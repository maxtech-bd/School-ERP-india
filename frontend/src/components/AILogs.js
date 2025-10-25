import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Bot, User, FileText, Mic, Volume2, Image, Calendar, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export default function AILogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/ai-engine/logs?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/ai-engine/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'ocr_extraction':
        return <FileText className="h-4 w-4" />;
      case 'voice_transcription':
        return <Mic className="h-4 w-4" />;
      case 'text_to_speech':
        return <Volume2 className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'ocr_extraction':
        return 'bg-blue-100 text-blue-600';
      case 'voice_transcription':
        return 'bg-purple-100 text-purple-600';
      case 'text_to_speech':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-emerald-100 text-emerald-600';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Activity className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Activity Logs</h1>
            <p className="text-gray-600">Monitor AI usage and interactions</p>
          </div>
        </div>
        <Button onClick={fetchLogs} variant="outline">
          Refresh Logs
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Queries</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_queries}</p>
                </div>
                <Bot className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tokens Used</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_tokens.toLocaleString()}</p>
                </div>
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unique_users}</p>
                </div>
                <User className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No activity logs found</div>
          ) : (
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-full ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900">{log.user_name}</p>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                            {log.user_role}
                          </span>
                        </div>
                        
                        {log.question && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-700 font-medium">Question:</p>
                            <p className="text-sm text-gray-600 mt-1">{log.question}</p>
                          </div>
                        )}
                        
                        {log.answer && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-700 font-medium">Answer:</p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{log.answer}</p>
                          </div>
                        )}
                        
                        {log.action === 'ocr_extraction' && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">OCR:</span> Extracted {log.extracted_text_length} characters from {log.filename}
                          </div>
                        )}
                        
                        {log.action === 'voice_transcription' && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Voice:</span> "{log.transcribed_text}"
                          </div>
                        )}
                        
                        {log.action === 'text_to_speech' && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">TTS:</span> {log.text_length} characters, voice: {log.voice}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(log.created_at)}</span>
                          </div>
                          {log.tokens_used && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                              {log.tokens_used} tokens
                            </span>
                          )}
                          {log.model && (
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded">
                              {log.model}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
