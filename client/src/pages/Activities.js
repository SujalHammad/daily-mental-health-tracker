import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  Filter,
  Search
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: '',
      category: 'other',
      description: '',
      duration: '',
      moodImpact: 0,
      energyImpact: 0,
      isRecurring: false,
      recurringDays: [],
      color: '#3B82F6',
      icon: '📝'
    }
  });

  const categories = [
    'exercise', 'meditation', 'reading', 'music', 'art', 'cooking',
    'social', 'nature', 'hobby', 'work', 'study', 'relaxation',
    'sports', 'gaming', 'travel', 'volunteer', 'other'
  ];

  const icons = ['📝', '🏃', '🧘', '📚', '🎵', '🎨', '🍳', '👥', '🌿', '🎯', '💼', '📖', '😌', '⚽', '🎮', '✈️', '🤝'];

  const recurringDays = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, categoryFilter]);

  const fetchActivities = async () => {
    try {
      const response = await axios.get('/api/activities');
      setActivities(response.data.activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = activities;

    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(activity => activity.category === categoryFilter);
    }

    setFilteredActivities(filtered);
  };

  const onSubmit = async (data) => {
    try {
      if (editingActivity) {
        await axios.put(`/api/activities/${editingActivity._id}`, data);
        toast.success('Activity updated successfully!');
      } else {
        await axios.post('/api/activities', data);
        toast.success('Activity created successfully!');
      }
      
      fetchActivities();
      reset();
      setShowForm(false);
      setEditingActivity(null);
    } catch (error) {
      console.error('Error saving activity:', error);
      toast.error('Failed to save activity');
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setValue('name', activity.name);
    setValue('category', activity.category);
    setValue('description', activity.description || '');
    setValue('duration', activity.duration || '');
    setValue('moodImpact', activity.moodImpact);
    setValue('energyImpact', activity.energyImpact);
    setValue('isRecurring', activity.isRecurring);
    setValue('recurringDays', activity.recurringDays || []);
    setValue('color', activity.color);
    setValue('icon', activity.icon);
    setShowForm(true);
  };

  const handleDelete = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await axios.delete(`/api/activities/${activityId}`);
        toast.success('Activity deleted successfully!');
        fetchActivities();
      } catch (error) {
        console.error('Error deleting activity:', error);
        toast.error('Failed to delete activity');
      }
    }
  };

  const handleToggleActive = async (activityId) => {
    try {
      await axios.post(`/api/activities/${activityId}/toggle`);
      toast.success('Activity status updated!');
      fetchActivities();
    } catch (error) {
      console.error('Error toggling activity:', error);
      toast.error('Failed to update activity status');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      exercise: 'bg-red-100 text-red-800',
      meditation: 'bg-purple-100 text-purple-800',
      reading: 'bg-blue-100 text-blue-800',
      music: 'bg-pink-100 text-pink-800',
      art: 'bg-yellow-100 text-yellow-800',
      cooking: 'bg-orange-100 text-orange-800',
      social: 'bg-green-100 text-green-800',
      nature: 'bg-emerald-100 text-emerald-800',
      hobby: 'bg-indigo-100 text-indigo-800',
      work: 'bg-gray-100 text-gray-800',
      study: 'bg-cyan-100 text-cyan-800',
      relaxation: 'bg-teal-100 text-teal-800',
      sports: 'bg-red-100 text-red-800',
      gaming: 'bg-violet-100 text-violet-800',
      travel: 'bg-amber-100 text-amber-800',
      volunteer: 'bg-rose-100 text-rose-800',
      other: 'bg-slate-100 text-slate-800'
    };
    return colors[category] || colors.other;
  };

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
              <Activity className="h-6 w-6 text-blue-500 mr-3" />
              Activities
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your daily activities and track their impact on your well-being
            </p>
          </div>
          <button
            onClick={() => {
              setEditingActivity(null);
              reset();
              setShowForm(true);
            }}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Activity
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => (
          <div
            key={activity._id}
            className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
              activity.isActive ? 'border-l-green-500' : 'border-l-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{activity.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activity.name}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(activity.category)}`}>
                    {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleActive(activity._id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {activity.isActive ? (
                    <ToggleRight className="h-5 w-5 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(activity)}
                  className="text-gray-400 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(activity._id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {activity.description && (
              <p className="text-sm text-gray-600 mb-4">{activity.description}</p>
            )}

            <div className="space-y-2">
              {activity.duration && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {activity.duration} minutes
                </div>
              )}

              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm">
                  {activity.moodImpact > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : activity.moodImpact < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <div className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-gray-600">Mood: </span>
                  <span className={`font-medium ${activity.moodImpact > 0 ? 'text-green-600' : activity.moodImpact < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {activity.moodImpact > 0 ? '+' : ''}{activity.moodImpact}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  {activity.energyImpact > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : activity.energyImpact < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <div className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-gray-600">Energy: </span>
                  <span className={`font-medium ${activity.energyImpact > 0 ? 'text-green-600' : activity.energyImpact < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {activity.energyImpact > 0 ? '+' : ''}{activity.energyImpact}
                  </span>
                </div>
              </div>

              {activity.isRecurring && activity.recurringDays.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Recurring: </span>
                  {activity.recurringDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || categoryFilter !== 'all' ? 'No activities found' : 'No activities yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start by adding your first activity'
            }
          </p>
          {(!searchTerm && categoryFilter === 'all') && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Activity
            </button>
          )}
        </div>
      )}

      {/* Activity Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingActivity ? 'Edit Activity' : 'Add New Activity'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingActivity(null);
                    reset();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Activity Name *</label>
                    <input
                      {...register('name', { required: 'Activity name is required' })}
                      type="text"
                      className="input"
                      placeholder="e.g., Morning Walk"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Category *</label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="input"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="input resize-none"
                    placeholder="Describe this activity..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="label">Duration (minutes)</label>
                    <input
                      {...register('duration', { min: 1, max: 1440 })}
                      type="number"
                      min="1"
                      max="1440"
                      className="input"
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label className="label">Mood Impact (-5 to +5)</label>
                    <input
                      {...register('moodImpact', { min: -5, max: 5 })}
                      type="range"
                      min="-5"
                      max="5"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>-5</span>
                      <span className="font-medium">{watch('moodImpact')}</span>
                      <span>+5</span>
                    </div>
                  </div>

                  <div>
                    <label className="label">Energy Impact (-5 to +5)</label>
                    <input
                      {...register('energyImpact', { min: -5, max: 5 })}
                      type="range"
                      min="-5"
                      max="5"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>-5</span>
                      <span className="font-medium">{watch('energyImpact')}</span>
                      <span>+5</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Icon</label>
                    <div className="grid grid-cols-6 gap-2">
                      {icons.map(icon => (
                        <label
                          key={icon}
                          className={`relative flex items-center justify-center p-2 rounded border cursor-pointer ${
                            watch('icon') === icon ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                          }`}
                        >
                          <input
                            {...register('icon')}
                            type="radio"
                            value={icon}
                            className="sr-only"
                          />
                          <span className="text-lg">{icon}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Color</label>
                    <input
                      {...register('color')}
                      type="color"
                      className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      {...register('isRecurring')}
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Recurring Activity</span>
                  </label>
                </div>

                {watch('isRecurring') && (
                  <div>
                    <label className="label">Recurring Days</label>
                    <div className="grid grid-cols-7 gap-2">
                      {recurringDays.map(day => (
                        <label
                          key={day}
                          className={`relative flex items-center justify-center p-2 rounded border cursor-pointer ${
                            watch('recurringDays')?.includes(day) ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                          }`}
                        >
                          <input
                            {...register('recurringDays')}
                            type="checkbox"
                            value={day}
                            className="sr-only"
                          />
                          <span className="text-xs font-medium text-gray-700">
                            {day.charAt(0).toUpperCase()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingActivity(null);
                      reset();
                    }}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : null}
                    {isSubmitting ? 'Saving...' : editingActivity ? 'Update Activity' : 'Create Activity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
