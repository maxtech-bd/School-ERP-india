import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, Send, Mic, Image as ImageIcon, FileText, Volume2, User, Loader, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [stats, setStats] = useState(null);
  
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/ai-engine/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching AI stats:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      image: selectedImage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      let requestData = {
        question: inputMessage,
        type: selectedImage ? 'image' : 'text'
      };

      if (selectedImage) {
        requestData.image = selectedImage.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      }

      const response = await axios.post(
        `${API_BASE_URL}/ai-engine/chat`,
        requestData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const aiMessage = {
        role: 'assistant',
        content: response.data.answer,
        tokens: response.data.tokens_used,
        timestamp: response.data.timestamp
      };

      setMessages(prev => [...prev, aiMessage]);
      setInputMessage('');
      setSelectedImage(null);
      fetchStats();
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        error: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOCR = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API_BASE_URL}/ai-engine/ocr`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const ocrMessage = {
        role: 'system',
        content: `📄 OCR Result:\n\n${response.data.extracted_text}`,
        timestamp: response.data.timestamp
      };

      setMessages(prev => [...prev, ocrMessage]);
      setInputMessage(response.data.extracted_text);
    } catch (error) {
      console.error('Error with OCR:', error);
      alert('OCR processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Microphone access denied or not available');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioBlob) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.wav');

      const response = await axios.post(
        `${API_BASE_URL}/ai-engine/voice-input`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setInputMessage(response.data.transcribed_text);
    } catch (error) {
      console.error('Error with voice input:', error);
      alert('Voice transcription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const playVoiceResponse = async (text) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/ai-engine/voice-output`,
        { text, voice: 'alloy' },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error playing voice response:', error);
      alert('Voice playback failed. Please try again.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
            <p className="text-gray-600">Ask questions, analyze images, or use voice commands</p>
          </div>
        </div>
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

      {/* Chat Interface */}
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Chat with AI</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-center">
              <div className="space-y-3">
                <Bot className="h-16 w-16 text-gray-400 mx-auto" />
                <p className="text-gray-600">Start a conversation with the AI Assistant</p>
                <p className="text-sm text-gray-500">Ask questions, upload images, or use voice input</p>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} space-x-2`}
            >
              {message.role !== 'user' && (
                <div className="flex-shrink-0">
                  <div className="p-2 bg-purple-100 rounded-full">
                    {message.role === 'system' ? (
                      <FileText className="h-4 w-4 text-purple-600" />
                    ) : (
                      <Bot className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                </div>
              )}
              
              <div className={`max-w-[70%] ${message.role === 'user' ? 'bg-emerald-500 text-white' : message.error ? 'bg-red-50 text-red-900' : 'bg-gray-100 text-gray-900'} rounded-lg p-3`}>
                {message.image && (
                  <img src={message.image} alt="Upload" className="max-w-full rounded mb-2" />
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.tokens && (
                  <p className="text-xs mt-1 opacity-70">{message.tokens} tokens</p>
                )}
                {message.role === 'assistant' && !message.error && (
                  <button
                    onClick={() => playVoiceResponse(message.content)}
                    className="mt-2 text-xs flex items-center space-x-1 opacity-70 hover:opacity-100"
                  >
                    <Volume2 className="h-3 w-3" />
                    <span>Play audio</span>
                  </button>
                )}
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="p-2 bg-emerald-100 rounded-full">
                    <User className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start space-x-2">
              <div className="flex-shrink-0">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Bot className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <Loader className="h-5 w-5 animate-spin text-gray-600" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </CardContent>
        
        {/* Input Area */}
        <div className="border-t p-4">
          {selectedImage && (
            <div className="mb-2">
              <div className="relative inline-block">
                <img src={selectedImage} alt="Selected" className="max-h-20 rounded" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            
            <input
              type="file"
              id="ocr-upload"
              onChange={handleOCR}
              accept="image/*"
              className="hidden"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('ocr-upload')?.click()}
              disabled={loading}
            >
              <FileText className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
              className={isRecording ? 'bg-red-100' : ''}
            >
              <Mic className={`h-4 w-4 ${isRecording ? 'text-red-600 animate-pulse' : ''}`} />
            </Button>
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
            
            <Button
              onClick={sendMessage}
              disabled={loading || (!inputMessage.trim() && !selectedImage)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
