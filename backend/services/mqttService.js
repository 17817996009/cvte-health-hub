const mqtt = require('mqtt');
const HealthData = require('../models/HealthData');

const client = mqtt.connect(process.env.MQTT_BROKER);

client.on('connect', () => {
  console.log('✅ MQTT客户端已连接');
  client.subscribe('cvte/health/#', (err) => {
    if (err) {
      console.error('❌ 订阅主题失败:', err);
    } else {
      console.log('✅ 已订阅健康数据主题');
    }
  });
});

client.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log(`📩 收到来自 ${topic} 的数据`);
    
    // 保存到数据库
    const healthData = new HealthData({
      userId: data.userId,
      deviceType: data.deviceType,
      data: data.data,
      timestamp: new Date(data.timestamp)
    });
    
    await healthData.save();
    console.log('✅ 健康数据已保存到数据库');
  } catch (error) {
    console.error('❌ 处理MQTT消息失败:', error);
  }
});

module.exports = client;