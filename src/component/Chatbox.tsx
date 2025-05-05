//OpenAi and DeepSeek combined

"use client";

import { useState } from "react";
import axios from "axios";
import { FaRobot, FaPaperPlane, FaChevronDown, FaChevronUp } from "react-icons/fa";

type Message = {
  sender: "user" | "bot";
  text: string;
};

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false);

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
  
    const userMessage: Message = { sender: "user", text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
  
    try {
      const res = await axios.post("/api/chat", { message: trimmedInput });
  
      const openaiReply = res.data?.openai || "No response from OpenAI.";
      const deepseekReply = res.data?.deepseek || "No response from DeepSeek.";
  
      const botMessageOpenAI: Message = {
        sender: "bot",
        text: `🤖 OpenAI: ${openaiReply}`,
      };
  
      const botMessageDeepSeek: Message = {
        sender: "bot",
        text: `🧠 DeepSeek: ${deepseekReply}`,
      };
  
      setMessages((prev) => [...prev, botMessageOpenAI, botMessageDeepSeek]);
  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error: Could not get a response." },
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
    <div className="fixed bottom-5 right-5 w-80 bg-white border shadow-lg rounded-lg overflow-hidden">
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
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ask about manufacturing..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              className="ml-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition"
              onClick={sendMessage}
            >
              <FaPaperPlane />
            </button>
          </div>
        </>
      )}
    </div>
  );
}



//Just OpenAi
// "use client";

// import { useState } from "react";
// import axios from "axios";
// import { FaRobot, FaPaperPlane, FaChevronDown, FaChevronUp } from "react-icons/fa";

// type Message = {
//   sender: "user" | "bot";
//   text: string;
// };

// export default function Chatbot() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [minimized, setMinimized] = useState(false); // ✅ Minimize state

//   const sendMessage = async () => {
//     const trimmedInput = input.trim();
//     if (!trimmedInput) return;

//     const userMessage: Message = { sender: "user", text: trimmedInput };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");

//     try {
//       const res = await axios.post("/api/chat", { message: trimmedInput });
//       const botMessage: Message = {
//         sender: "bot",
//         text: res.data.reply || "No response from bot.",
//       };
//       setMessages((prev) => [...prev, botMessage]);
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     } catch (err) {
//       setMessages((prev) => [
//         ...prev,
//         { sender: "bot", text: "Error: Could not get a response." },
//       ]);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   return (
//     <div className="fixed bottom-5 right-5 w-72 bg-white border shadow-lg rounded-lg overflow-hidden">
//       {/* Header */}
//       <div className="bg-red-500 text-white p-3 rounded-t-lg flex items-center justify-between">
//         <div className="flex items-center">
//           <FaRobot className="mr-2" />
//           <span>Manufacturing Chatbot</span>
//         </div>
//         <button onClick={() => setMinimized(!minimized)}>
//           {minimized ? <FaChevronUp /> : <FaChevronDown />}
//         </button>
//       </div>

//       {/* Chat Content (conditionally hidden) */}
//       {!minimized && (
//         <>
//           <div className="p-3 h-64 overflow-y-auto space-y-2">
//             {messages.map((msg, idx) => (
//               <div
//                 key={idx}
//                 className={`p-2 rounded-lg whitespace-pre-wrap ${
//                   msg.sender === "user" ? "bg-gray-200 text-right" : "bg-red-100 text-left"
//                 }`}
//               >
//                 {msg.text}
//               </div>
//             ))}
//           </div>
//           <div className="flex items-center p-3 border-t">
//             <input
//               type="text"
//               className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
//               placeholder="Ask about manufacturing..."
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKeyPress}
//             />
//             <button
//               className="ml-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition"
//               onClick={sendMessage}
//             >
//               <FaPaperPlane />
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }




//Deepseek
// "use client";

// import { useState } from "react";
// import axios from "axios";

// export default function Chatbot() {
//   const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
//   const [input, setInput] = useState("");

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     // Add user's message to UI
//     setMessages((prev) => [...prev, { sender: "user", text: input }]);
//     setInput("");

