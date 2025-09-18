const express = require('express');
const { query, validationResult } = require('express-validator');
const MoodEntry = require('../models/MoodEntry');
const Activity = require('../models/Activity');
const JournalEntry = require('../models/JournalEntry');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/overview
// @desc    Get comprehensive analytics overview
// @access  Private
router.get('/overview', auth, [
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

    // Get data for the period
    const [moodEntries, activities, journalEntries] = await Promise.all([
      MoodEntry.find({
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 }),
      Activity.find({
        user: req.user._id,
        isActive: true
      }),
      JournalEntry.find({
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 })
    ]);

    // Calculate mood analytics
    const moodAnalytics = {
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
        anxiety: [],
        sleep: []
      }
    };

    if (moodEntries.length > 0) {
      const moodScores = moodEntries.map(entry => entry.moodScore);
      const energies = moodEntries.map(entry => entry.energy);
      const stresses = moodEntries.map(entry => entry.stress);
      const anxieties = moodEntries.map(entry => entry.anxiety);
      const sleeps = moodEntries.map(entry => entry.sleep.hours);

      moodAnalytics.averageMood = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;
      moodAnalytics.averageEnergy = energies.reduce((a, b) => a + b, 0) / energies.length;
      moodAnalytics.averageStress = stresses.reduce((a, b) => a + b, 0) / stresses.length;
      moodAnalytics.averageAnxiety = anxieties.reduce((a, b) => a + b, 0) / anxieties.length;
      moodAnalytics.averageSleep = sleeps.reduce((a, b) => a + b, 0) / sleeps.length;

      // Calculate mood distribution
      moodEntries.forEach(entry => {
        moodAnalytics.moodDistribution[entry.mood]++;
      });

      // Calculate daily trends
      const dailyStats = {};
      moodEntries.forEach(entry => {
        const dateKey = entry.date.toISOString().split('T')[0];
        if (!dailyStats[dateKey]) {
          dailyStats[dateKey] = {
            mood: [],
            energy: [],
            stress: [],
            anxiety: [],
            sleep: []
          };
        }
        dailyStats[dateKey].mood.push(entry.moodScore);
        dailyStats[dateKey].energy.push(entry.energy);
        dailyStats[dateKey].stress.push(entry.stress);
        dailyStats[dateKey].anxiety.push(entry.anxiety);
        dailyStats[dateKey].sleep.push(entry.sleep.hours);
      });

      Object.keys(dailyStats).sort().forEach(date => {
        const dayStats = dailyStats[date];
        moodAnalytics.trends.mood.push({
          date,
          value: dayStats.mood.reduce((a, b) => a + b, 0) / dayStats.mood.length
        });
        moodAnalytics.trends.energy.push({
          date,
          value: dayStats.energy.reduce((a, b) => a + b, 0) / dayStats.energy.length
        });
        moodAnalytics.trends.stress.push({
          date,
          value: dayStats.stress.reduce((a, b) => a + b, 0) / dayStats.stress.length
        });
        moodAnalytics.trends.anxiety.push({
          date,
          value: dayStats.anxiety.reduce((a, b) => a + b, 0) / dayStats.anxiety.length
        });
        moodAnalytics.trends.sleep.push({
          date,
          value: dayStats.sleep.reduce((a, b) => a + b, 0) / dayStats.sleep.length
        });
      });
    }

    // Calculate activity analytics
    const activityAnalytics = {
      totalActivities: activities.length,
      categoryDistribution: {},
      averageMoodImpact: 0,
      averageEnergyImpact: 0,
      recurringActivities: activities.filter(a => a.isRecurring).length,
      topActivities: []
    };

    if (activities.length > 0) {
      // Category distribution
      activities.forEach(activity => {
        activityAnalytics.categoryDistribution[activity.category] = 
          (activityAnalytics.categoryDistribution[activity.category] || 0) + 1;
      });

      // Average impacts
      const moodImpacts = activities.map(a => a.moodImpact);
      const energyImpacts = activities.map(a => a.energyImpact);
      
      activityAnalytics.averageMoodImpact = moodImpacts.reduce((a, b) => a + b, 0) / moodImpacts.length;
      activityAnalytics.averageEnergyImpact = energyImpacts.reduce((a, b) => a + b, 0) / energyImpacts.length;

      // Top activities by positive impact
      activityAnalytics.topActivities = activities
        .filter(a => a.moodImpact > 0 || a.energyImpact > 0)
        .sort((a, b) => (b.moodImpact + b.energyImpact) - (a.moodImpact + a.energyImpact))
        .slice(0, 10)
        .map(a => ({
          name: a.name,
          category: a.category,
          moodImpact: a.moodImpact,
          energyImpact: a.energyImpact,
          totalImpact: a.moodImpact + a.energyImpact
        }));
    }

    // Calculate journal analytics
    const journalAnalytics = {
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
      writingStreak: 0
    };

    if (journalEntries.length > 0) {
      journalAnalytics.averageWordsPerEntry = journalAnalytics.totalWords / journalEntries.length;
      journalAnalytics.averageReadingTime = journalEntries.reduce((sum, entry) => sum + entry.readingTime, 0) / journalEntries.length;

      // Mood distribution
      journalEntries.forEach(entry => {
        journalAnalytics.moodDistribution[entry.mood]++;
      });

      // Most used tags
      const tagCounts = {};
      journalEntries.forEach(entry => {
        entry.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      journalAnalytics.mostUsedTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));

      // Writing streak
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
      journalAnalytics.writingStreak = streak;
    }

    // Calculate insights and recommendations
    const insights = [];
    const recommendations = [];

    // Mood insights
    if (moodAnalytics.averageMood < 3) {
      insights.push("Your mood has been lower than average recently.");
      recommendations.push("Consider engaging in activities that typically boost your mood, or reach out to a mental health professional.");
    } else if (moodAnalytics.averageMood > 4) {
      insights.push("You've been in a great mood lately! Keep up the positive energy.");
    }

    // Sleep insights
    if (moodAnalytics.averageSleep < 7) {
      insights.push("Your sleep duration is below the recommended 7-9 hours.");
      recommendations.push("Try to establish a consistent sleep schedule and create a relaxing bedtime routine.");
    }

    // Stress insights
    if (moodAnalytics.averageStress > 7) {
      insights.push("Your stress levels have been high recently.");
      recommendations.push("Consider stress-reduction techniques like meditation, deep breathing, or physical exercise.");
    }

    // Activity insights
    if (activityAnalytics.topActivities.length > 0) {
      const topActivity = activityAnalytics.topActivities[0];
      insights.push(`Your most positive activity is ${topActivity.name} (${topActivity.category}).`);
      recommendations.push(`Try to incorporate more ${topActivity.name} into your daily routine.`);
    }

    // Journal insights
    if (journalAnalytics.writingStreak > 7) {
      insights.push(`Amazing! You have a ${journalAnalytics.writingStreak}-day writing streak.`);
    } else if (journalAnalytics.writingStreak === 0 && journalAnalytics.totalEntries > 0) {
      recommendations.push("Try to write in your journal daily to build a consistent habit.");
    }

    res.json({
      period,
      moodAnalytics,
      activityAnalytics,
      journalAnalytics,
      insights,
      recommendations
    });
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({ message: 'Server error while fetching analytics overview' });
  }
});

