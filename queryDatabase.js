const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { getEmbeddingFunction, getModel } = require("./foundationModel");
const { PromptTemplate } = require("@langchain/core/prompts");

require("dotenv").config();

const QUERY = "Who is Morgan?"
const PROMPT_TEMPLATE = `
Answer the question based only on the following context:

{context}

---

Answer the question based on the above context only: {question}
`;

// this function queries the vectors in the existing collection and if the score is greater than the certain threshold than we do not process further
const queryDB = async () => {
    const modelId = "amazon.titan-embed-text-v2:0";
    const credentials = {
        region: process.env.BEDROCK_AWS_REGION_USEAST,
        accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY
    }
    const vectorStore = await Chroma.fromExistingCollection(
        getEmbeddingFunction(modelId, credentials),
        { collectionName: "biography-collection" }
        ); 
    const similarResults = await vectorStore.similaritySearchWithScore(QUERY, 3);

    if (similarResults.length === 0 || similarResults[0][1] > 0.7)
        return

    const context = createContext(similarResults)
    const prompt = await createPrompt(context);
    console.log(prompt)
    const response = await getResponse(prompt);
    console.log(response);
}

// creating the context based on the results obtained from the query by joining the contents in the result array
const createContext = (resultArray) => {
    const results =  resultArray.map((result) => {
        return result[0].pageContent
    });
    const contextText = results.join("\n\n---\n\n");
    return contextText
}

// this function creates the prompt to be supplied to the text model by combining the context with the query
const createPrompt = async (context) => {
    const prompt = PromptTemplate.fromTemplate(PROMPT_TEMPLATE);
    const formattedPrompt = await prompt.format({
        context: context,
        question: QUERY
      });
    console.log(formattedPrompt);
    return formattedPrompt
}

const getResponse = async (prompt) => {
    const modelId = "amazon.titan-text-express-v1";
    // const modelId = "amazon.titan-text-lite-v1";
    const parameters = {
        temperature: 0,
        maxTokens: 400,
        streaming: true,
    }
    const credentials = {
        region: process.env.BEDROCK_AWS_REGION_SYD,
        accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY
    }
    const model = await getModel(modelId, credentials, parameters);
    const response = await model.invoke(prompt);
    return response;
}

queryDB()

