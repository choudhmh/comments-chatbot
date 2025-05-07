import os
from dotenv import load_dotenv,find_dotenv
from langchain_community.document_loaders import TextLoader, PyPDFLoader, JSONLoader
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings

vector_store = None
chain = None

load_dotenv(find_dotenv())

def load_all_documents():
    docs = []

    # Load .txt files
    for file in os.listdir("docs"):
        if file.endswith(".txt"):
            loader = TextLoader(os.path.join("docs", file))
            docs.extend(loader.load())

        elif file.endswith(".pdf"):
            loader = PyPDFLoader(os.path.join("docs", file))
            docs.extend(loader.load())

        elif file.endswith(".json"):
            loader = JSONLoader(
                file_path=os.path.join("docs", file),
                jq_schema='.',
                text_content=False
            )
            docs.extend(loader.load())

    return docs

# splitting data in chunks
def chunk_data(data, chunk_size=1000, chunk_overlap=200):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    chunks = text_splitter.split_documents(data)
    return chunks

def create_embeddings():
    docs = load_all_documents()
    chunks = chunk_data(docs)

    # embeddings = OpenAIEmbeddings()
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    db = Chroma.from_documents(documents=chunks, embedding=embeddings, persist_directory="chroma_db")
    
    return db

def ask_and_get_answer(vector_store, k=3):
    
    # llm = ChatOpenAI(model='gpt-4-1106-preview', temperature=0.1)
    # llm = ChatOpenAI(model='o4-mini')
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.1)
    retriever = vector_store.as_retriever(search_type='similarity', search_kwargs={'k': k})
    # retriever = vector_store.as_retriever()

    prompt = PromptTemplate(
        input_variables=["context", "question"],
        template="""
You are a comment analysis assistant. Based on the context of collected user comments below, analyze and answer the following question. 
Be specific and use only the information in the context. If the answer is not available, say "I don't know."

User comments:
{context}

Question:
{question}

Answer:
"""
    )

    chain = RetrievalQA.from_chain_type(
        llm=llm, 
        chain_type="stuff", 
        retriever=retriever,
        chain_type_kwargs={"prompt": prompt},
        verbose=True
    )

    return chain

def generate_response(query):
    global chain

    if chain is None:
        raise ValueError("Chain is not initialized. Please run initialize() first.")

    response = chain.invoke(query)
    return response

def initialize():
    global vector_store, chain

    # creating the embeddings and returning the Chroma vector store
    vector_store = create_embeddings()

    chain = ask_and_get_answer(vector_store)

if __name__ == "__main__":
    initialize()
    print("Comment Analysis Chatbot is ready. Type your question or type 'quit' to exit.\n")

    while True:
        user_input = input("User: ").strip().lower()

        if user_input in {"quit", "exit", "bye", "close"}:
            print("Chatbot: Goodbye!")
            break
        
        try:
            response = generate_response(user_input)

            if isinstance(response, dict) and "result" in response:
                response_text = response["result"]
            else:
                response_text = str(response)

            print("Chatbot: ", response_text.strip(), "\n")

        except Exception as e:
            print("Chatbot: Sorry, something went wrong. Please try again.")
            print("Debug info:", str(e))