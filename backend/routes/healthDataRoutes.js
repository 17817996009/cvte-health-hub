const express = require('express');
const router = express.Router();
const HealthData = require('../models/HealthData');
const aiService = require('../services/aiService');
const auth = require('../middleware/auth');

// 获取用户最新健康数据（智能镜页面用）
router.get('/latest', auth, async (req, res) => {
  try {
    const latestData = await HealthData.findOne({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(1);
    
    if (!latestData) {
      // 智能镜模拟数据
      const mockHealthData = {
        userId: req.user.id,
        deviceType: 'smart_mirror',
        data: {
          heartRate: 72,
          bloodOxygen: 98,
          stressLevel: 3,
          skinCondition: 'good',
          mood: 'happy'
        },
        timestamp: new Date()
      };
      return res.json({ success: true, data: mockHealthData });
    }
    
    res.json({ success: true, data: latestData });
  } catch (error) {
    console.error('❌ 获取健康数据失败:', error);
    res.status(500).json({ success: false, message: '获取健康数据失败', error: error.message });
  }
});

// 获取用户历史健康数据（MAXHUB大屏用，新增模拟数据）
router.get('/history', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const historyData = await HealthData.find({
      userId: req.user.id,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });
    
    // 🔴 关键：如果没有真实数据，返回7天模拟数据
    if (historyData.length === 0) {
      const mockHistoryData = [];
      const baseDate = new Date();
      for (let i = days; i >= 0; i--) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        mockHistoryData.push({
          userId: req.user.id,
          deviceType: 'smart_mirror',
          data: {
            heartRate: Math.floor(Math.random() * 20) + 65, // 65-85次/分
            bloodOxygen: Math.floor(Math.random() * 3) + 96, // 96-99%
            stressLevel: Math.floor(Math.random() * 4) + 2, // 2-5/10
            skinCondition: 'good',
            mood: 'happy'
          },
          timestamp: date
        });
      }
      return res.json({ success: true, data: mockHistoryData });
    }
    
    res.json({ success: true, data: historyData });
  } catch (error) {
    console.error('❌ 获取历史数据失败:', error);
    res.status(500).json({ success: false, message: '获取历史数据失败', error: error.message });
  }
});

// 分析健康数据（AI报告用）
router.post('/analyze', auth, async (req, res) => {
  try {
    const { healthData } = req.body;
    
    const risks = aiService.assessHealthRisks(healthData);
    const userInfo = {
      name: req.user.name,
      age: 45,
      healthConditions: ['有高血压家族史']
    };
    
    let report;
    try {
      report = await aiService.generateHealthReport(req.user.id, healthData, userInfo);
    } catch (error) {
      console.error('❌ AI报告生成失败，使用备用模拟报告:', error);
      report = `
张先生健康报告
一、基本健康数据
* 心率：${healthData.heartRate}次/分（正常范围：60-100次/分）
* 血氧饱和度：${healthData.bloodOxygen}%（正常范围：95%-100%）
* 压力值：${healthData.stressLevel}/10（较低，表示压力较小）

二、健康评估
1. 心率：在正常范围内，心脏功能良好。
2. 血氧饱和度：正常，呼吸系统运作良好。
3. 压力值：较低，情绪相对放松。

三、个性化建议
1. 继续保持现有生活习惯，保证7-8小时睡眠。
2. 每周进行3-5次中等强度运动，如快走、慢跑。
3. 每天喝够1500-2000ml水，维持皮肤和身体状态。
      `;
    }
    
    const interventionPlan = await aiService.generateInterventionPlan(risks, userInfo);
    
    res.json({
      success: true,
      risks,
      report,
      interventionPlan
    });
  } catch (error) {
    console.error('❌ 分析健康数据失败:', error);
    res.status(500).json({ success: false, message: '分析健康数据失败', error: error.message });
  }
});

// 🔴 新增：MAXHUB大屏统计数据接口
router.get('/stats', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 今日监测次数
    const todayCount = await HealthData.countDocuments({
      userId: req.user.id,
      timestamp: { $gte: today }
    });
    
    // 近7天平均心率、血氧
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const historyData = await HealthData.find({
      userId: req.user.id,
      timestamp: { $gte: sevenDaysAgo }
    });
    
    // 模拟统计数据（无真实数据时）
    if (historyData.length === 0) {
      return res.json({
        success: true,
        todayCount: 5,
        avgHeartRate: 72,
        avgBloodOxygen: 98,
        healthScore: 92,
        changeRate: 3
      });
    }
    
    // 真实数据统计
    const avgHeartRate = Math.round(historyData.reduce((sum, d) => sum + d.data.heartRate, 0) / historyData.length);
    const avgBloodOxygen = Math.round(historyData.reduce((sum, d) => sum + d.data.bloodOxygen, 0) / historyData.length);
    const healthScore = Math.round((avgHeartRate/100 + avgBloodOxygen/100 + (10 - historyData.reduce((sum, d) => sum + d.data.stressLevel, 0)/historyData.length)/10) * 33.3);
    
    res.json({
      success: true,
      todayCount: todayCount,
      avgHeartRate,
      avgBloodOxygen,
      healthScore,
      changeRate: 3
    });
  } catch (error) {
    console.error('❌ 获取统计数据失败:', error);
    res.status(500).json({ success: false, message: '获取统计数据失败', error: error.message });
  }
});

module.exports = router;