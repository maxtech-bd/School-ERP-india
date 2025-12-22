import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Bot, Send, Mic, Volume2, User, Loader, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [answerSource, setAnswerSource] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const heightDiff = window.innerHeight - window.visualViewport.height;
        setKeyboardHeight(heightDiff > 50 ? heightDiff : 0);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  const handleInputFocus = () => {
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 300);
  };

  /* -------------------- CHAT -------------------- */

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        question: userMessage.content,
        type: "text",
        ...(answerSource && { answer_source: answerSource }),
      };

      const res = await axios.post(`${API_BASE_URL}/ai-engine/chat`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.answer,
          tags: res.data.tags,
          timestamp: res.data.timestamp,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          error: true,
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- VOICE INPUT -------------------- */

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        stream.getTracks().forEach((t) => t.stop());
        await processVoice(blob);
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      alert("Microphone permission denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const processVoice = async (audioBlob) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("audio_file", audioBlob);

      const res = await axios.post(
        `${API_BASE_URL}/ai-engine/voice-input`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setInputMessage(res.data.transcribed_text);
    } catch {
      alert("Voice recognition failed");
    } finally {
      setLoading(false);
    }
  };

  const playVoice = async (text) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/ai-engine/voice-output`,
        { text, voice: "alloy" },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );

      new Audio(URL.createObjectURL(res.data)).play();
    } catch {
      alert("Audio playback failed");
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <div 
      ref={containerRef}
      className="flex flex-col gap-2 sm:gap-3 p-1 sm:p-3 md:p-4 overflow-hidden"
      style={{ height: `calc(100dvh - ${keyboardHeight}px - 60px)` }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold">GiNi AI Assistant</h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Academic AI with source-based answers
          </p>
        </div>
      </div>

      {/* Source Filter */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <span className="text-sm font-medium">Answer Source</span>
            <select
              value={answerSource}
              onChange={(e) => setAnswerSource(e.target.value)}
              className="w-full sm:flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Sources</option>
              <option value="Academic Book">Academic Books</option>
              <option value="Reference Book">Reference Books</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Chat */}
      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex gap-2 items-center text-sm">
            <Bot className="h-5 w-5" /> Chat
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-4 py-3 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              } gap-2`}
            >
              {m.role === "assistant" && (
                <div className="p-2 bg-purple-100 rounded-full">
                  <Bot className="h-4 w-4 text-purple-600" />
                </div>
              )}

              <div
                className={`rounded-lg p-3 text-sm sm:text-base max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%]
                ${
                  m.role === "user"
                    ? "bg-emerald-500 text-white"
                    : m.error
                      ? "bg-red-50 text-red-800"
                      : "bg-gray-100"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>

                {m.role === "assistant" && !m.error && (
                  <button
                    onClick={() => playVoice(m.content)}
                    className="mt-2 flex items-center gap-1 text-xs opacity-70 hover:opacity-100"
                  >
                    <Volume2 className="h-3 w-3" /> Play audio
                  </button>
                )}
              </div>

              {m.role === "user" && (
                <div className="p-2 bg-emerald-100 rounded-full">
                  <User className="h-4 w-4 text-emerald-600" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <Loader className="h-5 w-5 animate-spin" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <div className="border-t p-2 sm:p-4 sticky bottom-0 bg-white z-10">
          {/* Container: Flex row, center items, small gap */}
          <div className="flex flex-row items-center gap-2 max-w-screen-xl mx-auto">
            {/* MIC BUTTON */}
            <Button
              size="icon"
              variant="outline"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
              /* FIX 1: shrink-0 keeps the button from disappearing or squishing */
              className={`h-10 w-10 shrink-0 rounded-full ${
                isRecording ? "bg-red-100 border-red-200" : ""
              }`}
            >
              <Mic
                className={`h-4 w-4 ${isRecording ? "text-red-600 animate-pulse" : "text-gray-500"}`}
              />
            </Button>

            {/* INPUT FIELD */}
            <input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              onFocus={handleInputFocus}
              placeholder="Ask..."
              disabled={loading}
              className="flex-1 min-w-0 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
            />

            {/* SEND BUTTON */}
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
              /* FIX 3: shrink-0 ensures this button never gets pushed off screen */
              className="h-10 w-10 shrink-0 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
