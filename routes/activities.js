const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Activity = require('../models/Activity');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/activities
// @desc    Create a new activity
// @access  Private
router.post('/', auth, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Activity name must be between 1 and 100 characters'),
  body('category').isIn([
    'exercise', 'meditation', 'reading', 'music', 'art', 'cooking',
    'social', 'nature', 'hobby', 'work', 'study', 'relaxation',
    'sports', 'gaming', 'travel', 'volunteer', 'other'
  ]).withMessage('Invalid category'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('duration').optional().isInt({ min: 1, max: 1440 }).withMessage('Duration must be between 1 and 1440 minutes'),
  body('moodImpact').optional().isInt({ min: -5, max: 5 }).withMessage('Mood impact must be between -5 and 5'),
  body('energyImpact').optional().isInt({ min: -5, max: 5 }).withMessage('Energy impact must be between -5 and 5'),
  body('isRecurring').optional().isBoolean().withMessage('isRecurring must be a boolean'),
  body('recurringDays').optional().isArray().withMessage('recurringDays must be an array'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color'),
  body('icon').optional().isLength({ max: 10 }).withMessage('Icon cannot exceed 10 characters')
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
      name,
      category,
      description,
      duration,
      moodImpact = 0,
      energyImpact = 0,
      isRecurring = false,
      recurringDays = [],
      color = '#3B82F6',
      icon = '📝'
    } = req.body;

    const activity = new Activity({
      user: req.user._id,
      name,
      category,
      description,
      duration,
      moodImpact,
      energyImpact,
      isRecurring,
      recurringDays,
      color,
      icon
    });

    await activity.save();

    res.status(201).json({
      message: 'Activity created successfully',
      activity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ message: 'Server error during activity creation' });
  }
});

// @route   GET /api/activities
// @desc    Get user's activities with optional filtering
// @access  Private
router.get('/', auth, [
  query('category').optional().isIn([
    'exercise', 'meditation', 'reading', 'music', 'art', 'cooking',
    'social', 'nature', 'hobby', 'work', 'study', 'relaxation',
    'sports', 'gaming', 'travel', 'volunteer', 'other'
  ]).withMessage('Invalid category filter'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  query('isRecurring').optional().isBoolean().withMessage('isRecurring must be a boolean'),
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
      category,
      isActive,
      isRecurring,
      limit = 50,
      page = 1
    } = req.query;

    // Build query
    const query = { user: req.user._id };

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isRecurring !== undefined) query.isRecurring = isRecurring === 'true';

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get activities
    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const totalActivities = await Activity.countDocuments(query);

    res.json({
      activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalActivities / parseInt(limit)),
        totalActivities,
        hasNextPage: skip + activities.length < totalActivities,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error while fetching activities' });
  }
});

// @route   GET /api/activities/categories
// @desc    Get activity categories with counts
// @access  Private
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Activity.aggregate([
      { $match: { user: req.user._id, isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
});

// @route   GET /api/activities/:id
// @desc    Get single activity
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json({ activity });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Server error while fetching activity' });
  }
});

// @route   PUT /api/activities/:id
// @desc    Update activity
// @access  Private
router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Activity name must be between 1 and 100 characters'),
  body('category').optional().isIn([
    'exercise', 'meditation', 'reading', 'music', 'art', 'cooking',
    'social', 'nature', 'hobby', 'work', 'study', 'relaxation',
    'sports', 'gaming', 'travel', 'volunteer', 'other'
  ]).withMessage('Invalid category'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('duration').optional().isInt({ min: 1, max: 1440 }).withMessage('Duration must be between 1 and 1440 minutes'),
  body('moodImpact').optional().isInt({ min: -5, max: 5 }).withMessage('Mood impact must be between -5 and 5'),
  body('energyImpact').optional().isInt({ min: -5, max: 5 }).withMessage('Energy impact must be between -5 and 5'),
  body('isRecurring').optional().isBoolean().withMessage('isRecurring must be a boolean'),
  body('recurringDays').optional().isArray().withMessage('recurringDays must be an array'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color'),
  body('icon').optional().isLength({ max: 10 }).withMessage('Icon cannot exceed 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Update activity
    Object.assign(activity, req.body);
    await activity.save();

    res.json({
      message: 'Activity updated successfully',
      activity
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ message: 'Server error during activity update' });
  }
});

// @route   DELETE /api/activities/:id
// @desc    Delete activity
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    await Activity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ message: 'Server error while deleting activity' });
  }
});

// @route   POST /api/activities/:id/toggle
// @desc    Toggle activity active status
// @access  Private
router.post('/:id/toggle', auth, async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    activity.isActive = !activity.isActive;
    await activity.save();

    res.json({
      message: `Activity ${activity.isActive ? 'activated' : 'deactivated'} successfully`,
      activity
    });
  } catch (error) {
    console.error('Toggle activity error:', error);
    res.status(500).json({ message: 'Server error while toggling activity' });
  }
});

module.exports = router;
