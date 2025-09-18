import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Heart,
  Zap,
  AlertTriangle,
  Moon,
  BookOpen,
  Activity,
  Target,
  Award
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import axios from 'axios';
import { format, subDays, subWeeks, subMonths, subQuarters } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [metric, setMetric] = useState('mood');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  useEffect(() => {
    fetchTrends();
  }, [metric, period]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/api/analytics/overview?period=${period}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await axios.get(`/api/analytics/trends?metric=${metric}&period=${period}`);
      setTrends(response.data);
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'week': return 'Last 7 days';
      case 'month': return 'Last 30 days';
      case 'quarter': return 'Last 3 months';
      case 'year': return 'Last year';
      default: return 'Last 30 days';
    }
  };

  const getMetricLabel = (metric) => {
    switch (metric) {
      case 'mood': return 'Mood';
      case 'energy': return 'Energy';
      case 'stress': return 'Stress';
      case 'anxiety': return 'Anxiety';
      case 'sleep': return 'Sleep Hours';
      default: return 'Mood';
    }
  };

  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'mood': return <Heart className="h-5 w-5" />;
      case 'energy': return <Zap className="h-5 w-5" />;
      case 'stress': return <AlertTriangle className="h-5 w-5" />;
      case 'anxiety': return <Heart className="h-5 w-5" />;
      case 'sleep': return <Moon className="h-5 w-5" />;
      default: return <Heart className="h-5 w-5" />;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const moodColors = {
    'very-sad': '#EF4444',
    'sad': '#F97316',
    'neutral': '#EAB308',
    'happy': '#22C55E',
    'very-happy': '#10B981'
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  if (loading) {
    return <LoadingSpinner size="xl" className="min-h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-6 w-6 text-purple-500 mr-3" />
              Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Insights into your mental health journey and patterns
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="input w-40"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 3 months</option>
              <option value="year">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Mood</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.moodAnalytics.averageMood.toFixed(1)}/5
                  </p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                {getTrendIcon(analytics.moodAnalytics.averageMood > 3 ? 'increasing' : 'decreasing')}
                <span className={`ml-1 ${analytics.moodAnalytics.averageMood > 3 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.moodAnalytics.averageMood > 3 ? 'Positive' : 'Needs attention'}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Energy Level</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.moodAnalytics.averageEnergy.toFixed(1)}/10
                  </p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                {getTrendIcon(analytics.moodAnalytics.averageEnergy > 5 ? 'increasing' : 'decreasing')}
                <span className={`ml-1 ${analytics.moodAnalytics.averageEnergy > 5 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.moodAnalytics.averageEnergy > 5 ? 'Good' : 'Low'}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stress Level</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.moodAnalytics.averageStress.toFixed(1)}/10
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                {getTrendIcon(analytics.moodAnalytics.averageStress < 5 ? 'increasing' : 'decreasing')}
                <span className={`ml-1 ${analytics.moodAnalytics.averageStress < 5 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.moodAnalytics.averageStress < 5 ? 'Manageable' : 'High'}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sleep Hours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.moodAnalytics.averageSleep.toFixed(1)}h
                  </p>
                </div>
                <Moon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                {getTrendIcon(analytics.moodAnalytics.averageSleep >= 7 ? 'increasing' : 'decreasing')}
                <span className={`ml-1 ${analytics.moodAnalytics.averageSleep >= 7 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.moodAnalytics.averageSleep >= 7 ? 'Adequate' : 'Insufficient'}
                </span>
              </div>
            </div>
          </div>

          {/* Mood Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.moodAnalytics.moodDistribution).map(([mood, count]) => ({
                      name: mood.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                      value: count,
                      color: moodColors[mood]
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(analytics.moodAnalytics.moodDistribution).map(([mood, count], index) => (
                      <Cell key={`cell-${index}`} fill={moodColors[mood]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Categories</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(analytics.activityAnalytics.categoryDistribution).map(([category, count]) => ({
                  name: category.charAt(0).toUpperCase() + category.slice(1),
                  value: count
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Trends Over Time</h3>
              <div className="flex items-center space-x-2">
                {getMetricIcon(metric)}
                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  className="input w-32"
                >
                  <option value="mood">Mood</option>
                  <option value="energy">Energy</option>
                  <option value="stress">Stress</option>
                  <option value="anxiety">Anxiety</option>
                  <option value="sleep">Sleep</option>
                </select>
              </div>
            </div>
            
            {trends && trends.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trends.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis domain={[0, 10]} />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMMM d, yyyy')}
                    formatter={(value) => [value.toFixed(1), getMetricLabel(metric)]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
                <p className="text-gray-500">Start tracking your {getMetricLabel(metric).toLowerCase()} to see trends</p>
              </div>
            )}
          </div>

          {/* Insights and Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 text-blue-500 mr-2" />
                Insights
              </h3>
              <div className="space-y-3">
                {analytics.insights.length > 0 ? (
                  analytics.insights.map((insight, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">{insight}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No insights available yet. Keep tracking to get personalized insights!</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 text-green-500 mr-2" />
                Recommendations
              </h3>
              <div className="space-y-3">
                {analytics.recommendations.length > 0 ? (
                  analytics.recommendations.map((recommendation, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">{recommendation}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recommendations available yet. Keep tracking to get personalized recommendations!</p>
                )}
              </div>
            </div>
          </div>

          {/* Journal Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 text-green-500 mr-2" />
              Journal Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{analytics.journalAnalytics.totalEntries}</p>
                <p className="text-sm text-gray-600">Total Entries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{analytics.journalAnalytics.totalWords.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Words Written</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{analytics.journalAnalytics.writingStreak}</p>
                <p className="text-sm text-gray-600">Day Streak</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{analytics.journalAnalytics.averageWordsPerEntry.toFixed(0)}</p>
                <p className="text-sm text-gray-600">Avg Words/Entry</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