//     try {
//       const res = await axios.post("/api/chat", {
//         message: input,
//         provider: "gemini", // 👈 Tell backend to use Gemini API
//       });

//       // Add bot's reply to UI
//       setMessages((prev) => [...prev, { sender: "bot", text: res.data.reply }]);
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     } catch (err) {
//       // Show error message in chat
//       setMessages((prev) => [
//         ...prev,
//         { sender: "bot", text: "Error: Could not get a response." },
//       ]);
//     }
//   };

//   return (
//     <div className="fixed bottom-4 right-4 bg-white border rounded-xl shadow-xl w-[350px] p-4 flex flex-col h-[450px]">
//       <h2 className="text-lg font-semibold mb-2">Manufacturing Chatbot</h2>
//       <div className="flex-1 overflow-y-auto space-y-2 mb-3">
//         {messages.map((m, i) => (
//           <div
//             key={i}
//             className={`text-sm p-2 rounded ${
//               m.sender === "user" ? "bg-gray-200 text-right" : "bg-blue-100"
//             }`}
//           >
//             {m.text}
//           </div>
//         ))}
//       </div>
//       <div className="flex gap-2">
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           placeholder="Type your question..."
//           className="flex-1 border rounded px-3 py-2 text-sm"
//         />
//         <button
//           onClick={sendMessage}
//           className="px-3 py-2 bg-blue-500 text-white rounded text-sm"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }




// internal memory comments

// "use client";

// import { useState } from "react";
// import axios from "axios";
// import { FaRobot, FaPaperPlane, FaChevronDown, FaChevronUp } from "react-icons/fa";

// type Message = {
//   sender: "user" | "bot";
//   text: string;
// };

// const Chatbot = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [minimized, setMinimized] = useState(false); // ✅ Minimize state

//   const sendMessage = async () => {
//     const trimmedInput = input.trim();
//     if (!trimmedInput) return;

//     const userMessage: Message = { sender: "user", text: trimmedInput };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");

//     try {
//       const response = await axios.post(
//         "http://localhost:5122/api/comments",
//         JSON.stringify(trimmedInput),
//         { headers: { "Content-Type": "application/json" } }
//       );

//       const botMessage: Message = {
//         sender: "bot",
//         text: response.data?.botMessage || "No response from bot.",
//       };
//       setMessages((prev) => [...prev, botMessage]);
//     } catch (error) {
//       console.error("Error sending message:", error);
//       setMessages((prev) => [
//         ...prev,
//         { sender: "bot", text: "Error: Unable to reach server." },
//       ]);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   return (
//     <div className="fixed bottom-5 right-5 w-72 bg-white border shadow-lg rounded-lg overflow-hidden">
//       {/* Header */}
//       <div className="bg-red-500 text-white p-3 rounded-t-lg flex items-center justify-between">
//         <div className="flex items-center">
//           <FaRobot className="mr-2" />
//           <span>Manufacturing Chatbot</span>
//         </div>
//         <button onClick={() => setMinimized(!minimized)}>
//           {minimized ? <FaChevronUp /> : <FaChevronDown />}
//         </button>
//       </div>

//       {/* Chat Content (conditionally hidden) */}
//       {!minimized && (
//         <>
//           <div className="p-3 h-64 overflow-y-auto space-y-2">
//             {messages.map((msg, idx) => (
//               <div
//                 key={idx}
//                 className={`p-2 rounded-lg whitespace-pre-wrap ${
//                   msg.sender === "user" ? "bg-gray-200 text-right" : "bg-red-100 text-left"
//                 }`}
//               >
//                 {msg.text}
//               </div>
//             ))}
//           </div>
//           <div className="flex items-center p-3 border-t">
//             <input
//               type="text"
//               className="flex-1 p-2 border rounded-md"
//               placeholder="Ask about manufacturing..."
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKeyPress}
//             />
//             <button
//               className="ml-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-md"
//               onClick={sendMessage}
//             >
//               <FaPaperPlane />
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default Chatbot;

