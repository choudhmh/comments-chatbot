import { NextResponse } from "next/server";
import { config } from "dotenv";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import * as fs from "fs/promises";
import path from "path";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

config(); // Load env vars

let chain: Runnable | null = null;

async function loadAllDocuments(): Promise<Document[]> {
  const docsDir = path.join(process.cwd(), "docs");
  const files = await fs.readdir(docsDir);
  const docs: Document[] = [];

  for (const file of files) {
    const filePath = path.join(docsDir, file);

    if (file.endsWith(".txt")) {
      const text = await fs.readFile(filePath, "utf-8");
      docs.push(new Document({ pageContent: text, metadata: { source: file } }));
    } else if (file.endsWith(".json")) {
      const jsonText = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(jsonText);
      const records = Array.isArray(parsed) ? parsed : [parsed];
      for (const record of records) {
        docs.push(new Document({ pageContent: JSON.stringify(record), metadata: { source: file } }));
      }
    } else if (file.endsWith(".pdf")) {
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

async function chunkData(data: Document[]) {
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
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);
  return vectorStore;
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

  // Prompt uses {input} to match the expected input key
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant that answers questions based only on the given context."],
    ["human", "Context:\n{context}\n\nQuestion:\n{input}"]
  ]);

  const documentChain = await createStuffDocumentsChain({
    llm,
    prompt,
  });

  chain = await createRetrievalChain({
    retriever,
    combineDocsChain: documentChain,
    // no inputKey here
  });
}

export async function generateResponse(query: string) {
  if (!chain) {
    await initializeChain();
  }

  if (!chain) {
    throw new Error("Chain is not initialized.");
  }

  const safeQuery = typeof query === "string" && query.trim().length > 0 ? query.trim() : "What is this about?";

  try {
    const result = await chain.invoke({ input: safeQuery }); // use 'input' key here
    return result?.text || result?.answer || "No answer found.";
  } catch (error) {
    console.error("Error invoking chain:", error);
    throw error;
  }
}

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
