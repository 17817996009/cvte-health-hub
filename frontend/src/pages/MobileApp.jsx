import React, { useState, useRef } from 'react';
import { Home, Activity, Users, Bell, Settings, Heart, Droplets, Wind, Phone, Video, MessageCircle, X, PhoneOff, Mic, MicOff, Send, User, LogOut, Edit, CheckCircle2, Footprints, Flame, Clock, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from 'axios';

const MobileApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  // 快捷操作状态
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isVoiceCall, setIsVoiceCall] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [micEnabled, setMicEnabled] = useState(true);
  const localVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  // 用户信息修改状态
  const [editUserInfo, setEditUserInfo] = useState({ name: '张先生', email: 'zhang@example.com' });
  
  // ✅ AI聊天状态（新增）
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'ai',
      content: '你好！我是CVTE专属AI健康顾问，请问有什么健康问题可以帮你解答？'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const navigate = useNavigate();

  const familyMembers = [
    { id: 1, name: '张爷爷', age: 72, relationship: '父亲', status: 'online', heartRate: 78, bloodOxygen: 96.5, lastUpdate: '刚刚' },
    { id: 2, name: '李奶奶', age: 68, relationship: '母亲', status: 'online', heartRate: 72, bloodOxygen: 97.2, lastUpdate: '5分钟前' },
    { id: 3, name: '小明', age: 12, relationship: '儿子', status: 'offline', heartRate: 85, bloodOxygen: 99.0, lastUpdate: '1小时前' },
  ];

  const [notifications, setNotifications] = useState([
    { id: 1, title: '张爷爷心率异常', message: '心率达到110次/分，请注意', time: '10分钟前', type: 'danger', isRead: false },
    { id: 2, title: '服药提醒', message: '张爷爷该服用降压药了', time: '30分钟前', type: 'warning', isRead: false },
    { id: 3, title: '每日健康报告', message: '今日全家健康状况良好', time: '1小时前', type: 'info', isRead: true },
  ]);

  const healthActivities = [
    { id: 1, type: '晨间散步', duration: '30分钟', calories: 120, date: '今天 08:30', icon: '🚶' },
    { id: 2, type: '晚间慢跑', duration: '20分钟', calories: 180, date: '昨天 19:00', icon: '🏃' },
    { id: 3, type: '居家瑜伽', duration: '40分钟', calories: 80, date: '昨天 07:00', icon: '🧘' },
    { id: 4, type: '午休散步', duration: '15分钟', calories: 60, date: '前天 12:30', icon: '🚶' },
  ];

  const weeklyActivityData = [
    { day: '周一', steps: 8500, calories: 320 },
    { day: '周二', steps: 10200, calories: 380 },
    { day: '周三', steps: 7800, calories: 290 },
    { day: '周四', steps: 9500, calories: 350 },
    { day: '周五', steps: 11000, calories: 420 },
    { day: '周六', steps: 6500, calories: 250 },
    { day: '周日', steps: 9200, calories: 360 },
  ];

  const mockHealthHistory = [
    { date: '周一', heartRate: 70, bloodOxygen: 98 },
    { date: '周二', heartRate: 75, bloodOxygen: 97 },
    { date: '周三', heartRate: 72, bloodOxygen: 99 },
    { date: '周四', heartRate: 68, bloodOxygen: 98 },
    { date: '周五', heartRate: 71, bloodOxygen: 97 },
    { date: '周六', heartRate: 73, bloodOxygen: 98 },
    { date: '周日', heartRate: 72, bloodOxygen: 98.5 },
  ];

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const saveUserInfo = () => {
    alert('个人信息修改成功！');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsVideoCall(true);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('获取摄像头权限失败:', error);
      alert('无法获取摄像头/麦克风权限，请在浏览器设置中允许访问设备');
    }
  };

  const endVideoCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setIsVideoCall(false);
    setMicEnabled(true);
  };

  const startVoiceCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      setIsVoiceCall(true);
    } catch (error) {
      console.error('获取麦克风权限失败:', error);
      alert('无法获取麦克风权限，请在浏览器设置中允许访问设备');
    }
  };

  const endVoiceCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setIsVoiceCall(false);
    setMicEnabled(true);
  };

  const sendMessage = () => {
    if (!messageText.trim() || !selectedContact) return;
    alert(`消息已发送给 ${selectedContact.name}：${messageText}`);
    setMessageText('');
    setShowMessageModal(false);
  };

  // ✅ AI聊天核心函数（新增，和PC端接口打通）
  const sendAiMessage = async () => {
    if (!chatInput.trim() || isAiLoading) return;
    
    // 添加用户消息
    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAiLoading(true);
    
    try {
      // 调用后端AI接口（和PC端同一个接口）
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

  // ✅ 快捷问题点击（新增，和PC端保持一致）
  const handleQuickQuestion = (question) => {
    setChatInput(question);
    setTimeout(() => sendAiMessage(), 100);
  };

  const openMyReport = () => {
    setSelectedMember(null);
    setShowReportModal(true);
  };

  const openFamilyReport = (member) => {
    setSelectedMember(member);
    setShowReportModal(true);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative">
      {/* 头部 */}
      <div className="bg-primary text-white p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">CVTE健康</h1>
          <div className="flex space-x-4">
            <button 
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 hover:bg-blue-700 rounded-full transition"
            >
              <Bell size={24} />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className="p-2 hover:bg-blue-700 rounded-full transition"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-lg">下午好，张先生</p>
          <p className="text-primary-100">{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 p-4 overflow-auto">
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* 我的健康卡片 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">我的健康</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Heart size={24} className="text-red-500" />
                  </div>
                  <div className="text-2xl font-bold">72</div>
                  <div className="text-gray-500 text-sm">心率</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Droplets size={24} className="text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold">98.5</div>
                  <div className="text-gray-500 text-sm">血氧</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Wind size={24} className="text-yellow-500" />
                  </div>
                  <div className="text-2xl font-bold">25</div>
                  <div className="text-gray-500 text-sm">压力</div>
                </div>
              </div>
              <button 
                onClick={openMyReport}
                className="w-full mt-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
              >
                查看详细报告
              </button>
            </div>

            {/* 家庭成员卡片 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">家庭成员</h2>
                <button className="text-primary font-medium">查看全部</button>
              </div>
              <div className="space-y-4">
                {familyMembers.map(member => (
                  <div key={member.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex items-center justify-center text-2xl">
                      {member.relationship === '父亲' ? '👴' : member.relationship === '母亲' ? '👵' : '👦'}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="font-medium">{member.name}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          member.status === 'online' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {member.status === 'online' ? '在线' : '离线'}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        心率 {member.heartRate} · 血氧 {member.bloodOxygen}% · {member.lastUpdate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">快捷操作</h2>
              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={startVoiceCall}
                  className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <Phone size={24} className="text-primary mb-2" />
                  <span className="text-sm">语音通话</span>
                </button>
                <button 
                  onClick={startVideoCall}
                  className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <Video size={24} className="text-primary mb-2" />
                  <span className="text-sm">视频通话</span>
                </button>
                <button 
                  onClick={() => {
                    setSelectedContact(familyMembers[0]);
                    setShowMessageModal(true);
                  }}
                  className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <MessageCircle size={24} className="text-primary mb-2" />
                  <span className="text-sm">发送消息</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">健康活动</h2>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                <Footprints size={24} className="text-blue-500 mx-auto mb-2" />
                <div className="text-xl font-bold">9,200</div>
                <div className="text-xs text-gray-500">今日步数</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                <Flame size={24} className="text-orange-500 mx-auto mb-2" />
                <div className="text-xl font-bold">360</div>
                <div className="text-xs text-gray-500">消耗卡路里</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                <Clock size={24} className="text-green-500 mx-auto mb-2" />
                <div className="text-xl font-bold">50分钟</div>
                <div className="text-xs text-gray-500">活动时长</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">本周步数趋势</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="steps" fill="#3b82f6" name="步数" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">近期活动记录</h3>
              <div className="space-y-4">
                {healthActivities.map(activity => (
                  <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl mr-4">{activity.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.type}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {activity.duration} · 消耗 {activity.calories} 卡路里
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">{activity.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'family' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">家庭成员</h2>
            {familyMembers.map(member => (
              <div key={member.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 flex items-center justify-center text-3xl">
                    {member.relationship === '父亲' ? '👴' : member.relationship === '母亲' ? '👵' : '👦'}
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-bold">{member.name}</div>
                    <div className="text-gray-500">{member.age}岁 · {member.relationship}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-red-500">{member.heartRate}</div>
                    <div className="text-sm text-gray-500">心率</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-500">{member.bloodOxygen}</div>
                    <div className="text-sm text-gray-500">血氧</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={startVideoCall}
                    className="py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                  >
                    视频通话
                  </button>
                  <button 
                    onClick={() => openFamilyReport(member)}
                    className="py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    查看报告
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">通知中心</h2>
              {notifications.some(n => !n.isRead) && (
                <button 
                  onClick={markAllAsRead}
                  className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm"
                >
                  <CheckCircle2 size={16} className="mr-1" />
                  全部标为已读
                </button>
              )}
            </div>
            <div className="space-y-4">
              {notifications.map(notification => (
                <div key={notification.id} className={`bg-white rounded-xl shadow-lg p-4 border-l-4 ${
                  notification.type === 'danger' ? 'border-red-500' : 
                  notification.type === 'warning' ? 'border-yellow-500' : 
                  'border-blue-500'
                } ${!notification.isRead ? 'bg-blue-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{notification.title}</div>
                    {!notification.isRead && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="text-primary text-xs hover:underline"
                      >
                        标为已读
                      </button>
                    )}
                  </div>
                  <div className="text-gray-600 mt-1">{notification.message}</div>
                  <div className="text-gray-400 text-sm mt-2">{notification.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">设置</h2>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <User size={24} className="text-primary mr-3" />
                <h3 className="text-xl font-semibold">个人信息</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                  <input 
                    type="text" 
                    value={editUserInfo.name}
                    onChange={(e) => setEditUserInfo({...editUserInfo, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                  <input 
                    type="email" 
                    value={editUserInfo.email}
                    onChange={(e) => setEditUserInfo({...editUserInfo, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <button 
                  onClick={saveUserInfo}
                  className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center justify-center"
                >
                  <Edit size={18} className="mr-2" />
                  保存修改
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <LogOut size={24} className="text-red-500 mr-3" />
                <h3 className="text-xl font-semibold text-red-600">退出登录</h3>
              </div>
              <p className="text-gray-600 mb-6">退出当前账号，将清除本地登录状态并返回登录页</p>
              <button 
                onClick={handleLogout}
                className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                退出登录
              </button>
            </div>
          </div>
        )}

        {/* ✅ 新增：AI健康顾问聊天页面 */}
        {activeTab === 'ai' && (
          <div className="flex flex-col h-full">
            {/* 聊天记录区 */}
            <div className="flex-1 space-y-4 mb-4 overflow-auto">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {/* AI加载动画 */}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-4 rounded-2xl bg-gray-100 text-gray-800 rounded-tl-none">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 快捷问题按钮 */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                onClick={() => handleQuickQuestion('心率正常范围是多少？')}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition"
              >
                心率正常范围
              </button>
              <button 
                onClick={() => handleQuickQuestion('熬夜对身体有什么危害？')}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition"
              >
                熬夜的危害
              </button>
              <button 
                onClick={() => handleQuickQuestion('日常养生有什么建议？')}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition"
              >
                养生建议
              </button>
            </div>

            {/* 输入框 */}
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendAiMessage()}
                placeholder="输入你的健康问题..."
                className="flex-1 p-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={isAiLoading}
              />
              <button 
                onClick={sendAiMessage}
                disabled={!chatInput.trim() || isAiLoading}
                className="p-4 bg-primary text-white rounded-full hover:bg-primary/90 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 底部导航 */}
      <div className="bg-white border-t">
        <div className="flex justify-around py-3">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center ${activeTab === 'home' ? 'text-primary' : 'text-gray-500'}`}
          >
            <Home size={24} />
            <span className="text-xs mt-1">首页</span>
          </button>
          <button 
            onClick={() => setActiveTab('activity')}
            className={`flex flex-col items-center ${activeTab === 'activity' ? 'text-primary' : 'text-gray-500'}`}
          >
            <Activity size={24} />
            <span className="text-xs mt-1">活动</span>
          </button>
          <button 
            onClick={() => setActiveTab('family')}
            className={`flex flex-col items-center ${activeTab === 'family' ? 'text-primary' : 'text-gray-500'}`}
          >
            <Users size={24} />
            <span className="text-xs mt-1">家人</span>
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex flex-col items-center ${activeTab === 'notifications' ? 'text-primary' : 'text-gray-500'}`}
          >
            <Bell size={24} />
            <span className="text-xs mt-1">通知</span>
          </button>
          {/* ✅ 新增：AI顾问导航按钮 */}
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center ${activeTab === 'ai' ? 'text-primary' : 'text-gray-500'}`}
          >
            <Bot size={24} />
            <span className="text-xs mt-1">AI顾问</span>
          </button>
        </div>
      </div>

      {/* 返回按钮 */}
      <button 
        onClick={() => navigate('/')}
        className="absolute -bottom-11 right-4 px-4 py-2 bg-gray-800 text-white rounded-lg shadow-lg"
      >
        返回智能镜
      </button>

      {/* 健康报告弹窗 */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {selectedMember ? `${selectedMember.name} 的健康报告` : '我的健康详细报告'}
              </h2>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">心率</p>
                <p className="text-2xl font-bold text-red-500">
                  {selectedMember ? selectedMember.heartRate : '72'}
                </p>
                <p className="text-xs text-gray-400">次/分</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">血氧</p>
                <p className="text-2xl font-bold text-blue-500">
                  {selectedMember ? selectedMember.bloodOxygen : '98.5'}
                </p>
                <p className="text-xs text-gray-400">%</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">近7天健康趋势</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockHealthHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} name="心率" />
                    <Line type="monotone" dataKey="bloodOxygen" stroke="#3b82f6" strokeWidth={2} name="血氧" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-green-700 mb-2">健康建议</h3>
              <p className="text-sm text-green-600">
                {selectedMember 
                  ? `${selectedMember.name} 当前健康状态良好，建议保持规律作息与适量运动。` 
                  : '您当前健康状态良好，建议保持规律作息、均衡饮食，每日监测健康数据。'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 视频通话弹窗 */}
      {isVideoCall && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <video 
            ref={localVideoRef}
            autoPlay 
            muted 
            playsInline
            className="flex-1 w-full object-cover"
          />
          <div className="bg-gray-900 p-6 flex justify-center items-center space-x-8">
            <button 
              onClick={() => {
                if (localStream) {
                  const audioTrack = localStream.getAudioTracks()[0];
                  if (audioTrack) {
                    audioTrack.enabled = !audioTrack.enabled;
                    setMicEnabled(audioTrack.enabled);
                  }
                }
              }}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                micEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {micEnabled ? <Mic size={24} className="text-white" /> : <MicOff size={24} className="text-white" />}
            </button>
            <button 
              onClick={endVideoCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition"
            >
              <PhoneOff size={28} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* 语音通话弹窗 */}
      {isVoiceCall && (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center p-6">
          <div className="text-center text-white mb-12">
            <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone size={48} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">正在语音通话</h2>
            <p className="text-gray-400">与 {familyMembers[0].name} 通话中...</p>
          </div>
          <div className="flex justify-center items-center space-x-8">
            <button 
              onClick={() => {
                if (localStream) {
                  const audioTrack = localStream.getAudioTracks()[0];
                  if (audioTrack) {
                    audioTrack.enabled = !audioTrack.enabled;
                    setMicEnabled(audioTrack.enabled);
                  }
                }
              }}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                micEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {micEnabled ? <Mic size={24} className="text-white" /> : <MicOff size={24} className="text-white" />}
            </button>
            <button 
              onClick={endVoiceCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition"
            >
              <PhoneOff size={28} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* 发送消息弹窗 */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">发送消息给 {selectedContact?.name}</h2>
              <button 
                onClick={() => setShowMessageModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <textarea 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="输入消息..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary mb-4"
            />
            <button 
              onClick={sendMessage}
              disabled={!messageText.trim()}
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send size={18} className="mr-2" />
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileApp;