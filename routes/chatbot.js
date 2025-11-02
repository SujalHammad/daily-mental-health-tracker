const express = require('express');
const { body, validationResult } = require('express-validator');
const MoodEntry = require('../models/MoodEntry');
const Activity = require('../models/Activity');
const JournalEntry = require('../models/JournalEntry');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Helper function to analyze mood trends
const analyzeMoodTrends = (moodEntries) => {
  if (moodEntries.length < 2) return null;
  
  const recent = moodEntries.slice(-7); // Last 7 entries
  const older = moodEntries.slice(-14, -7); // Previous 7 entries
  
  const recentAvg = recent.reduce((sum, entry) => {
    const moodScore = { 'very-sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very-happy': 5 };
    return sum + moodScore[entry.mood];
  }, 0) / recent.length;
  
  const olderAvg = older.reduce((sum, entry) => {
    const moodScore = { 'very-sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very-happy': 5 };
    return sum + moodScore[entry.mood];
  }, 0) / older.length;
  
  return {
    trend: recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable',
    recentAverage: recentAvg,
    previousAverage: olderAvg,
    change: recentAvg - olderAvg
  };
};

// Helper function to analyze sleep patterns
const analyzeSleepPatterns = (moodEntries) => {
  const recentEntries = moodEntries.slice(-7);
  const sleepData = recentEntries.filter(entry => entry.sleep && entry.sleep.hours);
  
  if (sleepData.length === 0) return null;
  
  const avgSleepHours = sleepData.reduce((sum, entry) => sum + entry.sleep.hours, 0) / sleepData.length;
  const poorSleepDays = sleepData.filter(entry => entry.sleep.quality === 'poor').length;
  
  return {
    averageHours: avgSleepHours,
    poorSleepDays,
    recommendation: avgSleepHours < 7 ? 'sleep-deprivation' : 
                   avgSleepHours > 9 ? 'oversleeping' : 
                   poorSleepDays > 3 ? 'poor-quality' : 'good'
  };
};

// Helper function to analyze stress and anxiety
const analyzeStressAnxiety = (moodEntries) => {
  const recent = moodEntries.slice(-7);
  const avgStress = recent.reduce((sum, entry) => sum + entry.stress, 0) / recent.length;
  const avgAnxiety = recent.reduce((sum, entry) => sum + entry.anxiety, 0) / recent.length;
  
  return {
    stressLevel: avgStress,
    anxietyLevel: avgAnxiety,
    concern: avgStress > 7 || avgAnxiety > 7 ? 'high' : avgStress > 5 || avgAnxiety > 5 ? 'moderate' : 'low'
  };
};

// Helper function to analyze journal sentiment
const analyzeJournalSentiment = (journalEntries) => {
  if (journalEntries.length === 0) return null;
  
  const recent = journalEntries.slice(-5);
  const moodCounts = recent.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {});
  
  const totalEntries = recent.length;
  const positiveEntries = (moodCounts['happy'] || 0) + (moodCounts['very-happy'] || 0);
  const negativeEntries = (moodCounts['sad'] || 0) + (moodCounts['very-sad'] || 0);
  
  return {
    positiveRatio: positiveEntries / totalEntries,
    negativeRatio: negativeEntries / totalEntries,
    sentiment: positiveEntries > negativeEntries ? 'positive' : negativeEntries > positiveEntries ? 'negative' : 'neutral'
  };
};