// @route   GET /api/analytics/trends
// @desc    Get detailed trend analysis
// @access  Private
router.get('/trends', auth, [
  query('metric').optional().isIn(['mood', 'energy', 'stress', 'anxiety', 'sleep']).withMessage('Invalid metric'),
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period')
], async (req, res) => {
  try {
    const { metric = 'mood', period = 'month' } = req.query;
    
    // Calculate date range
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

    const moodEntries = await MoodEntry.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    const trends = {
      metric,
      period,
      data: [],
      statistics: {
        min: 0,
        max: 0,
        average: 0,
        trend: 'stable', // 'increasing', 'decreasing', 'stable'
        volatility: 0
      }
    };

    if (moodEntries.length > 0) {
      // Extract data based on metric
      let values = [];
      switch (metric) {
        case 'mood':
          values = moodEntries.map(entry => entry.moodScore);
          break;
        case 'energy':
          values = moodEntries.map(entry => entry.energy);
          break;
        case 'stress':
          values = moodEntries.map(entry => entry.stress);
          break;
        case 'anxiety':
          values = moodEntries.map(entry => entry.anxiety);
          break;
        case 'sleep':
          values = moodEntries.map(entry => entry.sleep.hours);
          break;
      }

      // Create data points
      trends.data = moodEntries.map((entry, index) => ({
        date: entry.date.toISOString().split('T')[0],
        value: values[index]
      }));

      // Calculate statistics
      trends.statistics.min = Math.min(...values);
      trends.statistics.max = Math.max(...values);
      trends.statistics.average = values.reduce((a, b) => a + b, 0) / values.length;

      // Calculate trend direction
      if (values.length >= 2) {
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        const change = ((secondAvg - firstAvg) / firstAvg) * 100;
        
        if (change > 5) trends.statistics.trend = 'increasing';
        else if (change < -5) trends.statistics.trend = 'decreasing';
        else trends.statistics.trend = 'stable';
      }

      // Calculate volatility (standard deviation)
      const variance = values.reduce((acc, val) => acc + Math.pow(val - trends.statistics.average, 2), 0) / values.length;
      trends.statistics.volatility = Math.sqrt(variance);
    }

    res.json(trends);
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ message: 'Server error while fetching trends' });
  }
});

module.exports = router;
