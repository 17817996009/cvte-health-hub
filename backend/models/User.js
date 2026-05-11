const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  familyMembers: [{
    name: String,
    relationship: String,
    age: Number,
    healthConditions: [String]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ 修复后的密码加密中间件（只保留async/await，不使用next回调）
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  console.log('🔐 正在加密密码...');
  try {
    // 直接用await加密，不需要next
    this.password = await bcrypt.hash(this.password, 10);
    console.log('✅ 密码加密成功');
  } catch (error) {
    console.error('❌ 密码加密失败:', error);
    throw error; // Mongoose会自动捕获错误，无需手动调用next
  }
});

// 密码验证方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);