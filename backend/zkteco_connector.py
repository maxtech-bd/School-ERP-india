#!/usr/bin/env python3
"""
ZKTeco Device Connector Service
Real-time biometric device integration for ERP system
"""

import asyncio
import aiohttp
import json
import logging
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional
import os
from zk import ZK, const
import threading
import signal
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('ZKTecoConnector')

class ZKTecoDeviceConnector:
    """Manages connection to individual ZKTeco device"""
    
    def __init__(self, device_config: Dict, erp_config: Dict):
        self.device_config = device_config
        self.erp_config = erp_config
        self.zk = ZK(
            device_config['ip_address'], 
            port=device_config.get('port', 4370),
            timeout=device_config.get('timeout', 5)
        )
        self.connection = None
        self.running = False
        self.last_seen = None
        
    async def connect(self) -> bool:
        """Connect to ZKTeco device using async operations"""
        try:
            logger.info(f"Connecting to device {self.device_config['device_id']} at {self.device_config['ip_address']}")
            
            # Use asyncio.to_thread for blocking operations
            connection_result = await asyncio.to_thread(self._blocking_connect)
            
            if connection_result['success']:
                self.connection = connection_result['connection']
                self.last_seen = datetime.now()
                
                # Update device registry
                await self._update_device_status('online', {
                    'firmware_version': connection_result['firmware'],
                    'total_users': connection_result['users_count']
                })
                
                logger.info(f"Device {self.device_config['device_id']} connected - Firmware: {connection_result['firmware']}, Users: {connection_result['users_count']}")
                return True
            else:
                await self._update_device_status('offline')
                return False
            
        except Exception as e:
            logger.error(f"Failed to connect to device {self.device_config['device_id']}: {e}")
            await self._update_device_status('offline')
            return False
    
    def _blocking_connect(self) -> dict:
        """Perform blocking ZKTeco connection operations"""
        try:
            # All blocking operations in one function
            connection = self.zk.connect()
            if connection:
                # Disable device during setup
                connection.disable_device()
                
                # Get device info
                firmware = connection.get_firmware_version()
                users_count = len(connection.get_users())
                
                # Re-enable device
                connection.enable_device()
                
                return {
                    'success': True,
                    'connection': connection,
                    'firmware': firmware,
                    'users_count': users_count
                }
            else:
                return {'success': False}
                
        except Exception as e:
            logger.error(f"Blocking connect error: {e}")
            return {'success': False}
    
    async def start_live_capture(self):
        """Start real-time attendance capture"""
        if not self.connection:
            if not await self.connect():
                return None
                
        self.running = True
        logger.info(f"Starting live capture for device {self.device_config['device_id']}")
        
        # Start live capture task on the event loop
        capture_task = asyncio.create_task(self._live_capture_worker())
        return capture_task
    
    async def _start_live_capture_task(self):
        """Complete async task for starting live capture"""
        try:
            if not self.connection:
                if not await self.connect():
                    logger.error(f"Failed to connect to device {self.device_config['device_id']}")
                    return
                    
            self.running = True
            logger.info(f"Starting live capture for device {self.device_config['device_id']}")
            
            # Start the live capture worker directly
            await self._live_capture_worker()
            
        except Exception as e:
            logger.error(f"Error in live capture task for device {self.device_config['device_id']}: {e}")
            await self._update_device_status('error')
    
    async def _live_capture_worker(self):
        """Async worker for live attendance capture using asyncio.to_thread"""
        try:
            while self.running:
                try:
                    # Use asyncio.to_thread to handle blocking ZK operations
                    attendance_records = await asyncio.to_thread(self._get_live_attendance_batch)
                    
                    for attendance in attendance_records:
                        if not self.running:
                            break
                        await self._process_attendance(attendance)
                    
                    # Small delay to prevent excessive polling
                    await asyncio.sleep(0.1)
                    
                except Exception as e:
                    logger.error(f"Live capture cycle error for device {self.device_config['device_id']}: {e}")
                    await self._update_device_status('error')
                    await asyncio.sleep(5)  # Wait before retrying
                    
        except Exception as e:
            logger.error(f"Live capture worker error for device {self.device_config['device_id']}: {e}")
            await self._update_device_status('error')
    
    def _get_live_attendance_batch(self):
        """Get batch of attendance records from device (blocking operation)"""
        try:
            # This is a blocking operation that runs in a thread pool
            attendance_list = []
            
            # Use ZK live_capture with timeout to avoid infinite blocking
            capture_iterator = self.connection.live_capture()
            
            # Collect up to 10 records or timeout after 1 second
            import time
            start_time = time.time()
            
            for attendance in capture_iterator:
                attendance_list.append(attendance)
                
                # Break if we have enough records or timeout
                if len(attendance_list) >= 10 or (time.time() - start_time) > 1.0:
                    break
            
            return attendance_list
            
        except Exception as e:
            logger.error(f"Error getting live attendance batch: {e}")
            return []
    
    async def _process_attendance(self, attendance):
        """Process attendance punch and send to ERP"""
        try:
            # Prepare punch data
            punch_data = {
                "person_id": str(attendance.user_id),
                "person_type": "student",  # Default, can be determined from user_id pattern
                "device_id": self.device_config['device_id'],
                "device_name": self.device_config['device_name'],
                "punch_time": attendance.timestamp.isoformat() + 'Z',
                "punch_method": "fingerprint",  # Default for ZKTeco
                "punch_type": self._determine_punch_type(attendance.punch),
                "verification_score": 95.0,  # Default high score for successful punch
                "status": "verified",
                "source_payload": {
                    "raw_user_id": attendance.user_id,
                    "raw_timestamp": str(attendance.timestamp),
                    "raw_punch": attendance.punch,
                    "raw_status": getattr(attendance, 'status', None),
                    "device_info": self.device_config
                }
            }
            
            # Determine person type from user_id pattern
            if str(attendance.user_id).startswith(('STF', 'STAFF', 'TCH')):
                punch_data["person_type"] = "staff"
            elif str(attendance.user_id).startswith(('STU', 'STUDENT')):
                punch_data["person_type"] = "student"
                
            logger.info(f"Processing punch: {punch_data['person_id']} on {punch_data['device_id']} at {punch_data['punch_time']}")
            
            # Send to ERP API
            success = await self._send_to_erp(punch_data)
            
            if success:
                logger.info(f"Punch sent to ERP successfully: {punch_data['person_id']}")
                self.last_seen = datetime.now()
            else:
                logger.error(f"Failed to send punch to ERP: {punch_data['person_id']}")
                
        except Exception as e:
            logger.error(f"Error processing attendance: {e}")
    
    def _determine_punch_type(self, punch_code) -> str:
        """Determine punch type from ZKTeco punch code"""
        # ZKTeco punch codes: 0=Check-in, 1=Check-out, 2=Break-out, 3=Break-in, 4=OT-in, 5=OT-out
        punch_types = {
            0: "IN",
            1: "OUT", 
            2: "BREAK",
            3: "BREAK",
            4: "IN",
            5: "OUT"
        }
        return punch_types.get(punch_code, "IN")
    
    async def _send_to_erp(self, punch_data: Dict) -> bool:
        """Send punch data to ERP API"""
        try:
            url = f"{self.erp_config['base_url']}/biometric/punch"
            headers = {
                'Authorization': f"Bearer {self.erp_config['auth_token']}",
                'Content-Type': 'application/json'
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=punch_data, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.debug(f"ERP response: {result}")
                        return True
                    else:
                        error_text = await response.text()
                        logger.error(f"ERP API error {response.status}: {error_text}")
                        return False
                        
        except Exception as e:
            logger.error(f"Error sending to ERP: {e}")
            return False
    
    async def _update_device_status(self, status: str, additional_data: Dict = None):
        """Update device status in ERP"""
        try:
            url = f"{self.erp_config['base_url']}/biometric/device-status"
            headers = {
                'Authorization': f"Bearer {self.erp_config['auth_token']}",
                'Content-Type': 'application/json'
            }
            
            status_data = {
                "device_id": self.device_config['device_id'],
                "status": status,
                "last_seen": datetime.now().isoformat() + 'Z',
                **(additional_data or {})
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.put(url, json=status_data, headers=headers) as response:
                    if response.status == 200:
                        logger.debug(f"Device status updated: {self.device_config['device_id']} - {status}")
                    else:
                        logger.warning(f"Failed to update device status: {response.status}")
                        
        except Exception as e:
            logger.error(f"Error updating device status: {e}")
    
    async def get_stored_attendance(self) -> List[Dict]:
        """Get stored attendance records from device"""
        try:
            if not self.connection:
                await self.connect()
                
            if self.connection:
                self.connection.disable_device()
                records = self.connection.get_attendance()
                self.connection.enable_device()
                
                attendance_data = []
                for record in records:
                    attendance_data.append({
                        "person_id": str(record.user_id),
                        "punch_time": record.timestamp.isoformat() + 'Z',
                        "punch_type": self._determine_punch_type(record.punch),
                        "device_id": self.device_config['device_id']
                    })
                
                return attendance_data
            return []
            
        except Exception as e:
            logger.error(f"Error getting stored attendance: {e}")
            return []
    
    async def disconnect(self):
        """Disconnect from device"""
        self.running = False
        if self.connection:
            try:
                self.connection.enable_device()
                self.connection.disconnect()
                logger.info(f"Disconnected from device {self.device_config['device_id']}")
            except Exception as e:
                logger.error(f"Error disconnecting from device: {e}")

class ZKTecoService:
    """Main service managing multiple ZKTeco devices"""
    
    def __init__(self, config_file: str = "zkteco_config.json"):
        self.config = self._load_config(config_file)
        self.device_connectors: Dict[str, ZKTecoDeviceConnector] = {}
        self.capture_tasks: Dict[str, asyncio.Task] = {}
        self.running = False
        
    def _load_config(self, config_file: str) -> Dict:
        """Load configuration from file"""
        default_config = {
            "erp": {
                "base_url": "http://localhost:8000/api",
                "auth_token": "your_jwt_token_here"
            },
            "devices": [
                {
                    "device_id": "DEV001",
                    "device_name": "Main Entrance",
                    "ip_address": "192.168.1.201",
                    "port": 4370,
                    "timeout": 5
                }
            ],
            "sync_interval": 30,
            "retry_attempts": 3
        }
        
        try:
            if os.path.exists(config_file):
                with open(config_file, 'r') as f:
                    return json.load(f)
            else:
                # Create default config file
                with open(config_file, 'w') as f:
                    json.dump(default_config, f, indent=2)
                logger.info(f"Created default config file: {config_file}")
                return default_config
                
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            return default_config
    
    async def start(self):
        """Start the ZKTeco service"""
        self.running = True
        logger.info("Starting ZKTeco Service...")
        
        # Initialize device connectors and start capture tasks
        for device_config in self.config['devices']:
            device_id = device_config['device_id']
            connector = ZKTecoDeviceConnector(device_config, self.config['erp'])
            self.device_connectors[device_id] = connector
            
            # Create and store capture task for each device (don't await)
            capture_task = asyncio.create_task(connector._start_live_capture_task())
            self.capture_tasks[device_id] = capture_task
            logger.info(f"Created capture task for device {device_id}")
        
        # Start monitoring loop
        asyncio.create_task(self._monitoring_loop())
        
        logger.info(f"ZKTeco Service started with {len(self.device_connectors)} devices, {len(self.capture_tasks)} capture tasks running")
    
    async def _monitoring_loop(self):
        """Monitor device health and reconnect if needed"""
        while self.running:
            try:
                for device_id, connector in self.device_connectors.items():
                    if not connector.connection:
                        logger.warning(f"Device {device_id} disconnected, attempting reconnection...")
                        await connector.connect()
                
                await asyncio.sleep(self.config.get('sync_interval', 30))
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(10)
    
    async def stop(self):
        """Stop the ZKTeco service"""
        self.running = False
        logger.info("Stopping ZKTeco Service...")
        
        for connector in self.device_connectors.values():
            await connector.disconnect()
        
        logger.info("ZKTeco Service stopped")
    
    async def sync_stored_data(self):
        """Sync stored attendance data from all devices"""
        logger.info("Starting stored data sync...")
        
        for device_id, connector in self.device_connectors.items():
            try:
                records = await connector.get_stored_attendance()
                logger.info(f"Retrieved {len(records)} stored records from {device_id}")
                
                # Send each record to ERP
                for record in records:
                    await connector._send_to_erp(record)
                    
            except Exception as e:
                logger.error(f"Error syncing data from {device_id}: {e}")

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    logger.info("Received shutdown signal")
    sys.exit(0)

async def main():
    """Main function"""
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Create and start service
    service = ZKTecoService()
    
    try:
        await service.start()
        
        # Keep service running
        while True:
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    finally:
        await service.stop()

if __name__ == "__main__":
    asyncio.run(main())