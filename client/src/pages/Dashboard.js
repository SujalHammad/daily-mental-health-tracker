import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Activity, 
  BookOpen, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Plus,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import axios from 'axios';
import { format, isToday } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [todayMood, setTodayMood] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [moodResponse, entriesResponse, statsResponse] = await Promise.all([
        axios.get('/api/mood/today'),
        axios.get('/api/mood?limit=5'),
        axios.get('/api/mood/stats?period=week')
      ]);

      setTodayMood(moodResponse.data.moodEntry);
      setRecentEntries(entriesResponse.data.moodEntries);
      setStats(statsResponse.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodIcon = (mood) => {
    switch (mood) {
      case 'very-happy':
        return <Smile className="h-8 w-8 text-emerald-600" />;
      case 'happy':
        return <Smile className="h-6 w-6 text-green-600" />;
      case 'neutral':
        return <Meh className="h-6 w-6 text-yellow-600" />;
      case 'sad':
        return <Frown className="h-6 w-6 text-orange-600" />;
      case 'very-sad':
        return <Frown className="h-8 w-8 text-red-600" />;
      default:
        return <Meh className="h-6 w-6 text-gray-600" />;
    }
  };

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'very-happy':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'happy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'neutral':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sad':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'very-sad':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMoodText = (mood) => {
    switch (mood) {
      case 'very-happy':
        return 'Very Happy';
      case 'happy':
        return 'Happy';
      case 'neutral':
        return 'Neutral';
      case 'sad':
        return 'Sad';
      case 'very-sad':
        return 'Very Sad';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return <LoadingSpinner size="xl" className="min-h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600">
          Here's how you're doing today and your recent progress.
        </p>
      </div>

      {/* Today's Mood */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Today's Mood</h2>
              <Link
                to="/mood"
                className="btn btn-outline btn-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Track Mood
              </Link>
            </div>

            {todayMood ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {getMoodIcon(todayMood.mood)}
                  <div>
                    <p className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getMoodColor(todayMood.mood)}`}>
                      {getMoodText(todayMood.mood)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Last updated: {format(new Date(todayMood.updatedAt), 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Energy</span>
                      <span className="text-lg font-semibold text-gray-900">{todayMood.energy}/10</span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(todayMood.energy / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Stress</span>
                      <span className="text-lg font-semibold text-gray-900">{todayMood.stress}/10</span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${(todayMood.stress / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {todayMood.notes && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> {todayMood.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No mood entry today</h3>
                <p className="text-gray-500 mb-4">Start tracking your daily mood and well-being</p>
                <Link
                  to="/mood"
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Track Today's Mood
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
            {stats ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Mood</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.averageMood.toFixed(1)}/5
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Entries</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.totalEntries}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Energy</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.averageEnergy.toFixed(1)}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Sleep</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.averageSleep.toFixed(1)}h
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No data available</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/mood"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Heart className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-sm font-medium">Track Mood</span>
              </Link>
              <Link
                to="/activities"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Activity className="h-5 w-5 text-blue-500 mr-3" />
                <span className="text-sm font-medium">Log Activity</span>
              </Link>
              <Link
                to="/journal"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BookOpen className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm font-medium">Write Journal</span>
              </Link>
              <Link
                to="/analytics"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="h-5 w-5 text-purple-500 mr-3" />
                <span className="text-sm font-medium">View Analytics</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Entries</h2>
          <Link
            to="/mood"
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            View all
          </Link>
        </div>

        {recentEntries.length > 0 ? (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div key={entry._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getMoodIcon(entry.mood)}
                  <div>
                    <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getMoodColor(entry.mood)}`}>
                      {getMoodText(entry.mood)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isToday(new Date(entry.date)) ? 'Today' : format(new Date(entry.date), 'MMM d')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Energy: {entry.energy}/10</p>
                  <p className="text-sm text-gray-500">Stress: {entry.stress}/10</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent entries</h3>
            <p className="text-gray-500">Start tracking your mood to see your progress here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
