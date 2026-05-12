const serverless = require('serverless-http');
const app = require('../../../backend/app'); // 引用你的 Express 应用

module.exports.handler = serverless(app);