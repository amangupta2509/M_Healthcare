import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

import {
  Upload,
  Send,
  RefreshCcw,
  X,
  Moon,
  Sun,
  Mic,
  Sparkles,
  Brush,
  Dna,
} from "lucide-react";
import "./AIChatAssistant.css";

const AIChatAssistant = () => {
  const [theme, setTheme] = useState("light");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "👋 Hello! I'm your AI assistant. How can I help you today?",
    },
  ]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const chatEndRef = useRef(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript); // sets input for logging
        sendVoiceMessage(transcript); // sends it automatically
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);
  const sendVoiceMessage = (voiceText) => {
    const newMessage = { type: "user", text: voiceText, file: null };
    setMessages((prev) => [...prev, newMessage]);
    setLastPrompt(voiceText);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const responseText = `You said: "${voiceText}". Here's a sample voice reply!`;
      const botMsg = {
        type: "bot",
        text: responseText,
      };
      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
      speakText(responseText); // use speech synthesis
    }, 1200);
  };
  const speakText = (text) => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1;
    utter.pitch = 1;

    utter.onend = () => {
      if (isVoiceMode) {
        startListening(); // loop to listen again
      }
    };

    synth.speak(utter);
  };
  const toggleVoiceMode = () => {
    const newState = !isVoiceMode;
    setIsVoiceMode(newState);
    if (newState) {
      startListening();
    } else {
      stopListening();
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const isValidFile = (file) => {
    return (
      file &&
      ["application/pdf", "image/jpeg", "image/png"].includes(file.type) &&
      file.size <= MAX_FILE_SIZE
    );
  };

  const handleFileChange = (file) => {
    if (!isValidFile(file)) {
      setError("Only PDF/JPG/PNG files under 5MB are allowed.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setError("");
    setFile(file);
  };

  const handleSend = () => {
    if (!input.trim() && !file) {
      setError("Please enter a message or upload a valid file.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setError("");
    const newMessage = { type: "user", text: input, file };
    setMessages((prev) => [...prev, newMessage]);
    setLastPrompt(input);
    setInput("");
    setFile(null);
    setLoading(true);

    setTimeout(() => {
      const botMsg = {
        type: "bot",
        text: `I understand you said: "${
          input || "[file uploaded]"
        }". This is a mock response for demonstration.`,
      };
      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 1000);
  };

  const handleRegenerate = () => {
    if (!lastPrompt) return;
    setInput(lastPrompt);
    handleSend();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const renderFilePreview = (file) => {
    const fileUrl = URL.createObjectURL(file);
    const isPDF = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    return (
      <div className="file-preview-modal">
        <div className="file-preview-content">
          <div className="file-preview-header">
            <h3 className="file-preview-title">{file.name}</h3>
            <button
              className="file-preview-close"
              onClick={() => setPreviewFile(null)}
            >
              <X size={20} />
            </button>
          </div>
          <div className="file-preview-body">
            {isPDF ? (
              <embed
                src={fileUrl}
                type="application/pdf"
                width="100%"
                height="600px"
              />
            ) : isImage ? (
              <img src={fileUrl} alt="preview" className="file-preview-image" />
            ) : (
              <div className="file-preview-unsupported">
                <p>Cannot preview this file type.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const clearChat = () => {
    setMessages([
      {
        type: "bot",
        text: "👋 Hello! I'm your AI assistant. How can I help you today?",
      },
    ]);
    setError("");
    setInput("");
    setFile(null);
    setLoading(false);
    setLastPrompt("");
  };

  return (
    <div
      className={`ai-container`}
      onDrop={handleDrop}
      onDragOver={handleDrag}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
    >
      <div className="ai-main-card">
        {/* Header */}
        <div className="ai-header">
          <div className="ai-header-content">
            <div className="ai-logo">
              <Dna size={35} color="#fff" />
            </div>
            <div className="ai-header-text">
              <h1>Assistant</h1>
              <p>Powered by dnalyst</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? <Sun /> : <Moon />}
            </button>
            <button
              className="theme-toggle"
              onClick={clearChat}
              title="Clear Chat"
            >
              <Brush size={20} />
            </button>
          </div>
        </div>

        {/* Chat Window */}
        <div className="ai-chat-window">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.type}`}>
              <div className={`chat-avatar ${msg.type}`}>
                {msg.type === "user" ? "👤" : "🤖"}
              </div>
              <div className={`chat-bubble ${msg.type}`}>
                {msg.file && (
                  <div
                    className="file-card"
                    onClick={() => setPreviewFile(msg.file)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="file-info">
                      <span className="file-name">{msg.file.name}</span>
                    </div>
                  </div>
                )}
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => (
                      <p className="bot-markdown" {...props} />
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <div className="loading-animation">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="ai-input-area">
          {file && (
            <div className="file-upload-preview">
              <div className="file-upload-info">
                <div className="file-upload-icon">📎</div>
                <span className="file-upload-name">{file.name}</span>
              </div>
              <button className="file-remove-btn" onClick={() => setFile(null)}>
                <X size={16} />
              </button>
            </div>
          )}

          {error && (
            <div key={error} className="error-message">
              {error}
            </div>
          )}

          <div className="input-controls">
            <label className="file-upload-btn">
              <input
                type="file"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
              <Upload size={20} />
            </label>

            <textarea
              className="message-input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button
              className="action-btn"
              onClick={handleRegenerate}
              disabled={!lastPrompt}
            >
              <RefreshCcw size={20} />
            </button>
            <button
              className={`action-btn ${isVoiceMode ? "voice-active" : ""}`}
              onClick={toggleVoiceMode}
              title="Use Voice Mode"
            >
              <Mic color={isVoiceMode ? "red" : "currentColor"} />
            </button>

            <button
              className="action-btn send-btn"
              onClick={handleSend}
              disabled={!input.trim() && !file}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {dragActive && (
        <div className="drag-overlay">
          <div className="drag-content">
            <Upload size={48} />
            <div className="drag-title">Drop your file here</div>
            <div className="drag-subtitle">Release to upload</div>
          </div>
        </div>
      )}

      {previewFile && renderFilePreview(previewFile)}
    </div>
  );
};

export default AIChatAssistant;
