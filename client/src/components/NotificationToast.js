import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Heart, 
  Activity, 
  Moon, 
  AlertTriangle, 
  MessageCircle,
  CheckCircle
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotifications();
  const { theme } = useTheme();
  const [toasts, setToasts] = useState([]);

  // Show new notifications as toasts
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      
      // Only show high priority notifications as toasts
      if (latestNotification.priority === 'high') {
        const toast = {
          id: Date.now(),
          ...latestNotification
        };
        
        setToasts(prev => [toast, ...prev]);
        
        // Auto remove after 8 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, 8000);
      }
    }
  }, [notifications]);

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

  const handleDismiss = (toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  };

  const handleAction = (notification) => {
    // Handle different notification actions
    switch (notification.action) {
      case 'mood-tracker':
        window.location.href = '/mood-tracker';
        break;
      case 'chat-support':
        setTimeout(() => {
          const chatButton = document.querySelector('[data-testid="chat-button"]');
          if (chatButton) {
            chatButton.click();
          }
        }, 100);
        break;
      case 'stress-help':
        setTimeout(() => {
          const chatButton = document.querySelector('[data-testid="chat-button"]');
          if (chatButton) {
            chatButton.click();
          }
        }, 100);
        break;
      case 'sleep-advice':
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
    
    handleDismiss(notification.id);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`max-w-sm w-full bg-white shadow-lg rounded-lg border-l-4 border-red-500 transform transition-all duration-300 ease-in-out ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getNotificationIcon(toast.type)}
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {toast.title}
                </p>
                <p className={`mt-1 text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {toast.message}
                </p>
                <div className="mt-3 flex space-x-2">
                  {toast.action && (
                    <button
                      onClick={() => handleAction(toast)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600 transition-colors"
                    >
                      Take Action
                    </button>
                  )}
                  <button
                    onClick={() => handleDismiss(toast.id)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      theme === 'dark' 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => handleDismiss(toast.id)}
                  className={`rounded-md inline-flex ${
                    theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;


