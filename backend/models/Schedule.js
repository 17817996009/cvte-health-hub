const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    required: true // 格式：YYYY-MM-DD
  },
  time: {
    type: String,
    required: true // 格式：HH:MM
  },
  type: {
    type: String,
    enum: ['服药提醒', '体检预约', '运动计划', '复查预约', '其他'],
    default: '服药提醒'
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);