const axios = require('axios');
require('dotenv').config();

// TokenHub配置
const API_KEY = process.env.TOKENHUB_API_KEY;
const API_URL = process.env.TOKENHUB_API_URL;

// 调用Hy3 preview模型
async function callHy3Preview(messages) {
  try {
    const response = await axios.post(API_URL, {
      model: "hy3-preview",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024
    }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      }
    });
    console.log("✅ TokenHub Hy3 preview调用成功！");
    return response.data;
  } catch (error) {
    console.error("🚨 调用失败:", error.response?.data || error.message);
    throw error;
  }
}

// 1. 健康风险评估
async function assessHealthRisks(healthData) {
  const heartRate = healthData?.heartRate || 72;
  const bloodOxygen = healthData?.bloodOxygen || 98;
  const stressLevel = healthData?.stressLevel || 3;

  try {
    const res = await callHy3Preview([
      { role: "system", content: '你是健康助手，仅输出JSON数组：[{"title":"","description":"","level":"danger/warning"}]' },
      { role: "user", content: `心率${heartRate} 血氧${bloodOxygen} 压力${stressLevel}` }
    ]);
    return JSON.parse(res.choices[0].message.content);
  } catch (e) { return []; }
}

// 2. 生成健康报告
async function generateHealthReport(healthData) {
  const heartRate = healthData?.heartRate || 72;
  const bloodOxygen = healthData?.bloodOxygen || 98;

  try {
    const res = await callHy3Preview([
      { role: "system", content: "你是家庭健康AI，生成简短中文健康报告，纯文本无格式" },
      { role: "user", content: `心率${heartRate} 血氧${bloodOxygen}` }
    ]);
    return res.choices[0].message.content;
  } catch (e) {
    return `健康报告：心率${heartRate}次/分，身体状态良好`;
  }
}

// 3. 生成干预方案
async function generateInterventionPlan(healthData) {
  const heartRate = healthData?.heartRate || 72;
  try {
    const res = await callHy3Preview([
      { role: "system", content: "你是健康管理师，生成简短干预方案" },
      { role: "user", content: `心率${heartRate}` }
    ]);
    return res.choices[0].message.content;
  } catch (e) {
    return "建议：每日运动30分钟，早睡早起";
  }
}

module.exports = {
  assessHealthRisks,
  generateHealthReport,
  generateInterventionPlan
};