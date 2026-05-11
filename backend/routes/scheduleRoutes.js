const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');

// 获取用户所有日程
router.get('/', auth, async (req, res) => {
  try {
    const schedules = await Schedule.find({ userId: req.user.id }).sort({ date: 1, time: 1 });
    res.json({ success: true, data: schedules });
  } catch (error) {
    console.error('获取日程失败:', error);
    res.status(500).json({ success: false, message: '获取日程失败', error: error.message });
  }
});

// 添加新日程
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, date, time, type, completed } = req.body;
    
    if (!title || !date || !time) {
      return res.status(400).json({ success: false, message: '请填写完整信息' });
    }

    const schedule = new Schedule({
      userId: req.user.id,
      title,
      description,
      date,
      time,
      type,
      completed: completed || false
    });

    await schedule.save();
    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    console.error('添加日程失败:', error);
    res.status(500).json({ success: false, message: '添加日程失败', error: error.message });
  }
});

// 更新日程（标记完成/编辑）
router.put('/:id', auth, async (req, res) => {
  try {
    const { completed, title, description, date, time, type } = req.body;
    
    const schedule = await Schedule.findOne({ _id: req.params.id, userId: req.user.id });
    if (!schedule) {
      return res.status(404).json({ success: false, message: '日程不存在' });
    }

    // 只更新提供的字段
    if (completed !== undefined) schedule.completed = completed;
    if (title) schedule.title = title;
    if (description !== undefined) schedule.description = description;
    if (date) schedule.date = date;
    if (time) schedule.time = time;
    if (type) schedule.type = type;

    await schedule.save();
    res.json({ success: true, data: schedule });
  } catch (error) {
    console.error('更新日程失败:', error);
    res.status(500).json({ success: false, message: '更新日程失败', error: error.message });
  }
});

// 删除日程
router.delete('/:id', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!schedule) {
      return res.status(404).json({ success: false, message: '日程不存在' });
    }

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除日程失败:', error);
    res.status(500).json({ success: false, message: '删除日程失败', error: error.message });
  }
});

module.exports = router;