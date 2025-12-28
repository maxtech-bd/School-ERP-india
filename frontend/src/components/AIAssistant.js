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
      className="flex flex-col gap-1 p-1 sm:p-2 overflow-hidden"
      style={{ height: `calc(100dvh - ${keyboardHeight}px - 56px)` }}
    >
      {/* Compact Header with Source Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0 bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 border dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold dark:text-white">GiNi AI</h1>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
              Academic AI Assistant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Source:</span>
          <select
            value={answerSource}
            onChange={(e) => setAnswerSource(e.target.value)}
            className="border dark:border-gray-600 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white"
          >
            <option value="">All</option>
            <option value="Academic Book">Academic</option>
            <option value="Reference Book">Reference</option>
          </select>
        </div>
      </div>

      {/* Chat */}
      <Card className="flex-1 min-h-0 flex flex-col dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        <CardHeader className="border-b dark:border-gray-700 py-1.5 px-2 shrink-0">
          <CardTitle className="flex gap-2 items-center text-xs sm:text-sm dark:text-white">
            <Bot className="h-4 w-4" /> Chat
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              } gap-2`}
            >
              {m.role === "assistant" && (
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                  <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                </div>
              )}

              <div
                className={`rounded-lg p-2 sm:p-3 text-xs sm:text-sm max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%]
                ${
                  m.role === "user"
                    ? "bg-emerald-500 text-white"
                    : m.error
                      ? "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                      : "bg-gray-100 dark:bg-gray-700 dark:text-gray-100"
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
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
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
        <div className="border-t dark:border-gray-700 p-1.5 shrink-0 bg-white dark:bg-gray-800">
          {/* Container: Flex row, center items, small gap */}
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            {/* MIC BUTTON */}
            <Button
              size="icon"
              variant="outline"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
              className={`h-9 w-9 shrink-0 rounded-full ${
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
              className="flex-1 min-w-0 border dark:border-gray-600 rounded-full px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
            />

            {/* SEND BUTTON */}
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
              className="h-9 w-9 shrink-0 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