// Helper function to generate personalized advice
const generateAdvice = (userData, userMessage) => {
  const { moodTrends, sleepPatterns, stressAnxiety, journalSentiment, recentActivities } = userData;
  const advice = [];
  const suggestions = [];
  
  // Mood-based advice
  if (moodTrends) {
    if (moodTrends.trend === 'declining') {
      advice.push("I've noticed your mood has been declining recently. This is completely normal and there are ways to help improve it.");
      suggestions.push("Try engaging in activities you enjoy, spending time with loved ones, or practicing mindfulness exercises.");
    } else if (moodTrends.trend === 'improving') {
      advice.push("Great news! I can see your mood has been improving lately. Keep up the positive momentum!");
      suggestions.push("Continue with the activities that are helping you feel better. Consider journaling about what's working for you.");
    }
  }
  
  // Sleep-based advice
  if (sleepPatterns) {
    if (sleepPatterns.recommendation === 'sleep-deprivation') {
      advice.push("I've noticed you might not be getting enough sleep. Quality sleep is crucial for mental health.");
      suggestions.push("Try establishing a consistent bedtime routine, limit screen time before bed, and create a comfortable sleep environment.");
    } else if (sleepPatterns.recommendation === 'poor-quality') {
      advice.push("Your sleep quality seems to be affecting your wellbeing.");
      suggestions.push("Consider relaxation techniques before bed, avoid caffeine in the evening, and ensure your bedroom is dark and quiet.");
    }
  }
  
  // Stress and anxiety advice
  if (stressAnxiety) {
    if (stressAnxiety.concern === 'high') {
      advice.push("I'm concerned about your stress and anxiety levels. It's important to address these feelings.");
      suggestions.push("Try deep breathing exercises, progressive muscle relaxation, or consider speaking with a mental health professional.");
    } else if (stressAnxiety.concern === 'moderate') {
      advice.push("Your stress and anxiety levels are moderate. Let's work on keeping them manageable.");
      suggestions.push("Regular exercise, meditation, and maintaining a balanced schedule can help manage stress levels.");
    }
  }
  
  // Journal sentiment advice
  if (journalSentiment) {
    if (journalSentiment.sentiment === 'negative') {
      advice.push("I've noticed some negative patterns in your recent journal entries. This is a good opportunity for reflection.");
      suggestions.push("Try focusing on gratitude, writing about positive experiences, or exploring what might be contributing to these feelings.");
    }
  }
  
  // Activity-based advice
  if (recentActivities.length === 0) {
    advice.push("I notice you haven't logged many activities recently. Engaging in meaningful activities can boost your mood.");
    suggestions.push("Try adding some activities to your routine - even simple things like taking a walk or listening to music can make a difference.");
  } else {
    const exerciseActivities = recentActivities.filter(activity => activity.category === 'exercise');
    if (exerciseActivities.length === 0) {
      suggestions.push("Consider adding some physical activity to your routine - even a short walk can improve your mood and energy.");
    }
  }
  
  return { advice, suggestions };
};

// @route   POST /api/chatbot/analyze
// @desc    Analyze user data and provide personalized insights
// @access  Private
router.post('/analyze', auth, async (req, res) => {
  try {
    // Get user data from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [moodEntries, activities, journalEntries] = await Promise.all([
      MoodEntry.find({
        user: req.user._id,
        date: { $gte: thirtyDaysAgo }
      }).sort({ date: 1 }),
      Activity.find({
        user: req.user._id,
        isActive: true
      }),
      JournalEntry.find({
        user: req.user._id,
        date: { $gte: thirtyDaysAgo }
      }).sort({ date: 1 })
    ]);
    
    // Analyze different aspects
    const moodTrends = analyzeMoodTrends(moodEntries);
    const sleepPatterns = analyzeSleepPatterns(moodEntries);
    const stressAnxiety = analyzeStressAnxiety(moodEntries);
    const journalSentiment = analyzeJournalSentiment(journalEntries);
    const recentActivities = activities.slice(-10);
    
    const userData = {
      moodTrends,
      sleepPatterns,
      stressAnxiety,
      journalSentiment,
      recentActivities
    };
    
    // Generate insights and recommendations
    const insights = generateAdvice(userData, '');
    
    res.json({
      success: true,
      data: {
        insights,
        summary: {
          totalMoodEntries: moodEntries.length,
          totalActivities: activities.length,
          totalJournalEntries: journalEntries.length,
          lastEntryDate: moodEntries.length > 0 ? moodEntries[moodEntries.length - 1].date : null
        }
      }
    });
    
  } catch (error) {
    console.error('Chatbot analysis error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to analyze user data' 
    });
  }
});

