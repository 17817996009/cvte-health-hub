require('dotenv').config();
const axios = require('axios');

const TOKENHUB_API_KEY = process.env.TOKENHUB_API_KEY;
const TOKENHUB_API_URL = process.env.TOKENHUB_API_URL || "https://hy3-preview.tokhub.com/v1/chat/completions";

async function chatWithHunyuan(question) {
  try {
    const response = await axios.post(
      TOKENHUB_API_URL,
      {
        model: "hy3-preview",
        messages: [
          {
            role: "system",
            content: "你是全能AI助手，能回答用户的任何问题，包括健康、生活、学习、工作等所有领域，回答简洁易懂，语气友好。"
          },
          {
            role: "user",
            content: question
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${TOKENHUB_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("TokenHub API调用错误：", error.response?.data || error.message);
    return "AI服务暂时不可用，请稍后再试";
  }
}

module.exports = { chatWithHunyuan };