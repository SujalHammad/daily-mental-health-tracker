const express = require('express');
const { body, validationResult, query } = require('express-validator');
const MoodEntry = require('../models/MoodEntry');
const Activity = require('../models/Activity');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/mood
// @desc    Create or update mood entry
// @access  Private
router.post('/', auth, [
  body('mood').isIn(['very-sad', 'sad', 'neutral', 'happy', 'very-happy']).withMessage('Invalid mood value'),
  body('energy').isInt({ min: 1, max: 10 }).withMessage('Energy must be between 1 and 10'),
  body('stress').isInt({ min: 1, max: 10 }).withMessage('Stress must be between 1 and 10'),
  body('anxiety').isInt({ min: 1, max: 10 }).withMessage('Anxiety must be between 1 and 10'),
  body('sleep.hours').optional().isInt({ min: 0, max: 24 }).withMessage('Sleep hours must be between 0 and 24'),
  body('sleep.quality').optional().isIn(['poor', 'fair', 'good', 'excellent']).withMessage('Invalid sleep quality'),
  body('activities').optional().isArray().withMessage('Activities must be an array'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('weather').optional().isIn(['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'unknown']).withMessage('Invalid weather value')
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
      mood,
      energy,
      stress,
      anxiety,
      sleep,
      activities,
      notes,
      tags,
      weather,
      location
    } = req.body;

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if entry already exists for today
    let moodEntry = await MoodEntry.findOne({
      user: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    const moodData = {
      user: req.user._id,
      mood,
      energy,
      stress,
      anxiety,
      sleep: sleep || { hours: 8, quality: 'good' },
      activities: activities || [],
      notes,
      tags: tags || [],
      weather: weather || 'unknown',
      location
    };

    if (moodEntry) {
      // Update existing entry
      Object.assign(moodEntry, moodData);
      await moodEntry.save();
      res.json({
        message: 'Mood entry updated successfully',
        moodEntry
      });
    } else {
      // Create new entry
      moodEntry = new MoodEntry(moodData);
      await moodEntry.save();
      res.status(201).json({
        message: 'Mood entry created successfully',
        moodEntry
      });
    }
  } catch (error) {
    console.error('Mood entry error:', error);
    res.status(500).json({ message: 'Server error during mood entry' });
  }
});

// @route   GET /api/mood
// @desc    Get mood entries with optional filtering
// @access  Private
router.get('/', auth, [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('mood').optional().isIn(['very-sad', 'sad', 'neutral', 'happy', 'very-happy']).withMessage('Invalid mood filter'),
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
      limit = 30,
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

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get mood entries
    const moodEntries = await MoodEntry.find(query)
      .populate('activities', 'name category color icon')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const totalEntries = await MoodEntry.countDocuments(query);

    res.json({
      moodEntries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEntries / parseInt(limit)),
        totalEntries,
        hasNextPage: skip + moodEntries.length < totalEntries,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get mood entries error:', error);
    res.status(500).json({ message: 'Server error while fetching mood entries' });
  }
});

// @route   GET /api/mood/today
// @desc    Get today's mood entry
// @access  Private
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const moodEntry = await MoodEntry.findOne({
      user: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('activities', 'name category color icon');

    res.json({ moodEntry });
  } catch (error) {
    console.error('Get today mood error:', error);
    res.status(500).json({ message: 'Server error while fetching today\'s mood' });
  }
});

// @route   GET /api/mood/stats
// @desc    Get mood statistics
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

    // Get mood entries for the period
    const moodEntries = await MoodEntry.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Calculate statistics
    const stats = {
      totalEntries: moodEntries.length,
      averageMood: 0,
      averageEnergy: 0,
      averageStress: 0,
      averageAnxiety: 0,
      averageSleep: 0,
      moodDistribution: {
        'very-sad': 0,
        'sad': 0,
        'neutral': 0,
        'happy': 0,
        'very-happy': 0
      },
      trends: {
        mood: [],
        energy: [],
        stress: [],
        anxiety: []
      }
    };

    if (moodEntries.length > 0) {
      // Calculate averages
      const moodScores = moodEntries.map(entry => entry.moodScore);
      const energies = moodEntries.map(entry => entry.energy);
      const stresses = moodEntries.map(entry => entry.stress);
      const anxieties = moodEntries.map(entry => entry.anxiety);
      const sleeps = moodEntries.map(entry => entry.sleep.hours);

      stats.averageMood = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;
      stats.averageEnergy = energies.reduce((a, b) => a + b, 0) / energies.length;
      stats.averageStress = stresses.reduce((a, b) => a + b, 0) / stresses.length;
      stats.averageAnxiety = anxieties.reduce((a, b) => a + b, 0) / anxieties.length;
      stats.averageSleep = sleeps.reduce((a, b) => a + b, 0) / sleeps.length;

      // Calculate mood distribution
      moodEntries.forEach(entry => {
        stats.moodDistribution[entry.mood]++;
      });

      // Calculate trends (daily averages)
      const dailyStats = {};
      moodEntries.forEach(entry => {
        const dateKey = entry.date.toISOString().split('T')[0];
        if (!dailyStats[dateKey]) {
          dailyStats[dateKey] = {
            mood: [],
            energy: [],
            stress: [],
            anxiety: []
          };
        }
        dailyStats[dateKey].mood.push(entry.moodScore);
        dailyStats[dateKey].energy.push(entry.energy);
        dailyStats[dateKey].stress.push(entry.stress);
        dailyStats[dateKey].anxiety.push(entry.anxiety);
      });

      Object.keys(dailyStats).sort().forEach(date => {
        const dayStats = dailyStats[date];
        stats.trends.mood.push({
          date,
          value: dayStats.mood.reduce((a, b) => a + b, 0) / dayStats.mood.length
        });
        stats.trends.energy.push({
          date,
          value: dayStats.energy.reduce((a, b) => a + b, 0) / dayStats.energy.length
        });
        stats.trends.stress.push({
          date,
          value: dayStats.stress.reduce((a, b) => a + b, 0) / dayStats.stress.length
        });
        stats.trends.anxiety.push({
          date,
          value: dayStats.anxiety.reduce((a, b) => a + b, 0) / dayStats.anxiety.length
        });
      });
    }

    res.json({ stats, period });
  } catch (error) {
    console.error('Get mood stats error:', error);
    res.status(500).json({ message: 'Server error while fetching mood statistics' });
  }
});

// @route   DELETE /api/mood/:id
// @desc    Delete mood entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const moodEntry = await MoodEntry.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!moodEntry) {
      return res.status(404).json({ message: 'Mood entry not found' });
    }

    await MoodEntry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Mood entry deleted successfully' });
  } catch (error) {
    console.error('Delete mood entry error:', error);
    res.status(500).json({ message: 'Server error while deleting mood entry' });
  }
});

module.exports = router;
