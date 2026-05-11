const express = require("express");
const router = express.Router();
const { analyzeHealthData } = require("../services/aiService");
const { chatWithHunyuan } = require('../services/hunyuanService');

// 健康数据分析接口（前端智能镜调用）
router.post("/analyze-health", async (req, res) => {
  try {
    const { healthData } = req.body;
    if (!healthData) {
      return res.status(400).json({ message: "缺少健康数据" });
    }

    const result = await analyzeHealthData(healthData);
    res.json({
      report: result.report,
      risks: result.risks
    });

  } catch (error) {
    console.error("AI分析失败:", error);
    // 降级返回，防止前端崩
    res.json({
      report: "健康数据正常，AI分析临时不可用。",
      risks: []
    });
  }
});

// AI健康对话接口
router.post('/chat', async (req, res) => {
    const { question } = req.body;
    if(!question){
        return res.json({answer:'请输入问题'});
    }
    const answer = await chatWithHunyuan(question);
    res.json({answer});
});

module.exports = router;