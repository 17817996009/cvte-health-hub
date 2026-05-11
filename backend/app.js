// 🔥 第一步：必须放在最顶部！加载环境变量（修复API Key读取问题）
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// 导入所有路由
const userRoutes = require('./routes/userRoutes');
const healthDataRoutes = require('./routes/healthDataRoutes');
const aiRoutes = require('./routes/aiRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');

// 导入MQTT服务
require('./services/mqttService');

// 创建Express实例
const app = express();
const PORT = process.env.PORT || 3001;

// 跨域中间件
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// JSON解析中间件
app.use(express.json());

// 挂载API路由
app.use('/api/users', userRoutes);
app.use('/api/health', healthDataRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/schedules', scheduleRoutes);

// 托管静态页面（AI聊天页面）
app.use(express.static('public'));

// 根路由测试
app.get('/', (req, res) => {
  res.json({ message: 'CVTE家庭健康中枢API服务正在运行' });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('🔥 服务器错误：', err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: err.message
  });
});

// 连接MongoDB数据库
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB连接成功'))
  .catch(err => console.error('❌ MongoDB连接失败:', err));

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
});

const serverless = require('@tencent-serverless/scf-express');
module.exports = serverless(app);