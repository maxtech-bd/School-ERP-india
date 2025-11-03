import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, Send, Mic, Volume2, User, Loader, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [answerSource, setAnswerSource] = useState(''); // '' = All, 'Academic Book', 'Reference Book'
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      let requestData = {
        question: inputMessage,
        type: 'text'
      };

      // Add answer source filter if selected
      if (answerSource) {
        requestData.answer_source = answerSource;
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
        tags: response.data.tags,
        source: response.data.source,
        tokens: response.data.tokens_used,
        timestamp: response.data.timestamp
      };

      setMessages(prev => [...prev, aiMessage]);
      setInputMessage('');
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
            <h1 className="text-2xl font-bold text-gray-900">GiNi AI Assistant</h1>
            <p className="text-gray-600">Ask academic questions and get tag-based answers</p>
          </div>
        </div>
      </div>

      {/* Answer Source Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Answer Source:</label>
            <select
              value={answerSource}
              onChange={(e) => setAnswerSource(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Sources</option>
              <option value="Academic Book">Academic Books Only</option>
              <option value="Reference Book">Reference Books Only</option>
            </select>
          </div>
        </CardContent>
      </Card>

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
                    <Bot className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              )}
              
              <div className={`max-w-[70%] ${message.role === 'user' ? 'bg-emerald-500 text-white' : message.error ? 'bg-red-50 text-red-900' : 'bg-gray-100 text-gray-900'} rounded-lg p-3`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                
                {/* Display Tags for AI Assistant Responses */}
                {message.role === 'assistant' && message.tags && !message.error && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs font-semibold mb-2 text-gray-600">📚 Source Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.tags.subject && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          Subject: {message.tags.subject}
                        </span>
                      )}
                      {message.tags.chapter && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          Chapter: {message.tags.chapter}
                        </span>
                      )}
                      {message.tags.topic && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          Topic: {message.tags.topic}
                        </span>
                      )}
                      {message.tags.academic_book && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                          📖 Academic Book: {message.tags.academic_book}
                        </span>
                      )}
                      {message.tags.reference_book && (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                          📚 Reference Book: {message.tags.reference_book}
                        </span>
                      )}
                      {message.tags.qa_knowledge_base && (
                        <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs">
                          ❓ Q&A Knowledge Base
                        </span>
                      )}
                      {message.tags.previous_papers && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                          📝 Previous Papers: {message.tags.previous_papers}
                        </span>
                      )}
                    </div>
                  </div>
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
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
              className={isRecording ? 'bg-red-100' : ''}
              title="Voice Input"
            >
              <Mic className={`h-4 w-4 ${isRecording ? 'text-red-600 animate-pulse' : ''}`} />
            </Button>
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask academic questions..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
            
            <Button
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
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
