const { BedrockEmbeddings } = require("@langchain/community/embeddings/bedrock");
const { Bedrock } = require("@langchain/community/llms/bedrock");

const getEmbeddingFunction = (modelId, credentials) => {
    const { region, accessKeyId, secretAccessKey } = credentials;
    const embeddings = new BedrockEmbeddings({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      model: modelId, 
    });
      return embeddings
}

const getModel = async (modelId, credentials, parameters) => {
  const {region, accessKeyId, secretAccessKey} = credentials;
  const {temperature, maxTokens, streaming} = parameters;
  const model = new Bedrock({
    model: modelId, 
    region: region,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
    temperature,
    maxTokens,
    streaming,
    modelKwargs: {},
  });
  return model;
}

module.exports = { getEmbeddingFunction, getModel }

// configure iam. Visit https://github.com/cloudopian/amazon-bedrock-dotnet-samples to know more.
// get model id from https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html