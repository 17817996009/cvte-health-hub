const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ✅ 修复后的注册接口（带完整错误捕获）
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('📩 收到注册请求:', { name, email }); // 打印请求数据，方便排查

    // 1. 检查必填字段
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: '请填写完整信息' });
    }

    // 2. 检查用户是否已存在
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: '用户已存在，请直接登录' });
    }

    // 3. 创建新用户（默认添加家庭成员）
    user = new User({
      name,
      email,
      password,
      familyMembers: [
        { name: '张爷爷', relationship: '父亲', age: 72, healthConditions: ['高血压'] },
        { name: '李奶奶', relationship: '母亲', age: 68, healthConditions: ['糖尿病'] },
        { name: '小明', relationship: '儿子', age: 12, healthConditions: [] }
      ]
    });

    // 4. 保存用户（密码加密会自动执行）
    await user.save();
    console.log('✅ 用户创建成功:', user._id);

    // 5. 生成JWT令牌
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );

    // 6. 返回成功响应
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        familyMembers: user.familyMembers
      }
    });
  } catch (error) {
    console.error('❌ 注册接口错误:', error); // 强制打印错误
    res.status(500).json({ 
      success: false, 
      message: '注册失败', 
      error: error.message 
    });
  }
});

// ✅ 修复后的登录接口
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('📩 收到登录请求:', { email });

    if (!email || !password) {
      return res.status(400).json({ success: false, message: '请填写邮箱和密码' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: '用户不存在' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: '密码错误' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        familyMembers: user.familyMembers
      }
    });
  } catch (error) {
    console.error('❌ 登录接口错误:', error);
    res.status(500).json({ success: false, message: '登录失败', error: error.message });
  }
});

// 获取当前用户信息
router.get('/me', auth, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      familyMembers: req.user.familyMembers
    }
  });
});

// ✅ 新增：添加家庭成员接口
router.put('/update', auth, async (req, res) => {
  try {
    const { familyMember } = req.body;
    
    // 校验必填字段
    if (!familyMember.name || !familyMember.relationship || !familyMember.age) {
      return res.status(400).json({ success: false, message: '请填写完整信息' });
    }

    // 查找用户并添加新成员
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    // 追加到家庭成员数组
    user.familyMembers.push({
      name: familyMember.name,
      relationship: familyMember.relationship,
      age: familyMember.age,
      healthConditions: familyMember.healthConditions || []
    });

    await user.save();

    // 返回更新后的用户数据
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        familyMembers: user.familyMembers
      }
    });
  } catch (error) {
    console.error('❌ 添加家庭成员失败:', error);
    res.status(500).json({ success: false, message: '添加成员失败', error: error.message });
  }
});

// ✅ 新增：删除家庭成员接口
router.delete('/delete-family-member/:index', auth, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    
    // 校验索引是否有效
    if (isNaN(index) || index < 0) {
      return res.status(400).json({ success: false, message: '无效的成员索引' });
    }

    // 查找用户
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    // 校验索引是否在成员数组范围内
    if (index >= user.familyMembers.length) {
      return res.status(400).json({ success: false, message: '成员不存在' });
    }

    // 删除对应索引的成员
    user.familyMembers.splice(index, 1);
    await user.save();

    // 返回更新后的用户数据
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        familyMembers: user.familyMembers
      }
    });
  } catch (error) {
    console.error('❌ 删除家庭成员失败:', error);
    res.status(500).json({ success: false, message: '删除成员失败', error: error.message });
  }
});

// 添加到文件中，和其他用户接口放在一起
router.put('/update-profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    // 更新允许修改的字段
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    // 返回更新后的用户数据
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        familyMembers: user.familyMembers
      }
    });
  } catch (error) {
    console.error('❌ 更新用户信息失败:', error);
    res.status(500).json({ success: false, message: '更新失败', error: error.message });
  }
});

module.exports = router;