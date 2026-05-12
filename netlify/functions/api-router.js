exports.handler = async (event) => {
  const path = event.path.replace('/.netlify/functions/api-router', '');
  const method = event.httpMethod;

  // 处理注册接口（前端调用的是/api/users/register）
  if (method === 'POST' && path === '/api/users/register') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          id: 'demo-user-001',
          name: '张先生',
          email: 'test@cvte.com'
        },
        token: 'fake-jwt-token-for-demo'
      })
    };
  }

  // 处理登录接口（前端调用的是/api/users/login）
  if (method === 'POST' && path === '/api/users/login') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          id: 'demo-user-001',
          name: '张先生',
          email: 'test@cvte.com'
        },
        token: 'fake-jwt-token-for-demo'
      })
    };
  }

  // 处理AI对话接口（和你之前的混元逻辑保持一致）
  if (method === 'POST' && path === '/api/chat') {
    try {
      const { messages, vitals } = JSON.parse(event.body);
      const apiUrl = process.env.TOKENHUB_API_URL || "https://hy3-preview.tokhub.com/v1/chat/completions";
      const systemPrompt = `你是家庭健康助手。当前体征：心率${vitals.heartRate}bpm，血氧${vitals.spo2}%，睡眠${vitals.sleepScore}/100，精神状态“${vitals.mood}”。请用通俗语言给予建议，150字内。`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TOKENHUB_API_KEY}`
        },
        body: JSON.stringify({
          model: "hy3-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.slice(-6)
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'AI服务暂时不可用，请稍后再试';

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply })
      };
    } catch (err) {
      console.error('混元调用错误：', err);
      return { statusCode: 500, body: JSON.stringify({ reply: '服务异常，请稍后重试' }) };
    }
  }

  // 其他接口（如设备列表）
  if (method === 'GET' && path === '/api/devices') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ devices: [] })
    };
  }

  // 未知请求返回404
  return { statusCode: 404, body: 'Not Found' };
};