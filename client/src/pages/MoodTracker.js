import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Heart, 
  Zap, 
  AlertTriangle, 
  Moon, 
  Cloud, 
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  MapPin,
  Save,
  Calendar
} from 'lucide-react';
import axios from 'axios';
import { format, isToday } from 'date-fns';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const MoodTracker = () => {
  const [todayMood, setTodayMood] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      mood: 'neutral',
      energy: 5,
      stress: 5,
      anxiety: 5,
      sleep: {
        hours: 8,
        quality: 'good'
      },
      activities: [],
      notes: '',
      tags: [],
      weather: 'unknown',
      location: ''
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [moodResponse, activitiesResponse] = await Promise.all([
        axios.get('/api/mood/today'),
        axios.get('/api/activities?isActive=true')
      ]);

      setTodayMood(moodResponse.data.moodEntry);
      setActivities(activitiesResponse.data.activities);

      // If mood entry exists, populate form
      if (moodResponse.data.moodEntry) {
        const entry = moodResponse.data.moodEntry;
        setValue('mood', entry.mood);
        setValue('energy', entry.energy);
        setValue('stress', entry.stress);
        setValue('anxiety', entry.anxiety);
        setValue('sleep.hours', entry.sleep.hours);
        setValue('sleep.quality', entry.sleep.quality);
        setValue('activities', entry.activities.map(a => a._id));
        setValue('notes', entry.notes || '');
        setValue('tags', entry.tags || []);
        setValue('weather', entry.weather || 'unknown');
        setValue('location', entry.location || '');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const response = await axios.post('/api/mood', data);
      setTodayMood(response.data.moodEntry);
      toast.success(todayMood ? 'Mood updated successfully!' : 'Mood tracked successfully!');
    } catch (error) {
      console.error('Error saving mood:', error);
      toast.error('Failed to save mood entry');
    } finally {
      setSaving(false);
    }
  };

  const moodOptions = [
    { value: 'very-sad', label: 'Very Sad', emoji: '😢', color: 'text-red-600' },
    { value: 'sad', label: 'Sad', emoji: '😔', color: 'text-orange-600' },
    { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'text-yellow-600' },
    { value: 'happy', label: 'Happy', emoji: '😊', color: 'text-green-600' },
    { value: 'very-happy', label: 'Very Happy', emoji: '😄', color: 'text-emerald-600' }
  ];

  const weatherOptions = [
    { value: 'sunny', label: 'Sunny', icon: Sun },
    { value: 'cloudy', label: 'Cloudy', icon: Cloud },
    { value: 'rainy', label: 'Rainy', icon: CloudRain },
    { value: 'snowy', label: 'Snowy', icon: Snowflake },
    { value: 'windy', label: 'Windy', icon: Wind },
    { value: 'unknown', label: 'Unknown', icon: Cloud }
  ];

  const sleepQualityOptions = [
    { value: 'poor', label: 'Poor' },
    { value: 'fair', label: 'Fair' },
    { value: 'good', label: 'Good' },
    { value: 'excellent', label: 'Excellent' }
  ];

  if (loading) {
    return <LoadingSpinner size="xl" className="min-h-96" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Heart className="h-6 w-6 text-red-500 mr-3" />
              Mood Tracker
            </h1>
            <p className="text-gray-600 mt-1">
              {isToday(new Date()) ? 'How are you feeling today?' : 'Track your mood and well-being'}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            <Calendar className="h-4 w-4 inline mr-1" />
            {format(new Date(), 'MMMM d, yyyy')}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Mood Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How are you feeling?</h2>
          <div className="grid grid-cols-5 gap-4">
            {moodOptions.map((option) => (
              <label
                key={option.value}
                className={`relative flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  watchedValues.mood === option.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  {...register('mood', { required: 'Please select a mood' })}
                  type="radio"
                  value={option.value}
                  className="sr-only"
                />
                <span className="text-3xl mb-2">{option.emoji}</span>
                <span className={`text-sm font-medium ${option.color}`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          {errors.mood && (
            <p className="mt-2 text-sm text-red-600">{errors.mood.message}</p>
          )}
        </div>

        {/* Energy, Stress, and Anxiety Levels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="h-5 w-5 text-yellow-500 mr-2" />
              Energy Level
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Low</span>
                <span className="text-lg font-semibold text-gray-900">
                  {watchedValues.energy}/10
                </span>
                <span>High</span>
              </div>
              <input
                {...register('energy', { 
                  required: 'Energy level is required',
                  min: 1,
                  max: 10
                })}
                type="range"
                min="1"
                max="10"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Stress Level
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Low</span>
                <span className="text-lg font-semibold text-gray-900">
                  {watchedValues.stress}/10
                </span>
                <span>High</span>
              </div>
              <input
                {...register('stress', { 
                  required: 'Stress level is required',
                  min: 1,
                  max: 10
                })}
                type="range"
                min="1"
                max="10"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="h-5 w-5 text-purple-500 mr-2" />
              Anxiety Level
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Low</span>
                <span className="text-lg font-semibold text-gray-900">
                  {watchedValues.anxiety}/10
                </span>
                <span>High</span>
              </div>
              <input
                {...register('anxiety', { 
                  required: 'Anxiety level is required',
                  min: 1,
                  max: 10
                })}
                type="range"
                min="1"
                max="10"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>

        {/* Sleep Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Moon className="h-5 w-5 text-blue-500 mr-2" />
            Sleep Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Hours of Sleep</label>
              <input
                {...register('sleep.hours', { 
                  required: 'Sleep hours is required',
                  min: 0,
                  max: 24
                })}
                type="number"
                min="0"
                max="24"
                step="0.5"
                className="input"
                placeholder="8"
              />
            </div>
            <div>
              <label className="label">Sleep Quality</label>
              <select
                {...register('sleep.quality', { required: 'Sleep quality is required' })}
                className="input"
              >
                {sleepQualityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Activities */}
        {activities.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activities Today</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {activities.map((activity) => (
                <label
                  key={activity._id}
                  className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                    watchedValues.activities?.includes(activity._id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    {...register('activities')}
                    type="checkbox"
                    value={activity._id}
                    className="sr-only"
                  />
                  <span className="mr-2">{activity.icon}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {activity.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Weather and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather</h3>
            <div className="grid grid-cols-3 gap-3">
              {weatherOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <label
                    key={option.value}
                    className={`relative flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all ${
                      watchedValues.weather === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      {...register('weather')}
                      type="radio"
                      value={option.value}
                      className="sr-only"
                    />
                    <Icon className="h-6 w-6 text-gray-600 mb-1" />
                    <span className="text-xs font-medium text-gray-700">
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 text-gray-500 mr-2" />
              Location
            </h3>
            <input
              {...register('location')}
              type="text"
              className="input"
              placeholder="Where are you today?"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
          <textarea
            {...register('notes')}
            rows={4}
            className="input resize-none"
            placeholder="How was your day? Any thoughts or feelings you'd like to record?"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-lg"
          >
            {saving ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            {saving ? 'Saving...' : todayMood ? 'Update Mood' : 'Save Mood'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default MoodTracker;
