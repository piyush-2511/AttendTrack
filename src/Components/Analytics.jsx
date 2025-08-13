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
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BookOpen,
  Award,
  Zap,
  PieChart,
  Activity,
  Calendar as CalendarIcon,
  Filter,
  Download,
  Users,
  Clock3,
  BarChart2
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, Area, AreaChart, RadialBarChart, RadialBar } from 'recharts'
import {useNavigate} from 'react-router-dom'

export default function Analytics() {
  const [theme, setTheme] = useState('dark')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState('analytics')
  const [selectedTimeRange, setSelectedTimeRange] = useState('month')
  const [selectedSubject, setSelectedSubject] = useState('all')

  // Mock data - replace with your actual data hooks
  const isDark = theme === 'dark'

  const navigate = useNavigate()

  // Mock attendance statistics
  const attendanceStats = [
    { subject_name: 'Mathematics', present_days: 25, total_days: 30, absent_days: 5 },
    { subject_name: 'Physics', present_days: 22, total_days: 28, absent_days: 6 },
    { subject_name: 'Chemistry', present_days: 28, total_days: 32, absent_days: 4 },
    { subject_name: 'English', present_days: 20, total_days: 25, absent_days: 5 },
    { subject_name: 'Computer Science', present_days: 30, total_days: 32, absent_days: 2 },
    { subject_name: 'History', present_days: 18, total_days: 24, absent_days: 6 }
  ]

  const minPercentage = 75

  // Calculate overall statistics
  const overallStats = attendanceStats.reduce(
    (acc, data) => ({
      totalPresent: acc.totalPresent + data.present_days,
      totalClasses: acc.totalClasses + data.total_days,
      totalAbsent: acc.totalAbsent + data.absent_days
    }),
    { totalPresent: 0, totalClasses: 0, totalAbsent: 0 }
  )

  const overallPercentage = Math.round((overallStats.totalPresent / overallStats.totalClasses) * 100)

  // Weekly attendance trend
  const weeklyTrend = [
    { week: 'Week 1', attendance: 85, present: 17, absent: 3 },
    { week: 'Week 2', attendance: 90, present: 18, absent: 2 },
    { week: 'Week 3', attendance: 78, present: 15, absent: 4 },
    { week: 'Week 4', attendance: 92, present: 19, absent: 1 },
    { week: 'Week 5', attendance: 88, present: 18, absent: 2 },
    { week: 'Week 6', attendance: 95, present: 19, absent: 1 },
    { week: 'Week 7', attendance: 82, present: 16, absent: 3 },
    { week: 'Week 8', attendance: 87, present: 17, absent: 2 }
  ]

  // Daily attendance pattern
  const dailyPattern = [
    { day: 'Monday', attendance: 85, classes: 6 },
    { day: 'Tuesday', attendance: 90, classes: 5 },
    { day: 'Wednesday', attendance: 78, classes: 7 },
    { day: 'Thursday', attendance: 92, classes: 6 },
    { day: 'Friday', attendance: 88, classes: 5 },
    { day: 'Saturday', attendance: 95, classes: 4 }
  ]

  // Subject comparison data
  const subjectComparison = attendanceStats.map(data => ({
    subject: data.subject_name,
    percentage: Math.round((data.present_days / data.total_days) * 100),
    present: data.present_days,
    total: data.total_days,
    absent: data.absent_days,
    status: Math.round((data.present_days / data.total_days) * 100) >= minPercentage ? 'safe' : 'risk'
  }))

  // Monthly comparison
  const monthlyComparison = [
    { month: 'Jan', attendance: 82 },
    { month: 'Feb', attendance: 85 },
    { month: 'Mar', attendance: 88 },
    { month: 'Apr', attendance: 90 },
    { month: 'May', attendance: 87 },
    { month: 'Jun', attendance: 92 }
  ]

  // Pie chart data for attendance distribution
  const attendanceDistribution = [
    { name: 'Present', value: overallStats.totalPresent, color: '#10b981' },
    { name: 'Absent', value: overallStats.totalAbsent, color: '#ef4444' }
  ]

  // Time distribution data
  const timeDistribution = [
    { period: 'Morning (9-12)', attendance: 95, classes: 45 },
    { period: 'Afternoon (12-3)', attendance: 88, classes: 38 },
    { period: 'Evening (3-6)', attendance: 82, classes: 35 }
  ]

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

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4']

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
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'ml-0'
      }`}>
        <div className={`p-4 lg:p-8 ${!sidebarOpen ? 'pt-20 lg:pt-8' : 'pt-8'}`}>
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Analytics Dashboard
              </h1>
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Detailed insights into your attendance patterns and trends
              </p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className={`px-4 py-2 rounded-lg border backdrop-blur-sm ${
                  isDark
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/60 border-gray-200 text-gray-800'
                }`}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="semester">This Semester</option>
                <option value="year">This Year</option>
              </select>
              
              <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg border backdrop-blur-sm transition-colors ${
                isDark
                  ? 'bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-600 hover:bg-blue-500/20'
              }`}>
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className={`backdrop-blur-lg rounded-xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Average Attendance
                  </p>
                  <p className={`text-2xl font-bold ${getStatusColor(overallPercentage)}`}>
                    {overallPercentage}%
                  </p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="text-green-400" size={16} />
                    <span className="text-green-400 text-sm ml-1">+2.5%</span>
                  </div>
                </div>
                <Activity className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={32} />
              </div>
            </div>

            <div className={`backdrop-blur-lg rounded-xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Best Subject
                  </p>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {subjectComparison.sort((a, b) => b.percentage - a.percentage)[0]?.subject.slice(0, 10)}
                  </p>
                  <p className="text-green-400 text-sm">
                    {subjectComparison.sort((a, b) => b.percentage - a.percentage)[0]?.percentage}%
                  </p>
                </div>
                <Award className="text-green-400" size={32} />
              </div>
            </div>

            <div className={`backdrop-blur-lg rounded-xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Subjects at Risk
                  </p>
                  <p className={`text-2xl font-bold ${
                    subjectComparison.filter(s => s.status === 'risk').length > 0 
                      ? 'text-red-400' 
                      : 'text-green-400'
                  }`}>
                    {subjectComparison.filter(s => s.status === 'risk').length}
                  </p>
                  <p className={`text-sm ${
                    subjectComparison.filter(s => s.status === 'risk').length > 0 
                      ? 'text-red-400' 
                      : 'text-green-400'
                  }`}>
                    Below {minPercentage}%
                  </p>
                </div>
                <AlertTriangle className={
                  subjectComparison.filter(s => s.status === 'risk').length > 0 
                    ? 'text-red-400' 
                    : 'text-green-400'
                } size={32} />
              </div>
            </div>

            <div className={`backdrop-blur-lg rounded-xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Classes This Week
                  </p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    28
                  </p>
                  <div className="flex items-center mt-1">
                    <Clock3 className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={16} />
                    <span className={`text-sm ml-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      6 today
                    </span>
                  </div>
                </div>
                <CalendarIcon className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`} size={32} />
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            
            {/* Weekly Attendance Trend */}
            <div className={`backdrop-blur-lg rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Weekly Attendance Trend
                </h3>
                <TrendingUp className={`${isDark ? 'text-green-400' : 'text-green-600'}`} size={20} />
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="week" 
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                    fontSize={12}
                  />
                  <YAxis 
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="attendance"
                    stroke={isDark ? '#3b82f6' : '#2563eb'}
                    fill={isDark ? '#3b82f6' : '#2563eb'}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Subject-wise Performance */}
            <div className={`backdrop-blur-lg rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Subject Performance
                </h3>
                <BarChart2 className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`} size={20} />
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectComparison} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    type="number" 
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                    fontSize={12}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="subject" 
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="percentage" 
                    fill={isDark ? '#8b5cf6' : '#7c3aed'}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            
            {/* Attendance Distribution Pie Chart */}
            <div className={`backdrop-blur-lg rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Attendance Distribution
                </h3>
                <PieChart className={`${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} size={20} />
              </div>
              
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={attendanceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
              
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Present ({overallStats.totalPresent})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Absent ({overallStats.totalAbsent})
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Pattern */}
            <div className={`backdrop-blur-lg rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Daily Patterns
                </h3>
                <CalendarIcon className={`${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} size={20} />
              </div>
              
              <div className="space-y-3">
                {dailyPattern.map((day, index) => (
                  <div key={day.day} className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {day.day}
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className={`w-24 h-2 bg-gray-200 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-2 rounded-full ${
                            day.attendance >= 90 ? 'bg-green-500' : 
                            day.attendance >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${day.attendance}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold w-12 ${getStatusColor(day.attendance)}`}>
                        {day.attendance}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time-based Analysis */}
            <div className={`backdrop-blur-lg rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Time Distribution
                </h3>
                <Clock3 className={`${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} size={20} />
              </div>
              
              <div className="space-y-4">
                {timeDistribution.map((period, index) => (
                  <div key={period.period} className={`p-4 rounded-lg border ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-white/30 border-gray-200/30'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {period.period}
                      </span>
                      <span className={`text-sm font-bold ${getStatusColor(period.attendance)}`}>
                        {period.attendance}%
                      </span>
                    </div>
                    <div className={`w-full h-2 bg-gray-200 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-2 rounded-full ${
                          period.attendance >= 90 ? 'bg-green-500' : 
                          period.attendance >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${period.attendance}%` }}
                      />
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {period.classes} total classes
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Comparison Line Chart */}
          <div className={`backdrop-blur-lg rounded-2xl border p-6 mb-8 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Monthly Attendance Comparison
              </h3>
              <div className="flex items-center space-x-2">
                <TrendingUp className="text-green-400" size={16} />
                <span className="text-green-400 text-sm">+5.2% from last month</span>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="month" 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke={isDark ? '#10b981' : '#059669'}
                  strokeWidth={3}
                  dot={{ fill: isDark ? '#10b981' : '#059669', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Subject Analysis Table */}
          <div className={`backdrop-blur-lg rounded-2xl border p-6 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Detailed Subject Analysis
              </h3>
              <div className="flex items-center space-x-2">
                <Filter className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`} size={16} />
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className={`px-3 py-1 rounded-lg border text-sm backdrop-blur-sm ${
                    isDark
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-white/60 border-gray-200 text-gray-800'
                  }`}
                >
                  <option value="all">All Subjects</option>
                  {subjectComparison.map(subject => (
                    <option key={subject.subject} value={subject.subject}>
                      {subject.subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className={`w-full ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <thead>
                  <tr className={`border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Subject
                    </th>
                    <th className={`text-center py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Attendance %
                    </th>
                    <th className={`text-center py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Present/Total
                    </th>
                    <th className={`text-center py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Status
                    </th>
                    <th className={`text-center py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Trend
                    </th>
                    <th className={`text-center py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Action Needed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subjectComparison
                    .filter(subject => selectedSubject === 'all' || subject.subject === selectedSubject)
                    .map((subject, index) => {
                      const canMiss = subject.percentage >= minPercentage 
                        ? Math.floor((subject.present - (minPercentage / 100) * subject.total) / (minPercentage / 100))
                        : 0;
                      const needAttend = subject.percentage < minPercentage 
                        ? Math.ceil((minPercentage / 100 * subject.total - subject.present) / (1 - minPercentage / 100))
                        : 0;

                      return (
                        <tr 
                          key={subject.subject} 
                          className={`border-b transition-colors hover:bg-white/5 ${
                            isDark ? 'border-white/10' : 'border-gray-100'
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                subject.status === 'safe' ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <span className="font-medium">{subject.subject}</span>
                            </div>
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className={`font-bold ${getStatusColor(subject.percentage)}`}>
                              {subject.percentage}%
                            </span>
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {subject.present}/{subject.total}
                            </span>
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              subject.status === 'safe'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {subject.status === 'safe' ? 'Safe' : 'At Risk'}
                            </span>
                          </td>
                          <td className="text-center py-4 px-4">
                            <div className="flex items-center justify-center">
                              {Math.random() > 0.5 ? (
                                <TrendingUp className="text-green-400" size={18} />
                              ) : (
                                <TrendingDown className="text-red-400" size={18} />
                              )}
                            </div>
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className={`text-sm font-medium ${
                              subject.status === 'safe' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {subject.status === 'safe' 
                                ? `Can miss ${canMiss}` 
                                : `Need ${needAttend} more`
                              }
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights and Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            
            {/* Key Insights */}
            <div className={`backdrop-blur-lg rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                <Target className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Key Insights
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Check className="text-green-400" size={16} />
                    <span className={`font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      Strong Performance
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-green-200' : 'text-green-600'}`}>
                    Your overall attendance is above the minimum requirement. Keep maintaining this consistency!
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="text-yellow-400" size={16} />
                    <span className={`font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      Areas to Watch
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-yellow-200' : 'text-yellow-600'}`}>
                    {subjectComparison.filter(s => s.percentage < 80 && s.percentage >= 75).length} subjects are close to the risk threshold.
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="text-blue-400" size={16} />
                    <span className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                      Best Day Pattern
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-600'}`}>
                    Saturday shows the highest attendance rate at 95%. Try to maintain this energy throughout the week.
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className={`backdrop-blur-lg rounded-2xl border p-6 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                <Zap className={`${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} size={24} />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Smart Recommendations
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/50 border-gray-200/50'}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                      <Users className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`} size={12} />
                    </div>
                    <div>
                      <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Focus on Risk Subjects
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Prioritize attendance for subjects below {minPercentage}% to avoid academic issues.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/50 border-gray-200/50'}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                      <CalendarIcon className={`${isDark ? 'text-green-400' : 'text-green-600'}`} size={12} />
                    </div>
                    <div>
                      <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Optimize Your Schedule
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Your afternoon attendance is lower. Consider scheduling important subjects in the morning.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/50 border-gray-200/50'}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <Target className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={12} />
                    </div>
                    <div>
                      <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Set Weekly Goals
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Aim for 90%+ weekly attendance to build a strong buffer for unexpected absences.
                      </p>
                    </div>
                  </div>
                </div>
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