import requests
import sys
import json
from datetime import datetime
import uuid

class SchoolERPAPITester:
    def __init__(self, base_url="https://cloud-school-erp.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.tenant_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            'students': [],
            'staff': [],
            'classes': [],
            'sections': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    return success, response_data
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "email": f"test_admin_{timestamp}@school.com",
            "username": f"test_admin_{timestamp}",
            "full_name": f"Test Admin {timestamp}",
            "password": "TestPass123!",
            "role": "admin"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success:
            self.user_data = user_data
            return True
        return False

    def test_user_login(self):
        """Test user login"""
        if not self.user_data:
            print("❌ No user data available for login test")
            return False
            
        login_data = {
            "username": self.user_data["username"],
            "password": self.user_data["password"]
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.tenant_id = response['user']['tenant_id']
            print(f"   Token acquired: {self.token[:20]}...")
            print(f"   Tenant ID: {self.tenant_id}")
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, response = self.run_test(
            "Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        
        if success:
            expected_keys = ['total_students', 'total_staff', 'total_teachers', 'total_classes']
            for key in expected_keys:
                if key not in response:
                    print(f"   Warning: Missing key '{key}' in dashboard stats")
                    return False
            print(f"   Stats: {response}")
        return success

    def test_create_school(self):
        """Test creating a school"""
        timestamp = datetime.now().strftime('%H%M%S')
        school_data = {
            "name": f"Test School {timestamp}",
            "code": f"TS{timestamp}",
            "address": "123 Test Street",
            "city": "Test City",
            "state": "Test State",
            "pincode": "123456",
            "phone": "9876543210",
            "email": f"school{timestamp}@test.com",
            "principal_name": f"Principal {timestamp}",
            "established_year": 2020,
            "board_affiliation": "CBSE"
        }
        
        success, response = self.run_test(
            "Create School",
            "POST",
            "schools",
            200,
            data=school_data
        )
        
        if success and 'id' in response:
            print(f"   Created school ID: {response['id']}")
        return success

    def test_get_schools(self):
        """Test getting schools list"""
        success, response = self.run_test(
            "Get Schools",
            "GET",
            "schools",
            200
        )
        
        if success:
            print(f"   Found {len(response)} schools")
        return success

    def test_create_student(self):
        """Test creating a student"""
        # First, we need a class and section
        class_success = self.test_create_class()
        if not class_success:
            print("❌ Cannot create student without class")
            return False
            
        section_success = self.test_create_section()
        if not section_success:
            print("❌ Cannot create student without section")
            return False

        timestamp = datetime.now().strftime('%H%M%S')
        student_data = {
            "admission_no": f"ADM{timestamp}",
            "roll_no": f"ROLL{timestamp}",
            "name": f"Test Student {timestamp}",
            "father_name": f"Test Father {timestamp}",
            "mother_name": f"Test Mother {timestamp}",
            "date_of_birth": "2010-01-15",
            "gender": "Male",
            "class_id": self.created_resources['classes'][0] if self.created_resources['classes'] else "test-class-id",
            "section_id": self.created_resources['sections'][0] if self.created_resources['sections'] else "test-section-id",
            "phone": "9876543210",
            "email": f"student{timestamp}@school.com",
            "address": "Test Address",
            "guardian_name": f"Guardian {timestamp}",
            "guardian_phone": "9876543211"
        }
        
        success, response = self.run_test(
            "Create Student",
            "POST",
            "students",
            200,
            data=student_data
        )
        
        if success and 'id' in response:
            self.created_resources['students'].append(response['id'])
            print(f"   Created student ID: {response['id']}")
        return success

    def test_get_students(self):
        """Test getting students list"""
        success, response = self.run_test(
            "Get Students",
            "GET",
            "students",
            200
        )
        
        if success:
            print(f"   Found {len(response)} students")
        return success

    def test_create_staff(self):
        """Test creating staff member"""
        timestamp = datetime.now().strftime('%H%M%S')
        staff_data = {
            "employee_id": f"EMP{timestamp}",
            "name": f"Test Teacher {timestamp}",
            "email": f"teacher{timestamp}@school.com",
            "phone": "9876543212",
            "designation": "Teacher",
            "department": "Mathematics",
            "qualification": "M.Sc Mathematics",
            "experience_years": 5,
            "date_of_joining": "2020-06-01",
            "salary": 50000.0,
            "address": "Test Teacher Address"
        }
        
        success, response = self.run_test(
            "Create Staff",
            "POST",
            "staff",
            200,
            data=staff_data
        )
        
        if success and 'id' in response:
            self.created_resources['staff'].append(response['id'])
            print(f"   Created staff ID: {response['id']}")
        return success

    def test_get_staff(self):
        """Test getting staff list"""
        success, response = self.run_test(
            "Get Staff",
            "GET",
            "staff",
            200
        )
        
        if success:
            print(f"   Found {len(response)} staff members")
        return success

    def test_create_class(self):
        """Test creating a class"""
        timestamp = datetime.now().strftime('%H%M%S')
        class_data = {
            "name": f"Class {timestamp}",
            "standard": f"Grade-{timestamp[-2:]}",
            "max_students": 40
        }
        
        success, response = self.run_test(
            "Create Class",
            "POST",
            "classes",
            200,
            data=class_data
        )
        
        if success and 'id' in response:
            self.created_resources['classes'].append(response['id'])
            print(f"   Created class ID: {response['id']}")
        return success

    def test_get_classes(self):
        """Test getting classes list"""
        success, response = self.run_test(
            "Get Classes",
            "GET",
            "classes",
            200
        )
        
        if success:
            print(f"   Found {len(response)} classes")
        return success

    def test_create_section(self):
        """Test creating a section"""
        if not self.created_resources['classes']:
            print("❌ No classes available for section creation")
            return False
            
        timestamp = datetime.now().strftime('%H%M%S')
        section_data = {
            "class_id": self.created_resources['classes'][0],
            "name": f"Section-{timestamp[-1]}",
            "max_students": 30
        }
        
        success, response = self.run_test(
            "Create Section",
            "POST",
            "sections",
            200,
            data=section_data
        )
        
        if success and 'id' in response:
            self.created_resources['sections'].append(response['id'])
            print(f"   Created section ID: {response['id']}")
        return success

    def test_get_sections(self):
        """Test getting sections list"""
        success, response = self.run_test(
            "Get Sections",
            "GET",
            "sections",
            200
        )
        
        if success:
            print(f"   Found {len(response)} sections")
        return success

    def test_update_student(self):
        """Test updating a student"""
        if not self.created_resources['students']:
            print("❌ No students available for update test")
            return False
            
        student_id = self.created_resources['students'][0]
        timestamp = datetime.now().strftime('%H%M%S')
        
        update_data = {
            "admission_no": f"ADM{timestamp}",
            "roll_no": f"ROLL{timestamp}",
            "name": f"Updated Student {timestamp}",
            "father_name": f"Updated Father {timestamp}",
            "mother_name": f"Updated Mother {timestamp}",
            "date_of_birth": "2010-01-15",
            "gender": "Female",
            "class_id": self.created_resources['classes'][0] if self.created_resources['classes'] else "test-class-id",
            "section_id": self.created_resources['sections'][0] if self.created_resources['sections'] else "test-section-id",
            "phone": "9876543213",
            "email": f"updated_student{timestamp}@school.com",
            "address": "Updated Address",
            "guardian_name": f"Updated Guardian {timestamp}",
            "guardian_phone": "9876543214"
        }
        
        success, response = self.run_test(
            "Update Student",
            "PUT",
            f"students/{student_id}",
            200,
            data=update_data
        )
        return success

    def create_admin_test_user(self):
        """Create the admin_test user if it doesn't exist"""
        # Try different variations of the admin user
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "email": f"admin_test_{timestamp}@school.com",
            "username": f"admin_test_{timestamp}",
            "full_name": f"Admin Test User {timestamp}",
            "password": "admin123",
            "role": "admin"
        }
        
        success, response = self.run_test(
            "Create Admin Test User",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success:
            # Store the created user data for login
            self.user_data = user_data
            
        return success

    def test_specific_admin_login(self):
        """Test login with the created admin credentials"""
        if not self.user_data:
            print("❌ No user data available for login test")
            return False
            
        login_data = {
            "username": self.user_data["username"],
            "password": self.user_data["password"]
        }
        
        success, response = self.run_test(
            "Admin Login with Created User",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            user_info = response.get('user', {})
            
            # Verify JWT includes required fields
            print(f"   ✅ JWT Token acquired: {self.token[:20]}...")
            print(f"   ✅ User ID: {user_info.get('id')}")
            print(f"   ✅ Tenant ID: {user_info.get('tenant_id')}")
            print(f"   ✅ School ID: {user_info.get('school_id')}")
            print(f"   ✅ Role: {user_info.get('role')}")
            
            # Check that all required fields are present
            required_fields = ['tenant_id', 'school_id', 'role']
            missing_fields = [field for field in required_fields if not user_info.get(field)]
            
            if missing_fields:
                print(f"   ❌ Missing JWT fields: {missing_fields}")
                return False
            
            self.tenant_id = user_info.get('tenant_id')
            return True
        return False

    def test_jwt_school_id_validation(self):
        """Test that JWT school_id matches actual tenant school"""
        print("\n🔍 Validating JWT school_id against tenant schools...")
        
        # Get schools for current tenant
        success, schools_response = self.run_test(
            "Get Tenant Schools",
            "GET",
            "schools",
            200
        )
        
        if not success or not schools_response:
            print("   ❌ No schools found for tenant")
            return False
            
        # Extract school IDs for this tenant
        tenant_school_ids = [school['id'] for school in schools_response]
        print(f"   📋 Tenant school IDs: {tenant_school_ids}")
        
        # Get current user info to see JWT school_id
        success, user_response = self.run_test(
            "Get Current User for JWT Check",
            "GET",
            "auth/me",
            200
        )
        
        if success and hasattr(user_response, 'get'):
            jwt_school_id = user_response.get('school_id')
            print(f"   🎫 JWT school_id: {jwt_school_id}")
            
            if jwt_school_id in tenant_school_ids:
                print("   ✅ JWT school_id matches tenant school")
                return True
            else:
                print("   ❌ JWT school_id does NOT match any tenant school")
                print("   🐛 This is the root cause of staff creation failure")
                return False
        
        return False

    def test_create_staff_with_debug(self):
        """Test staff creation with detailed debugging"""
        timestamp = datetime.now().strftime('%H%M%S')
        staff_data = {
            "employee_id": f"EMP{timestamp}",
            "name": f"Test Teacher {timestamp}",
            "email": f"teacher{timestamp}@school.com",
            "phone": "9876543212",
            "designation": "Teacher",
            "department": "Mathematics",
            "qualification": "M.Sc Mathematics",
            "experience_years": 5,
            "date_of_joining": "2020-06-01",
            "salary": 50000.0,
            "address": "Test Teacher Address"
        }
        
        print(f"\n🔍 Attempting to create staff with data: {staff_data}")
        
        success, response = self.run_test(
            "Create Staff (Debug Mode)",
            "POST",
            "staff",
            200,
            data=staff_data
        )
        
        if success and 'id' in response:
            self.created_resources['staff'].append(response['id'])
            print(f"   ✅ Created staff ID: {response['id']}")
            return True
        else:
            print(f"   ❌ Staff creation failed - this confirms the tenant/school binding issue")
            return False

    def test_create_school_for_tenant(self):
        """Create a school for the current tenant to fix staff creation"""
        timestamp = datetime.now().strftime('%H%M%S')
        school_data = {
            "name": f"Test School {timestamp}",
            "code": f"TS{timestamp}",
            "address": "123 Test Street",
            "city": "Test City",
            "state": "Test State",
            "pincode": "123456",
            "phone": "9876543210",
            "email": f"school{timestamp}@test.com",
            "principal_name": f"Principal {timestamp}",
            "established_year": 2020,
            "board_affiliation": "CBSE"
        }
        
        success, response = self.run_test(
            "Create School for Current Tenant",
            "POST",
            "schools",
            200,
            data=school_data
        )
        
        if success and 'id' in response:
            print(f"   Created school ID: {response['id']} for tenant")
        return success

    def test_seed_data_verification(self):
        """Verify that seed data exists (tenants, schools, academic years)"""
        print("\n🔍 Verifying Seed Data...")
        
        # Test getting schools (should include default school)
        success, schools_response = self.run_test(
            "Verify Schools Exist",
            "GET",
            "schools",
            200
        )
        
        if success:
            if len(schools_response) > 0:
                print(f"   ✅ Found {len(schools_response)} schools")
                for school in schools_response:
                    print(f"      - School: {school.get('name')} (ID: {school.get('id')})")
            else:
                print("   ❌ No schools found - seed data may be missing")
                return False
        else:
            return False
            
        # Test dashboard stats to verify data
        success, stats_response = self.run_test(
            "Verify Dashboard Stats",
            "GET", 
            "dashboard/stats",
            200
        )
        
        if success:
            print(f"   ✅ Dashboard accessible - Stats: {stats_response}")
        
        return success

    def test_comprehensive_staff_flow(self):
        """Test the complete staff management flow"""
        print("\n🔍 Testing Complete Staff Management Flow...")
        
        # Create multiple staff members
        staff_members = []
        for i in range(3):
            timestamp = datetime.now().strftime('%H%M%S') + str(i)
            staff_data = {
                "employee_id": f"EMP{timestamp}",
                "name": f"Staff Member {timestamp}",
                "email": f"staff{timestamp}@school.com",
                "phone": f"987654321{i}",
                "designation": ["Teacher", "Principal", "Admin"][i],
                "department": ["Mathematics", "Science", "Administration"][i],
                "qualification": "M.Sc",
                "experience_years": 3 + i,
                "date_of_joining": "2020-06-01",
                "salary": 40000.0 + (i * 10000),
                "address": f"Address {i+1}"
            }
            
            success, response = self.run_test(
                f"Create Staff Member {i+1}",
                "POST",
                "staff",
                200,
                data=staff_data
            )
            
            if success and 'id' in response:
                staff_members.append(response['id'])
                print(f"   ✅ Created staff {i+1}: {response['name']} (ID: {response['id']})")
            else:
                print(f"   ❌ Failed to create staff member {i+1}")
                return False
        
        # Verify all staff members exist
        success, staff_list = self.run_test(
            "Get All Staff Members",
            "GET",
            "staff",
            200
        )
        
        if success:
            print(f"   ✅ Total staff in system: {len(staff_list)}")
            for staff in staff_list:
                print(f"      - {staff['name']} ({staff['designation']}) - {staff['employee_id']}")
        
        return success and len(staff_list) >= 3

def main():
    print("🚀 Starting School ERP API Testing - Focus on Staff Creation & Auth...")
    print("=" * 80)
    
    tester = SchoolERPAPITester()
    
    # Focused test sequence for the review request
    test_sequence = [
        ("Create Admin Test User", tester.create_admin_test_user),
        ("Admin Login with Created User", tester.test_specific_admin_login),
        ("JWT School ID Validation", tester.test_jwt_school_id_validation),
        ("Create School for Tenant", tester.test_create_school_for_tenant),
        ("Seed Data Verification", tester.test_seed_data_verification),
        ("Get Current User Info", tester.test_get_current_user),
        ("Create Staff (Debug Mode)", tester.test_create_staff_with_debug),
        ("Comprehensive Staff Flow", tester.test_comprehensive_staff_flow),
        ("Get Staff List", tester.test_get_staff),
        ("Dashboard Stats", tester.test_dashboard_stats),
    ]
    
    # Run all tests
    for test_name, test_func in test_sequence:
        try:
            result = test_func()
            if not result:
                print(f"⚠️  Test '{test_name}' failed, but continuing...")
        except Exception as e:
            print(f"💥 Test '{test_name}' crashed: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 60)
    print("📊 FINAL TEST RESULTS")
    print("=" * 60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.created_resources['students']:
        print(f"\n📝 Created {len(tester.created_resources['students'])} students")
    if tester.created_resources['staff']:
        print(f"👥 Created {len(tester.created_resources['staff'])} staff members")
    if tester.created_resources['classes']:
        print(f"🏫 Created {len(tester.created_resources['classes'])} classes")
    if tester.created_resources['sections']:
        print(f"📚 Created {len(tester.created_resources['sections'])} sections")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())