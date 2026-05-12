exports.handler = async (event) => {
  const path = event.path.replace('/.netlify/functions/api-router', '');
  const method = event.httpMethod;

  // 处理 AI 对话请求 (来自你后端的 aiRoutes)
  // 处理 AI 对话请求 (使用腾讯混元，通过 TokenHub 代理)
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

  // 其他接口（如获取设备列表）可以暂时返回模拟数据
  if (method === 'GET' && path === '/api/devices') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ devices: [] })  // 假数据
    };
  }

  // 未知请求
  return { statusCode: 404, body: 'Not Found' };
};