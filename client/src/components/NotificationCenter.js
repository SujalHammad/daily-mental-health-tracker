import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Heart, 
  Activity, 
  Moon, 
  AlertTriangle, 
  MessageCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';

const NotificationCenter = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    removeNotification,
    clearAll 
  } = useNotifications();
  
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'mood-reminder':
        return <Heart className="w-5 h-5 text-blue-500" />;
      case 'mood-decline':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'stress-alert':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'sleep-support':
        return <Moon className="w-5 h-5 text-purple-500" />;
      case 'activity-reminder':
        return <Activity className="w-5 h-5 text-green-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-orange-500 bg-orange-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleAction = (notification) => {
    // Handle different notification actions
    switch (notification.action) {
      case 'mood-tracker':
        // Navigate to mood tracker
        window.location.href = '/mood-tracker';
        break;
      case 'chat-support':
        // Open chatbot with specific message
        setIsOpen(false);
        // Trigger chatbot to open with support message
        setTimeout(() => {
          const chatButton = document.querySelector('[data-testid="chat-button"]');
          if (chatButton) {
            chatButton.click();
          }
        }, 100);
        break;
      case 'stress-help':
        setIsOpen(false);
        setTimeout(() => {
          const chatButton = document.querySelector('[data-testid="chat-button"]');
          if (chatButton) {
            chatButton.click();
          }
        }, 100);
        break;
      case 'sleep-advice':
        setIsOpen(false);
        setTimeout(() => {
          const chatButton = document.querySelector('[data-testid="chat-button"]');
          if (chatButton) {
            chatButton.click();
          }
        }, 100);
        break;
      case 'activities':
        window.location.href = '/activities';
        break;
      default:
        break;
    }
  };

  const handleMarkAllRead = () => {
    markAsRead();
  };

  const handleClearAll = () => {
    clearAll();
  };

  if (loading) {
    return (
      <div className="relative">
        <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
          <Bell className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className={`px-4 py-3 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark all read
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={`px-4 py-8 text-center ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={index}
                  className={`border-l-4 p-4 border-b ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  } ${getNotificationColor(notification.priority)} ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  } transition-colors`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`mt-1 text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                        </div>
                        <button
                          onClick={() => removeNotification(index)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {notification.action && (
                        <button
                          onClick={() => handleAction(notification)}
                          className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <span>Take action</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={`px-4 py-2 border-t ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setIsOpen(false)}
                className={`w-full text-center text-sm ${
                  theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                } transition-colors`}
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter;


