import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Calendar,
  Tag,
  Heart,
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react';
import axios from 'axios';
import { format, isToday, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
      mood: 'neutral',
      tags: [],
      isPrivate: true
    }
  });

  const moodOptions = [
    { value: 'very-sad', label: 'Very Sad', emoji: '😢', color: 'text-red-600' },
    { value: 'sad', label: 'Sad', emoji: '😔', color: 'text-orange-600' },
    { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'text-yellow-600' },
    { value: 'happy', label: 'Happy', emoji: '😊', color: 'text-green-600' },
    { value: 'very-happy', label: 'Very Happy', emoji: '😄', color: 'text-emerald-600' }
  ];

  useEffect(() => {
    fetchEntries();
    fetchTags();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, moodFilter, selectedTags]);

  const fetchEntries = async () => {
    try {
      const response = await axios.get('/api/journal');
      setEntries(response.data.journalEntries);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get('/api/journal/tags');
      setTags(response.data.tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const filterEntries = () => {
    let filtered = entries;

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (moodFilter !== 'all') {
      filtered = filtered.filter(entry => entry.mood === moodFilter);
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(entry =>
        selectedTags.some(tag => entry.tags.includes(tag))
      );
    }

    setFilteredEntries(filtered);
  };

  const onSubmit = async (data) => {
    try {
      if (editingEntry) {
        await axios.put(`/api/journal/${editingEntry._id}`, data);
        toast.success('Journal entry updated successfully!');
      } else {
        await axios.post('/api/journal', data);
        toast.success('Journal entry created successfully!');
      }
      
      fetchEntries();
      reset();
      setShowForm(false);
      setEditingEntry(null);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast.error('Failed to save journal entry');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setValue('title', entry.title);
    setValue('content', entry.content);
    setValue('mood', entry.mood);
    setValue('tags', entry.tags || []);
    setValue('isPrivate', entry.isPrivate);
    setShowForm(true);
  };

  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      try {
        await axios.delete(`/api/journal/${entryId}`);
        toast.success('Journal entry deleted successfully!');
        fetchEntries();
      } catch (error) {
        console.error('Error deleting journal entry:', error);
        toast.error('Failed to delete journal entry');
      }
    }
  };

  const getMoodIcon = (mood) => {
    const moodOption = moodOptions.find(option => option.value === mood);
    return moodOption ? moodOption.emoji : '😐';
  };

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'very-sad':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'sad':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'neutral':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'happy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'very-happy':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMoodText = (mood) => {
    const moodOption = moodOptions.find(option => option.value === mood);
    return moodOption ? moodOption.label : 'Unknown';
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
              <BookOpen className="h-6 w-6 text-green-500 mr-3" />
              Journal
            </h1>
            <p className="text-gray-600 mt-1">
              Write about your thoughts, feelings, and experiences
            </p>
          </div>
          <button
            onClick={() => {
              setEditingEntry(null);
              reset();
              setShowForm(true);
            }}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Entry
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          
          <div>
            <select
              value={moodFilter}
              onChange={(e) => setMoodFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Moods</option>
              {moodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.emoji} {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value && !selectedTags.includes(e.target.value)) {
                  setSelectedTags([...selectedTags, e.target.value]);
                }
              }}
              className="input"
            >
              <option value="">Add Tag Filter</option>
              {tags.map(tag => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
                <button
                  onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Journal Entries */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <div key={entry._id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {entry.title}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getMoodColor(entry.mood)}`}>
                    <span className="mr-1">{getMoodIcon(entry.mood)}</span>
                    {getMoodText(entry.mood)}
                  </span>
                  {entry.isPrivate && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Private
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {isToday(parseISO(entry.date)) ? 'Today' : format(parseISO(entry.date), 'MMM d, yyyy')}
                  </span>
                  <span>{entry.wordCount} words</span>
                  <span>{entry.readingTime} min read</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(entry)}
                  className="text-gray-400 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(entry._id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {entry.content.length > 200 
                  ? `${entry.content.substring(0, 200)}...` 
                  : entry.content
                }
              </p>
            </div>

            {entry.tags && entry.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {entry.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || moodFilter !== 'all' || selectedTags.length > 0 
              ? 'No entries found' 
              : 'No journal entries yet'
            }
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || moodFilter !== 'all' || selectedTags.length > 0
              ? 'Try adjusting your search or filter criteria'
              : 'Start writing your first journal entry'
            }
          </p>
          {(!searchTerm && moodFilter === 'all' && selectedTags.length === 0) && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Write Your First Entry
            </button>
          )}
        </div>
      )}

      {/* Journal Entry Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingEntry(null);
                    reset();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="label">Title *</label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    type="text"
                    className="input"
                    placeholder="What's on your mind today?"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Mood</label>
                  <div className="grid grid-cols-5 gap-3">
                    {moodOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`relative flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          watch('mood') === option.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          {...register('mood')}
                          type="radio"
                          value={option.value}
                          className="sr-only"
                        />
                        <span className="text-2xl mb-1">{option.emoji}</span>
                        <span className="text-xs font-medium text-gray-700">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Content *</label>
                  <textarea
                    {...register('content', { 
                      required: 'Content is required',
                      minLength: { value: 10, message: 'Content must be at least 10 characters' }
                    })}
                    rows={12}
                    className="input resize-none"
                    placeholder="Write about your day, thoughts, feelings, or anything you'd like to remember..."
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {watch('content')?.length || 0} characters
                  </p>
                </div>

                <div>
                  <label className="label">Tags (comma-separated)</label>
                  <input
                    {...register('tags')}
                    type="text"
                    className="input"
                    placeholder="work, family, health, travel..."
                    onChange={(e) => {
                      const tagArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                      setValue('tags', tagArray);
                    }}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separate multiple tags with commas
                  </p>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      {...register('isPrivate')}
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Keep this entry private
                    </span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingEntry(null);
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
                    ) : (
                      <Save className="h-5 w-5 mr-2" />
                    )}
                    {isSubmitting ? 'Saving...' : editingEntry ? 'Update Entry' : 'Save Entry'}
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

export default Journal;
