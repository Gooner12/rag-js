const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { UnstructuredLoader } = require("@langchain/community/document_loaders/fs/unstructured");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { getEmbeddingFunction } = require("./embeddings");

require("dotenv").config();

dataPath = "./data/text.md";

// markdown loader
const loadDocuments = async () => {
    const loader = new UnstructuredLoader(dataPath, {
        apiKey: process.env.UNSTRUCTURED_API_KEY,
        apiUrl: process.env.UNSTRUCTURED_API_URL,
      });
    return await loader.load();
}

const splitDocuments = (documents) => {
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 50,
        chunkOverlap: 20,
      })
    return textSplitter.splitDocuments(documents);  
}

const main = async () => {
    const documents = await loadDocuments();
    const chunks = await splitDocuments(documents)
    saveEmbeddings(chunks)
}

const saveEmbeddings = async (chunks) => {
    const vectorStore = await Chroma.fromDocuments(chunks, getEmbeddingFunction(), {
        collectionName: "biography-collection",
        url: "http://localhost:8000", 
        collectionMetadata: {
          "hnsw:space": "cosine",
        }, 
      });
    console.log("Embeddings have been stored in the database");    
}

main()
