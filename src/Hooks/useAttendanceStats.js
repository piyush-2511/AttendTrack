import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useMemo } from 'react'
import {
  // Async thunks
  fetchUserAttendance,
  fetchUserSummary,
  fetchUserAndSubjectAttendance,
  fetchSubjectAttendance,
  fetchProfessorAttendance,
  fetchAllSubjects,
  fetchAllProfessors,
  fetchSubjectWiseStats,
  fetchProfessorWiseStats,
  fetchLowAttendanceUsers,
  fetchHighAttendanceUsers,
  searchAttendanceRecords,
  fetchAttendanceByPercentageRange,
  
  // Actions
  clearUserAttendance,
  clearUserSummary,
  clearSubjectAttendance,
  clearProfessorAttendance,
  clearSearchResults,
  clearFilteredAttendance,
  clearAllErrors,
  setAttendanceThreshold,
  setSelectedSubject,
  setSelectedProfessor,
  setPercentageRange,
  resetFilters,
  resetAttendanceStats,
  
  // Selectors
  selectUserAttendance,
  selectCurrentUserSummary,
  selectSubjectAttendance,
  selectProfessorAttendance,
  selectAllSubjects,
  selectAllProfessors,
  selectSubjectWiseStats,
  selectProfessorWiseStats,
  selectLowAttendanceUsers,
  selectHighAttendanceUsers,
  selectSearchResults,
  selectFilteredAttendance,
  selectLoading,
  selectErrors,
  selectFilters,
  selectIsLoading,
  selectHasErrors
} from '../slices/attendanceStatsSlice'

