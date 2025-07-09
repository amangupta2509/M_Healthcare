import { useNavigate, useLocation } from "react-router-dom"; // ⬅ Add at top
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

import {
  Upload,
  Send,
  RefreshCcw,
  X,
  Moon,
  Sun,
  Sparkles,
  Brush,
  Pencil,
  CookingPot,
} from "lucide-react";
import "./AIChatAssistantForDiet.css";
import { toast } from "react-toastify";
const AIChatAssistantForDiet = () => {
  const [theme, setTheme] = useState("light");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "🍽️ Hello! I'm your AI diet assistant. How can I help you with a meal plan today?",
    },
  ]);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState("");

  const chatEndRef = useRef(null);
  const location = useLocation();
  const aiInitialData = location.state?.aiInitialData || {};

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
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
              <CookingPot size={20} color="#fff" />
            </div>
            <div className="ai-header-text">
              <h1>Diet Assistant</h1>
              <p>Powered by dnalyst</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="theme-toggle"
              onClick={clearChat}
              title="Clear Chat"
            >
              <Brush size={20} />
            </button>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? <Sun /> : <Moon />}
            </button>
            <button
              className="theme-toggle"
              onClick={() => navigate("/diet/DietMealPlanAssign")}
              title="Back to Diet Plan Assign"
            >
              <X size={20} />
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

              {msg.type === "bot" && (
                <Pencil
                  size={18}
                  className="edit-icon"
                  onClick={() => {
                    setEditableContent(msg.text);
                    setIsEditing(true);
                  }}
                />
              )}
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
      {/* ✅ Right-side sliding Edit Panel */}
      {isEditing && (
        <div className="ai-edit-side-panel">
          <div className="edit-panel-header">
            <h3>Edit Diet Plan</h3>
            <button
              onClick={() => setIsEditing(false)}
              className="edit-close-btn"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="edit-scroll-wrapper">
            <textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="edit-textarea"
            />
            <button
              className="btn btn-success"
              style={{ marginTop: "1rem" }}
              onClick={() => {
                toast.success("Diet chart successfully saved!", {
                  autoClose: 1500,
                });
                setIsEditing(false);
                navigate("/diet/DietMealPlanAssign", {
                  state: {
                    aiGeneratedText: editableContent,
                    ...aiInitialData,
                  },
                });
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatAssistantForDiet;
