import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sun,
  Moon,
  Menu,
  Copy,
  RotateCcw,
  AlertCircle,
  Home,
  Eye,
  BarChart3,
  CalendarDays,
  Settings,
  Award,
  Grid3X3,
  Loader
} from 'lucide-react'
import { useSubjects } from '../Hooks/useSubjects'
import { useSchedule } from '../Hooks/useSchedule'
import { useAuth } from '../Hooks/useAuth'
import {useNavigate} from 'react-router-dom'


export default function Schedule() {
  const [theme, setTheme] = useState('dark')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [activeView, setActiveView] = useState('schedule')
  const [currentWeek, setCurrentWeek] = useState(0)

  const navigate = useNavigate()


  const { user } = useAuth()
  const userId = user?.id

  // Use hooks
  const { subjects, safeFetchSubjects, isLoading: subjectsLoading } = useSubjects(userId)
  const {
    // State
    weeklySchedule,
    scheduleByDay,
    subjectsByDay,
    isScheduleEmpty,
    
    // Loading states
    isWeeklyScheduleLoading,
    isSettingSchedule,
    isAddingSubject,
    isRemovingSubject,
    isDeletingDay,
    isAnyLoading,
    
    // Error states
    hasAnyError,
    allErrors,
    
    // Actions
    fetchWeeklySchedule,
    setScheduleForDay,
    addSubjectToDay,
    removeSubjectFromDay,
    deleteScheduleForDay,
    clearAllErrors,
    
    // Selectors
    getScheduleForDay,
    getSubjectsForDay,
    hasScheduleForDay,
    
    // Utils
    getDayName,
    getCurrentDay,
    isToday,
    getSubjectsCountForDay,
    getTotalSubjectsCount,
    hasSubjectOnDay,
    getScheduleCompleteness,
    getMostFrequentSubject,
    
    // Safe methods
    safeFetchWeeklySchedule,
    safeSetScheduleForDay,
    safeAddSubjectToDay,
    safeRemoveSubjectFromDay,
    safeDeleteScheduleForDay,
    
    // Convenience methods
    initializeSchedule,
    refreshAllScheduleData,
    
    // Computed values
    computed
  } = useSchedule()

  console.log(subjects)

  const [newSchedule, setNewSchedule] = useState({
    subjectlist: [],
    day: 1
  })

  const isDark = theme === 'dark'

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']


  // Initialize data on component mount
  useEffect(() => {
    const initData = async () => {
      try {
        if (userId) {
          await Promise.all([
            safeFetchSubjects(),
            initializeSchedule()
          ])
        }
      } catch (error) {
        console.error('Error initializing data:', error)
      }
    }

    initData()
  }, [userId])

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearAllErrors()
    }
  }, [])

  // Mock overall stats for sidebar
  const overallStats = {
    totalPresent: 85,
    totalClasses: 100
  }
  const overallPercentage = Math.round((overallStats.totalPresent / overallStats.totalClasses) * 100)

  const getStatusColor = (percentage) => {
    if (percentage >= 75) return isDark ? 'text-green-400' : 'text-green-600'
    if (percentage >= 50) return isDark ? 'text-yellow-400' : 'text-yellow-600'
    return isDark ? 'text-red-400' : 'text-red-600'
  }

  const getStatusBg = (percentage) => {
    if (percentage >= 75) return isDark ? 'bg-green-500/10' : 'bg-green-50'
    if (percentage >= 50) return isDark ? 'bg-yellow-500/10' : 'bg-yellow-50'
    return isDark ? 'bg-red-500/10' : 'bg-red-50'
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const resetForm = () => {
    setNewSchedule({
      subjectlist: [],
      day: 1
    })
  }

  // Get all unique subjects from schedules and subjects list
  const getAllUniqueSubjects = () => {
    const scheduleSubjects = Object.values(subjectsByDay).flat()
    // Extract subject names from the subjects objects
    const subjectNames = subjects.map(subject => subject.name)
    const allSubjects = [...new Set([...subjectNames, ...scheduleSubjects])]
    return allSubjects
  }

  // Check if a subject is scheduled for a specific day
  const isSubjectScheduledForDay = (subjectName, dayIndex) => {
    return hasSubjectOnDay(dayIndex, subjectName)
  }

  const handleAddSchedule = async () => {
    if (newSchedule.subjectlist.length === 0) {
      alert('Please select at least one subject!')
      return
    }

    try {
      console.log('Adding schedule for day:', newSchedule.day)
      console.log('Subject list:', newSchedule.subjectlist)
      console.log('Is array:', Array.isArray(newSchedule.subjectlist))
      console.log('Subject list type:', typeof newSchedule.subjectlist)
      
      await safeSetScheduleForDay(newSchedule.day, newSchedule.subjectlist)
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      const errorMessage = error.message.includes('duplicate')
        ? 'This schedule already exists for the selected day'
        : error.message.includes('network')
        ? 'Network error - please check your connection'
        : `Failed to add schedule: ${error.message}`
      
      alert(errorMessage)
    }
  }

  const handleEditSchedule = (day) => {
    const daySubjects = getSubjectsForDay(day)
    setEditingSchedule({ day, subjectlist: daySubjects })
    setNewSchedule({
      subjectlist: [...daySubjects],
      day: day
    })
    setShowAddModal(true)
  }

  const handleUpdateSchedule = async () => {
    if (newSchedule.subjectlist.length === 0) {
      alert('Please select at least one subject!')
      return
    }

    try {
      console.log('Updating schedule for day:', newSchedule.day)
      console.log('Subject list:', newSchedule.subjectlist)
      console.log('Is array:', Array.isArray(newSchedule.subjectlist))
      console.log('Subject list type:', typeof newSchedule.subjectlist)
      
      await safeSetScheduleForDay(newSchedule.day, newSchedule.subjectlist)
      setShowAddModal(false)
      setEditingSchedule(null)
      resetForm()
    } catch (error) {
      console.error('Error details:', error)
      alert('Failed to update schedule: ' + error.message)
    }
  }

  const handleDeleteSchedule = async (day) => {
    try {
      await safeDeleteScheduleForDay(day, () => 
        confirm(`Are you sure you want to delete ${getDayName(day)}'s schedule?`)
      )
    } catch (error) {
      alert('Failed to delete schedule: ' + error.message)
    }
  }

  const clearDaySchedule = async (dayIndex) => {
    if (hasScheduleForDay(dayIndex)) {
      try {
        await handleDeleteSchedule(dayIndex)
      } catch (error) {
        console.error('Error clearing day schedule:', error)
      }
    }
  }

  const handleSubjectToggle = (subjectName) => {
    setNewSchedule(prev => ({
      ...prev,
      subjectlist: prev.subjectlist.includes(subjectName)
        ? prev.subjectlist.filter(s => s !== subjectName)
        : [...prev.subjectlist, subjectName]
    }))
  }

  const removeSubject = (subjectName) => {
    setNewSchedule(prev => ({
      ...prev,
      subjectlist: prev.subjectlist.filter(s => s !== subjectName)
    }))
  }

  const getWeekDates = () => {
    const today = new Date()
    const currentDay = today.getDay()
    const sunday = new Date(today)
    sunday.setDate(today.getDate() - currentDay + (currentWeek * 7))
    
    return days.map((_, index) => {
      const date = new Date(sunday)
      date.setDate(sunday.getDate() + index)
      return date
    })
  }

  const handleRefreshData = async () => {
    try {
      await refreshAllScheduleData()
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
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

  // Show loading spinner while data is being fetched
  if (subjectsLoading || isWeeklyScheduleLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' 
          : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      }`}>
        <div className="text-center">
          <Loader className={`animate-spin mx-auto mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`} size={48} />
          <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Loading your schedule...
          </p>
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
            <div className={`p-3 rounded-lg ${getStatusBg(overallPercentage)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Overall
                </span>
                <Award className={getStatusColor(overallPercentage)} size={16} />
              </div>
              <div className={`text-2xl font-bold ${getStatusColor(overallPercentage)}`}>
                {overallPercentage}%
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {overallStats.totalPresent}/{overallStats.totalClasses} classes
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

          {/* Schedule Stats */}
          <div className="p-4 border-t border-white/10">
            <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Schedule Stats
            </h4>
            <div className="space-y-2">
              <div className={`p-2 rounded text-xs ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Total Subjects: {getTotalSubjectsCount()}
                </div>
              </div>
              <div className={`p-2 rounded text-xs ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Completeness: {getScheduleCompleteness()}%
                </div>
              </div>
              <div className={`p-2 rounded text-xs ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Current Day: {getDayName(getCurrentDay())}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <div className={`p-4 lg:p-8 ${!sidebarOpen ? 'pt-20 lg:pt-8' : 'pt-8'}`}>
          
          {/* Error Display */}
          {hasAnyError && (
            <div className={`mb-4 p-4 rounded-lg border ${
              isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              <div className="flex items-center space-x-2">
                <AlertCircle size={20} />
                <span>There was an error loading your schedule data.</span>
                <button
                  onClick={clearAllErrors}
                  className={`ml-auto text-sm underline ${
                    isDark ? 'text-red-300 hover:text-red-200' : 'text-red-700 hover:text-red-800'
                  }`}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Weekly Schedule
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage your subject schedule for each day
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefreshData}
                disabled={isAnyLoading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:opacity-50'
                }`}
              >
                <RotateCcw size={20} className={isAnyLoading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => {
                  setShowAddModal(true)
                  setEditingSchedule(null)
                  resetForm()
                }}
                disabled={isAnyLoading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? 'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50'
                    : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
                }`}
              >
                <Plus size={20} />
                <span>Add Schedule</span>
              </button>
            </div>
          </div>

          {/* Weekly Overview Table */}
          <div className={`backdrop-blur-lg rounded-2xl border p-6 mb-8 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Grid3X3 className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Weekly Overview
                </h2>
              </div>
              <div className={`text-sm px-3 py-1 rounded-lg ${
                isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/10 text-blue-600'
              }`}>
                {getAllUniqueSubjects().length} Subjects
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <th className={`text-left p-3 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Subject
                    </th>
                    {days.map((day, index) => (
                      <th key={day} className={`text-center p-3 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className="flex flex-col">
                          <span className="text-sm">{day.slice(0, 3)}</span>
                          {isToday(index) && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/10 text-blue-600'
                            }`}>
                              Today
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getAllUniqueSubjects().map((subjectName, subjectIndex) => (
                    <tr key={subjectName} className={`border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                      <td className={`p-3 font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg ${
                          isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                        }`}>
                          <BookOpen size={16} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                          <span className="text-sm">{subjectName}</span>
                        </div>
                      </td>
                      {days.map((day, dayIndex) => (
                        <td key={dayIndex} className="p-3 text-center">
                          {isSubjectScheduledForDay(subjectName, dayIndex) ? (
                            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                              isDark 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-green-100 text-green-600 border border-green-200'
                            }`}>
                              <div className={`w-3 h-3 rounded-full ${
                                isDark ? 'bg-green-400' : 'bg-green-600'
                              }`} />
                            </div>
                          ) : (
                            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed ${
                              isDark 
                                ? 'border-gray-600 text-gray-600' 
                                : 'border-gray-300 text-gray-400'
                            }`}>
                              <div className="w-1 h-1 rounded-full bg-current opacity-30" />
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {getAllUniqueSubjects().length === 0 && (
                    <tr>
                      <td colSpan={8} className={`p-8 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No subjects scheduled yet</p>
                        <p className="text-sm mt-1">Add a schedule to see your weekly overview</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Day-wise Schedule Cards */}
          <div className={`backdrop-blur-lg rounded-2xl border p-6 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Day-wise Schedule
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {days.map((day, index) => {
                const daySubjects = getSubjectsForDay(index)
                const hasSchedule = hasScheduleForDay(index)
                
                return (
                  <div key={day} className={`backdrop-blur-lg rounded-xl border p-4 ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
                  } ${isToday(index) ? (isDark ? 'ring-2 ring-blue-400/50' : 'ring-2 ring-blue-500/50') : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center flex-1">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {day}
                          {isToday(index) && (
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                              isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/10 text-blue-600'
                            }`}>
                              Today
                            </span>
                          )}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        {hasSchedule && (
                          <button
                            onClick={() => clearDaySchedule(index)}
                            disabled={isDeletingDay}
                            className={`p-1 rounded hover:bg-white/10 transition-colors ${
                              isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'
                            }`}
                            title="Clear Day"
                          >
                            <RotateCcw size={16} className={isDeletingDay ? 'animate-spin' : ''} />
                          </button>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/10 text-blue-600'
                        }`}>
                          {daySubjects.length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 min-h-[200px]">
                      {daySubjects.map((subject, subjectIndex) => (
                        <div key={subjectIndex} className={`p-3 rounded-lg border ${
                          isDark ? 'bg-white/5 border-white/10' : 'bg-white/50 border-gray-200/50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {subject}
                              </h4>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {daySubjects.length === 0 && (
                        <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No subjects scheduled</p>
                        </div>
                      )}

                      {/* Edit/Add Button for each day */}
                      <button
                        onClick={() => {
                          if (hasSchedule) {
                            handleEditSchedule(index)
                          } else {
                            setNewSchedule(prev => ({ ...prev, day: index }))
                            setShowAddModal(true)
                            setEditingSchedule(null)
                          }
                        }}
                        disabled={isAnyLoading}
                        className={`w-full mt-2 p-2 rounded-lg border-2 border-dashed transition-colors disabled:opacity-50 ${
                          isDark 
                            ? 'border-gray-600 hover:border-blue-400 text-gray-400 hover:text-blue-400' 
                            : 'border-gray-300 hover:border-blue-500 text-gray-600 hover:text-blue-600'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {hasSchedule ? <Edit3 size={16} /> : <Plus size={16} />}
                          <span className="text-sm font-medium">
                            {hasSchedule ? 'Edit Schedule' : 'Add Schedule'}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 ${
            isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingSchedule(null)
                  resetForm()
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Day Selection */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Day *
                </label>
                <select
                  value={newSchedule.day}
                  onChange={(e) => setNewSchedule(prev => ({...prev, day: parseInt(e.target.value)}))}
                  disabled={isAnyLoading}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors disabled:opacity-50 ${
                    isDark 
                      ? 'bg-gray-800 border-white/10 text-white focus:border-blue-400' 
                      : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'
                  }`}
                >
                  {days.map((day, index) => (
                    <option key={day} value={index}>{day}</option>
                  ))}
                </select>
              </div>

              {/* Subject Selection */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Select Subjects *
                </label>
                
                {/* Selected Subjects */}
                {newSchedule.subjectlist.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {newSchedule.subjectlist.map((subjectName, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                            isDark 
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {subjectName}
                          <button
                            onClick={() => removeSubject(subjectName)}
                            disabled={isAnyLoading}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5 disabled:opacity-50"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Available Subjects Grid */}
                <div className={`max-h-48 overflow-y-auto p-3 rounded-lg border ${
                  isDark ? 'bg-gray-800/50 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  {subjects.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {subjects.map((subject) => (
                        <button
                          key={subject.id}
                          onClick={() => handleSubjectToggle(subject.name)}
                          disabled={isAnyLoading}
                          className={`p-2 text-left rounded-lg transition-colors disabled:opacity-50 ${
                            newSchedule.subjectlist.includes(subject.name)
                              ? isDark
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                              : isDark
                                ? 'hover:bg-white/5 text-gray-300 border border-transparent hover:border-white/10'
                                : 'hover:bg-white text-gray-700 border border-transparent hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <span className="text-sm font-medium">{subject.name}</span>
                              {subject.professor_name && (
                                <p className={`text-xs mt-1 ${
                                  isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Prof. {subject.professor_name}
                                </p>
                              )}
                            </div>
                            {newSchedule.subjectlist.includes(subject.name) && (
                              <div className={`w-4 h-4 rounded-full ${
                                isDark ? 'bg-blue-400' : 'bg-blue-600'
                              } flex items-center justify-center`}>
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className={`text-center py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <BookOpen size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No subjects available</p>
                      <p className="text-xs mt-1">Add subjects first to create schedules</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Validation Warning */}
              {newSchedule.subjectlist.length === 0 && (
                <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                  isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
                }`}>
                  <AlertCircle size={16} className="text-red-500" />
                  <span className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    Please select at least one subject
                  </span>
                </div>
              )}

              {/* Selected Subjects Info */}
              {newSchedule.subjectlist.length > 0 && (
                <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                  isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <BookOpen size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                  <span className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {newSchedule.subjectlist.length} subject{newSchedule.subjectlist.length !== 1 ? 's' : ''} selected for {days[newSchedule.day]}
                  </span>
                </div>
              )}

              {/* Loading indicator in modal */}
              {isAnyLoading && (
                <div className={`flex items-center justify-center space-x-2 p-3 rounded-lg ${
                  isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                }`}>
                  <Loader className={`animate-spin ${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={16} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {isSettingSchedule ? 'Saving schedule...' : 
                     isAddingSubject ? 'Adding subject...' : 
                     isRemovingSubject ? 'Removing subject...' : 
                     isDeletingDay ? 'Deleting schedule...' : 'Loading...'}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200/20">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingSchedule(null)
                  resetForm()
                }}
                disabled={isAnyLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              
              {editingSchedule && (
                <button
                  onClick={() => handleDeleteSchedule(editingSchedule.day)}
                  disabled={isAnyLoading}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 ${
                    isDark 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                      : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              )}
              
              <button
                onClick={editingSchedule ? handleUpdateSchedule : handleAddSchedule}
                disabled={newSchedule.subjectlist.length === 0 || isAnyLoading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  newSchedule.subjectlist.length === 0 || isAnyLoading
                    ? (isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                    : (isDark 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105')
                }`}
              >
                {isAnyLoading ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>{editingSchedule ? 'Update Schedule' : 'Add Schedule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}