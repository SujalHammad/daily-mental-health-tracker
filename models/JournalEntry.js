const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [10000, 'Content cannot be more than 10000 characters']
  },
  mood: {
    type: String,
    enum: ['very-sad', 'sad', 'neutral', 'happy', 'very-happy'],
    default: 'neutral'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  isPrivate: {
    type: Boolean,
    default: true
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'audio', 'document'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  }],
  wordCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
journalEntrySchema.index({ user: 1, date: -1 });
journalEntrySchema.index({ user: 1, mood: 1 });
journalEntrySchema.index({ user: 1, tags: 1 });
journalEntrySchema.index({ user: 1, isPrivate: 1 });

// Calculate word count and reading time before saving
journalEntrySchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.wordCount = this.content.trim().split(/\s+/).length;
    this.readingTime = Math.ceil(this.wordCount / 200); // Average reading speed: 200 words per minute
  }
  next();
});

// Virtual for excerpt (first 150 characters)
journalEntrySchema.virtual('excerpt').get(function() {
  return this.content.length > 150 
    ? this.content.substring(0, 150) + '...' 
    : this.content;
});

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
