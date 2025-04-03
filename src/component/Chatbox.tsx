"use client";

import { useState } from "react";
import axios from "axios";
import { FaRobot, FaPaperPlane } from "react-icons/fa";

const Chatbot = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;


    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await axios.post(
        "http://localhost:5122/api/comments",
        JSON.stringify(input),
        { headers: { "Content-Type": "application/json" } }
      );

      // Extract bot's response
      const botMessage = { sender: "bot", text: response.data.botMessage };
      setMessages((prev) => [...prev, botMessage]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Error: Unable to reach server." }]);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 w-80 bg-white border shadow-lg rounded-lg">
      <div className="bg-blue-500 text-white p-3 rounded-t-lg flex items-center">
        <FaRobot className="mr-2" />
        <span>Manufacturing Chatbot</span>
      </div>
      <div className="p-3 h-64 overflow-y-auto space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-2 rounded-lg ${msg.sender === "user" ? "bg-gray-300" : "bg-blue-200"}`}>
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
        />
        <button className="ml-2 bg-blue-500 text-white p-2 rounded-md" onClick={sendMessage}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
