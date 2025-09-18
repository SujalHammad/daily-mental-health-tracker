const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Activity name is required'],
    trim: true,
    maxlength: [100, 'Activity name cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'exercise', 'meditation', 'reading', 'music', 'art', 'cooking',
      'social', 'nature', 'hobby', 'work', 'study', 'relaxation',
      'sports', 'gaming', 'travel', 'volunteer', 'other'
    ],
    default: 'other'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  duration: {
    type: Number, // in minutes
    min: [1, 'Duration must be at least 1 minute'],
    max: [1440, 'Duration cannot exceed 24 hours']
  },
  moodImpact: {
    type: Number,
    min: -5,
    max: 5,
    default: 0
  },
  energyImpact: {
    type: Number,
    min: -5,
    max: 5,
    default: 0
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color'],
    default: '#3B82F6'
  },
  icon: {
    type: String,
    default: '📝'
  }
}, {
  timestamps: true
});

// Index for efficient queries
activitySchema.index({ user: 1, category: 1 });
activitySchema.index({ user: 1, isActive: 1 });
activitySchema.index({ user: 1, isRecurring: 1 });

module.exports = mongoose.model('Activity', activitySchema);
