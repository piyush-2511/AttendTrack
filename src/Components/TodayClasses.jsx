import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {useNavigate} from 'react-router-dom'
import { 
  Calendar, 
  Check, 
  X, 
  Minus, 
  RotateCcw,
  Sun,
  Moon,
  BookOpen,
  User,
  Award,
  AlertTriangle,
  Target,
  TrendingUp,
  Plus,
  ChevronRight,
  Home,
  CalendarDays,
  Eye,
  Settings,
  BarChart3,
  Menu,
  ChevronLeft,
  Zap,
  Loader2,
  AlertCircle,
  RefreshCw,
  Database,
  WifiOff
} from 'lucide-react'
import {useSchedule} from '../Hooks/useSchedule'
import {useSettings} from '../Hooks/useSetting'
import {useAttendance} from '../Hooks/useAttendance' // Import the real attendance hook
import {scheduleService} from '../supabase/scheduleService' 

export default function TodaysClasses() {
  const [theme, setTheme] = useState('dark')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState('today')

  const navigate = useNavigate()

  // Use the schedule hook with all its functionality
  const {
    todaysSubjects,
    loading: scheduleLoading,
    error: scheduleError,
    getDayName,
    getCurrentDay,
    todaysSubjectsCount,
    hasTodaysSchedule,
    refreshAllScheduleData,
    clearAllErrors: clearScheduleErrors,
    
    safeGetSubjectIdByName,
    initializeSchedule,
    // **NEW: Subject ID management from hook**
  } = useSchedule()

  // console.log(safeGetSubjectIdByName('HRD'))

  const {settingTheme, minPercentage} = useSettings()

  const {
    data: {
      todaysAttendance,
      attendanceStats,
      todaysSubjects: attendanceTodaysSubjects,
    },
    loading: attendanceLoading,
    error: attendanceError,
    actions: {
      fetchTodaysAttendance,
      fetchAttendanceStats,
      fetchTodaysSubjects: fetchAttendanceTodaysSubjects,
      markAttendanceOptimistic,
      removeAttendanceOptimistic,
      markAllPresent,
      markAllAbsent,
      initializeDashboard,
      refreshAll: refreshAttendanceData,
      clearAllErrors: clearAttendanceErrors,
    },
    helpers: {
      isSubjectMarked,
      getSubjectStatus,
      getUnmarkedSubjects,
      getSubjectsAtRisk,
      getOverallAttendancePercentage,
      getSubjectStats,
    },
    computed: {
      isAnyLoading: attendanceIsLoading,
      hasAnyError: attendanceHasError,
      overallAttendancePercentage,
    }
  } = useAttendance()

  const isDark = settingTheme


  // **REMOVED: Mock attendance state - now using real Redux state**
  // const [attendanceData, setAttendanceData] = useState({})
  // const [isInitialized, setIsInitialized] = useState(false)

  // Initialize component and fetch data
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Initialize both schedule and attendance data
        await Promise.all([
          initializeSchedule?.(),
          initializeDashboard?.()
        ])
      } catch (error) {
        console.error('Failed to initialize component:', error)
      }
    }
    
    initializeComponent()
  }, []) // Only run once on mount

  // **INTEGRATED: Real attendance stats calculation**
  const overallStats = useMemo(() => {
    if (!attendanceStats || attendanceStats.length === 0) {
      return { totalPresent: 0, totalClasses: 0, subjects: 0 }
    }

    const totalPresent = attendanceStats.reduce((sum, stats) => sum + (stats.present_days || 0), 0)
    const totalClasses = attendanceStats.reduce((sum, stats) => sum + (stats.present_days || 0) + (stats.absent_days || 0), 0)

    return {
      totalPresent,
      totalClasses,
      subjects: attendanceStats.length
    }
  }, [attendanceStats])

  const overallPercentage = overallStats.totalClasses > 0 ? 
    Math.round((overallStats.totalPresent / overallStats.totalClasses) * 100) : 0

  // **INTEGRATED: Real attendance update function**
  const updateAttendance = useCallback(async (subject, status) => {
    console.log('updateAttendance function hit')
    if (!subject) return
    console.log(subject)

    try {
      const today = new Date().toISOString().split('T')[0]
      console.log(todaysSubjects)

      const subjects = await scheduleService.getSubjectIdByName(subject)
      const subjectId = subjects?.subject_id
      console.log(subjectId)
      if (status === null) {
        // Remove attendance
        await removeAttendanceOptimistic(subjectId, today)
      } else {
        // Mark attendance with optimistic update
        await markAttendanceOptimistic(subjectId, today, status)
      }
    } catch (error) {
      console.error('Failed to update attendance:', error)
    } 
  }, [todaysSubjects, attendanceStats, markAttendanceOptimistic, removeAttendanceOptimistic])

  // **INTEGRATED: Real attendance helper functions**
  const getSubjectAttendanceData = useCallback((subject) => {
    // Get stats for this subject
    const stats = attendanceStats?.find(s => 
      s.subject_name === subject || s.subject_id === subject
    ) || { present_days: 0, absent_days: 0, attendance_percentage: 0 }
    
    // Get today's attendance status
    const todayStatus = getSubjectStatus(subject)
    
    // Generate professor name (you might want to get this from your data)
    const subjectHash = subject.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) & 0xffffff, 0)
    const professor = `Prof. ${subject.split(' ')[0]} ${String.fromCharCode(65 + (Math.abs(subjectHash) % 26))}`
    
    return {
      present: stats.present_days || 0,
      total: (stats.present_days || 0) + (stats.absent_days || 0),
      percentage: Math.round(stats.attendance_percentage || 0),
      status: todayStatus,
      professor: professor
    }
  }, [attendanceStats, getSubjectStatus])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const calculateRequiredClasses = useCallback((subject) => {
    const data = getSubjectAttendanceData(subject)
    if (!data || data.total === 0) return { type: 'no_data', count: 0 }
    
    const currentPercentage = data.percentage
    
    if (currentPercentage >= minPercentage) {
      const maxMissable = Math.floor((data.present - (minPercentage / 100) * data.total) / (minPercentage / 100))
      return { type: 'can_miss', count: Math.max(0, maxMissable) }
    } else {
      const required = Math.ceil((minPercentage / 100 * data.total - data.present) / (1 - minPercentage / 100))
      return { type: 'need_attend', count: Math.max(0, required) }
    }
  }, [getSubjectAttendanceData, minPercentage])

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (percentage) => {
    if (percentage >= 85) return 'text-green-400'
    if (percentage >= 75) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusBg = (percentage) => {
    if (percentage >= 85) return 'bg-green-500/10 border-green-500/20'
    if (percentage >= 75) return 'bg-yellow-500/10 border-yellow-500/20'
    return 'bg-red-500/10 border-red-500/20'
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

  const handleRefreshAll = async () => {
    try {
      clearScheduleErrors?.()
      clearAttendanceErrors?.()
      
      await Promise.all([
        refreshAllScheduleData?.(),
        refreshAttendanceData?.()
      ])
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  }

  // **INTEGRATED: Real batch attendance functions using the hook's bulk operations**
  const handleMarkAllPresent = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      await markAllPresent(today)
    } catch (error) {
      console.error('Failed to mark all present:', error)
    }
  }, [markAllPresent])

  const handleMarkAllAbsent = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      await markAllAbsent(today)
    } catch (error) {
      console.error('Failed to mark all absent:', error)
    }
  }, [markAllAbsent])

  const handleMarkAllOff = useCallback(async () => {
    // Custom implementation for marking all as "off" since it's not in the hook
    try {
      const today = new Date().toISOString().split('T')[0]
      const subjects = todaysSubjects || []
      
      for (const subject of subjects) {
        await updateAttendance(subject, 'off')
      }
    } catch (error) {
      console.error('Failed to mark all off:', error)
    }
  }, [todaysSubjects, updateAttendance])

  const handleResetDay = useCallback(async () => {
    try {
      const subjects = todaysSubjects || []
      
      for (const subject of subjects) {
        await updateAttendance(subject, null)
      }
    } catch (error) {
      console.error('Failed to reset day:', error)
    }
  }, [todaysSubjects, updateAttendance])

  // **INTEGRATED: Combined loading and error states**
  const getDataState = () => {
    const isLoading = scheduleLoading?.todaysSchedule || scheduleLoading?.todaysSubjects || attendanceIsLoading
    const hasError = scheduleError?.todaysSchedule || scheduleError?.todaysSubjects || attendanceHasError
    
    if (isLoading) {
      return 'loading'
    }
    if (hasError) {
      return 'error'
    }
    if (!todaysSubjects || !Array.isArray(todaysSubjects) || todaysSubjects.length === 0) {
      return 'no_classes'
    }
    return 'has_data'
  }

  const dataState = getDataState()

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

          {/* **INTEGRATED: Real Overall Stats in Sidebar** */}
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
              {attendanceIsLoading && (
                <div className="mt-2">
                  <Loader2 size={12} className={`animate-spin ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
              )}
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
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Today's Classes
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {formatDate(new Date())} - {getDayName ? getDayName(getCurrentDay()) : 'Unknown Day'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Refresh Button */}
              <button
                onClick={handleRefreshAll}
                disabled={dataState === 'loading'}
                className={`p-3 rounded-xl border transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border border-gray-500/30'
                    : 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 border border-gray-300'
                }`}
              >
                {dataState === 'loading' ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <RefreshCw size={20} />
                )}
              </button>
            </div>
          </div>

          {/* **INTEGRATED: Error Display for both schedule and attendance** */}
          {(attendanceHasError || (scheduleError?.todaysSchedule || scheduleError?.todaysSubjects)) && (
            <div className={`backdrop-blur-lg rounded-2xl border p-4 mb-6 ${
              isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50/60 border-red-300/40'
            }`}>
              <div className="flex items-center space-x-3">
                <AlertCircle className={`${isDark ? 'text-red-400' : 'text-red-500'}`} size={20} />
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Data Sync Issues
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Some data might be outdated. Try refreshing to get the latest information.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Data State Based Rendering */}
          {(() => {
            switch (dataState) {
              case 'loading':
                return (
                  <div className={`backdrop-blur-lg rounded-2xl border p-8 mb-6 text-center ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
                  }`}>
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <Loader2 className={`animate-spin ${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={32} />
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Loading Schedule & Attendance Data
                    </h3>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Please wait while we fetch your schedule and attendance information...
                    </p>
                  </div>
                )

              case 'error':
                return (
                  <div className={`backdrop-blur-lg rounded-2xl border p-8 mb-6 text-center ${
                    isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50/60 border-red-300/40'
                  }`}>
                    <div className="space-y-4">
                      <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-red-500/20' : 'bg-red-100'
                      }`}>
                        <WifiOff className={`${isDark ? 'text-red-400' : 'text-red-500'}`} size={32} />
                      </div>
                      <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Failed to Load Data
                      </h3>
                      <p className={`max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        We encountered an error while trying to fetch your schedule and attendance data.
                      </p>
                      <button 
                        onClick={handleRefreshAll}
                        className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                          isDark 
                            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30' 
                            : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border border-blue-300'
                        }`}
                      >
                        <RefreshCw size={18} />
                        <span className="font-medium">Refresh Data</span>
                      </button>
                    </div>
                  </div>
                )

              case 'no_classes':
                return (
                  <div className={`backdrop-blur-lg rounded-2xl border p-8 mb-6 text-center ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
                  }`}>
                    <div className="space-y-4">
                      <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-gray-500/20' : 'bg-gray-200'
                      }`}>
                        <Calendar className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={32} />
                      </div>
                      <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        No Classes Scheduled Today
                      </h3>
                      <p className={`text-sm max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        It looks like you don't have any classes scheduled for {getDayName ? getDayName(getCurrentDay()) : 'today'}.
                      </p>
                    </div>
                  </div>
                )

              case 'has_data':
              default:
                return (
                  <>
                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap gap-4 mb-6">
                      <button 
                        onClick={handleMarkAllPresent}
                        disabled={attendanceIsLoading}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isDark 
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30' 
                            : 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-300'
                        }`}
                      >
                        {attendanceIsLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        <span className="font-medium">Mark All Present</span>
                      </button>
                      
                      <button 
                        onClick={handleMarkAllAbsent}
                        disabled={attendanceIsLoading}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isDark 
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                            : 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-300'
                        }`}
                      >
                        {attendanceIsLoading ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                        <span className="font-medium">Mark All Absent</span>
                      </button>
                      
                      <button 
                        onClick={handleMarkAllOff}
                        disabled={attendanceIsLoading}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isDark 
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30' 
                            : 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border border-yellow-300'
                        }`}
                      >
                        {attendanceIsLoading ? <Loader2 size={18} className="animate-spin" /> : <Minus size={18} />}
                        <span className="font-medium">Mark All Off</span>
                      </button>
                      
                      <button 
                        onClick={handleResetDay}
                        disabled={attendanceIsLoading}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isDark 
                            ? 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border border-gray-500/30' 
                            : 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 border border-gray-300'
                        }`}
                      >
                        {attendanceIsLoading ? <Loader2 size={18} className="animate-spin" /> : <RotateCcw size={18} />}
                        <span className="font-medium">Reset Day</span>
                      </button>
                    </div>

                    {/* **INTEGRATED: Real Classes List with Attendance Data** */}
                    <div className={`backdrop-blur-lg rounded-2xl border p-6 mb-6 ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
                    }`}>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          Subject Schedule
                        </h2>
                        <div className="flex items-center space-x-3">
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {todaysSubjectsCount} subjects today
                          </span>
                          <Zap className={`${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} size={20} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {todaysSubjects && todaysSubjects.map((subject, index) => {
                          const data = getSubjectAttendanceData(subject)
                          const requirement = calculateRequiredClasses(subject)
                          
                          return (
                            <div key={index} className={`p-5 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
                            }`}>
                              
                              {/* Subject Header */}
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    {subject}
                                  </h3>
                                  
                                  <div className={`flex items-center space-x-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <User size={14} />
                                    <span>{data.professor}</span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className={`text-lg font-bold px-3 py-1 rounded-lg ${
                                    data.percentage >= 85
                                      ? 'bg-green-500/20 text-green-400'
                                      : data.percentage >= 75
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-red-500/20 text-red-400'
                                  }`}>
                                    {data.percentage}%
                                  </span>
                                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {data.present}/{data.total} classes
                                  </p>
                                </div>
                              </div>
                             
                              {/* Attendance Buttons */}
                              <div className="grid grid-cols-4 gap-2 mb-4">
                                {[
                                  { icon: Check, status: 'present', color: 'green', label: 'Present' },
                                  { icon: X, status: 'absent', color: 'red', label: 'Absent' },
                                  { icon: Minus, status: 'off', color: 'yellow', label: 'Holiday/Off' },
                                  { icon: RotateCcw, status: null, color: 'gray', label: 'Reset' }
                                ].map(({ icon: Icon, status, color, label }) => (
                                  <button
                                    key={status || 'reset'}
                                    onClick={() => updateAttendance(subject, status)}
                                    disabled={attendanceIsLoading}
                                    className={`p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                      data.status === status
                                        ? color === 'green'
                                          ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                          : color === 'red'
                                            ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                            : color === 'yellow'
                                              ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                                              : isDark
                                                ? 'bg-gray-500/20 border-gray-500/50 text-gray-400'
                                                : 'bg-gray-200 border-gray-300 text-gray-600'
                                        : isDark
                                          ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                                          : 'bg-white/50 border-gray-200/50 text-gray-600 hover:bg-white/80'
                                    }`}
                                    title={label}
                                  >
                                    {attendanceIsLoading ? (
                                      <Loader2 size={16} className="animate-spin mx-auto mb-1" />
                                    ) : (
                                      <Icon size={16} className="mx-auto mb-1" />
                                    )}
                                    <span className="text-xs block">{label}</span>
                                  </button>
                                ))}
                              </div>

                              {/* Progress Bar */}
                              <div className={`w-full rounded-full h-3 mb-3 ${
                                isDark ? 'bg-gray-700' : 'bg-gray-200'
                              }`}>
                                <div 
                                  className={`h-3 rounded-full transition-all duration-500 ${
                                    data.percentage >= 85 
                                      ? 'bg-green-500' 
                                      : data.percentage >= 75 
                                        ? 'bg-yellow-500' 
                                        : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(data.percentage, 100)}%` }}
                                />
                              </div>

                              {/* Requirement Info */}
                              <div className="flex justify-between items-center">
                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Attendance: {data.present}/{data.total}
                                </div>
                                <div className={`text-sm font-medium ${
                                  requirement.type === 'can_miss' ? 'text-green-400' : 
                                  requirement.type === 'need_attend' ? 'text-red-400' : 'text-gray-400'
                                }`}>
                                  {requirement.type === 'can_miss' 
                                    ? `✓ Can miss ${requirement.count} more`
                                    : requirement.type === 'need_attend'
                                      ? `⚠ Need ${requirement.count} more classes`
                                      : 'No data available'
                                  }
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )
            }
          })()}

          {/* Schedule Info Panel */}
          <div className={`backdrop-blur-lg rounded-2xl border p-6 mb-6 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Schedule Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white/50'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Current Day
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {getDayName ? getDayName(getCurrentDay()) : 'Unknown'} (Day {getCurrentDay() || 0})
                </p>
              </div>
              
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white/50'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className={`${isDark ? 'text-green-400' : 'text-green-600'}`} size={20} />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Subjects Today
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {todaysSubjectsCount} subjects scheduled
                </p>
              </div>
              
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white/50'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Target className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`} size={20} />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Unmarked Subjects
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {getUnmarkedSubjects?.()?.length || 0} pending
                </p>
              </div>
              
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white/50'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Database className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`} size={20} />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Data Status
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {(() => {
                    switch (dataState) {
                      case 'loading': return 'Syncing...'
                      case 'error': return 'Error occurred'
                      case 'no_classes': return 'No classes'
                      case 'has_data': return 'Up to date'
                      default: return 'Unknown'
                    }
                  })()}
                </p>
              </div>
            </div>
          </div>

          {/* **INTEGRATED: Enhanced Motivation Panel with Real Stats** */}
          <div className={`backdrop-blur-lg rounded-2xl border p-8 ${
            isDark
              ? 'bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 border-purple-500/20'
              : 'bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 border-purple-200'
          }`}>
            <div className="text-center space-y-4">
              <div className="flex justify-center items-center space-x-4">
                <Award className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`} size={40} />
                <Target className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={40} />
                <TrendingUp className={`${isDark ? 'text-green-400' : 'text-green-600'}`} size={40} />
              </div>
              
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Keep Going! You're Doing Great! 🚀
              </h3>
              
              <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {(() => {
                  if (dataState !== 'has_data') {
                    return "Once your schedule is set up, you'll be able to track your attendance and stay on top of your academic goals! 📚"
                  } else if (overallPercentage >= 90) {
                    return "Excellent attendance! You're a star student! Keep up this amazing consistency and you'll achieve great success! ⭐"
                  } else if (overallPercentage >= 80) {
                    return "Great job! Your dedication is showing results. Keep maintaining this consistency and you'll reach your goals! 👏"
                  } else if (overallPercentage >= 75) {
                    return "Good work! You're on the right track. A few more classes and you'll be in the golden zone! Stay focused! 💪"
                  } else {
                    return "Focus mode activated! Every single class counts now. You've got this - turn it around and show your determination! 🎯"
                  }
                })()}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white/50'}`}>
                  <div className={`text-2xl font-bold mb-2 ${
                    dataState === 'has_data' ? getStatusColor(overallPercentage) : isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {dataState === 'has_data' ? `${overallPercentage}%` : '--'}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Overall Attendance
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white/50'}`}>
                  <div className={`text-2xl font-bold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {todaysSubjectsCount || 0}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Subjects Today
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white/50'}`}>
                  <div className={`text-2xl font-bold mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {todaysAttendance?.filter(att => att.status === 'present').length || 0}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Marked Present Today
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white/50'}`}>
                  <div className={`text-2xl font-bold mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {getSubjectsAtRisk?.(minPercentage)?.length || 0}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    At Risk Subjects
                  </div>
                </div>
              </div>
              
              {/* **INTEGRATED: Risk Analysis Section** */}
              {dataState === 'has_data' && getSubjectsAtRisk?.(minPercentage)?.length > 0 && (
                <div className={`mt-6 p-4 rounded-xl border ${
                  isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <AlertTriangle className={`${isDark ? 'text-red-400' : 'text-red-500'}`} size={20} />
                    <h4 className={`font-semibold ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                      Subjects Need Attention
                    </h4>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {getSubjectsAtRisk(minPercentage).map(subject => subject.subject_name).join(', ')} 
                    {getSubjectsAtRisk(minPercentage).length === 1 ? ' is' : ' are'} below {minPercentage}% attendance.
                  </p>
                </div>
              )}
              
              <div className={`text-sm mt-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                🎯 Stay consistent • 📚 Track daily • 🏆 Achieve success • ⚡ Never give up
              </div>
            </div>
          </div>
        </div>
      </div>

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