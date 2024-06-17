const { BedrockEmbeddings } = require("@langchain/community/embeddings/bedrock");

require("dotenv").config();

const getEmbeddingFunction = () => {
    const embeddings = new BedrockEmbeddings({
        region: process.env.BEDROCK_AWS_REGION_USEAST,
        credentials: {
          accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY,
        },
        model: "amazon.titan-embed-text-v2:0", 
      });
      return embeddings
}

module.exports = { getEmbeddingFunction }

// configure iam. Visit https://github.com/cloudopian/amazon-bedrock-dotnet-samples to know more.
// get model id from https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html