import React, { useState, useEffect } from 'react'
import { 
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  User,
  Clock,
  ChevronLeft,
  Sun,
  Moon,
  Menu,
  Search,
  GraduationCap,
  Target,
  Award,
  Home,
  CalendarDays,
  Calendar,
  BarChart3,
  Eye,
  Settings,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../Hooks/useAuth'
import { useSubjects} from '../Hooks/useSubjects'
import {subjectService} from '../supabase/subjectService'
import {useNavigate} from 'react-router-dom'

export default function Subjects() {
  const { user } = useAuth()
  const userId = user?.id

  const navigate = useNavigate()

  // Use the subjects hook
  const {
    subjects,
    totalCount,
    hasSubjects,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isAnyLoading,
    error,
    hasError,
    safeCreateSubject,
    safeUpdateSubject,
    safeDeleteSubject,
    safeFetchSubjects,
    clearError,
    needsRefresh
  } = useSubjects(userId)

  const [theme, setTheme] = useState('dark')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState('subjects')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')



  // ✅ CORRECTED: Form state matches Supabase schema exactly
  // Only includes: name, professor_name, color (id and user_id are handled automatically)
  const [newSubject, setNewSubject] = useState({
    name: '',           // Required field - subject name
    professor_name: '', // Optional field - professor name (matches DB column exactly)
    color: 'blue'       // Optional field - subject color
  })

  const isDark = theme === 'dark'


  // ✅ CORRECTED: Simplified color options that match your requirements
  const availableColors = [
    { name: 'blue', class: 'bg-blue-500', displayName: 'Blue' },
    { name: 'green', class: 'bg-green-500', displayName: 'Green' },
    { name: 'purple', class: 'bg-purple-500', displayName: 'Purple' },
    { name: 'red', class: 'bg-red-500', displayName: 'Red' },
    { name: 'yellow', class: 'bg-yellow-500', displayName: 'Yellow' },
    { name: 'pink', class: 'bg-pink-500', displayName: 'Pink' },
    { name: 'indigo', class: 'bg-indigo-500', displayName: 'Indigo' },
    { name: 'orange', class: 'bg-orange-500', displayName: 'Orange' }
  ]
  
  // Fetch subjects on component mount
  useEffect(() => {
    console.log('=== SUBJECTS DEBUG ===')
    console.log('User:', user)
    console.log('UserId:', userId)
    console.log('IsLoading:', isLoading)
    console.log('HasError:', hasError)
    console.log('Error:', error)
    console.log('HasSubjects:', hasSubjects)
    console.log('===================')
    
    if (userId) {
      console.log('Attempting to fetch subjects...')
      safeFetchSubjects()
      .then(result => console.log('Fetch result:', result))
      .catch(err => console.error('Fetch error:', err))
    }
    console.log('Subjects:', subjects)
  }, [userId])

  // Auto-refresh if data is stale
  useEffect(() => {
    if (userId && needsRefresh()) {
      safeFetchSubjects()
    }
  }, [userId, needsRefresh])

  // Clear errors after some time
  useEffect(() => {
    if (hasError) {
      const timer = setTimeout(() => {
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [hasError, clearError])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  // ✅ CORRECTED: Reset form to match schema
  const resetForm = () => {
    setNewSubject({
      name: '',
      professor_name: '',
      color: 'blue'
    })
  }

  // ✅ CORRECTED: Simplified validation for schema fields only
  const validateSubject = (subjectData) => {
    const errors = []
    
    // Validate name (required)
    if (!subjectData.name || !subjectData.name.trim()) {
      errors.push('Subject name is required')
    } else if (subjectData.name.trim().length < 2) {
      errors.push('Subject name must be at least 2 characters')
    } else if (subjectData.name.trim().length > 100) {
      errors.push('Subject name cannot exceed 100 characters')
    }
    
    // Validate professor_name (optional, but if provided must be valid)
    if (subjectData.professor_name && subjectData.professor_name.trim()) {
      if (subjectData.professor_name.trim().length < 2) {
        errors.push('Professor name must be at least 2 characters')
      } else if (subjectData.professor_name.trim().length > 100) {
        errors.push('Professor name cannot exceed 100 characters')
      }
    }
    
    // Validate color (optional, defaults to blue)
    const validColors = availableColors.map(c => c.name)
    if (subjectData.color && !validColors.includes(subjectData.color)) {
      errors.push('Please select a valid color')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // ✅ CORRECTED: Create subject with exact schema fields
  const handleAddSubject = async () => {
    // Validate input
    console.log('HandleAddSubject function hit')
    const validation = validateSubject(newSubject)
    if (!validation.isValid) {
      alert('Validation errors:\n' + validation.errors.join('\n'))
      return
    }

    try {
      // Prepare data for Supabase - only include schema fields
      const subjectData = {
        name: newSubject.name.trim(),
        professor_name: newSubject.professor_name.trim() || null, // Empty string becomes null
        color: newSubject.color
      }
      // Note: user_id and id are handled automatically by Supabase
      console.log(subjectData.professor_name)

      await safeCreateSubject(subjectData)
      
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error('Failed to create subject:', error)
      alert('Failed to create subject: ' + error.message)
    }
  }

  // ✅ CORRECTED: Edit subject with schema fields only
  const handleEditSubject = (subject) => {
    setEditingSubject(subject)
    setNewSubject({
      name: subject.name || '',
      professor_name: subject.professor_name || '', // Use exact column name
      color: subject.color || 'blue'
    })
    setShowAddModal(true)
  }

  // ✅ CORRECTED: Update subject with exact schema fields
  const handleUpdateSubject = async () => {
    // Validate input
    const validation = validateSubject(newSubject)
    if (!validation.isValid) {
      alert('Validation errors:\n' + validation.errors.join('\n'))
      return
    }

    try {
      // Prepare updates for Supabase - only include schema fields
      const updates = {
        name: newSubject.name.trim(),
        professor_name: newSubject.professor_name.trim() || null, // Empty string becomes null
        color: newSubject.color
      }

      await safeUpdateSubject(editingSubject.id, updates)

      setShowAddModal(false)
      setEditingSubject(null)
      resetForm()
    } catch (error) {
      console.error('Failed to update subject:', error)
      alert('Failed to update subject: ' + error.message)
    }
  }

  const handleDeleteSubject = async (subjectId) => {
    try {
      await safeDeleteSubject(subjectId, () => 
        confirm('Are you sure you want to delete this subject?')
      )
    } catch (error) {
      console.error('Failed to delete subject:', error)
      alert('Failed to delete subject: ' + error.message)
    }
  }

  const handleRefresh = () => {
    safeFetchSubjects(true)
  }

  // // ✅ CORRECTED: Filter subjects using exact field names
  // const filteredSubjects = subjects.filter(subject => {
  //   const matchesSearch = 
  //     subject.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     subject.professor_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
  //   return matchesSearch 
  // })

  const getColorClasses = (color, variant = 'default') => {
    const colorMap = {
      blue: {
        default: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
        card: 'bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20',
        dot: 'bg-blue-500'
      },
      green: {
        default: 'bg-green-500/20 border-green-500/30 text-green-400',
        card: 'bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20',
        dot: 'bg-green-500'
      },
      purple: {
        default: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
        card: 'bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20',
        dot: 'bg-purple-500'
      },
      red: {
        default: 'bg-red-500/20 border-red-500/30 text-red-400',
        card: 'bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20',
        dot: 'bg-red-500'
      },
      yellow: {
        default: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
        card: 'bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20',
        dot: 'bg-yellow-500'
      },
      pink: {
        default: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
        card: 'bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20',
        dot: 'bg-pink-500'
      },
      indigo: {
        default: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
        card: 'bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20',
        dot: 'bg-indigo-500'
      },
      orange: {
        default: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
        card: 'bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20',
        dot: 'bg-orange-500'
      }
    }
    
    return colorMap[color]?.[variant] || colorMap.blue[variant]
  }

  const sidebarItems = [
        { icon: Home, label: 'Dashboard', id: '' },
        { icon: BarChart3, label: 'Analytics', id: 'analytics' },
        { icon: Eye, label: 'Todays Classes', id: 'todays' },
        { icon: BookOpen, label: 'Add Subjects', id: 'add-subjects' },
        { icon: CalendarDays, label: 'Schedule', id: 'schedule' },
        { icon: Calendar, label: 'Calendar', id: 'calendar' },
        { icon: Settings, label: 'Settings', id: 'settings' }
      ]

  // Error notification component
  const ErrorNotification = () => {
    if (!hasError) return null

    return (
      <div className={`fixed top-4 right-20 z-50 p-4 rounded-lg border backdrop-blur-md ${
        isDark 
          ? 'bg-red-900/20 border-red-500/30 text-red-400' 
          : 'bg-red-100/80 border-red-300 text-red-700'
      }`}>
        <div className="flex items-center space-x-2">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">
            {error || 'An error occurred'}
          </span>
          <button
            onClick={clearError}
            className="ml-2 hover:opacity-70"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    )
  }

  // Loading overlay
  const LoadingOverlay = () => {
    if (!isLoading) return null

    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
        <div className={`p-4 rounded-lg ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}>
          <div className="flex items-center space-x-3">
            <Loader2 className="animate-spin" size={20} />
            <span>Loading subjects...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      
      {/* Error Notification */}
      <ErrorNotification />

      {/* Loading Overlay */}
      <LoadingOverlay />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 z-50 p-3 rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-110 ${
          isDark
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            : 'bg-black/10 border-black/20 text-gray-700 hover:bg-black/20'
        }`}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Mobile Menu Toggle */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className={`fixed top-4 left-4 z-50 lg:hidden p-3 rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-110 ${
            isDark
              ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              : 'bg-black/10 border-black/20 text-gray-700 hover:bg-black/20'
          }`}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className={`h-full w-64 backdrop-blur-lg border-r ${
          isDark
            ? 'bg-gray-900/50 border-white/10'
            : 'bg-white/50 border-gray-200/50'
        }`}>
          
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
                  <BookOpen className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
                </div>
                <h2 className={`text-xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  AttendTrack
                </h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`lg:hidden p-1 rounded hover:bg-white/10 transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          </div>

          {/* Overall Stats in Sidebar */}
          <div className="p-4 border-b border-white/10">
            <div className={`p-3 rounded-lg bg-green-500/10 border-green-500/20`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Subjects
                </span>
                <GraduationCap className="text-green-400" size={16} />
              </div>
              <div className="text-2xl font-bold text-green-400">
                {totalCount}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Total subjects
              </div>
            </div>
          </div>

          {/* Sidebar Menu */}
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(`/${item.id}`)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeView === item.id
                    ? isDark
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    : isDark
                      ? 'text-gray-300 hover:bg-white/10 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'ml-0'
      }`}>
        <div className={`p-4 lg:p-8 ${!sidebarOpen ? 'pt-20 lg:pt-8' : 'pt-8'}`}>
          
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`backdrop-blur-lg rounded-xl border p-4 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Subjects</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {totalCount}
                  </p>
                </div>
                <Target className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
              </div>
            </div>

            <div className={`backdrop-blur-lg rounded-xl border p-4 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Subjects</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {totalCount}
                  </p>
                </div>
                <Award className="text-green-400" size={24} />
              </div>
            </div>
          </div>

          {/* Header and Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Subjects Management
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage your subjects and course information
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                <RefreshCw className={isLoading ? 'animate-spin' : ''} size={16} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => {
                  setShowAddModal(true)
                  setEditingSubject(null)
                  resetForm()
                }}
                disabled={isAnyLoading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                  isAnyLoading
                    ? 'bg-gray-500 cursor-not-allowed'
                    : isDark
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isCreating ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Plus size={16} />
                )}
                <span>{isCreating ? 'Adding...' : 'Add Subject'}</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className={`backdrop-blur-lg rounded-xl border p-4 mb-6 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
          }`}>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} size={16} />
                <input
                  type="text"
                  placeholder="Search subjects or professors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                    isDark 
                      ? 'bg-gray-800/50 border-white/10 text-white placeholder-gray-400 focus:border-blue-400' 
                      : 'bg-white/50 border-gray-300 text-gray-800 placeholder-gray-500 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Results count */}
            <div className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {subjects.length} of {totalCount} subjects
              {isLoading && <span> (Loading...)</span>}
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <div key={subject.id} className={`backdrop-blur-lg rounded-xl border p-6 transition-all duration-200 hover:scale-105 group ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
              }`}>
                
                {/* Subject Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${getColorClasses(subject.color || 'blue', 'dot')}`} />
                    <div>
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {subject.name}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditSubject(subject)}
                      disabled={isAnyLoading}
                      className={`p-2 rounded-lg transition-colors ${
                        isAnyLoading 
                          ? 'cursor-not-allowed opacity-50'
                          : isDark 
                            ? 'hover:bg-white/10 text-gray-400 hover:text-blue-400' 
                            : 'hover:bg-gray-100 text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <Edit3 size={16} />}
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
                      disabled={isAnyLoading}
                      className={`p-2 rounded-lg transition-colors ${
                        isAnyLoading 
                          ? 'cursor-not-allowed opacity-50'
                          : isDark 
                            ? 'hover:bg-white/10 text-gray-400 hover:text-red-400' 
                            : 'hover:bg-gray-100 text-gray-600 hover:text-red-600'
                      }`}
                    >
                      {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>

                {/* Subject Details */}
                <div className="space-y-3">
                  {(subject.professor_name || subject.professorName) && (
                    <div className="flex items-center space-x-2">
                      <User className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`} size={16} />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {subject.professor_name || subject.professorName}
                      </span>
                    </div>
                  )}

                  {subject.created_at && (
                    <div className="flex items-center space-x-2">
                      <Clock className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`} size={16} />
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Added {new Date(subject.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Subject Footer */}
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200/50'}`}>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getColorClasses(subject.color || 'blue', 'default')}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${getColorClasses(subject.color || 'blue', 'dot')}`} />
                    Subject
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {!isLoading && subjects.length === 0 && (
            <div className={`backdrop-blur-lg rounded-xl border p-12 text-center ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <BookOpen size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {searchTerm ? 'No subjects found' : 'No subjects added yet'}
              </h3>
              <p className={`text-sm mb-6 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Get started by adding your first subject'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => {
                    setShowAddModal(true)
                    setEditingSubject(null)
                    resetForm()
                  }}
                  disabled={isAnyLoading}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 mx-auto ${
                    isAnyLoading
                      ? 'bg-gray-500 cursor-not-allowed'
                      : isDark
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Plus size={16} />
                  <span>Add Your First Subject</span>
                </button>
              )}
            </div>
          )}

          {/* Loading State for Grid */}
          {isLoading && subjects.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((skeleton) => (
                <div key={skeleton} className={`backdrop-blur-lg rounded-xl border p-6 animate-pulse ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-3 h-3 rounded-full bg-gray-400 mt-1" />
                      <div>
                        <div className={`h-6 w-32 rounded mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        <div className={`h-4 w-20 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className={`h-4 w-24 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    <div className={`h-4 w-16 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    <div className={`h-4 w-full rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Add/Edit Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingSubject(null)
                  resetForm()
                }}
                disabled={isCreating || isUpdating}
                className={`p-2 rounded-lg transition-colors ${
                  isCreating || isUpdating
                    ? 'cursor-not-allowed opacity-50'
                    : isDark 
                      ? 'hover:bg-white/10 text-gray-400' 
                      : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Subject Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject(prev => ({...prev, name: e.target.value}))}
                  placeholder="e.g., Mathematics, Physics"
                  disabled={isCreating || isUpdating}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isCreating || isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    isDark 
                      ? 'bg-gray-800 border-white/10 text-white placeholder-gray-400 focus:border-blue-400' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Professor */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Professor (Optional)
                </label>
                <input
                  type="text"
                  value={newSubject.professor_name}
                  onChange={(e) => setNewSubject(prev => ({...prev, professor_name: e.target.value}))}
                  placeholder="e.g., Dr. Smith, Prof. Johnson"
                  disabled={isCreating || isUpdating}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isCreating || isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    isDark 
                      ? 'bg-gray-800 border-white/10 text-white placeholder-gray-400 focus:border-blue-400' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Subject Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setNewSubject(prev => ({...prev, color: color.name}))}
                      disabled={isCreating || isUpdating}
                      className={`w-12 h-12 rounded-lg ${color.class} transition-all duration-200 hover:scale-110 ${
                        isCreating || isUpdating ? 'cursor-not-allowed opacity-50' : ''
                      } ${
                        newSubject.color === color.name 
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' 
                          : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description (Optional)
                </label>
                <textarea
                  value={newSubject.description}
                  onChange={(e) => setNewSubject(prev => ({...prev, description: e.target.value}))}
                  placeholder="Brief description of the subject..."
                  rows={3}
                  disabled={isCreating || isUpdating}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors resize-none ${
                    isCreating || isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    isDark 
                      ? 'bg-gray-800 border-white/10 text-white placeholder-gray-400 focus:border-blue-400' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200/20">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingSubject(null)
                  resetForm()
                }}
                disabled={isCreating || isUpdating}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isCreating || isUpdating
                    ? 'cursor-not-allowed opacity-50'
                    : isDark 
                      ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              
              <button
                onClick={editingSubject ? handleUpdateSubject : handleAddSubject}
                disabled={!newSubject.name.trim() || isCreating || isUpdating}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  !newSubject.name.trim() || isCreating || isUpdating
                    ? (isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                    : (isDark 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105')
                }`}
              >
                {(isCreating || isUpdating) ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                <span>
                  {isCreating 
                    ? 'Adding...' 
                    : isUpdating 
                      ? 'Updating...' 
                      : editingSubject 
                        ? 'Update Subject' 
                        : 'Add Subject'
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}