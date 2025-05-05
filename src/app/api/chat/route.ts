
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  const { message } = await req.json();

  try {
    // Run OpenAI and DeepSeek calls in parallel
    const [openaiRes, deepseekRes] = await Promise.all([
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message }],
        }),
      }),
      fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: message }],
        }),
      }),
    ]);

    const [openaiData, deepseekData] = await Promise.all([
      openaiRes.json(),
      deepseekRes.json(),
    ]);

    const openaiReply = openaiData?.choices?.[0]?.message?.content || "No response from OpenAI.";
    const deepseekReply = deepseekData?.choices?.[0]?.message?.content || "No response from DeepSeek.";

    return NextResponse.json({
      openai: openaiReply,
      deepseek: deepseekReply,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to get responses" }, { status: 500 });
  }
}



//OpenAi
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// export async function POST(req: Request) {
//   const body = await req.json();
//   const userMessage = body.message;

//   if (!userMessage) {
//     return NextResponse.json({ error: "No message provided" }, { status: 400 });
//   }

//   try {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo", 
//       messages: [
//         {
//           role: "system",
//           content: `
// You are a manufacturing assistant chatbot. You understand OEE, Vorne systems, downtime causes, machine status, and comment logs. 
// Only answer manufacturing-related questions. If the question is off-topic, say:
// "I'm not sure how to help with that. Please ask a manufacturing-related question."
//         `
//         },
//         { role: "user", content: userMessage }
//       ]
//     });

//     const reply = completion.choices[0].message.content;
//     return NextResponse.json({ reply });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "OpenAI error" }, { status: 500 });
//   }
// }

// DeepSeek API:
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const userMessage = body.message;

//     const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
//       },
//       body: JSON.stringify({
//         model: "deepseek-chat", 
//         messages: [
//           { role: "system", content: "You are a helpful assistant in a manufacturing company chatbot." },
//           { role: "user", content: userMessage }
//         ],
//         temperature: 0.7
//       })
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error("DeepSeek Error:", errorData);
//       return NextResponse.json({ error: "Failed to get response from DeepSeek" }, { status: 500 });
//     }

//     const data = await response.json();
//     const reply = data.choices?.[0]?.message?.content ?? "⚠️ No response from model.";
//     return NextResponse.json({ reply });

//   } catch (err) {
//     console.error("Server Error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// GEMINI API
// import { NextResponse } from "next/server";

// // Define the API Key and endpoint
// const API_KEY = "AIzaSyA_8IbJbtgQ0qy3S35E__BWv0bbdus7_5M";
// const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"; 

// // Define the response structure for Gemini API response
// interface GeminiModelResponse {
//   models: GeminiModel[];
// }

// interface GeminiModel {
//   name: string;
//   supportedMethods: string[];
// }

// interface GeminiGenerateResponse {
//   response: {
//     text: string;
//   };
// }

// export async function POST(req: Request) {
//   const body = await req.json();
//   const userMessage = body.message;
//   const provider = body.provider || "gemini";

//   try {
//     if (provider === "gemini") {
//       // Directly call Gemini API to list available models with API Key in query string
//       const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
//         method: 'GET',
//         headers: {
//           "Content-Type": "application/json",
//         }
//       });

//       if (!response.ok) {
//         console.error("Failed to fetch models from Gemini API", response.statusText);
//         return NextResponse.json({ error: "Gemini API models request failed" }, { status: 500 });
//       }

//       const data: GeminiModelResponse = await response.json(); // Use the defined type

//       // Check for available models
//       const availableModels = data.models;

//       // Look for a model that we want to use
//       const selectedModel = availableModels?.find((model) => model.name === "gemini-pro");

//       if (!selectedModel) {
//         return NextResponse.json({ error: "Gemini model not found" }, { status: 404 });
//       }

//       // Call the Gemini API with the selected model
//       const modelResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel.name}:generateContent?key=${API_KEY}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [{ text: userMessage }],
//               role: "user",
//             },
//           ],
//         }),
//       });

//       if (!modelResponse.ok) {
//         console.error("Failed to generate content from Gemini API", modelResponse.statusText);
//         return NextResponse.json({ error: "Gemini content generation failed" }, { status: 500 });
//       }

//       const result: GeminiGenerateResponse = await modelResponse.json();
//       const reply = result.response?.text;

//       return NextResponse.json({ reply });
//     }

//     return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
//   } catch (err) {
//     console.error("Gemini Error:", err);
//     return NextResponse.json({ error: "Gemini API call failed" }, { status: 500 });
//   }
// }
