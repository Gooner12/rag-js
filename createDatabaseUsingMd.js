const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { UnstructuredLoader } = require("@langchain/community/document_loaders/fs/unstructured");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { getEmbeddingFunction } = require("./foundationModel");
const { ChromaClient } = require("chromadb");

require("dotenv").config();

const DATA_PATH = "./data/text.md";

// markdown loader
const loadDocuments = async () => {
    const loader = new UnstructuredLoader(DATA_PATH, {
        apiKey: process.env.UNSTRUCTURED_API_KEY,
        apiUrl: process.env.UNSTRUCTURED_API_URL,
      });
    return await loader.load();
}

const splitDocuments = (documents) => {
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 150,
        chunkOverlap: 50,
      })
    return textSplitter.splitDocuments(documents);  
}

const main = async () => {
    const documents = await loadDocuments();
    const chunks = await splitDocuments(documents)
    console.log(chunks)
    saveEmbeddings(chunks)
}

const saveEmbeddings = async (chunks) => {
    const url = "http://localhost:8000";
    const collectionName = "biography-collection";
    await createCollection(url, collectionName, chunks);
    console.log("Embeddings have been stored in the database");    
}

// this function creates a collection in the chroma database from scratch. If there is already a collection, then it deletes that collection
const createCollection = async (url, collectionName, chunks) => {
    const modelId = "amazon.titan-embed-text-v2:0";
    const credentials = {
        region: process.env.BEDROCK_AWS_REGION_USEAST,
        accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY
    }
    const chroma = new ChromaClient({ path: url });
    chroma.deleteCollection({name: collectionName});
    const vectorStore = await Chroma.fromDocuments(chunks, getEmbeddingFunction(modelId, credentials), {
        collectionName: collectionName,
        url: url, 
        collectionMetadata: {
          "hnsw:space": "cosine",
        }, 
      });
    const collections = await chroma.listCollections({});
    console.log(collections);
}

main()
