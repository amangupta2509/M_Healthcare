import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

import {
  Upload,
  Send,
  RefreshCcw,
  X,
  Eye,
  Moon,
  Sun,
  Sparkles,
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

  const chatEndRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleSend = () => {
    if (!input.trim() && !file) return;

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
  const BotMessageCard = ({ title, content }) => {
    return (
      <div className="bot-card">
        <div className="bot-card-header">{title}</div>
        <div className="bot-card-body">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    );
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
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
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
              <Sparkles size={20} color="#fff" />
            </div>
            <div className="ai-header-text">
              <h1> Assistant</h1>
              <p>Powered by dnalyst</p>
            </div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? <Sun /> : <Moon />}
          </button>
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

          <div className="input-controls">
            <label className="file-upload-btn">
              <input
                type="file"
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files[0])}
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