// @route   POST /api/chatbot/chat
// @desc    Handle chatbot conversation with data-driven responses
// @access  Private
router.post('/chat', auth, [
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid message format',
        errors: errors.array()
      });
    }
    
    const { message } = req.body;
    const lowercaseMessage = message.toLowerCase();
    
    // Get recent user data for context
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const [recentMoodEntries, recentActivities] = await Promise.all([
      MoodEntry.find({
        user: req.user._id,
        date: { $gte: sevenDaysAgo }
      }).sort({ date: -1 }).limit(5),
      Activity.find({
        user: req.user._id,
        isActive: true
      }).limit(5)
    ]);
    
    let response = '';
    let suggestions = [];
    
    // Context-aware responses based on user data
    if (lowercaseMessage.includes('how am i doing') || lowercaseMessage.includes('how are my moods')) {
      if (recentMoodEntries.length === 0) {
        response = "I don't have enough data to give you insights yet. Try logging your mood for a few days so I can help you understand your patterns better!";
      } else {
        const latestMood = recentMoodEntries[0];
        const moodEmoji = {
          'very-sad': '😢',
          'sad': '😔',
          'neutral': '😐',
          'happy': '😊',
          'very-happy': '😄'
        };
        
        response = `Based on your recent mood entries, you've been feeling ${latestMood.mood.replace('-', ' ')} ${moodEmoji[latestMood.mood]} lately. `;
        
        if (latestMood.stress > 6) {
          response += "I notice your stress levels are quite high. ";
          suggestions.push("Try some relaxation techniques or deep breathing exercises.");
        }
        
        if (latestMood.energy < 4) {
          response += "Your energy levels seem low. ";
          suggestions.push("Consider getting some light exercise or spending time outdoors.");
        }
      }
    } else if (lowercaseMessage.includes('sleep') || lowercaseMessage.includes('tired')) {
      if (recentMoodEntries.length > 0) {
        const sleepData = recentMoodEntries.filter(entry => entry.sleep);
        if (sleepData.length > 0) {
          const avgSleep = sleepData.reduce((sum, entry) => sum + entry.sleep.hours, 0) / sleepData.length;
          response = `Based on your recent entries, you've been averaging about ${avgSleep.toFixed(1)} hours of sleep per night. `;
          
          if (avgSleep < 7) {
            response += "This might be affecting your mood and energy levels. ";
            suggestions.push("Try to maintain a consistent sleep schedule and create a relaxing bedtime routine.");
          } else if (avgSleep > 9) {
            response += "You're getting a lot of sleep, which is great for recovery!";
          } else {
            response += "That's a healthy amount of sleep. Keep it up!";
          }
        } else {
          response = "I don't have enough sleep data to provide insights. Try logging your sleep hours when you track your mood!";
        }
      } else {
        response = "I'd love to help with sleep advice, but I need some mood tracking data first. Try logging your mood and sleep for a few days!";
      }
    } else if (lowercaseMessage.includes('activity') || lowercaseMessage.includes('exercise')) {
      if (recentActivities.length > 0) {
        const exerciseActivities = recentActivities.filter(activity => activity.category === 'exercise');
        response = `I can see you have ${recentActivities.length} activities logged. `;
        
        if (exerciseActivities.length > 0) {
          response += "Great job staying active! Regular exercise can really help with mood and stress management.";
        } else {
          response += "Consider adding some physical activity to your routine - it can make a big difference in how you feel.";
          suggestions.push("Even a 10-minute walk can boost your mood and energy levels.");
        }
      } else {
        response = "I don't see any activities logged yet. Adding activities to your routine can help improve your overall wellbeing!";
        suggestions.push("Try logging activities like walking, reading, or any hobbies you enjoy.");
      }
    } else if (lowercaseMessage.includes('stress') || lowercaseMessage.includes('anxiety')) {
      if (recentMoodEntries.length > 0) {
        const latestEntry = recentMoodEntries[0];
        const avgStress = recentMoodEntries.reduce((sum, entry) => sum + entry.stress, 0) / recentMoodEntries.length;
        const avgAnxiety = recentMoodEntries.reduce((sum, entry) => sum + entry.anxiety, 0) / recentMoodEntries.length;
        
        response = `Based on your recent tracking, your stress level is around ${avgStress.toFixed(1)}/10 and anxiety is ${avgAnxiety.toFixed(1)}/10. `;
        
        if (avgStress > 7 || avgAnxiety > 7) {
          response += "These levels are quite high. It's important to take care of yourself during stressful times.";
          suggestions.push("Try mindfulness meditation, deep breathing exercises, or consider talking to a mental health professional.");
        } else if (avgStress > 5 || avgAnxiety > 5) {
          response += "These levels are moderate. Let's work on keeping them manageable.";
          suggestions.push("Regular breaks, physical activity, and maintaining a routine can help manage stress.");
        } else {
          response += "Your stress and anxiety levels look manageable. Keep up whatever strategies are working for you!";
        }
      } else {
        response = "I'd love to help with stress and anxiety management, but I need some mood tracking data first. Try logging your mood for a few days!";
      }
    } else if (lowercaseMessage.includes('advice') || lowercaseMessage.includes('help') || lowercaseMessage.includes('suggestion')) {
      // Generate personalized advice based on all available data
      const userData = {
        moodTrends: analyzeMoodTrends(recentMoodEntries),
        sleepPatterns: analyzeSleepPatterns(recentMoodEntries),
        stressAnxiety: analyzeStressAnxiety(recentMoodEntries),
        recentActivities: recentActivities
      };
      
      const advice = generateAdvice(userData, message);
      
      if (advice.advice.length > 0) {
        response = advice.advice.join(' ');
        suggestions = advice.suggestions;
      } else {
        response = "I'd be happy to provide personalized advice! Try logging your mood, activities, and journal entries for a few days so I can give you more specific recommendations.";
        suggestions.push("The more data you provide, the better insights I can offer about your wellbeing patterns.");
      }
    } else {
      // General supportive response
      response = "I'm here to help support your mental health journey! You can ask me about your mood patterns, sleep, stress levels, or activities. The more you track, the better insights I can provide.";
      suggestions.push("Try asking: 'How am I doing?' or 'Give me some advice' for personalized insights.");
    }
    
    // Add suggestions if we have any
    if (suggestions.length > 0) {
      response += " Here are some suggestions: " + suggestions.join(' ');
    }
    
    res.json({
      success: true,
      reply: response,
      suggestions: suggestions,
      dataAvailable: recentMoodEntries.length > 0 || recentActivities.length > 0
    });
    
  } catch (error) {
    console.error('Chatbot chat error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process your message. Please try again.' 
    });
  }
});

