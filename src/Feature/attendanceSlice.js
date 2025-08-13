// attendanceSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceService } from '../supabase/attendanceService';

// Async thunks
export const fetchTodaysAttendance = createAsyncThunk(
  'attendance/fetchTodaysAttendance',
  async (_, { rejectWithValue }) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await attendanceService.getAttendanceByDate(today);
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAttendanceByDateRange = createAsyncThunk(
  'attendance/fetchAttendanceByDateRange',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const result = await attendanceService.getAttendanceByDateRange(startDate, endDate);
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAttendanceStats = createAsyncThunk(
  'attendance/fetchAttendanceStats',
  async (_, { rejectWithValue }) => {
    try {
      const result = await attendanceService.getAttendanceStats();
      console.log(result)
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAttendance = createAsyncThunk(
  'attendance/markAttendance',
  async ({ subjectId, date, status }, { rejectWithValue, dispatch }) => {
    try {
      const result = await attendanceService.markAttendance(subjectId, date, status);
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      // Refresh stats after marking attendance
      dispatch(fetchAttendanceStats());
      
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeAttendance = createAsyncThunk(
  'attendance/removeAttendance',
  async ({ subjectId, date }, { rejectWithValue, dispatch }) => {
    try {
      const result = await attendanceService.removeAttendance(subjectId, date);
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      // Refresh stats and today's attendance after removal
      dispatch(fetchAttendanceStats());
      dispatch(fetchTodaysAttendance());
      
      return { subjectId, date };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const bulkMarkAttendance = createAsyncThunk(
  'attendance/bulkMarkAttendance',
  async (attendanceRecords, { rejectWithValue, dispatch }) => {
    try {
      const result = await attendanceService.bulkMarkAttendance(attendanceRecords);
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      // Refresh stats after bulk marking
      dispatch(fetchAttendanceStats());
      
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTodaysSubjects = createAsyncThunk(
  'attendance/fetchTodaysSubjects',
  async (_, { rejectWithValue }) => {
    try {
      const result = await attendanceService.getTodaysSubjects();
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetAttendanceData = createAsyncThunk(
  'attendance/resetAttendanceData',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const result = await attendanceService.resetAttendanceData();
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      // Refresh all data after reset
      dispatch(fetchAttendanceStats());
      dispatch(fetchTodaysAttendance());
      
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Today's attendance data
  todaysAttendance: [],
  todaysSubjects: [],
  
  // Historical attendance data
  attendanceHistory: [],
  
  // Statistics
  attendanceStats: [],
  
  // UI state
  loading: {
    todaysAttendance: false,
    attendanceHistory: false,
    attendanceStats: false,
    markingAttendance: false,
    todaysSubjects: false,
    resetting: false,
  },
  
  error: {
    todaysAttendance: null,
    attendanceHistory: null,
    attendanceStats: null,
    markingAttendance: null,
    todaysSubjects: null,
    resetting: null,
  },
  
  // Selected date for calendar view
  selectedDate: new Date().toISOString().split('T')[0],
  
  // Date range for filtering
  dateRange: {
    startDate: null,
    endDate: null,
  },
};

// Slice
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    // Clear errors
    clearError: (state, action) => {
      const errorType = action.payload;
      if (errorType) {
        state.error[errorType] = null;
      } else {
        // Clear all errors
        Object.keys(state.error).forEach(key => {
          state.error[key] = null;
        });
      }
    },
    
    // Set selected date
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    
    // Set date range
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    
    // Update attendance status in todaysAttendance (optimistic update)
    updateTodaysAttendanceOptimistic: (state, action) => {
      const { subjectId, status } = action.payload;
      const existingIndex = state.todaysAttendance.findIndex(
        attendance => attendance.subject_id === subjectId
      );
      
      if (existingIndex !== -1) {
        state.todaysAttendance[existingIndex].status = status;
      } else {
        // Add new attendance record
        state.todaysAttendance.push({
          subject_id: subjectId,
          date: state.selectedDate,
          status,
          subjects: state.todaysSubjects.find(s => s.id === subjectId)
        });
      }
    },
    
    // Remove attendance from todaysAttendance (optimistic update)
    removeTodaysAttendanceOptimistic: (state, action) => {
      const { subjectId } = action.payload;
      state.todaysAttendance = state.todaysAttendance.filter(
        attendance => attendance.subject_id !== subjectId
      );
    },
    
    // Reset attendance state
    resetAttendanceState: (state) => {
      return {
        ...initialState,
        selectedDate: state.selectedDate,
        dateRange: state.dateRange,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch today's attendance
      .addCase(fetchTodaysAttendance.pending, (state) => {
        state.loading.todaysAttendance = true;
        state.error.todaysAttendance = null;
      })
      .addCase(fetchTodaysAttendance.fulfilled, (state, action) => {
        state.loading.todaysAttendance = false;
        state.todaysAttendance = action.payload || [];
      })
      .addCase(fetchTodaysAttendance.rejected, (state, action) => {
        state.loading.todaysAttendance = false;
        state.error.todaysAttendance = action.payload;
      })
      
      // Fetch attendance by date range
      .addCase(fetchAttendanceByDateRange.pending, (state) => {
        state.loading.attendanceHistory = true;
        state.error.attendanceHistory = null;
      })
      .addCase(fetchAttendanceByDateRange.fulfilled, (state, action) => {
        state.loading.attendanceHistory = false;
        state.attendanceHistory = action.payload || [];
      })
      .addCase(fetchAttendanceByDateRange.rejected, (state, action) => {
        state.loading.attendanceHistory = false;
        state.error.attendanceHistory = action.payload;
      })
      
      // Fetch attendance stats
      .addCase(fetchAttendanceStats.pending, (state) => {
        state.loading.attendanceStats = true;
        state.error.attendanceStats = null;
      })
      .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
        state.loading.attendanceStats = false;
        state.attendanceStats = action.payload || [];
      })
      .addCase(fetchAttendanceStats.rejected, (state, action) => {
        state.loading.attendanceStats = false;
        state.error.attendanceStats = action.payload;
      })
      
      // Mark attendance
      .addCase(markAttendance.pending, (state) => {
        state.loading.markingAttendance = true;
        state.error.markingAttendance = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.loading.markingAttendance = false;
        
        // Update todaysAttendance with the new/updated record
        const newRecord = action.payload;
        const existingIndex = state.todaysAttendance.findIndex(
          attendance => attendance.subject_id === newRecord.subject_id && 
                      attendance.date === newRecord.date
        );
        
        if (existingIndex !== -1) {
          state.todaysAttendance[existingIndex] = newRecord;
        } else {
          state.todaysAttendance.push(newRecord);
        }
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading.markingAttendance = false;
        state.error.markingAttendance = action.payload;
      })
      
      // Remove attendance
      .addCase(removeAttendance.pending, (state) => {
        state.loading.markingAttendance = true;
        state.error.markingAttendance = null;
      })
      .addCase(removeAttendance.fulfilled, (state, action) => {
        state.loading.markingAttendance = false;
        const { subjectId, date } = action.payload;
        
        // Remove from todaysAttendance
        state.todaysAttendance = state.todaysAttendance.filter(
          attendance => !(attendance.subject_id === subjectId && attendance.date === date)
        );
      })
      .addCase(removeAttendance.rejected, (state, action) => {
        state.loading.markingAttendance = false;
        state.error.markingAttendance = action.payload;
      })
      
      // Bulk mark attendance
      .addCase(bulkMarkAttendance.pending, (state) => {
        state.loading.markingAttendance = true;
        state.error.markingAttendance = null;
      })
      .addCase(bulkMarkAttendance.fulfilled, (state, action) => {
        state.loading.markingAttendance = false;
        
        // Update todaysAttendance with bulk records
        const newRecords = action.payload || [];
        newRecords.forEach(newRecord => {
          const existingIndex = state.todaysAttendance.findIndex(
            attendance => attendance.subject_id === newRecord.subject_id && 
                        attendance.date === newRecord.date
          );
          
          if (existingIndex !== -1) {
            state.todaysAttendance[existingIndex] = newRecord;
          } else {
            state.todaysAttendance.push(newRecord);
          }
        });
      })
      .addCase(bulkMarkAttendance.rejected, (state, action) => {
        state.loading.markingAttendance = false;
        state.error.markingAttendance = action.payload;
      })
      
      // Fetch today's subjects
      .addCase(fetchTodaysSubjects.pending, (state) => {
        state.loading.todaysSubjects = true;
        state.error.todaysSubjects = null;
      })
      .addCase(fetchTodaysSubjects.fulfilled, (state, action) => {
        state.loading.todaysSubjects = false;
        state.todaysSubjects = action.payload || [];
      })
      .addCase(fetchTodaysSubjects.rejected, (state, action) => {
        state.loading.todaysSubjects = false;
        state.error.todaysSubjects = action.payload;
      })
      
      // Reset attendance data
      .addCase(resetAttendanceData.pending, (state) => {
        state.loading.resetting = true;
        state.error.resetting = null;
      })
      .addCase(resetAttendanceData.fulfilled, (state) => {
        state.loading.resetting = false;
        // Clear all attendance related data
        state.todaysAttendance = [];
        state.attendanceHistory = [];
        state.attendanceStats = [];
      })
      .addCase(resetAttendanceData.rejected, (state, action) => {
        state.loading.resetting = false;
        state.error.resetting = action.payload;
      });
  },
});

// Export actions
export const {
  clearError,
  setSelectedDate,
  setDateRange,
  updateTodaysAttendanceOptimistic,
  removeTodaysAttendanceOptimistic,
  resetAttendanceState,
} = attendanceSlice.actions;

// Selectors
export const selectTodaysAttendance = (state) => state.attendance.todaysAttendance;
export const selectTodaysSubjects = (state) => state.attendance.todaysSubjects;
export const selectAttendanceHistory = (state) => state.attendance.attendanceHistory;
export const selectAttendanceStats = (state) => state.attendance.attendanceStats;
export const selectAttendanceLoading = (state) => state.attendance.loading;
export const selectAttendanceError = (state) => state.attendance.error;
export const selectSelectedDate = (state) => state.attendance.selectedDate;
export const selectDateRange = (state) => state.attendance.dateRange;

// Complex selectors
export const selectTodaysAttendanceBySubject = (state, subjectId) => 
  state.attendance.todaysAttendance.find(attendance => attendance.subject_id === subjectId);

export const selectSubjectAttendanceStats = (state, subjectId) =>
  state.attendance.attendanceStats.find(stats => stats.subject_id === subjectId);

export const selectAttendanceStatsWithMinPercentage = (state, minPercentage = 75) =>
  state.attendance.attendanceStats.map(stats => ({
    ...stats,
    isAtRisk: stats.attendance_percentage < minPercentage,
    classesNeeded: Math.max(0, Math.ceil(
      (minPercentage * (stats.present_days + stats.absent_days) - 100 * stats.present_days) / 
      (100 - minPercentage)
    )),
    canMiss: Math.max(0, Math.floor(
      (100 * stats.present_days - minPercentage * (stats.present_days + stats.absent_days)) / 
      minPercentage
    ))
  }));

export default attendanceSlice.reducer;