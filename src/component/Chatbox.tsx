"use client";

import { useState } from "react";
import axios from "axios";
import { FaRobot, FaPaperPlane, FaChevronDown, FaChevronUp } from "react-icons/fa";

type Message = {
  sender: "user" | "bot";
  text: string;
};

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false); // ✅ Minimize state

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage: Message = { sender: "user", text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await axios.post(
        "http://localhost:5122/api/comments",
        JSON.stringify(trimmedInput),
        { headers: { "Content-Type": "application/json" } }
      );

      const botMessage: Message = {
        sender: "bot",
        text: response.data?.botMessage || "No response from bot.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error: Unable to reach server." },
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 w-72 bg-white border shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-red-500 text-white p-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center">
          <FaRobot className="mr-2" />
          <span>Manufacturing Chatbot</span>
        </div>
        <button onClick={() => setMinimized(!minimized)}>
          {minimized ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {/* Chat Content (conditionally hidden) */}
      {!minimized && (
        <>
          <div className="p-3 h-64 overflow-y-auto space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg whitespace-pre-wrap ${
                  msg.sender === "user" ? "bg-gray-200 text-right" : "bg-red-100 text-left"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="flex items-center p-3 border-t">
            <input
              type="text"
              className="flex-1 p-2 border rounded-md"
              placeholder="Ask about manufacturing..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              className="ml-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-md"
              onClick={sendMessage}
            >
              <FaPaperPlane />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;
