import React from 'react';

const MessageParser = ({ children, actions }) => {
  const parse = (message) => {
    const lowercaseMessage = message.toLowerCase();

    // Emergency handling (always first)
    const emergencyKeywords = ['suicide', 'self-harm', 'help me', 'want to die'];
    if (emergencyKeywords.some(keyword => lowercaseMessage.includes(keyword))) {
      actions.handleEmergency();
      return;
    }

    // Keyword-based actions
    if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')) {
      actions.handleHello();
    } else if (lowercaseMessage.includes('how are you')) {
      actions.handleHowAreYou();
    } else if (lowercaseMessage.includes('journal')) {
      actions.handleJournal();
    } else if (lowercaseMessage.includes('mood')) {
      actions.handleMood();
    } else if (lowercaseMessage.includes('insights') || lowercaseMessage.includes('data') || 
               lowercaseMessage.includes('analysis') || lowercaseMessage.includes('patterns')) {
      actions.handleDataInsights();
    } 
    // Fallback for general conversation
    else {
      actions.handleGeneralResponse(message);
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          parse: parse,
          actions,
        });
      })}
    </div>
  );
};

export default MessageParser;

