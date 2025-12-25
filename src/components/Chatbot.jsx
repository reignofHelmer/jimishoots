import React, { useState, useRef, useEffect } from "react";
import "../styles/chatbot.css";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I’m here to help with your booking." },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Send message function
  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([...messages, { from: "user", text: input }]);
    setInput("");

    // Simple bot response (simulate AI)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Thanks for your message! We'll get back to you soon." },
      ]);
    }, 1000);
  };

  return (
    <div className="chatbot-wrapper">
      {/* Floating bubble */}
      {!open && (
        <div className="chatbot-toggle" onClick={() => setOpen(true)}>
          <img src="/ailogo.png" alt="ai" />
        </div>
      )}
      {/* WhatsApp Hover Button */}
      <a
        href={`https://wa.me/${"2349035906395"}?text=${encodeURIComponent(
          "Hello Jimishoots, I’d like to make an enquiry"
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
      >
        <img src="/whatsapp-icon.png" alt="WhatsApp" />
      </a>


      {/* Chat window */}
      {open && (
        <div className={`chatbot-container open`}>
          <div className="chat-header">
            Chat with us
            <button className="close-btn" onClick={() => setOpen(false)}>
              ×
            </button>
          </div>

          <div className="chat-body">
            <div className="messages">
              {messages.map((m, idx) => (
                <div key={idx} className={`message ${m.from}`}>
                  {m.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={input}
                placeholder="Type a message..."
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;