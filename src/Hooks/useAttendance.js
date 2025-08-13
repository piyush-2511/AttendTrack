// hooks/useAttendance.js
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  // Async thunks
  fetchTodaysAttendance,
  fetchAttendanceByDateRange,
  fetchAttendanceStats,
  markAttendance,
  removeAttendance,
  bulkMarkAttendance,
  fetchTodaysSubjects,
  resetAttendanceData,
  
  // Actions
  clearError,
  setSelectedDate,
  setDateRange,
  updateTodaysAttendanceOptimistic,
  removeTodaysAttendanceOptimistic,
  resetAttendanceState,
  
  // Selectors
  selectTodaysAttendance,
  selectTodaysSubjects,
  selectAttendanceHistory,
  selectAttendanceStats,
  selectAttendanceLoading,
  selectAttendanceError,
  selectSelectedDate,
  selectDateRange,
  selectTodaysAttendanceBySubject,
  selectSubjectAttendanceStats,
  selectAttendanceStatsWithMinPercentage,
} from '../Feature/attendanceSlice';

export const useAttendance = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const todaysAttendance = useSelector(selectTodaysAttendance);
  const todaysSubjects = useSelector(selectTodaysSubjects);
  const attendanceHistory = useSelector(selectAttendanceHistory);
  const attendanceStats = useSelector(selectAttendanceStats);
  const loading = useSelector(selectAttendanceLoading);
  const error = useSelector(selectAttendanceError);
  const selectedDate = useSelector(selectSelectedDate);
  const dateRange = useSelector(selectDateRange);
  
  // Async actions
  const actions = {
    // Fetch data
    fetchTodaysAttendance: useCallback(() => {
      return dispatch(fetchTodaysAttendance());
    }, [dispatch]),
    
    fetchAttendanceByDateRange: useCallback((startDate, endDate) => {
      return dispatch(fetchAttendanceByDateRange({ startDate, endDate }));
    }, [dispatch]),
    
    fetchAttendanceStats: useCallback(() => {
      return dispatch(fetchAttendanceStats());
    }, [dispatch]),
    
    fetchTodaysSubjects: useCallback(() => {
      return dispatch(fetchTodaysSubjects());
    }, [dispatch]),
    
    // Mark attendance
    markAttendance: useCallback((subjectId, date, status) => {
      return dispatch(markAttendance({ subjectId, date, status }));
    }, [dispatch]),
    
    // Mark attendance with optimistic update
    markAttendanceOptimistic: useCallback((subjectId, date, status) => {
      // First, perform optimistic update
      dispatch(updateTodaysAttendanceOptimistic({ subjectId, status }));
      
      // Then perform actual API call
      return dispatch(markAttendance({ subjectId, date, status }));
    }, [dispatch]),
    
    // Remove attendance
    removeAttendance: useCallback((subjectId, date) => {
      return dispatch(removeAttendance({ subjectId, date }));
    }, [dispatch]),

    // Remove attendance with optimistic update
    removeAttendanceOptimistic: useCallback((subjectId, date) => {
      // First, perform optimistic update
      dispatch(removeTodaysAttendanceOptimistic({ subjectId }));
      
      // Then perform actual API call
      return dispatch(removeAttendance({ subjectId, date }));
    }, [dispatch]),
    
    // Bulk mark attendance
    bulkMarkAttendance: useCallback((attendanceRecords) => {
      return dispatch(bulkMarkAttendance(attendanceRecords));
    }, [dispatch]),
    
    // Reset data
    resetAttendanceData: useCallback(() => {
      return dispatch(resetAttendanceData());
    }, [dispatch]),
    
    // Sync actions
    clearError: useCallback((errorType) => {
      dispatch(clearError(errorType));
    }, [dispatch]),
    
    clearAllErrors: useCallback(() => {
      dispatch(clearError());
    }, [dispatch]),
    
    setSelectedDate: useCallback((date) => {
      dispatch(setSelectedDate(date));
    }, [dispatch]),
    
    setDateRange: useCallback((startDate, endDate) => {
      dispatch(setDateRange({ startDate, endDate }));
    }, [dispatch]),
    
    resetState: useCallback(() => {
      dispatch(resetAttendanceState());
    }, [dispatch]),
  };
  
  // Helper functions
  const helpers = {
    // Get attendance for specific subject
    getSubjectAttendance: useCallback((subjectId) => {
      return useSelector(state => selectTodaysAttendanceBySubject(state, subjectId));
    }, []),
    
    // Get stats for specific subject
    getSubjectStats: useCallback((subjectId) => {
      return useSelector(state => selectSubjectAttendanceStats(state, subjectId));
    }, []),
    
    // Get stats with risk analysis
    getStatsWithRiskAnalysis: useCallback((minPercentage = 75) => {
      return useSelector(state => selectAttendanceStatsWithMinPercentage(state, minPercentage));
    }, []),
    
    // Check if subject is marked for today
    isSubjectMarked: useCallback((subjectId) => {
      return todaysAttendance.some(attendance => attendance.subject_id === subjectId);
    }, [todaysAttendance]),
    
    // Get attendance status for subject
    getSubjectStatus: useCallback((subjectId) => {
      const attendance = todaysAttendance.find(attendance => attendance.subject_id === subjectId);
      return attendance?.status || null;
    }, [todaysAttendance]),
    
    // Check if any operation is loading
    isAnyLoading: useCallback(() => {
      return Object.values(loading).some(isLoading => isLoading);
    }, [loading]),
    
    // Check if any error exists
    hasAnyError: useCallback(() => {
      return Object.values(error).some(err => err !== null);
    }, [error]),
    
    // Get all subjects that need attendance (not marked yet)
    getUnmarkedSubjects: useCallback(() => {
      const markedSubjectIds = new Set(todaysAttendance.map(att => att.subject_id));
      return todaysSubjects.filter(subject => !markedSubjectIds.has(subject.id));
    }, [todaysSubjects, todaysAttendance]),
    
    // Get subjects at risk (below minimum percentage)
    getSubjectsAtRisk: useCallback((minPercentage = 75) => {
      return attendanceStats.filter(stats => stats.attendance_percentage < minPercentage);
    }, [attendanceStats]),
    
    // Calculate overall attendance percentage
    getOverallAttendancePercentage: useCallback(() => {
      if (attendanceStats.length === 0) return 0;
      
      const totalPresent = attendanceStats.reduce((sum, stats) => sum + stats.present_days, 0);
      const totalClasses = attendanceStats.reduce((sum, stats) => sum + stats.present_days + stats.absent_days, 0);
      
      return totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;
    }, [attendanceStats]),
  };
  
  // Composite actions that combine multiple operations
  const compositeActions = {
    // Initialize dashboard data
    initializeDashboard: useCallback(async () => {
      try {
        await Promise.all([
          actions.fetchTodaysSubjects(),
          actions.fetchTodaysAttendance(),
          actions.fetchAttendanceStats(),
        ]);
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
      }
    }, [actions]),
    
    // Refresh all data
    refreshAll: useCallback(async () => {
      try {
        await Promise.all([
          actions.fetchTodaysAttendance(),
          actions.fetchAttendanceStats(),
          actions.fetchTodaysSubjects(),
        ]);
      } catch (error) {
        console.error('Failed to refresh data:', error);
      }
    }, [actions]),
    
    // Mark attendance and refresh related data
    markAttendanceAndRefresh: useCallback(async (subjectId, date, status) => {
      try {
        await actions.markAttendance(subjectId, date, status);
        // Stats are automatically refreshed by the thunk
      } catch (error) {
        console.error('Failed to mark attendance:', error);
        throw error;
      }
    }, [actions]),
    
    // Quick mark all present
    markAllPresent: useCallback(async (date = null) => {
      const targetDate = date || selectedDate;
      const unmarkedSubjects = helpers.getUnmarkedSubjects();
      
      if (unmarkedSubjects.length === 0) return;
      
      const attendanceRecords = unmarkedSubjects.map(subject => ({
        subjectId: subject.id,
        date: targetDate,
        status: 'present'
      }));
      
      try {
        await actions.bulkMarkAttendance(attendanceRecords);
      } catch (error) {
        console.error('Failed to mark all present:', error);
        throw error;
      }
    }, [actions, helpers, selectedDate]),
    
    // Quick mark all absent
    markAllAbsent: useCallback(async (date = null) => {
      const targetDate = date || selectedDate;
      const unmarkedSubjects = helpers.getUnmarkedSubjects();
      
      if (unmarkedSubjects.length === 0) return;
      
      const attendanceRecords = unmarkedSubjects.map(subject => ({
        subjectId: subject.id,
        date: targetDate,
        status: 'absent'
      }));
      
      try {
        await actions.bulkMarkAttendance(attendanceRecords);
      } catch (error) {
        console.error('Failed to mark all absent:', error);
        throw error;
      }
    }, [actions, helpers, selectedDate]),
  };
  
  return {
    // State
    data: {
      todaysAttendance,
      todaysSubjects,
      attendanceHistory,
      attendanceStats,
      selectedDate,
      dateRange,
    },
    
    // Loading states
    loading,
    
    // Error states
    error,
    
    // Actions
    actions: {
      ...actions,
      ...compositeActions,
    },
    
    // Helper functions
    helpers,
    
    // Computed values
    computed: {
      isAnyLoading: helpers.isAnyLoading(),
      hasAnyError: helpers.hasAnyError(),
      unmarkedSubjects: helpers.getUnmarkedSubjects(),
      overallAttendancePercentage: helpers.getOverallAttendancePercentage(),
      subjectsAtRisk: helpers.getSubjectsAtRisk(),
    },
  };
};

export default useAttendance;