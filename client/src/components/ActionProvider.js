import React from 'react';
import axios from 'axios';

const ActionProvider = ({ createChatBotMessage, setState, children }) => {
  // Get auth token for API calls
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Action for emergencies - this is a static, critical response.
  const handleEmergency = () => {
    const message = createChatBotMessage(
      "It sounds like you're going through a lot. Please reach out to a professional immediately. You can contact a crisis hotline for free, confidential support: 1-800-273-8255."
    );
    updateChatbotState(message);
  };
  
  // Enhanced greetings with data awareness
  const handleHello = async () => {
    try {
      const token = getAuthToken();
      if (token) {
        // Get recent data to personalize greeting
        const response = await axios.get('/api/chatbot/analyze', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success && response.data.data.summary.totalMoodEntries > 0) {
          const lastEntryDate = response.data.data.summary.lastEntryDate;
          const daysSinceLastEntry = Math.floor((new Date() - new Date(lastEntryDate)) / (1000 * 60 * 60 * 24));
          
          let greeting = "Hello! It's great to see you again. ";
          if (daysSinceLastEntry === 0) {
            greeting += "I see you've been tracking your mood today - that's wonderful! ";
          } else if (daysSinceLastEntry === 1) {
            greeting += "I noticed you haven't logged your mood today yet. ";
          } else {
            greeting += `It's been ${daysSinceLastEntry} days since your last mood entry. `;
          }
          greeting += "How can I help you today?";
          
          const message = createChatBotMessage(greeting);
          updateChatbotState(message);
        } else {
          const message = createChatBotMessage("Hello! Welcome to your wellness journey. I'm here to help you track and understand your mental health patterns. Try logging your mood for a few days so I can provide personalized insights!");
          updateChatbotState(message);
        }
      } else {
        const message = createChatBotMessage("Hello! I'm your wellness assistant. Please log in to get personalized support for your mental health journey.");
        updateChatbotState(message);
      }
    } catch (error) {
      console.error("Error in personalized greeting:", error);
      const message = createChatBotMessage("Hello! It's good to see you. How can I assist you today?");
      updateChatbotState(message);
    }
  };
  
  const handleHowAreYou = () => {
    const message = createChatBotMessage("I'm doing well, thank you for asking! I'm here to help you feel well too. What's on your mind?");
    updateChatbotState(message);
  };
  
  // Enhanced actions that provide data-driven insights
  const handleJournal = async () => {
    try {
      const token = getAuthToken();
      if (token) {
        const response = await axios.get('/api/journal/stats?period=week', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success && response.data.stats.totalEntries > 0) {
          const stats = response.data.stats;
          const message = createChatBotMessage(
            `Great job with your journaling! You've written ${stats.totalEntries} entries this week with ${stats.totalWords} total words. ` +
            `Your average entry is about ${stats.averageWordsPerEntry} words. ` +
            `Keep writing - it's a powerful tool for processing thoughts and emotions!`
          );
          updateChatbotState(message);
        } else {
          const message = createChatBotMessage("Writing in your journal can be a great way to process thoughts and track your emotional journey. You can find your journal in the navigation menu.");
          updateChatbotState(message);
        }
      } else {
        const message = createChatBotMessage("Writing in your journal can be a great way to process thoughts. You can find your journal in the navigation menu.");
        updateChatbotState(message);
      }
    } catch (error) {
      console.error("Error getting journal stats:", error);
      const message = createChatBotMessage("Writing in your journal can be a great way to process thoughts. You can find your journal in the navigation menu.");
      updateChatbotState(message);
    }
  };

  const handleMood = async () => {
    try {
      const token = getAuthToken();
      if (token) {
        const response = await axios.get('/api/mood/stats?period=week', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success && response.data.stats.totalEntries > 0) {
          const stats = response.data.stats;
          const avgMood = stats.averageMood;
          const moodDescription = avgMood >= 4 ? 'positive' : avgMood >= 3 ? 'neutral' : 'low';
          
          const message = createChatBotMessage(
            `You've logged ${stats.totalEntries} mood entries this week. ` +
            `Your average mood has been ${moodDescription} (${avgMood.toFixed(1)}/5). ` +
            `Keep tracking to see your patterns and progress! You can use the Mood Tracker to log how you're feeling.`
          );
          updateChatbotState(message);
        } else {
          const message = createChatBotMessage("You can use the Mood Tracker to log how you're feeling. Regular tracking helps me provide better insights about your wellbeing patterns!");
          updateChatbotState(message);
        }
      } else {
        const message = createChatBotMessage("You can use the Mood Tracker to log how you're feeling. Let me know if you want to talk about it first.");
        updateChatbotState(message);
      }
    } catch (error) {
      console.error("Error getting mood stats:", error);
      const message = createChatBotMessage("You can use the Mood Tracker to log how you're feeling. Let me know if you want to talk about it first.");
      updateChatbotState(message);
    }
  };

  // Enhanced general response with intelligent backend integration
  const handleGeneralResponse = async (userMessage) => {
    try {
      const token = getAuthToken();
      if (!token) {
        const message = createChatBotMessage("Please log in to get personalized responses based on your data.");
        updateChatbotState(message);
        return;
      }

      const response = await axios.post('/api/chatbot/chat', {
        message: userMessage,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const botMessage = createChatBotMessage(response.data.reply);
        updateChatbotState(botMessage);
        
        // If there are suggestions, add them as additional messages
        if (response.data.suggestions && response.data.suggestions.length > 0) {
          setTimeout(() => {
            const suggestionsMessage = createChatBotMessage(
              "💡 Quick suggestions: " + response.data.suggestions.join(' • ')
            );
            updateChatbotState(suggestionsMessage);
          }, 1000);
        }
      } else {
        const errorMessage = createChatBotMessage("I'm sorry, I couldn't process your message right now. Please try again later.");
        updateChatbotState(errorMessage);
      }
    } catch (error) {
      console.error("Chatbot API error:", error);
      const errorMessage = createChatBotMessage("I'm sorry, I couldn't get a response right now. Please try again later.");
      updateChatbotState(errorMessage);
    }
  };

  // New action for data insights
  const handleDataInsights = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        const message = createChatBotMessage("Please log in to get insights from your data.");
        updateChatbotState(message);
        return;
      }

      const response = await axios.get('/api/chatbot/analyze', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const { insights, summary } = response.data.data;
        
        let message = `Here's what I've noticed from your data:\n\n`;
        message += `📊 You have ${summary.totalMoodEntries} mood entries, ${summary.totalActivities} activities, and ${summary.totalJournalEntries} journal entries.\n\n`;
        
        if (insights.advice.length > 0) {
          message += "🔍 Key insights:\n" + insights.advice.join('\n\n');
        } else {
          message += "Keep logging your data so I can provide more personalized insights!";
        }
        
        const botMessage = createChatBotMessage(message);
        updateChatbotState(botMessage);
      } else {
        const message = createChatBotMessage("I need more data to provide insights. Try logging your mood, activities, and journal entries for a few days!");
        updateChatbotState(message);
      }
    } catch (error) {
      console.error("Error getting data insights:", error);
      const message = createChatBotMessage("I'm having trouble analyzing your data right now. Please try again later.");
      updateChatbotState(message);
    }
  };

  // Helper function to update the chat state with a new message
  const updateChatbotState = (message) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: {
            handleHello,
            handleHowAreYou,
            handleJournal,
            handleMood,
            handleGeneralResponse,
            handleEmergency,
            handleDataInsights,
          },
        });
      })}
    </div>
  );
};

export default ActionProvider;

