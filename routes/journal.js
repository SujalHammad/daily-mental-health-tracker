const express = require('express');
const { body, validationResult, query } = require('express-validator');
const JournalEntry = require('../models/JournalEntry');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/journal
// @desc    Create a new journal entry
// @access  Private
router.post('/', auth, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('content').isLength({ min: 1, max: 10000 }).withMessage('Content must be between 1 and 10000 characters'),
  body('mood').optional().isIn(['very-sad', 'sad', 'neutral', 'happy', 'very-happy']).withMessage('Invalid mood value'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      title,
      content,
      mood = 'neutral',
      tags = [],
      isPrivate = true
    } = req.body;

    const journalEntry = new JournalEntry({
      user: req.user._id,
      title,
      content,
      mood,
      tags,
      isPrivate
    });

    await journalEntry.save();

    res.status(201).json({
      message: 'Journal entry created successfully',
      journalEntry
    });
  } catch (error) {
    console.error('Create journal entry error:', error);
    res.status(500).json({ message: 'Server error during journal entry creation' });
  }
});

// @route   GET /api/journal
// @desc    Get journal entries with optional filtering
// @access  Private
router.get('/', auth, [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('mood').optional().isIn(['very-sad', 'sad', 'neutral', 'happy', 'very-happy']).withMessage('Invalid mood filter'),
  query('tags').optional().isString().withMessage('Tags filter must be a string'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      startDate,
      endDate,
      mood,
      tags,
      search,
      limit = 20,
      page = 1
    } = req.query;

    // Build query
    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (mood) query.mood = mood;

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get journal entries
    const journalEntries = await JournalEntry.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const totalEntries = await JournalEntry.countDocuments(query);

    res.json({
      journalEntries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEntries / parseInt(limit)),
        totalEntries,
        hasNextPage: skip + journalEntries.length < totalEntries,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get journal entries error:', error);
    res.status(500).json({ message: 'Server error while fetching journal entries' });
  }
});

// @route   GET /api/journal/:id
// @desc    Get single journal entry
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const journalEntry = await JournalEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!journalEntry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.json({ journalEntry });
  } catch (error) {
    console.error('Get journal entry error:', error);
    res.status(500).json({ message: 'Server error while fetching journal entry' });
  }
});

// @route   PUT /api/journal/:id
// @desc    Update journal entry
// @access  Private
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('content').optional().isLength({ min: 1, max: 10000 }).withMessage('Content must be between 1 and 10000 characters'),
  body('mood').optional().isIn(['very-sad', 'sad', 'neutral', 'happy', 'very-happy']).withMessage('Invalid mood value'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const journalEntry = await JournalEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!journalEntry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    // Update journal entry
    Object.assign(journalEntry, req.body);
    await journalEntry.save();

    res.json({
      message: 'Journal entry updated successfully',
      journalEntry
    });
  } catch (error) {
    console.error('Update journal entry error:', error);
    res.status(500).json({ message: 'Server error during journal entry update' });
  }
});

// @route   DELETE /api/journal/:id
// @desc    Delete journal entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const journalEntry = await JournalEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!journalEntry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    await JournalEntry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    res.status(500).json({ message: 'Server error while deleting journal entry' });
  }
});

// @route   GET /api/journal/stats
// @desc    Get journal statistics
// @access  Private
router.get('/stats', auth, [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period')
], async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    // Get journal entries for the period
    const journalEntries = await JournalEntry.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Calculate statistics
    const stats = {
      totalEntries: journalEntries.length,
      totalWords: journalEntries.reduce((sum, entry) => sum + entry.wordCount, 0),
      averageWordsPerEntry: 0,
      averageReadingTime: 0,
      moodDistribution: {
        'very-sad': 0,
        'sad': 0,
        'neutral': 0,
        'happy': 0,
        'very-happy': 0
      },
      mostUsedTags: [],
      writingStreak: 0,
      entriesByMonth: {}
    };

    if (journalEntries.length > 0) {
      stats.averageWordsPerEntry = stats.totalWords / journalEntries.length;
      stats.averageReadingTime = journalEntries.reduce((sum, entry) => sum + entry.readingTime, 0) / journalEntries.length;

      // Calculate mood distribution
      journalEntries.forEach(entry => {
        stats.moodDistribution[entry.mood]++;
      });

      // Calculate most used tags
      const tagCounts = {};
      journalEntries.forEach(entry => {
        entry.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      stats.mostUsedTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));

      // Calculate entries by month
      journalEntries.forEach(entry => {
        const month = entry.date.toISOString().substring(0, 7);
        stats.entriesByMonth[month] = (stats.entriesByMonth[month] || 0) + 1;
      });

      // Calculate writing streak
      const sortedEntries = journalEntries
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (const entry of sortedEntries) {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        
        const diffTime = currentDate - entryDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === streak + 1 || (streak === 0 && diffDays <= 1)) {
          streak++;
          currentDate = entryDate;
        } else {
          break;
        }
      }
      stats.writingStreak = streak;
    }

    res.json({ stats, period });
  } catch (error) {
    console.error('Get journal stats error:', error);
    res.status(500).json({ message: 'Server error while fetching journal statistics' });
  }
});

// @route   GET /api/journal/tags
// @desc    Get all unique tags
// @access  Private
router.get('/tags', auth, async (req, res) => {
  try {
    const tags = await JournalEntry.distinct('tags', { user: req.user._id });
    res.json({ tags: tags.sort() });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Server error while fetching tags' });
  }
});

module.exports = router;
