import { NextResponse } from "next/server";
import { config } from "dotenv";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import * as fs from "fs/promises";
import path from "path";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";


config(); // Load env vars

let chain: Runnable | null = null;

// Helper Functions

async function loadAllDocuments(): Promise<Document[]> {
    const docsDir = path.join(process.cwd(), "docs");
    const files = await fs.readdir(docsDir);
    const docs: Document[] = [];
  
    for (const file of files) {
      const filePath = path.join(docsDir, file);
  
      if (file.endsWith(".txt")) {
        const text = await fs.readFile(filePath, "utf-8");
        docs.push(new Document({ pageContent: text, metadata: { source: file } }));
      }
  
      else if (file.endsWith(".json")) {
        const jsonText = await fs.readFile(filePath, "utf-8");
        const parsed = JSON.parse(jsonText);
        // Flatten if it's an array of objects
        const records = Array.isArray(parsed) ? parsed : [parsed];
        for (const record of records) {
          docs.push(new Document({ pageContent: JSON.stringify(record), metadata: { source: file } }));
        }
      }
  
      else if (file.endsWith(".pdf")) {
        try {
          const { PDFLoader } = await import("@langchain/community/document_loaders/fs/pdf");
          const loader = new PDFLoader(filePath);
          docs.push(...(await loader.load()));
        } catch (e) {
          console.warn("PDFLoader failed or not installed:", e);
        }
      }
    }
  
    return docs;
}

async function chunkData(data: Document<Record<string, unknown>>[]) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  return splitter.splitDocuments(data);
}

async function createEmbeddings() {
  const docs = await loadAllDocuments();
  const chunks = await chunkData(docs);

  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "models/embedding-001",
  });

  return Chroma.fromDocuments(chunks, embeddings, {
    // Removed persistDirectory as it is not a valid property
  });
}

async function initializeChain() {
    const vectorStore = await createEmbeddings();
    
    const retriever = vectorStore.asRetriever({
        searchType: "similarity",
        k: 3,
    }); 

    const llm = new ChatGoogleGenerativeAI({
        model: "gemini-1.5-flash",
        temperature: 0.1,
    });

  const prompt = ChatPromptTemplate.fromTemplate(`
You are a comment analysis assistant. Based on the context of collected user comments below, analyze and answer the following question. 
Be specific and use only the information in the context. If the answer is not available, say "I don't know."

User comments:
{context}

Question:
{question}

Answer:`);


    const documentChain = await createStuffDocumentsChain({
        llm,
        prompt,
    });

    chain = await createRetrievalChain({
        retriever,
        combineDocsChain: documentChain,
    });
}

async function generateResponse(query: string) {
    if (!chain) {
        await initializeChain();
    }

    if (!chain) {
        throw new Error("Chain is not initialized.");
    }

    const result = await chain.invoke({ input: query });
    return result?.answer || "No answer found.";
}

// API Handler

export async function POST(req: Request) {
  const { message } = await req.json();

  if (!message) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }

  try {
    const answer = await generateResponse(message);
    return NextResponse.json({ reply: answer });
  } catch (err) {
    console.error("RAG error:", err);
    return NextResponse.json({ error: "Failed to get RAG response." }, { status: 500 });
  }
}
