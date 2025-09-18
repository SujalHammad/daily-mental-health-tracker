const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  mood: {
    type: String,
    required: [true, 'Mood is required'],
    enum: ['very-sad', 'sad', 'neutral', 'happy', 'very-happy'],
    default: 'neutral'
  },
  energy: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  },
  stress: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  },
  anxiety: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  },
  sleep: {
    hours: {
      type: Number,
      min: 0,
      max: 24,
      default: 8
    },
    quality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
      default: 'good'
    }
  },
  activities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot be more than 20 characters']
  }],
  weather: {
    type: String,
    enum: ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'unknown'],
    default: 'unknown'
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters']
  }
}, {
  timestamps: true
});

// Index for efficient queries
moodEntrySchema.index({ user: 1, date: -1 });
moodEntrySchema.index({ user: 1, mood: 1 });
moodEntrySchema.index({ user: 1, createdAt: -1 });

// Virtual for mood score (1-5 scale)
moodEntrySchema.virtual('moodScore').get(function() {
  const moodMap = {
    'very-sad': 1,
    'sad': 2,
    'neutral': 3,
    'happy': 4,
    'very-happy': 5
  };
  return moodMap[this.mood];
});

// Ensure only one entry per user per day
moodEntrySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
