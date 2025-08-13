import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  BarChart3, 
  Home, 
  CalendarDays, 
  Eye, 
  Settings, 
  Check, 
  X, 
  Minus, 
  RotateCcw,
  Sun,
  Moon,
  Menu,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
  Users,
  FileText,
  Target,
  Zap,
  CheckSquare,
  XSquare,
  MinusSquare,
  RotateCcwSquare
} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {useSettings} from '../Hooks/useSetting'

export default function CalendarPage() {
  const [theme, setTheme] = useState('dark')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState([])
  const [multiSelectMode, setMultiSelectMode] = useState(false)
  const [viewDate, setViewDate] = useState(new Date())
  const [activeView, setActiveView] = useState('calendar')

  const {settingTheme, minPercentage} = useSettings()

  const isDark = settingTheme


  const navigate = useNavigate()

  // Sample subjects data
  const [subjects] = useState([
    { id: 1, name: 'Mathematics', professor: 'Dr. Smith', credits: 4, color: 'blue' },
    { id: 2, name: 'Physics', professor: 'Dr. Johnson', credits: 3, color: 'green' },
    { id: 3, name: 'Chemistry', professor: 'Dr. Brown', credits: 4, color: 'purple' },
    { id: 4, name: 'English', professor: 'Prof. Davis', credits: 2, color: 'orange' },
    { id: 5, name: 'Computer Science', professor: 'Dr. Wilson', credits: 4, color: 'red' },
    { id: 6, name: 'Biology', professor: 'Dr. Taylor', credits: 3, color: 'teal' }
  ])

  // Sample schedule data (day of week: [subject IDs])
  const [schedule] = useState({
    1: [1, 2], // Monday: Math, Physics
    2: [3, 4], // Tuesday: Chemistry, English
    3: [1, 5], // Wednesday: Math, Computer Science
    4: [2, 6], // Thursday: Physics, Biology
    5: [3, 5], // Friday: Chemistry, Computer Science
    6: [4, 6], // Saturday: English, Biology
    0: [] // Sunday: No classes
  })

  // Attendance data structure: { date: { subjectId: status } }
  const [attendanceData, setAttendanceData] = useState({})

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
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
  // Calendar utilities
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const isSameDay = (date1, date2) => {
    return formatDateKey(date1) === formatDateKey(date2)
  }

  const isDateSelected = (date) => {
    return selectedDates.some(selectedDate => isSameDay(selectedDate, date))
  }

  const handleDateClick = (date) => {
    if (multiSelectMode) {
      if (isDateSelected(date)) {
        setSelectedDates(prev => prev.filter(d => !isSameDay(d, date)))
      } else {
        setSelectedDates(prev => [...prev, date])
      }
    } else {
      setSelectedDates([date])
    }
  }

  const getSubjectsForDate = (date) => {
    const dayOfWeek = date.getDay()
    const subjectIds = schedule[dayOfWeek] || []
    return subjects.filter(subject => subjectIds.includes(subject.id))
  }

  const updateAttendance = (date, subjectId, status) => {
    const dateKey = formatDateKey(date)
    setAttendanceData(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [subjectId]: prev[dateKey]?.[subjectId] === status ? null : status
      }
    }))
  }

  // Bulk attendance update function
  const updateBulkAttendance = (status) => {
    if (selectedDates.length === 0) return

    setAttendanceData(prev => {
      const newData = { ...prev }
      
      selectedDates.forEach(date => {
        const dateKey = formatDateKey(date)
        const subjectsForDay = getSubjectsForDate(date)
        
        if (subjectsForDay.length > 0) {
          if (!newData[dateKey]) {
            newData[dateKey] = {}
          }
          
          subjectsForDay.forEach(subject => {
            newData[dateKey][subject.id] = status
          })
        }
      })
      
      return newData
    })
  }

  const getAttendanceStatus = (date, subjectId) => {
    const dateKey = formatDateKey(date)
    return attendanceData[dateKey]?.[subjectId] || null
  }

  const navigateMonth = (direction) => {
    setViewDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  // Get count of classes affected by bulk operations
  const getBulkAffectedCount = () => {
    let totalClasses = 0
    selectedDates.forEach(date => {
      const subjectsForDay = getSubjectsForDate(date)
      totalClasses += subjectsForDay.length
    })
    return totalClasses
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewDate)
    const firstDay = getFirstDayOfMonth(viewDate)
    const today = new Date()
    
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
      const isToday = isSameDay(date, today)
      const isSelected = isDateSelected(date)
      const subjectsForDay = getSubjectsForDate(date)
      const hasClasses = subjectsForDay.length > 0
      
      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(date)}
          className={`p-2 h-16 cursor-pointer rounded-lg border transition-all duration-200 hover:scale-105 relative ${
            isSelected
              ? isDark
                ? 'bg-blue-500/30 border-blue-500/50 text-blue-300 ring-2 ring-blue-500/50'
                : 'bg-blue-500/20 border-blue-500/40 text-blue-700 ring-2 ring-blue-500/40'
              : isToday
                ? isDark
                  ? 'bg-green-500/20 border-green-500/40 text-green-300'
                  : 'bg-green-500/10 border-green-500/30 text-green-700'
                : hasClasses
                  ? isDark
                    ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    : 'bg-white/60 border-gray-200/50 text-gray-800 hover:bg-white/80'
                  : isDark
                    ? 'bg-gray-800/50 border-gray-700/50 text-gray-500'
                    : 'bg-gray-100/50 border-gray-300/50 text-gray-400'
          }`}
        >
          <div className="text-sm font-medium">{day}</div>
          {hasClasses && (
            <div className="flex gap-1 mt-1">
              {subjectsForDay.slice(0, 2).map(subject => (
                <div
                  key={subject.id}
                  className={`w-2 h-2 rounded-full ${
                    subject.color === 'blue' ? 'bg-blue-400' :
                    subject.color === 'green' ? 'bg-green-400' :
                    subject.color === 'purple' ? 'bg-purple-400' :
                    subject.color === 'orange' ? 'bg-orange-400' :
                    subject.color === 'red' ? 'bg-red-400' :
                    'bg-teal-400'
                  }`}
                />
              ))}
              {subjectsForDay.length > 2 && (
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  +{subjectsForDay.length - 2}
                </div>
              )}
            </div>
          )}
          {isSelected && multiSelectMode && (
            <div className="absolute -top-1 -right-1">
              <div className={`w-4 h-4 rounded-full ${isDark ? 'bg-blue-500' : 'bg-blue-600'} flex items-center justify-center`}>
                <Check size={10} className="text-white" />
              </div>
            </div>
          )}
        </div>
      )
    }
    
    return days
  }

  const getColorClasses = (color, status) => {
    const baseColors = {
      blue: status === 'present' ? 'bg-blue-500/20 border-blue-500/40' : status === 'absent' ? 'bg-red-500/20 border-red-500/40' : status === 'off' ? 'bg-yellow-500/20 border-yellow-500/40' : isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200',
      green: status === 'present' ? 'bg-green-500/20 border-green-500/40' : status === 'absent' ? 'bg-red-500/20 border-red-500/40' : status === 'off' ? 'bg-yellow-500/20 border-yellow-500/40' : isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200',
      purple: status === 'present' ? 'bg-purple-500/20 border-purple-500/40' : status === 'absent' ? 'bg-red-500/20 border-red-500/40' : status === 'off' ? 'bg-yellow-500/20 border-yellow-500/40' : isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200',
      orange: status === 'present' ? 'bg-orange-500/20 border-orange-500/40' : status === 'absent' ? 'bg-red-500/20 border-red-500/40' : status === 'off' ? 'bg-yellow-500/20 border-yellow-500/40' : isDark ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-200',
      red: status === 'present' ? 'bg-red-500/20 border-red-500/40' : status === 'absent' ? 'bg-red-500/30 border-red-500/50' : status === 'off' ? 'bg-yellow-500/20 border-yellow-500/40' : isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200',
      teal: status === 'present' ? 'bg-teal-500/20 border-teal-500/40' : status === 'absent' ? 'bg-red-500/20 border-red-500/40' : status === 'off' ? 'bg-yellow-500/20 border-yellow-500/40' : isDark ? 'bg-teal-500/10 border-teal-500/20' : 'bg-teal-50 border-teal-200'
    }
    return baseColors[color] || baseColors.blue
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
        <div className={`h-full w-64 backdrop-blur-lg border-r overflow-y-auto ${
          isDark
            ? 'bg-gray-900/50 border-white/10'
            : 'bg-white/50 border-gray-200/50'
        }`}>
          
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
                  <Calendar className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
                </div>
                <h2 className={`text-xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  Calendar
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

          {/* Multi-select Toggle - Removed */}

          {/* Selected Dates Info */}
          {selectedDates.length > 0 && (
            <div className="p-4 border-b border-white/10">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                    Selected Dates
                  </span>
                  <Target className={`${isDark ? 'text-green-400' : 'text-green-600'}`} size={16} />
                </div>
                <div className={`text-lg font-bold ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                  {selectedDates.length} days
                </div>
                <div className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {getBulkAffectedCount()} classes affected
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions - Removed from sidebar */}

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
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Attendance Calendar
                </h1>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {multiSelectMode 
                    ? 'Multi-select mode: Click multiple dates to manage bulk attendance'
                    : 'Select dates to manage your class attendance'
                  }
                </p>
              </div>
              
              {/* Multi-Select Toggle */}
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Multi-Select
                </span>
                <button
                  onClick={() => setMultiSelectMode(!multiSelectMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    multiSelectMode
                      ? isDark
                        ? 'bg-purple-500'
                        : 'bg-purple-600'
                      : isDark
                        ? 'bg-gray-600'
                        : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      multiSelectMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedDates.length > 0 && getBulkAffectedCount() > 0 && (
              <div className={`p-4 rounded-xl border backdrop-blur-lg mb-6 ${
                isDark ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <Zap className={`${isDark ? 'text-orange-400' : 'text-orange-600'}`} size={20} />
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
                        Bulk Actions
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-orange-400/80' : 'text-orange-600/80'}`}>
                        {selectedDates.length} days selected • {getBulkAffectedCount()} classes affected
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateBulkAttendance('present')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 hover:scale-105 ${
                        isDark
                          ? 'bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30'
                          : 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'
                      }`}
                      title={`Mark all classes as Present (${getBulkAffectedCount()} classes)`}
                    >
                      <Check size={16} />
                      <span className="text-sm font-medium">Present</span>
                    </button>
                    
                    <button
                      onClick={() => updateBulkAttendance('absent')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 hover:scale-105 ${
                        isDark
                          ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
                          : 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200'
                      }`}
                      title={`Mark all classes as Absent (${getBulkAffectedCount()} classes)`}
                    >
                      <X size={16} />
                      <span className="text-sm font-medium">Absent</span>
                    </button>
                    
                    <button
                      onClick={() => updateBulkAttendance('off')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 hover:scale-105 ${
                        isDark
                          ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30'
                          : 'bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200'
                      }`}
                      title={`Mark all classes as Off (${getBulkAffectedCount()} classes)`}
                    >
                      <Minus size={16} />
                      <span className="text-sm font-medium">Off</span>
                    </button>
                    
                    <button
                      onClick={() => updateBulkAttendance(null)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 hover:scale-105 ${
                        isDark
                          ? 'bg-gray-500/20 border-gray-500/40 text-gray-400 hover:bg-gray-500/30'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={`Reset all classes (${getBulkAffectedCount()} classes)`}
                    >
                      <RotateCcw size={16} />
                      <span className="text-sm font-medium">Reset</span>
                    </button>

                    <button
                      onClick={() => setSelectedDates([])}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 hover:scale-105 ${
                        isDark
                          ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
                          : 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200'
                      }`}
                      title="Clear all selected dates"
                    >
                      <X size={16} />
                      <span className="text-sm font-medium">Clear All</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Calendar Section */}
            <div className="xl:col-span-2">
              <div className={`backdrop-blur-lg rounded-2xl border p-6 ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
              }`}>
                
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                      isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  
                  <button
                    onClick={() => navigateMonth(1)}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                      isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className={`p-2 text-center text-sm font-medium ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {renderCalendar()}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-green-400' : 'bg-green-500'}`}></div>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Today</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-white/20' : 'bg-gray-300'}`}></div>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Has Classes</span>
                  </div>
                  {multiSelectMode && (
                    <div className="flex items-center space-x-2">
                      <Check size={12} className={`p-0.5 rounded-full ${isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'}`} />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Multi-selected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Dates Attendance */}
            <div className={`backdrop-blur-lg rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center space-x-3 mb-6">
                <FileText className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`} size={24} />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Attendance Management
                </h3>
              </div>

              {selectedDates.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Select dates from the calendar to manage attendance</p>
                  {multiSelectMode && (
                    <p className="text-sm mt-2">Multi-select mode is active - click multiple dates for bulk operations</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {selectedDates.map((date, dateIndex) => {
                    const subjectsForDay = getSubjectsForDate(date)
                    
                    if (subjectsForDay.length === 0) {
                      return (
                        <div key={dateIndex} className={`p-4 rounded-xl border ${
                          isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100/50 border-gray-300'
                        }`}>
                          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            No classes scheduled
                          </p>
                        </div>
                      )
                    }

                    return (
                      <div key={dateIndex} className={`border rounded-xl overflow-hidden ${
                        isDark ? 'bg-white/5 border-white/10' : 'bg-white/50 border-gray-200/50'
                      }`}>
                        <div className={`p-3 border-b ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </h4>
                        </div>
                        
                        <div className="p-3 space-y-3">
                          {subjectsForDay.map(subject => {
                            const status = getAttendanceStatus(date, subject.id)
                            
                            return (
                              <div key={subject.id} className={`p-3 rounded-lg border transition-all duration-200 ${
                                getColorClasses(subject.color, status)
                              }`}>
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h5 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                      {subject.name}
                                    </h5>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {subject.professor}
                                    </p>
                                  </div>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    status === 'present' ? 'bg-green-500/20 text-green-400' :
                                    status === 'absent' ? 'bg-red-500/20 text-red-400' :
                                    status === 'off' ? 'bg-yellow-500/20 text-yellow-400' :
                                    isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {status || 'Not Set'}
                                  </span>
                                </div>

                                <div className="grid grid-cols-4 gap-1">
                                  {[
                                    { icon: Check, status: 'present', color: 'green', label: 'Present' },
                                    { icon: X, status: 'absent', color: 'red', label: 'Absent' },
                                    { icon: Minus, status: 'off', color: 'yellow', label: 'Off' },
                                    { icon: RotateCcw, status: null, color: 'gray', label: 'Reset' }
                                  ].map(({ icon: Icon, status: btnStatus, color, label }) => (
                                    <button
                                      key={btnStatus || 'reset'}
                                      onClick={() => updateAttendance(date, subject.id, btnStatus)}
                                      className={`p-2 rounded border transition-all duration-200 hover:scale-105 ${
                                        status === btnStatus
                                          ? color === 'green'
                                            ? 'bg-green-500/30 border-green-500/50 text-green-400'
                                            : color === 'red'
                                              ? 'bg-red-500/30 border-red-500/50 text-red-400'
                                              : color === 'yellow'
                                                ? 'bg-yellow-500/30 border-yellow-500/50 text-yellow-400'
                                                : isDark
                                                  ? 'bg-gray-500/30 border-gray-500/50 text-gray-400'
                                                  : 'bg-gray-300 border-gray-400 text-gray-600'
                                          : isDark
                                            ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                                            : 'bg-white/50 border-gray-200/50 text-gray-600 hover:bg-white/80'
                                      }`}
                                      title={label}
                                    >
                                      <Icon size={14} className="mx-auto" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
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