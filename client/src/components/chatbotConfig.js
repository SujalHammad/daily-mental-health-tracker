import React from 'react';
import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
  // The name displayed at the top of the chatbot window.
  botName: "Your Wellness Assistant",
  
  // The first message the chatbot sends when a user opens it.
  initialMessages: [
    createChatBotMessage(
      "Hello! I'm your personalized wellness assistant. I can help you understand your mood patterns, provide insights from your data, and offer suggestions for better mental health. How can I assist you today?"
    ),
    createChatBotMessage(
      "💡 Try asking me things like:\n• \"How am I doing?\" - Get insights from your recent data\n• \"Give me some advice\" - Get personalized recommendations\n• \"Tell me about my mood patterns\" - See trends in your mood tracking\n• \"I'm feeling stressed\" - Get help with stress management"
    ),
  ],
  
  // Custom styles to match your app's theme.
  customStyles: {
    botMessageBox: {
      backgroundColor: '#5bccf6', // Match the blue in your app's UI
    },
    chatButton: {
      backgroundColor: '#5bccf6',
    },
  },
};

export default config;

