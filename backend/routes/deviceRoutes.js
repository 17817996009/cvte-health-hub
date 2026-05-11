const express = require('express');
const router = express.Router();
const mqtt = require('mqtt');
const auth = require('../middleware/auth');

const client = mqtt.connect(process.env.MQTT_BROKER);

// 控制设备
router.post('/control', auth, (req, res) => {
  try {
    const { device, action, params } = req.body;
    
    const message = {
      device,
      action,
      params,
      userId: req.user.id,
      timestamp: Date.now()
    };
    
    client.publish(`cvte/devices/${device}`, JSON.stringify(message));
    
    res.json({ success: true, message: '控制指令已发送' });
  } catch (error) {
    res.status(500).json({ success: false, message: '控制设备失败', error: error.message });
  }
});

module.exports = router;