import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Bot, Send, Mic, Volume2, Loader, Sparkles } from "lucide-react";
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

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: inputMessage }]);
    setInputMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/ai-engine/chat`,
        {
          question: inputMessage,
          type: "text",
          ...(answerSource && { answer_source: answerSource }),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Voice recording is not supported in your browser. Please use text input instead.",
            error: true,
          },
        ]);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        await processVoiceInput(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn("Microphone access error:", err.name, err.message);
      let errorMessage = "Could not access microphone. ";
      
      if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMessage += "No microphone detected. Please connect a microphone or use text input.";
      } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMessage += "Microphone permission denied. Please allow microphone access in your browser settings.";
      } else if (err.name === "NotReadableError") {
        errorMessage += "Microphone is being used by another application.";
      } else {
        errorMessage += "Please use text input instead.";
      }
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
          error: true,
        },
      ]);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const processVoiceInput = async (blob) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("audio_file", blob);

      const res = await axios.post(
        `${API_BASE_URL}/ai-engine/voice-input`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setInputMessage(res.data.transcribed_text);
    } finally {
      setLoading(false);
    }
  };

  const playVoiceResponse = async (text) => {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API_BASE_URL}/ai-engine/voice-output`,
      { text },
      { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" },
    );
    new Audio(URL.createObjectURL(res.data)).play();
  };

  return (
    /* 🔥 BREAK OUT OF DASHBOARD COLUMN ON MOBILE */
    <div className="w-screen max-w-none -mx-2 sm:mx-0 px-2 sm:px-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Sparkles className="text-purple-600" />
        </div>
        <div>
          <h1 className="text-base sm:text-xl font-bold">GiNi AI Assistant</h1>
          <p className="hidden sm:block text-sm text-gray-600">
            Ask academic questions with verified sources
          </p>
        </div>
      </div>

      {/* Filter */}
      <Card className="rounded-none sm:rounded-lg border-x-0 sm:border">
        <CardContent className="p-4">
          <select
            value={answerSource}
            onChange={(e) => setAnswerSource(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm"
          >
            <option value="">All Sources</option>
            <option value="Academic Book">Academic Books</option>
            <option value="Reference Book">Reference Books</option>
          </select>
        </CardContent>
      </Card>

      {/* Chat */}
      <Card
        className="
          flex flex-col
          h-[calc(100vh-180px)]
          sm:h-[500px]
          rounded-none sm:rounded-lg
          border-x-0 sm:border
        "
      >
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Bot /> Chat
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-3 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-3 text-sm
                ${
                  m.role === "user"
                    ? "bg-emerald-500 text-white"
                    : m.error
                      ? "bg-red-100"
                      : "bg-gray-100"
                }`}
              >
                {m.content}

                {m.role === "assistant" && !m.error && (
                  <button
                    onClick={() => playVoiceResponse(m.content)}
                    className="mt-2 text-xs flex items-center gap-1 opacity-70"
                  >
                    <Volume2 size={14} /> Audio
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader className="animate-spin" size={16} /> Thinking...
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <div className="border-t p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2 flex-1">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask something..."
                className="flex-1 p-2 border rounded-lg text-base"
              />
              <Button onClick={sendMessage} disabled={!inputMessage || loading}>
                <Send size={16} />
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-full sm:w-auto ${isRecording && "bg-red-100"}`}
            >
              <Mic
                className={isRecording ? "animate-pulse text-red-600" : ""}
              />
              <span className="sm:hidden ml-2">Voice</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
