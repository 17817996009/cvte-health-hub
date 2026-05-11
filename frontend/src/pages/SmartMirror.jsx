import React, { useState, useEffect } from 'react';
import { Heart, Droplets, Wind, User, Clock, Footprints, Flame, Users, Bell, Bot, Send } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar } from 'recharts';

const SmartMirror = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState('');
  const [risks, setRisks] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // AI健康顾问状态
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'ai',
      content: '你好！我是CVTE专属AI健康顾问，请问有什么健康问题可以帮你解答？'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 模拟活动数据
  const weeklyActivityData = [
    { day: '周一', steps: 8500, calories: 320 },
    { day: '周二', steps: 10200, calories: 380 },
    { day: '周三', steps: 7800, calories: 290 },
    { day: '周四', steps: 9500, calories: 350 },
    { day: '周五', steps: 11000, calories: 420 },
    { day: '周六', steps: 6500, calories: 250 },
    { day: '周日', steps: 9200, calories: 360 },
  ];

  // 模拟家人数据
  const familyMembers = [
    { id: 1, name: '张爷爷', relationship: '父亲', status: 'online', heartRate: 78, bloodOxygen: 96.5 },
    { id: 2, name: '李奶奶', relationship: '母亲', status: 'online', heartRate: 72, bloodOxygen: 97.2 },
    { id: 3, name: '小明', relationship: '儿子', status: 'offline', heartRate: 85, bloodOxygen: 99.0 },
  ];

  // 模拟通知数据
  const notifications = [
    { id: 1, title: '张爷爷心率异常', message: '心率达到110次/分，请注意', type: 'danger' },
    { id: 2, title: '服药提醒', message: '张爷爷该服用降压药了', type: 'warning' },
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }

    // 更新时间
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // 获取最新健康数据
    const fetchHealthData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/api/health/latest', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.data) {
          setHealthData(response.data.data.data);
          
          // 分析健康数据
          const analyzeResponse = await axios.post('http://localhost:3001/api/health/analyze', 
            { healthData: response.data.data.data },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          setReport(analyzeResponse.data.report);
          setRisks(analyzeResponse.data.risks);
        }
      } catch (error) {
        console.error('获取健康数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
    // 每30秒刷新一次数据
    const dataTimer = setInterval(fetchHealthData, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(dataTimer);
    };
  }, [navigate]);

  // AI聊天核心函数
  const sendAiMessage = async () => {
    if (!chatInput.trim() || isAiLoading) return;
    
    // 添加用户消息
    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAiLoading(true);
    
    try {
      // 调用后端AI接口
      const response = await axios.post('http://localhost:3001/api/ai/chat', {
        question: chatInput
      });
      
      // 添加AI回复
      setChatMessages(prev => [...prev, {
        role: 'ai',
        content: response.data.answer
      }]);
    } catch (error) {
      console.error('AI调用失败:', error);
      setChatMessages(prev => [...prev, {
        role: 'ai',
        content: '抱歉，AI服务暂时不可用，请稍后再试。'
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 快捷问题点击
  const handleQuickQuestion = (question) => {
    setChatInput(question);
    setTimeout(() => sendAiMessage(), 100);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  if (loading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">正在加载健康数据...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* 顶部：时间和问候 */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="text-7xl font-light">{formatTime(currentTime)}</div>
            <div className="text-xl text-gray-400 mt-2">{formatDate(currentTime)}</div>
          </div>
          <div className="flex items-center space-x-3">
            <User size={32} />
            <div className="text-2xl">{getGreeting()}，{user?.name || '用户'}</div>
          </div>
        </div>

        {/* 中间：健康数据 + AI报告 + 新增AI顾问（三列布局） */}
        <div className="flex-1 grid grid-cols-3 gap-8">
          {/* 左侧：健康指标卡片 */}
          <div className="col-span-1 space-y-4">
            <div className="bg-gray-900/80 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">心率</h3>
                <Heart size={24} className="text-red-500" />
              </div>
              <div className="text-5xl font-light">{healthData?.heartRate || '--'}</div>
              <div className="text-gray-400 mt-1">次/分</div>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-500" 
                  style={{ width: `${Math.min((healthData?.heartRate || 0) / 120 * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-900/80 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">血氧</h3>
                <Droplets size={24} className="text-blue-500" />
              </div>
              <div className="text-5xl font-light">{healthData?.bloodOxygen || '--'}</div>
              <div className="text-gray-400 mt-1">%</div>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500" 
                  style={{ width: `${((healthData?.bloodOxygen || 0) - 90) * 10}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-900/80 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">压力水平</h3>
                <Wind size={24} className="text-yellow-500" />
              </div>
              <div className="text-5xl font-light">{healthData?.stressLevel || '--'}</div>
              <div className="text-gray-400 mt-1">/10</div>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    (healthData?.stressLevel || 0) > 7 ? 'bg-red-500' : 
                    (healthData?.stressLevel || 0) > 4 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(healthData?.stressLevel || 0) * 10}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-900/80 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">精神状态</h3>
                <Clock size={24} className="text-green-500" />
              </div>
              <div className="text-2xl font-light">
                {healthData?.mood === 'happy' ? '😊 愉悦' : 
                 healthData?.mood === 'neutral' ? '😐 平静' : '😴 疲惫'}
              </div>
              <div className="text-gray-400 mt-1">
                皮肤状态：{healthData?.skinCondition === 'good' ? '良好' : 
                          healthData?.skinCondition === 'normal' ? '一般' : '较差'}
              </div>
            </div>
          </div>

          {/* 中间：原有AI报告 + 下方模块 */}
          <div className="col-span-1 flex flex-col gap-6">
            {/* AI健康报告 */}
            <div className="bg-gray-900/80 rounded-2xl p-6 backdrop-blur-sm flex-1 overflow-auto">
              <h2 className="text-3xl font-medium mb-6 flex items-center">
                <span className="w-2 h-8 bg-blue-500 rounded-full mr-4"></span>
                AI健康报告
              </h2>
              
              {risks.length > 0 && (
                <div className="mb-6 space-y-3">
                  {risks.map((risk, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg ${
                        risk.level === 'danger' ? 'bg-red-900/30 border border-red-500/50' : 
                        'bg-yellow-900/30 border border-yellow-500/50'
                      }`}
                    >
                      <div className="font-medium text-lg">⚠️ {risk.title}</div>
                      <div className="text-gray-300 mt-1">{risk.description}</div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-lg leading-relaxed whitespace-pre-line">
                {report || '正在生成健康报告...'}
              </div>
            </div>

            {/* 下方模块：活动概览 + 家人状态 + 通知 */}
            <div className="grid grid-cols-2 gap-6">
              {/* 今日活动概览 */}
              <div className="bg-gray-900/80 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-medium mb-4 flex items-center">
                  <Footprints className="mr-2 text-blue-400" size={20} />
                  今日活动概览
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">9200</div>
                    <div className="text-gray-400 text-xs">步数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">360</div>
                    <div className="text-gray-400 text-xs">卡路里</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">50</div>
                    <div className="text-gray-400 text-xs">分钟</div>
                  </div>
                </div>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyActivityData}>
                      <Bar dataKey="steps" fill="#3b82f6" radius={2} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 家人状态 & 通知 */}
              <div className="bg-gray-900/80 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-medium mb-3 flex items-center">
                  <Users className="mr-2 text-green-400" size={20} />
                  家人状态
                </h3>
                <div className="space-y-2 mb-4">
                  {familyMembers.slice(0,2).map(member => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="text-sm">{member.name}</div>
                      <div className="text-xs text-gray-400">心率 {member.heartRate}</div>
                    </div>
                  ))}
                </div>
                <h3 className="text-xl font-medium mb-2 flex items-center">
                  <Bell className="mr-2 text-yellow-400" size={20} />
                  通知提醒
                </h3>
                <div className="text-xs text-yellow-400">
                  {notifications[0].title}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：AI健康顾问聊天模块【关键修改：固定高度，确保内部滚动】 */}
          <div className="col-span-1 bg-gray-900/80 rounded-2xl p-6 backdrop-blur-sm flex flex-col" style={{ minHeight: '600px' }}>
            <h2 className="text-2xl font-medium mb-6 flex items-center">
              <Bot className="mr-3 text-blue-400" size={24} />
              AI健康顾问
            </h2>

            {/* 聊天记录区【核心修改：固定高度，内部滚动】 */}
            <div className="flex-grow overflow-y-auto pr-2 mb-4" style={{
              maxHeight: '400px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#4B5563 transparent'
            }}>
              {/* 自定义滚动条样式 */}
              <style>{`
                /* 针对Chrome、Edge、Safari的滚动条样式 */
                .overflow-y-auto::-webkit-scrollbar {
                  width: 6px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                  background: transparent;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                  background-color: #4B5563;
                  border-radius: 3px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                  background-color: #6B7280;
                }
              `}</style>

              <div className="space-y-4">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-xl ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-gray-800 text-gray-100 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {/* AI加载动画 */}
                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] p-4 rounded-xl bg-gray-800 text-gray-100 rounded-tl-none">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 快捷问题按钮 */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                onClick={() => handleQuickQuestion('心率正常范围是多少？')}
                className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-gray-700 transition"
              >
                心率正常范围
              </button>
              <button 
                onClick={() => handleQuickQuestion('熬夜对身体有什么危害？')}
                className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-gray-700 transition"
              >
                熬夜的危害
              </button>
              <button 
                onClick={() => handleQuickQuestion('日常养生有什么建议？')}
                className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-gray-700 transition"
              >
                养生建议
              </button>
            </div>

            {/* 输入框 */}
            <div className="flex items-center space-x-3">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendAiMessage()}
                placeholder="输入你的健康问题..."
                className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                disabled={isAiLoading}
              />
              <button 
                onClick={sendAiMessage}
                disabled={!chatInput.trim() || isAiLoading}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* 底部：导航和提示 */}
        <div className="mt-8 flex justify-between items-center">
          <div className="text-gray-500">
            CVTE家庭健康中枢 · 您的专属健康管家
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => navigate('/maxhub')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
            >
              进入MAXHUB大屏
            </button>
            <button 
              onClick={() => navigate('/mobile')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
            >
              进入手机端
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartMirror;