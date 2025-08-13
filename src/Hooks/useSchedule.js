// hooks/useSchedule.js
import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useMemo, useEffect } from 'react'
import {
  // Async thunks
  fetchTodaysSchedule,
  fetchWeeklySchedule,
  fetchScheduleByDay,
  setScheduleForDay,
  addSubjectToDay,
  removeSubjectFromDay,
  setWeeklySchedule,
  fetchTodaysSubjects,
  fetchSubjectsForDay,
  deleteScheduleForDay,
  resetScheduleData,
  getSubjectIdByName,
  // Actions
  clearError,
  setSelectedDay,
  toggleScheduleModal,
  addSubjectToDayOptimistic,
  removeSubjectFromDayOptimistic,
  calculateScheduleStats,
  resetScheduleState,
  // Selectors
  selectTodaysSchedule,
  selectWeeklySchedule,
  selectScheduleByDay,
  selectTodaysSubjects,
  selectSubjectsByDay,
  selectScheduleLoading,
  selectScheduleError,
  selectSelectedDay,
  selectIsScheduleModalOpen,
  selectScheduleStats,
  selectScheduleForDay,
  selectSubjectsForDay,
  selectHasScheduleForDay,
  selectTotalScheduledDays,
  selectAllUniqueSubjects,
  selectDaysWithSubject,
  selectIsScheduleEmpty,
  selectWeeklyScheduleForUI
} from '../Feature/scheduleSlice' // Adjust path as needed

export const useSchedule = () => {
  const dispatch = useDispatch()

  // console.log('Use Schedule')

  // State selectors
  const todaysSchedule = useSelector(selectTodaysSchedule)
  const weeklySchedule = useSelector(selectWeeklySchedule)
  const scheduleByDay = useSelector(selectScheduleByDay)
  const todaysSubjects = useSelector(selectTodaysSubjects)
  const subjectsByDay = useSelector(selectSubjectsByDay)
  const loading = useSelector(selectScheduleLoading)
  const error = useSelector(selectScheduleError)
  const selectedDay = useSelector(selectSelectedDay)
  const isScheduleModalOpen = useSelector(selectIsScheduleModalOpen)
  const scheduleStats = useSelector(selectScheduleStats)
  const totalScheduledDays = useSelector(selectTotalScheduledDays)
  const allUniqueSubjects = useSelector(selectAllUniqueSubjects)
  const isScheduleEmpty = useSelector(selectIsScheduleEmpty)
  const weeklyScheduleForUI = useSelector(selectWeeklyScheduleForUI)

  // Action dispatchers
  const actions = useMemo(() => ({
    // Fetch operations
    fetchTodaysSchedule: () => dispatch(fetchTodaysSchedule()),
    fetchWeeklySchedule: () => dispatch(fetchWeeklySchedule()),
    fetchScheduleByDay: (day) => dispatch(fetchScheduleByDay(day)),
    fetchTodaysSubjects: () => dispatch(fetchTodaysSubjects()),
    fetchSubjectsForDay: (day) => dispatch(fetchSubjectsForDay(day)),

    // Set/Update operations
    setScheduleForDay: (day, subjectList) => 
      dispatch(setScheduleForDay({ day, subjectList })),
    setWeeklySchedule: (weeklyScheduleData) => 
      dispatch(setWeeklySchedule(weeklyScheduleData)),

    // Add/Remove operations
    addSubjectToDay: (day, subjectName) => 
      dispatch(addSubjectToDay({ day, subjectName })),
    removeSubjectFromDay: (day, subjectName) => 
      dispatch(removeSubjectFromDay({ day, subjectName })),

    // Delete operations
    deleteScheduleForDay: (day) => dispatch(deleteScheduleForDay(day)),
    resetScheduleData: () => dispatch(resetScheduleData()),

    // UI actions
    clearError: (errorType) => dispatch(clearError(errorType)),
    setSelectedDay: (day) => dispatch(setSelectedDay(day)),
    toggleScheduleModal: (isOpen) => dispatch(toggleScheduleModal(isOpen)),
    calculateScheduleStats: () => dispatch(calculateScheduleStats()),
    resetScheduleState: () => dispatch(resetScheduleState()),

    // Optimistic actions
    addSubjectToDayOptimistic: (day, subjectName) => 
      dispatch(addSubjectToDayOptimistic({ day, subjectName })),
    removeSubjectFromDayOptimistic: (day, subjectName) => 
      dispatch(removeSubjectFromDayOptimistic({ day, subjectName }))
  }), [dispatch])

  // Dynamic selectors with parameters
  const selectors = useMemo(() => ({
    getScheduleForDay: (day) => {
      // Fixed: Don't use useSelector inside functions, use state data directly
      return scheduleByDay[day] || null
    },
    getSubjectsForDay: (day) => {
      return subjectsByDay[day] || []
    },
    hasScheduleForDay: (day) => {
      return !!(scheduleByDay[day] && (subjectsByDay[day] || []).length > 0)
    },
    getDaysWithSubject: (subjectName) => {
      const days = []
      Object.entries(subjectsByDay).forEach(([day, subjects]) => {
        if (subjects.includes(subjectName)) {
          days.push(parseInt(day))
        }
      })
      return days
    }
  }), [scheduleByDay, subjectsByDay])

  // Loading states
  const loadingStates = useMemo(() => ({
    isTodaysScheduleLoading: loading.todaysSchedule,
    isWeeklyScheduleLoading: loading.weeklySchedule,
    isScheduleByDayLoading: loading.scheduleByDay,
    isSettingSchedule: loading.settingSchedule,
    isAddingSubject: loading.addingSubject,
    isRemovingSubject: loading.removingSubject,
    isSettingWeekly: loading.settingWeekly,
    isTodaysSubjectsLoading: loading.todaysSubjects,
    isSubjectsForDayLoading: loading.subjectsForDay,
    isDeletingDay: loading.deletingDay,
    isResetting: loading.resetting,
    isAnyLoading: Object.values(loading).some(Boolean)
  }), [loading])

  // Error states
  const errorStates = useMemo(() => ({
    todaysScheduleError: error.todaysSchedule,
    weeklyScheduleError: error.weeklySchedule,
    scheduleByDayError: error.scheduleByDay,
    settingScheduleError: error.settingSchedule,
    addingSubjectError: error.addingSubject,
    removingSubjectError: error.removingSubject,
    settingWeeklyError: error.settingWeekly,
    todaysSubjectsError: error.todaysSubjects,
    subjectsForDayError: error.subjectsForDay,
    deletingDayError: error.deletingDay,
    resettingError: error.resetting,
    hasAnyError: Object.values(error).some(Boolean),
    allErrors: error
  }), [error])

  // Utility functions
  const utils = useMemo(() => ({
    // Get day name from day number
    getDayName: (day) => {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return dayNames[day] || 'Invalid Day'
    },

    // Get current day number
    getCurrentDay: () => new Date().getDay(),

    // Check if a day is today
    isToday: (day) => day === new Date().getDay(),

    // Get subjects count for a specific day
    getSubjectsCountForDay: (day) => {
      const subjects = subjectsByDay[day] || []
      return subjects.length
    },

    // Get total subjects across all days
    getTotalSubjectsCount: () => {
      return Object.values(subjectsByDay).reduce((total, subjects) => total + subjects.length, 0)
    },

    // Check if subject exists on a specific day
    hasSubjectOnDay: (day, subjectName) => {
      const subjects = subjectsByDay[day] || []
      return subjects.includes(subjectName)
    },

    // Get next scheduled day
    getNextScheduledDay: () => {
      const currentDay = new Date().getDay()
      for (let i = 1; i <= 7; i++) {
        const nextDay = (currentDay + i) % 7
        if (scheduleByDay[nextDay] && (subjectsByDay[nextDay] || []).length > 0) {
          return nextDay
        }
      }
      return null
    },

    // Get previous scheduled day
    getPreviousScheduledDay: () => {
      const currentDay = new Date().getDay()
      for (let i = 1; i <= 7; i++) {
        const prevDay = (currentDay - i + 7) % 7
        if (scheduleByDay[prevDay] && (subjectsByDay[prevDay] || []).length > 0) {
          return prevDay
        }
      }
      return null
    },

    // Get schedule completeness percentage
    getScheduleCompleteness: () => {
      const scheduledDays = Object.keys(scheduleByDay).filter(day => 
        scheduleByDay[day] && (subjectsByDay[day] || []).length > 0
      ).length
      return Math.round((scheduledDays / 7) * 100)
    },

    // Get most frequent subject
    getMostFrequentSubject: () => {
      const subjectCount = {}
      Object.values(subjectsByDay).forEach(subjects => {
        subjects.forEach(subject => {
          subjectCount[subject] = (subjectCount[subject] || 0) + 1
        })
      })
      
      let maxCount = 0
      let mostFrequent = null
      Object.entries(subjectCount).forEach(([subject, count]) => {
        if (count > maxCount) {
          maxCount = count
          mostFrequent = subject
        }
      })
      
      return { subject: mostFrequent, count: maxCount }
    },

    // Validate schedule data
    validateScheduleData: (day, subjectlist) => {
      const errors = []
      
      if (day < 0 || day > 6) {
        errors.push('Invalid day number')
      }
      
      if (!Array.isArray(subjectlist)) {
        errors.push('Subject list must be an array')
      } else {
        const invalidSubjects = subjectlist.filter(subject => 
          !subject || typeof subject !== 'string' || subject.trim().length === 0
        )
        if (invalidSubjects.length > 0) {
          errors.push('All subjects must be non-empty strings')
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors
      }
    }
  }), [scheduleByDay, subjectsByDay])

  // Safe methods with error handling
  const safeMethods = useMemo(() => ({
    // Safe fetch today's schedule
    safeFetchTodaysSchedule: async () => {
      console.log('safeFetchTodaysSchedule function hit')
      try {
        return await dispatch(fetchTodaysSchedule()).unwrap()
      } catch (error) {
        console.error('Error fetching today\'s schedule:', error)
        throw error
      }
    },

    // Safe fetch weekly schedule
    safeFetchWeeklySchedule: async () => {
      try {
        return await dispatch(fetchWeeklySchedule()).unwrap()
      } catch (error) {
        console.error('Error fetching weekly schedule:', error)
        throw error
      }
    },

    // Safe set schedule for day with validation
    safeSetScheduleForDay: async (day, subjectlist) => {
      try {
        const validation = utils.validateScheduleData(day, subjectlist)
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '))
        }
        return await dispatch(setScheduleForDay({ day, subjectlist })).unwrap()
      } catch (error) {
        console.error('Error setting schedule for day:', error)
        throw error
      }
    },

    // Safe add subject with validation
    safeAddSubjectToDay: async (day, subjectName, useOptimistic = false) => {
      try {
        if (!subjectName || typeof subjectName !== 'string' || subjectName.trim().length === 0) {
          throw new Error('Subject name is required')
        }
        
        if (day < 0 || day > 6) {
          throw new Error('Invalid day number')
        }

        // Check if subject already exists
        if (utils.hasSubjectOnDay(day, subjectName)) {
          throw new Error('Subject already exists on this day')
        }

        // Optimistic update
        if (useOptimistic) {
          dispatch(addSubjectToDayOptimistic({ day, subjectName }))
        }

        return await dispatch(addSubjectToDay({ day, subjectName })).unwrap()
      } catch (error) {
        console.error('Error adding subject to day:', error)
        throw error
      }
    },

    // Safe remove subject
    safeRemoveSubjectFromDay: async (day, subjectName, useOptimistic = false) => {
      try {
        if (!subjectName || typeof subjectName !== 'string') {
          throw new Error('Subject name is required')
        }
        
        if (day < 0 || day > 6) {
          throw new Error('Invalid day number')
        }

        // Check if subject exists
        if (!utils.hasSubjectOnDay(day, subjectName)) {
          throw new Error('Subject does not exist on this day')
        }

        // Optimistic update
        if (useOptimistic) {
          dispatch(removeSubjectFromDayOptimistic({ day, subjectName }))
        }

        return await dispatch(removeSubjectFromDay({ day, subjectName })).unwrap()
      } catch (error) {
        console.error('Error removing subject from day:', error)
        throw error
      }
    },

    // Safe delete schedule for day with confirmation
    safeDeleteScheduleForDay: async (day, confirmCallback) => {
      try {
        if (day < 0 || day > 6) {
          throw new Error('Invalid day number')
        }

        if (confirmCallback && !confirmCallback()) {
          return null // User cancelled
        }

        return await dispatch(deleteScheduleForDay(day)).unwrap()
      } catch (error) {
        console.error('Error deleting schedule for day:', error)
        throw error
      }
    },
    safeGetSubjectIdByName: async (subjectName) => {
      try {
        if (!subjectName || typeof subjectName !== 'string') {
          throw new Error('Subject name is required')
        }
        return await dispatch(getSubjectIdByName(subjectName)).unwrap()
      } catch (error) {
        console.error('Error getting subject ID:', error)
        throw error
      }
    },

    // Safe reset with confirmation
    safeResetScheduleData: async (confirmCallback) => {
      try {
        if (confirmCallback && !confirmCallback()) {
          return null // User cancelled
        }

        return await dispatch(resetScheduleData()).unwrap()
      } catch (error) {
        console.error('Error resetting schedule data:', error)
        throw error
      }
    }
  }), [dispatch, utils])

  // Convenience methods
  const convenience = useMemo(() => ({
    // Initialize schedule (fetch all necessary data)
    initializeSchedule: async () => {
      console.log('Initialize Schedule function hit')
      try {
        await Promise.all([
          dispatch(fetchWeeklySchedule()),
          dispatch(fetchTodaysSchedule())
        ])
      } catch (error) {
        console.error('Error initializing schedule:', error)
        throw error
      }
    },

    // Refresh all schedule data
    refreshAllScheduleData: async () => {
      try {
        await Promise.all([
          dispatch(fetchWeeklySchedule()),
          dispatch(fetchTodaysSchedule()),
          dispatch(fetchTodaysSubjects())
        ])
      } catch (error) {
        console.error('Error refreshing schedule data:', error)
        throw error
      }
    },

    // Clear all errors
    clearAllErrors: () => {
      dispatch(clearError())
    },

    // Open schedule modal for specific day
    openScheduleModalForDay: (day) => {
      dispatch(setSelectedDay(day))
      dispatch(toggleScheduleModal(true))
    },

    // Close schedule modal
    closeScheduleModal: () => {
      dispatch(toggleScheduleModal(false))
    },

    // Quick add subject to today
    addSubjectToToday: (subjectName) => {
      const today = utils.getCurrentDay()
      return actions.addSubjectToDay(today, subjectName)
    },

    // Quick remove subject from today
    removeSubjectFromToday: (subjectName) => {
      const today = utils.getCurrentDay()
      return actions.removeSubjectFromDay(today, subjectName)
    }
  }), [dispatch, actions, utils])

  // Computed values
  const computed = useMemo(() => ({
    currentDay: utils.getCurrentDay(),
    scheduleCompleteness: utils.getScheduleCompleteness(),
    totalSubjectsCount: utils.getTotalSubjectsCount(),
    mostFrequentSubject: utils.getMostFrequentSubject(),
    nextScheduledDay: utils.getNextScheduledDay(),
    previousScheduledDay: utils.getPreviousScheduledDay(),
    todaysSubjectsCount: utils.getSubjectsCountForDay(utils.getCurrentDay()),
    hasTodaysSchedule: utils.getSubjectsCountForDay(utils.getCurrentDay()) > 0
  }), [utils])

  return {
    // State
    todaysSchedule,
    weeklySchedule,
    scheduleByDay,
    todaysSubjects,
    subjectsByDay,
    selectedDay,
    isScheduleModalOpen,
    scheduleStats,
    totalScheduledDays,
    allUniqueSubjects,
    isScheduleEmpty,
    weeklyScheduleForUI,

    // Loading states
    ...loadingStates,

    // Error states
    ...errorStates,

    // Actions
    ...actions,

    // Selectors
    ...selectors,

    // Utils
    ...utils,

    // Safe methods
    ...safeMethods,

    // Convenience methods
    ...convenience,

    // Computed values
    computed
  }
}

// Hook for today's schedule specifically
export const useTodaysSchedule = () => {
  const dispatch = useDispatch()
  const todaysSchedule = useSelector(selectTodaysSchedule)
  const todaysSubjects = useSelector(selectTodaysSubjects)
  const loading = useSelector(state => state.schedule.loading.todaysSchedule)
  const error = useSelector(state => state.schedule.error.todaysSchedule)

  const fetchTodaysData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchTodaysSchedule()),
        dispatch(fetchTodaysSubjects())
      ])
    } catch (error) {
      console.error('Error fetching today\'s data:', error)
      throw error
    }
  }, [dispatch])

  return {
    todaysSchedule,
    todaysSubjects,
    loading,
    error,
    fetchTodaysData,
    refetch: fetchTodaysData,
    hasTodaysSchedule: !!todaysSchedule,
    todaysSubjectCount: todaysSubjects.length
  }
}

// Hook for specific day schedule
export const useDaySchedule = (day, autoFetch = true) => {
  const dispatch = useDispatch()
  const scheduleForDay = useSelector(state => selectScheduleForDay(state, day))
  const subjectsForDay = useSelector(state => selectSubjectsForDay(state, day))
  const hasSchedule = useSelector(state => selectHasScheduleForDay(state, day))
  const loading = useSelector(state => state.schedule.loading.scheduleByDay)
  const error = useSelector(state => state.schedule.error.scheduleByDay)

  const fetchDaySchedule = useCallback(() => {
    if (day >= 0 && day <= 6) {
      dispatch(fetchScheduleByDay(day))
    }
  }, [dispatch, day])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && day >= 0 && day <= 6) {
      fetchDaySchedule()
    }
  }, [fetchDaySchedule, autoFetch, day])

  return {
    scheduleForDay,
    subjectsForDay,
    hasSchedule,
    loading,
    error,
    fetchDaySchedule,
    refetch: fetchDaySchedule,
    subjectCount: subjectsForDay.length,
    dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day] || 'Invalid Day'
  }
}