export const useAttendanceStats = () => {
  const dispatch = useDispatch()

  // Selectors
  const userAttendance = useSelector(selectUserAttendance)
  const currentUserSummary = useSelector(selectCurrentUserSummary)
  const subjectAttendance = useSelector(selectSubjectAttendance)
  const professorAttendance = useSelector(selectProfessorAttendance)
  const allSubjects = useSelector(selectAllSubjects)
  const allProfessors = useSelector(selectAllProfessors)
  const subjectWiseStats = useSelector(selectSubjectWiseStats)
  const professorWiseStats = useSelector(selectProfessorWiseStats)
  const lowAttendanceUsers = useSelector(selectLowAttendanceUsers)
  const highAttendanceUsers = useSelector(selectHighAttendanceUsers)
  const searchResults = useSelector(selectSearchResults)
  const filteredAttendance = useSelector(selectFilteredAttendance)
  const loading = useSelector(selectLoading)
  const errors = useSelector(selectErrors)
  const filters = useSelector(selectFilters)
  const isLoading = useSelector(selectIsLoading)
  const hasErrors = useSelector(selectHasErrors)

  // API Actions - wrapped in useCallback for performance
  const getUserAttendance = useCallback((userId) => {
    return dispatch(fetchUserAttendance(userId))
  }, [dispatch])

  const getUserSummary = useCallback((userId) => {
    return dispatch(fetchUserSummary(userId))
  }, [dispatch])

  const getUserAndSubjectAttendance = useCallback((userId, subjectId) => {
    return dispatch(fetchUserAndSubjectAttendance({ userId, subjectId }))
  }, [dispatch])

  const getSubjectAttendance = useCallback((subjectId) => {
    return dispatch(fetchSubjectAttendance(subjectId))
  }, [dispatch])

  const getProfessorAttendance = useCallback((professorName) => {
    return dispatch(fetchProfessorAttendance(professorName))
  }, [dispatch])

  const getAllSubjectsData = useCallback(() => {
    return dispatch(fetchAllSubjects())
  }, [dispatch])

  const getAllProfessorsData = useCallback(() => {
    return dispatch(fetchAllProfessors())
  }, [dispatch])

  const getSubjectWiseStats = useCallback(() => {
    return dispatch(fetchSubjectWiseStats())
  }, [dispatch])

  const getProfessorWiseStats = useCallback(() => {
    return dispatch(fetchProfessorWiseStats())
  }, [dispatch])

  const getLowAttendanceUsers = useCallback((threshold = 75, subjectId = null) => {
    return dispatch(fetchLowAttendanceUsers({ threshold, subjectId }))
  }, [dispatch])

  const getHighAttendanceUsers = useCallback((threshold = 90, subjectId = null) => {
    return dispatch(fetchHighAttendanceUsers({ threshold, subjectId }))
  }, [dispatch])

  const searchAttendance = useCallback((searchTerm) => {
    return dispatch(searchAttendanceRecords(searchTerm))
  }, [dispatch])

  const getAttendanceByRange = useCallback((minPercentage, maxPercentage, subjectId = null) => {
    return dispatch(fetchAttendanceByPercentageRange({ minPercentage, maxPercentage, subjectId }))
  }, [dispatch])

  // Clear Actions
  const clearUserData = useCallback(() => {
    dispatch(clearUserAttendance())
  }, [dispatch])

  const clearUserSummaryData = useCallback(() => {
    dispatch(clearUserSummary())
  }, [dispatch])

  const clearSubjectData = useCallback(() => {
    dispatch(clearSubjectAttendance())
  }, [dispatch])

  const clearProfessorData = useCallback(() => {
    dispatch(clearProfessorAttendance())
  }, [dispatch])

  const clearSearch = useCallback(() => {
    dispatch(clearSearchResults())
  }, [dispatch])

  const clearFiltered = useCallback(() => {
    dispatch(clearFilteredAttendance())
  }, [dispatch])

  const clearErrors = useCallback(() => {
    dispatch(clearAllErrors())
  }, [dispatch])

  // Filter Actions
  const updateAttendanceThreshold = useCallback((threshold) => {
    dispatch(setAttendanceThreshold(threshold))
  }, [dispatch])

  const updateSelectedSubject = useCallback((subjectId) => {
    dispatch(setSelectedSubject(subjectId))
  }, [dispatch])

  const updateSelectedProfessor = useCallback((professorName) => {
    dispatch(setSelectedProfessor(professorName))
  }, [dispatch])

  const updatePercentageRange = useCallback((range) => {
    dispatch(setPercentageRange(range))
  }, [dispatch])

  const clearFilters = useCallback(() => {
    dispatch(resetFilters())
  }, [dispatch])

  const resetAllData = useCallback(() => {
    dispatch(resetAttendanceStats())
  }, [dispatch])

  // Computed/Derived State
  const computedStats = useMemo(() => {
    const hasUserSummary = !!currentUserSummary
    const hasUserAttendance = userAttendance.length > 0
    const hasSubjects = allSubjects.length > 0
    const hasProfessors = allProfessors.length > 0

    // Get attendance status for current user
    const getAttendanceStatus = (percentage) => {
      if (percentage >= 90) return 'excellent'
      if (percentage >= 80) return 'good'
      if (percentage >= 75) return 'average'
      if (percentage >= 60) return 'poor'
      return 'critical'
    }

    // Get color code for attendance percentage
    const getAttendanceColor = (percentage) => {
      if (percentage >= 90) return 'green'
      if (percentage >= 80) return 'blue'
      if (percentage >= 75) return 'yellow'
      if (percentage >= 60) return 'orange'
      return 'red'
    }

    // Get subjects below threshold
    const subjectsBelowThreshold = userAttendance.filter(
      subject => subject.attendance_percentage < filters.attendanceThreshold
    )

    // Get subjects above 90%
    const excellentSubjects = userAttendance.filter(
      subject => subject.attendance_percentage >= 90
    )

    return {
      hasUserSummary,
      hasUserAttendance,
      hasSubjects,
      hasProfessors,
      getAttendanceStatus,
      getAttendanceColor,
      subjectsBelowThreshold,
      excellentSubjects,
      criticalSubjects: userAttendance.filter(s => s.attendance_percentage < 60),
      totalSubjects: userAttendance.length,
      averageAttendance: hasUserAttendance 
        ? Math.round(userAttendance.reduce((sum, s) => sum + s.attendance_percentage, 0) / userAttendance.length * 100) / 100
        : 0
    }
  }, [currentUserSummary, userAttendance, allSubjects, allProfessors, filters.attendanceThreshold])

  // Utility Functions
  const utils = useMemo(() => ({
    // Check if specific data is loading
    isUserDataLoading: loading.userAttendance || loading.userSummary,
    isAnalyticsLoading: loading.subjectStats || loading.professorStats,
    isSearchLoading: loading.search,
    isFilterLoading: loading.filtered,

    // Check for specific errors
    hasUserError: errors.userAttendance || errors.userSummary,
    hasAnalyticsError: errors.subjectStats || errors.professorStats,
    hasSearchError: errors.search,
    hasFilterError: errors.filtered,

    // Get subject by ID
    getSubjectById: (subjectId) => allSubjects.find(s => s.subject_id === subjectId),
    
    // Get professor subjects
    getProfessorSubjects: (professorName) => 
      allSubjects.filter(s => s.professor_name === professorName),

    // Format attendance percentage
    formatPercentage: (percentage) => `${percentage?.toFixed(1) || 0}%`,

    // Get attendance trend (requires historical data - placeholder)
    getAttendanceTrend: (currentPercentage, previousPercentage) => {
      if (!previousPercentage) return 'neutral'
      if (currentPercentage > previousPercentage) return 'up'
      if (currentPercentage < previousPercentage) return 'down'
      return 'stable'
    },

    // Filter user attendance by criteria
    filterUserAttendance: (criteria) => {
      return userAttendance.filter(attendance => {
        if (criteria.minPercentage && attendance.attendance_percentage < criteria.minPercentage) return false
        if (criteria.maxPercentage && attendance.attendance_percentage > criteria.maxPercentage) return false
        if (criteria.subjectName && !attendance.subject_name.toLowerCase().includes(criteria.subjectName.toLowerCase())) return false
        if (criteria.professorName && !attendance.professor_name.toLowerCase().includes(criteria.professorName.toLowerCase())) return false
        return true
      })
    }
  }), [loading, errors, allSubjects, userAttendance])

  // Bulk Operations
  const bulkOperations = useMemo(() => ({
    // Load all initial data for a user
    loadUserDashboard: async (userId) => {
      const promises = [
        dispatch(fetchUserAttendance(userId)),
        dispatch(fetchUserSummary(userId)),
        dispatch(fetchAllSubjects()),
        dispatch(fetchAllProfessors())
      ]
      return Promise.allSettled(promises)
    },

    // Load analytics dashboard
    loadAnalyticsDashboard: async () => {
      const promises = [
        dispatch(fetchSubjectWiseStats()),
        dispatch(fetchProfessorWiseStats()),
        dispatch(fetchLowAttendanceUsers({ threshold: 75 })),
        dispatch(fetchHighAttendanceUsers({ threshold: 90 }))
      ]
      return Promise.allSettled(promises)
    },

    // Load subject details
    loadSubjectDetails: async (subjectId) => {
      const promises = [
        dispatch(fetchSubjectAttendance(subjectId)),
        dispatch(fetchLowAttendanceUsers({ threshold: 75, subjectId }))
      ]
      return Promise.allSettled(promises)
    },

    // Clear all data except subjects and professors (keep reference data)
    clearAllExceptReference: () => {
      dispatch(clearUserAttendance())
      dispatch(clearUserSummary())
      dispatch(clearSubjectAttendance())
      dispatch(clearProfessorAttendance())
      dispatch(clearSearchResults())
      dispatch(clearFilteredAttendance())
    }
  }), [dispatch])

  return {
    // State
    data: {
      userAttendance,
      currentUserSummary,
      subjectAttendance,
      professorAttendance,
      allSubjects,
      allProfessors,
      subjectWiseStats,
      professorWiseStats,
      lowAttendanceUsers,
      highAttendanceUsers,
      searchResults,
      filteredAttendance
    },

    // UI State
    loading,
    errors,
    filters,
    isLoading,
    hasErrors,

    // Computed Stats
    stats: computedStats,

    // API Actions
    actions: {
      getUserAttendance,
      getUserSummary,
      getUserAndSubjectAttendance,
      getSubjectAttendance,
      getProfessorAttendance,
      getAllSubjectsData,
      getAllProfessorsData,
      getSubjectWiseStats,
      getProfessorWiseStats,
      getLowAttendanceUsers,
      getHighAttendanceUsers,
      searchAttendance,
      getAttendanceByRange
    },

    // Clear Actions
    clear: {
      clearUserData,
      clearUserSummaryData,
      clearSubjectData,
      clearProfessorData,
      clearSearch,
      clearFiltered,
      clearErrors,
      resetAllData
    },

    // Filter Actions
    filters: {
      updateAttendanceThreshold,
      updateSelectedSubject,
      updateSelectedProfessor,
      updatePercentageRange,
      clearFilters
    },

    // Utils
    utils,

    // Bulk Operations
    bulk: bulkOperations
  }
}

export default useAttendanceStats