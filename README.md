# rag-js

# RAG Application

This project is a Retrieval-Augmented Generation (RAG) application that generates responses to queries using Langchain and foundation models in JavaScript. The application leverages vector stores and embeddings to enhance the quality of the responses.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)

## Introduction

RAG (Retrieval-Augmented Generation) is a technique that combines retrieval-based and generation-based approaches to provide more accurate and contextually relevant responses to user queries. This application uses Langchain for managing the language models and embeddings, and foundation models to generate high-quality responses.

## Features

- **Document Loading**: Load documents from a directory to create a knowledge base.
- **Text Splitting**: Split documents into manageable chunks for better processing.
- **Embedding Creation**: Generate embeddings for document chunks using foundation models.
- **Query Handling**: Handle user queries and provide accurate responses using retrieval-augmented generation.
- **Chroma Vector Store**: Store and manage document embeddings using Chroma.

## Prerequisites

Before running the application, ensure you have the following installed:

- Node.js (>= 14.x)
- npm (Node Package Manager)
- chromadb 

## Installation

1. **Clone the Repository**

   ```sh
   git clone https://github.com/Gooner12/rag-js.git
   cd rag-application
   ```

2. **Install Dependencies**

    ```js 
    npm install
    ```

3. **Run ChromaDB Server**

   You can run the chromadb locally using Docker or using chromadb cli.
   
   - Using Docker:

    ```sh
    git clone git@github.com:chroma-core/chroma.git
    cd chroma
    docker-compose up -d --build
    ```

    - Using ChromaDB CLI:

      To use chromadb cli, you need to install the chromadb using:

      ```py
      pip install chromadb
      chroma run --host localhost --port 8000 --path ./my_chroma_data
      ```
   For more information on running the chromadb server, check out [this link](https://cookbook.chromadb.dev/running/running-chroma/#chroma-cli).

 4. **Configure Environment Variables**
    
    Lastly, create a .env file with environment variables containing your secret key and access key.  