// @route   GET /api/chatbot/notifications
// @desc    Get proactive notifications based on user patterns
// @access  Private
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = [];
    
    // Check for missing mood entries (remind to log mood)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayMoodEntry = await MoodEntry.findOne({
      user: req.user._id,
      date: { $gte: today }
    });
    
    if (!todayMoodEntry) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdayEntry = await MoodEntry.findOne({
        user: req.user._id,
        date: { $gte: yesterday }
      });
      
      if (!yesterdayEntry) {
        notifications.push({
          type: 'mood-reminder',
          title: 'Track Your Mood',
          message: "It's been a while since you logged your mood. Tracking regularly helps me provide better insights!",
          priority: 'medium',
          action: 'mood-tracker'
        });
      }
    }
    
    // Check for declining mood trends
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentMoodEntries = await MoodEntry.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });
    
    if (recentMoodEntries.length >= 5) {
      const moodTrends = analyzeMoodTrends(recentMoodEntries);
      if (moodTrends && moodTrends.trend === 'declining' && moodTrends.change < -0.5) {
        notifications.push({
          type: 'mood-decline',
          title: 'Mood Support Available',
          message: "I've noticed your mood has been declining recently. I'm here to help with some personalized suggestions.",
          priority: 'high',
          action: 'chat-support'
        });
      }
    }
    
    // Check for high stress levels
    if (recentMoodEntries.length >= 3) {
      const stressAnxiety = analyzeStressAnxiety(recentMoodEntries);
      if (stressAnxiety && stressAnxiety.concern === 'high') {
        notifications.push({
          type: 'stress-alert',
          title: 'Stress Management',
          message: "Your stress levels have been high recently. Let's talk about some coping strategies.",
          priority: 'high',
          action: 'stress-help'
        });
      }
    }
    
    // Check for sleep issues
    if (recentMoodEntries.length >= 3) {
      const sleepPatterns = analyzeSleepPatterns(recentMoodEntries);
      if (sleepPatterns && (sleepPatterns.recommendation === 'sleep-deprivation' || sleepPatterns.recommendation === 'poor-quality')) {
        notifications.push({
          type: 'sleep-support',
          title: 'Sleep Wellness',
          message: "I've noticed some sleep patterns that might be affecting your wellbeing. Let's discuss some sleep tips.",
          priority: 'medium',
          action: 'sleep-advice'
        });
      }
    }
    
    // Check for low activity levels
    const recentActivities = await Activity.find({
      user: req.user._id,
      createdAt: { $gte: sevenDaysAgo }
    });
    
    if (recentActivities.length === 0) {
      notifications.push({
        type: 'activity-reminder',
        title: 'Stay Active',
        message: "Adding some activities to your routine can help boost your mood and energy levels.",
        priority: 'low',
        action: 'activities'
      });
    }
    
    res.json({
      success: true,
      notifications: notifications,
      unreadCount: notifications.length
    });
    
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notifications' 
    });
  }
});

// @route   POST /api/chatbot/notifications/read
// @desc    Mark notifications as read
// @access  Private
router.post('/notifications/read', auth, async (req, res) => {
  try {
    // In a real app, you'd store notification state in the database
    // For now, we'll just return success
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update notifications' 
    });
  }
});

module.exports = router;


