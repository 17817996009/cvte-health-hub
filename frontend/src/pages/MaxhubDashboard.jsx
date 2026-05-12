import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bell, Calendar, Video, Settings, Home, Activity, Users, Heart, Droplets, Wind, X, Trash2, Check, Plus, Clock, Phone, PhoneOff, Video as VideoIcon, Mic, MicOff, User, LogOut, Edit, CheckCircle2, Bot } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MaxhubDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [healthHistory, setHealthHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: '久坐提醒', message: '您已经工作1小时了，建议起身活动一下', time: '10分钟前', isRead: false },
    { id: 2, title: '服药提醒', message: '张爷爷该服用降压药了', time: '30分钟前', isRead: false },
    { id: 3, title: '健康建议', message: '今天天气晴朗，适合外出散步30分钟', time: '1小时前', isRead: false },
  ]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relationship: '',
    age: '',
    healthConditions: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, index: null });

  const [schedules, setSchedules] = useState([]);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: '服药提醒',
    completed: false
  });

  const [isInCall, setIsInCall] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const localVideoRef = useRef(null);

  const [editUserInfo, setEditUserInfo] = useState({ name: '', email: '' });

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditUserInfo({ name: parsedUser.name, email: parsedUser.email });
    } else {
      navigate('/login');
    }

    const fetchHistoryData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/health/history?days=7', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const formattedData = response.data.data.map(item => ({
          time: new Date(item.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          heartRate: item.data.heartRate,
          bloodOxygen: item.data.bloodOxygen,
          stressLevel: item.data.stressLevel
        }));
        
        setHealthHistory(formattedData);
      } catch (error) {
        console.error('获取历史数据失败:', error);
      }
    };

    const fetchSchedules = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/schedules', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSchedules(response.data.data);
      } catch (error) {
        console.error('获取日程失败:', error);
      }
    };

    fetchHistoryData();
    fetchSchedules();
    const timer = setInterval(fetchHistoryData, 300000);

    return () => clearInterval(timer);
  }, [navigate]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const saveUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/users/update-profile', editUserInfo, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert('信息修改成功');
    } catch (error) {
      console.error('修改信息失败:', error);
      alert('修改失败，请重试');
    }
  };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsInCall(true);
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
    setIsInCall(false);
    setMicEnabled(true);
    setVideoEnabled(true);
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const handleAddMember = async () => {
    try {
      const token = localStorage.getItem('token');
      const healthConditions = newMember.healthConditions.split(/[,，]/).map(s => s.trim()).filter(s => s);

      const response = await axios.put('/api/users/update', {
        familyMember: {
          name: newMember.name,
          relationship: newMember.relationship,
          age: parseInt(newMember.age),
          healthConditions
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setShowAddMemberModal(false);
      setNewMember({ name: '', relationship: '', age: '', healthConditions: '' });
    } catch (error) {
      console.error('添加成员失败:', error);
      alert('添加成员失败，请重试');
    }
  };

  const handleDeleteMember = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/users/delete-family-member/${deleteConfirm.index}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setDeleteConfirm({ show: false, index: null });
    } catch (error) {
      console.error('删除成员失败:', error);
      alert('删除成员失败，请重试');
    }
  };

  const handleAddSchedule = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/schedules', newSchedule, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSchedules([...schedules, response.data.data]);
      setShowAddScheduleModal(false);
      setNewSchedule({ title: '', description: '', date: '', time: '', type: '服药提醒', completed: false });
    } catch (error) {
      console.error('添加日程失败:', error);
      alert('添加日程失败，请重试');
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSchedules(schedules.filter(s => s._id !== id));
    } catch (error) {
      console.error('删除日程失败:', error);
      alert('删除日程失败，请重试');
    }
  };

  const toggleScheduleComplete = async (id, completed) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/schedules/${id}`, { completed: !completed }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSchedules(schedules.map(s => 
        s._id === id ? { ...s, completed: !completed } : s
      ));
    } catch (error) {
      console.error('更新日程状态失败:', error);
      alert('更新状态失败，请重试');
    }
  };

  const getAverageStats = () => {
    if (healthHistory.length === 0) {
      return { heartRate: 0, bloodOxygen: 0, stressLevel: 0 };
    }

    const sum = healthHistory.reduce((acc, item) => ({
      heartRate: acc.heartRate + item.heartRate,
      bloodOxygen: acc.bloodOxygen + item.bloodOxygen,
      stressLevel: acc.stressLevel + item.stressLevel
    }), { heartRate: 0, bloodOxygen: 0, stressLevel: 0 });

    return {
      heartRate: Math.round(sum.heartRate / healthHistory.length),
      bloodOxygen: (sum.bloodOxygen / healthHistory.length).toFixed(1),
      stressLevel: (sum.stressLevel / healthHistory.length).toFixed(1)
    };
  };

  const averageStats = getAverageStats();
  const healthScore = Math.max(0, Math.min(100, 
    100 - 
    Math.abs(averageStats.heartRate - 72) * 0.5 - 
    (100 - averageStats.bloodOxygen) * 2 - 
    averageStats.stressLevel * 2
  ));

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const scheduleTypeColors = {
    '服药提醒': 'bg-blue-500',
    '体检预约': 'bg-green-500',
    '运动计划': 'bg-orange-500',
    '复查预约': 'bg-red-500',
    '其他': 'bg-gray-500'
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <div className="w-20 bg-gray-900 text-white flex flex-col items-center py-8">
        <div className="mb-12">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Home size={24} />
          </div>
        </div>
        
        <div className="flex-1 space-y-8">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${activeTab === 'overview' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          >
            <Activity size={24} />
          </button>
          <button 
            onClick={() => setActiveTab('family')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${activeTab === 'family' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          >
            <Users size={24} />
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${activeTab === 'calendar' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          >
            <Calendar size={24} />
          </button>
          <button 
            onClick={() => setActiveTab('video')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${activeTab === 'video' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          >
            <Video size={24} />
          </button>
          {/* ✅ AI健康顾问按钮（强制显示，样式固定） */}
          <button 
            onClick={() => setActiveTab('ai')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${activeTab === 'ai' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          >
            <Bot size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center hover:bg-gray-700 relative ${activeTab === 'notifications' ? 'bg-blue-600' : ''}`}
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center hover:bg-gray-700 ${activeTab === 'settings' ? 'bg-blue-600' : ''}`}
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">CVTE家庭健康中枢</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">欢迎回来，{user?.name || '用户'}</span>
              <button 
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                返回智能镜
              </button>
            </div>
          </div>
          
          {/* 概览页面 */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-500">今日监测次数</div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Activity size={20} className="text-blue-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{healthHistory.length || 5}</div>
                  <div className="text-green-500 text-sm mt-1">↑ 比昨天多3次</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-500">平均心率</div>
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Heart size={20} className="text-red-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{averageStats.heartRate || 72}</div>
                  <div className="text-gray-500 text-sm mt-1">次/分</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-500">平均血氧</div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Droplets size={20} className="text-blue-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{averageStats.bloodOxygen || 98}</div>
                  <div className="text-gray-500 text-sm mt-1">%</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-500">健康评分</div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Heart size={20} className="text-green-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-500">{Math.round(healthScore || 92)}</div>
                  <div className="text-gray-500 text-sm mt-1">
                    {healthScore >= 80 ? '优秀' : healthScore >= 60 ? '良好' : '需关注'}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">健康趋势（近7天）</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={healthHistory.length > 0 ? healthHistory : [
                      { time: '周一', heartRate: 70, bloodOxygen: 98, stressLevel: 3 },
                      { time: '周二', heartRate: 72, bloodOxygen: 97, stressLevel: 2 },
                      { time: '周三', heartRate: 68, bloodOxygen: 99, stressLevel: 4 },
                      { time: '周四', heartRate: 75, bloodOxygen: 98, stressLevel: 3 },
                      { time: '周五', heartRate: 71, bloodOxygen: 97, stressLevel: 2 },
                      { time: '周六', heartRate: 73, bloodOxygen: 98, stressLevel: 3 },
                      { time: '周日', heartRate: 72, bloodOxygen: 98, stressLevel: 3 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="heartRate" stroke="#F53F3F" strokeWidth={2} name="心率" />
                      <Line type="monotone" dataKey="bloodOxygen" stroke="#165DFF" strokeWidth={2} name="血氧" />
                      <Line type="monotone" dataKey="stressLevel" stroke="#FF7D00" strokeWidth={2} name="压力水平" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">最新通知</h2>
                <div className="space-y-4">
                  {notifications.map(notification => (
                    <div key={notification.id} className={`flex items-start p-4 rounded-lg ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'}`}>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <Bell size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${!notification.isRead ? 'font-bold' : ''}`}>{notification.title}</div>
                        <div className="text-gray-500 mt-1">{notification.message}</div>
                        <div className="text-gray-400 text-sm mt-2">{notification.time}</div>
                      </div>
                      {!notification.isRead && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 text-sm hover:underline"
                        >
                          标为已读
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 家庭成员页面 */}
          {activeTab === 'family' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold">家庭成员健康</h2>
              <div className="grid grid-cols-3 gap-6">
                {user?.familyMembers?.map((member, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-6 relative group">
                    <button 
                      onClick={() => setDeleteConfirm({ show: true, index })}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 size={20} />
                    </button>

                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 flex items-center justify-center text-3xl">
                        {member.relationship === '父亲' ? '👴' : member.relationship === '母亲' ? '👵' : '👦'}
                      </div>
                      <div>
                        <div className="text-xl font-bold">{member.name}</div>
                        <div className="text-gray-500">{member.age}岁 · {member.relationship}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>健康状态</span>
                        <span className={`font-medium ${
                          member.healthConditions.length === 0 ? 'text-green-500' : 'text-yellow-500'
                        }`}>
                          {member.healthConditions.length === 0 ? '正常' : '需关注'}
                        </span>
                      </div>
                      {member.healthConditions.length > 0 && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <div className="text-sm text-yellow-800">
                            健康问题：{member.healthConditions.join('、')}
                          </div>
                        </div>
                      )}
                      <div className="pt-4 border-t">
                        <button 
                          onClick={() => {
                            setSelectedMember(member);
                            setShowReportModal(true);
                          }}
                          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          查看详细报告
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div 
                  onClick={() => setShowAddMemberModal(true)}
                  className="bg-white rounded-xl shadow-sm p-6 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-600 hover:bg-gray-50 transition"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition">
                    +
                  </div>
                  <div className="mt-4 text-gray-500 hover:text-blue-600 transition">添加家庭成员</div>
                </div>
              </div>
            </div>
          )}

          {/* 健康日程页面 */}
          {activeTab === 'calendar' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">健康日程</h2>
                <button 
                  onClick={() => setShowAddScheduleModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus size={20} className="mr-2" />
                  添加日程
                </button>
              </div>

              {schedules.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-16 text-center">
                  <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-500 mb-2">暂无健康日程</h3>
                  <p className="text-gray-400 mb-6">点击上方按钮添加服药、体检、运动等日程</p>
                  <button 
                    onClick={() => setShowAddScheduleModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    添加第一个日程
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {schedules.map(schedule => (
                    <div key={schedule._id} className={`bg-white rounded-xl shadow-sm p-6 relative group ${schedule.completed ? 'opacity-70' : ''}`}>
                      <button 
                        onClick={() => handleDeleteSchedule(schedule._id)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={18} />
                      </button>

                      <button 
                        onClick={() => toggleScheduleComplete(schedule._id, schedule.completed)}
                        className={`absolute top-4 left-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                          schedule.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-blue-600'
                        }`}
                      >
                        {schedule.completed && <Check size={14} />}
                      </button>

                      <div className={`absolute top-4 left-16 px-2 py-1 rounded text-xs text-white ${scheduleTypeColors[schedule.type]}`}>
                        {schedule.type}
                      </div>

                      <div className="pt-10">
                        <h3 className={`text-lg font-bold mb-2 ${schedule.completed ? 'line-through text-gray-500' : ''}`}>
                          {schedule.title}
                        </h3>
                        {schedule.description && (
                          <p className="text-gray-500 text-sm mb-4">{schedule.description}</p>
                        )}
                        <div className="flex items-center text-gray-400 text-sm">
                          <Calendar size={14} className="mr-2" />
                          <span>{schedule.date}</span>
                          <Clock size={14} className="ml-4 mr-2" />
                          <span>{schedule.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 视频通话页面 */}
          {activeTab === 'video' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold">视频通话</h2>
              
              {!isInCall ? (
                <div className="bg-white rounded-xl shadow-sm p-16 text-center">
                  <Video size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-500 mb-2">发起家庭视频通话</h3>
                  <p className="text-gray-400 mb-6">点击下方按钮，开启摄像头与家人进行视频通话</p>
                  <button 
                    onClick={startVideoCall}
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center mx-auto"
                  >
                    <Phone size={20} className="mr-2" />
                    发起视频通话
                  </button>
                </div>
              ) : (
                <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
                  <div className="relative">
                    <video 
                      ref={localVideoRef}
                      autoPlay 
                      muted 
                      playsInline
                      className="w-full max-h-[70vh] object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      正在通话中...
                    </div>
                  </div>

                  <div className="bg-gray-900 p-6 flex justify-center items-center space-x-8">
                    <button 
                      onClick={toggleMic}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                        micEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      {micEnabled ? <Mic size={24} className="text-white" /> : <MicOff size={24} className="text-white" />}
                    </button>

                    <button 
                      onClick={toggleVideo}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                        videoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      {videoEnabled ? <VideoIcon size={24} className="text-white" /> : <VideoIcon size={24} className="text-white opacity-50" />}
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
            </div>
          )}

          {/* 通知中心 */}
          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">通知中心</h2>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <CheckCircle2 size={18} className="mr-2" />
                    全部标为已读
                  </button>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm divide-y">
                {notifications.map(notification => (
                  <div key={notification.id} className={`flex items-start p-6 ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50'}`}>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <Bell size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className={`text-lg font-medium ${!notification.isRead ? 'font-bold' : ''}`}>{notification.title}</div>
                      <div className="text-gray-600 mt-2">{notification.message}</div>
                      <div className="text-gray-400 text-sm mt-3">{notification.time}</div>
                    </div>
                    {!notification.isRead && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="ml-4 text-blue-600 hover:underline flex-shrink-0"
                      >
                        标为已读
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 设置页面 */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold">设置</h2>

              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center mb-6">
                  <User size={24} className="text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold">个人信息</h3>
                </div>

                <div className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                    <input 
                      type="text" 
                      value={editUserInfo.name}
                      onChange={(e) => setEditUserInfo({...editUserInfo, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                    <input 
                      type="email" 
                      value={editUserInfo.email}
                      onChange={(e) => setEditUserInfo({...editUserInfo, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>

                  <button 
                    onClick={saveUserInfo}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                  >
                    <Edit size={18} className="mr-2" />
                    保存修改
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center mb-6">
                  <LogOut size={24} className="text-red-500 mr-3" />
                  <h3 className="text-xl font-semibold text-red-600">退出登录</h3>
                </div>
                <p className="text-gray-600 mb-6">退出当前账号，将清除本地登录状态并返回登录页</p>
                <button 
                  onClick={handleLogout}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  退出登录
                </button>
              </div>
            </div>
          )}

          {/* ✅ AI健康顾问页面（必显示） */}
          {activeTab === 'ai' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold">AI健康顾问</h2>
              <div className="bg-white rounded-xl shadow-sm p-6 h-[70vh]">
                <iframe 
                  src="/ai-chat.html" 
                  width="100%" 
                  height="100%" 
                  frameBorder="0"
                  className="rounded-lg"
                  title="AI健康顾问"
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 弹窗内容（不变） */}
      {showReportModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{selectedMember.name} - 详细健康报告</h2>
              <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">基本信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>姓名：{selectedMember.name}</div>
                  <div>年龄：{selectedMember.age}岁</div>
                  <div>关系：{selectedMember.relationship}</div>
                  <div>健康状态：{selectedMember.healthConditions.length > 0 ? '需关注' : '正常'}</div>
                </div>
              </div>

              {selectedMember.healthConditions.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-yellow-800">健康问题</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedMember.healthConditions.map((condition, idx) => (
                      <li key={idx} className="text-yellow-800">{condition}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">近期健康数据（模拟）</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-800">{Math.floor(Math.random() * 20) + 65}</div>
                    <div className="text-sm text-blue-600">心率（次/分）</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-800">{Math.floor(Math.random() * 3) + 96}</div>
                    <div className="text-sm text-blue-600">血氧（%）</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-800">{Math.floor(Math.random() * 5) + 2}</div>
                    <div className="text-sm text-blue-600">压力水平（/10）</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-green-800">个性化健康建议</h3>
                <ul className="list-disc list-inside space-y-2 text-green-800">
                  {selectedMember.healthConditions.includes('高血压') && (
                    <>
                      <li>建议低盐饮食，每日盐摄入量不超过5克</li>
                      <li>避免情绪激动，保持平稳心态</li>
                      <li>定期监测血压，遵医嘱服药</li>
                    </>
                  )}
                  {selectedMember.healthConditions.includes('糖尿病') && (
                    <>
                      <li>控制糖分摄入，主食以粗粮为主</li>
                      <li>餐后适当运动，如散步30分钟</li>
                      <li>定期监测血糖，规律作息</li>
                    </>
                  )}
                  {selectedMember.healthConditions.length === 0 && (
                    <>
                      <li>继续保持良好的生活习惯</li>
                      <li>每周进行3-5次中等强度运动</li>
                      <li>保证充足睡眠，均衡饮食</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">添加家庭成员</h2>
              <button onClick={() => setShowAddMemberModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                <input 
                  type="text" 
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="请输入姓名"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关系 *</label>
                <select 
                  value={newMember.relationship}
                  onChange={(e) => setNewMember({...newMember, relationship: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  required
                >
                  <option value="">请选择关系</option>
                  <option value="父亲">父亲</option>
                  <option value="母亲">母亲</option>
                  <option value="配偶">配偶</option>
                  <option value="儿子">儿子</option>
                  <option value="女儿">女儿</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年龄 *</label>
                <input 
                  type="number" 
                  value={newMember.age}
                  onChange={(e) => setNewMember({...newMember, age: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="请输入年龄"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">健康问题（选填，多个用逗号分隔）</label>
                <textarea 
                  value={newMember.healthConditions}
                  onChange={(e) => setNewMember({...newMember, healthConditions: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="如：高血压, 糖尿病"
                  rows={3}
                />
              </div>

              <button 
                onClick={handleAddMember}
                disabled={!newMember.name || !newMember.relationship || !newMember.age}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                添加成员
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">确认删除？</h3>
              <p className="text-gray-500 mb-6">删除后无法恢复，确定要删除该家庭成员吗？</p>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setDeleteConfirm({ show: false, index: null })}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  取消
                </button>
                <button 
                  onClick={handleDeleteMember}
                  className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">添加健康日程</h2>
              <button onClick={() => setShowAddScheduleModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日程标题 *</label>
                <input 
                  type="text" 
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="如：服用降压药"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日程类型 *</label>
                <select 
                  value={newSchedule.type}
                  onChange={(e) => setNewSchedule({...newSchedule, type: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  required
                >
                  <option value="服药提醒">服药提醒</option>
                  <option value="体检预约">体检预约</option>
                  <option value="运动计划">运动计划</option>
                  <option value="复查预约">复查预约</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日期 *</label>
                  <input 
                    type="date" 
                    value={newSchedule.date}
                    onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">时间 *</label>
                  <input 
                    type="time" 
                    value={newSchedule.time}
                    onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注（选填）</label>
                <textarea 
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="如：饭后服用，每天一次"
                  rows={3}
                />
              </div>

              <button 
                onClick={handleAddSchedule}
                disabled={!newSchedule.title || !newSchedule.date || !newSchedule.time}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                添加日程
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaxhubDashboard;