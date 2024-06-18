const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { DirectoryLoader } = require("langchain/document_loaders/fs/directory");
// const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { getEmbeddingFunction } = require("./foundationModel");
const { ChromaClient } = require("chromadb");

require("dotenv").config();

const DATA_PATH = "./data/pdf"

// pdf loader to load all PDFs within the specified directory
const loadDocuments = async () => {
    const directoryLoader = new DirectoryLoader(DATA_PATH,
        {
          ".pdf": (path) => new PDFLoader(path, {parsedItemSeparator: "",}),
        }
      );
    return docs = await directoryLoader.load(); 
}

const splitDocuments = (documents) => {
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 70,
        chunkOverlap: 20,
      })
    return textSplitter.splitDocuments(documents);  
}

const main = async () => {
    const documents = await loadDocuments();
    const chunks = await splitDocuments(documents)
    const chunkWithIds = assignChunkId(chunks);
    saveEmbeddings(chunkWithIds)
}

// this function assigns a unique id to the chunk for a document. In this case pdf document. 
const assignChunkId = (chunks) => {
    lastPageId = null;
    currentChunkIndex = 0;
    chunks.forEach((chunk) => {
        const source = chunk.metadata.source;
        const pageNumber = chunk.metadata.loc.pageNumber;
        // const lines = chunk.metadata.loc.lines; 
        const currentPageId = `${source}:${pageNumber}`;
        // compare if the current page id is same as the last page id. If not increment the index
        if (currentPageId === lastPageId)
            currentChunkIndex++;
        else
            currentChunkIndex = 0;
        const chunkId = `${currentPageId}:${currentChunkIndex}`;
        lastPageId = currentPageId

        // add the chunkId to the metadata
        chunk.metadata["id"] = chunkId;
    });
    return chunks
}

const saveEmbeddings = async (chunks) => {
    const url = "http://localhost:8000";
    const collectionName = "biography-collection-pdf";
    const modelId = "amazon.titan-embed-text-v2:0";
    const credentials = {
        region: process.env.BEDROCK_AWS_REGION_USEAST,
        accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY
    }
    await createCollection(url, collectionName, chunks, modelId, credentials);
    console.log("Embeddings have been stored in the database"); 
}

// this function deletes a collection if present. If not it just creates a collection
const createCollection = async (url, collectionName, chunks, modelId, credentials) => {
    const chroma = new ChromaClient({ path: url });
    try {
    const collection = await chroma.getCollection({name: collectionName});
    const existingIds = await getExistingIds(collection);
    const updatedChunks = await getUpdatedChunks(existingIds, chunks);
    if (updatedChunks.length) {
        await storeVectors(url, collectionName, updatedChunks, modelId, credentials);
    } 
    }
    catch(error) {
        if (error.message.includes(`ValueError('Collection ${collectionName} does not exist.')`)) {
            console.log("collection does not exist")
            await storeVectors(url, collectionName, chunks, modelId, credentials);
          } else {
            console.error("Error occurred:", error);
          }
    }
}

// this function returns the ids array created from the existing items in a collection
const getExistingIds = async (collection) => {
    const existingIds = []
    const items = await collection.get();
    // console.log(items);
    items.metadatas.forEach((metadata) => {
        existingIds.push(metadata.id);
    })
    return existingIds;
}

// this function returns the chunks that is not present in the existing collection so that we only add the new chunks to the existing collection discarding the already present old chunks
const getUpdatedChunks = async (existingIds, chunks) => {
    const updatedChunks = [];
    chunks.forEach((chunk) => {
        if (!existingIds.includes(chunk.metadata.id)) {
            updatedChunks.push(chunk);
        }
    });
    return updatedChunks;
}

const storeVectors = async (url, collectionName, chunks, modelId, credentials) => {
    const vectorStore = await Chroma.fromDocuments(chunks, getEmbeddingFunction(modelId, credentials), {
    collectionName: collectionName,
    url: url, 
    collectionMetadata: {
        "hnsw:space": "cosine",
    }, 
    });
}

main()
