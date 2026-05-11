const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deviceType: {
    type: String,
    required: true,
    enum: ['smart_mirror', 'sleep_monitor', 'blood_pressure', 'weight_scale'],
  },
  data: {
    type: Object,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('HealthData', healthDataSchema); 