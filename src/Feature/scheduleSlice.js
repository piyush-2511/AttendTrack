// scheduleSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { scheduleService } from '../supabase/scheduleService';

// Async thunks
export const fetchTodaysSchedule = createAsyncThunk(
  'schedule/fetchTodaysSchedule',
  async (_, { rejectWithValue }) => {
    try {
      const result = await scheduleService.getTodaysSchedule();
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWeeklySchedule = createAsyncThunk(
  'schedule/fetchWeeklySchedule',
  async (_, { rejectWithValue }) => {
    try {
      const result = await scheduleService.getWeeklySchedule();
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchScheduleByDay = createAsyncThunk(
  'schedule/fetchScheduleByDay',
  async (day, { rejectWithValue }) => {
    try {
      const result = await scheduleService.getScheduleByDay(day);
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      return { day, data: result.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllScheduleEntries = createAsyncThunk(
  'schedule/fetchAllScheduleEntries',
  async (_, { rejectWithValue }) => {
    try {
      const result = await scheduleService.getAllScheduleEntries();
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const setScheduleForDay = createAsyncThunk(
  'schedule/setScheduleForDay',
  async ({ day, subjectlist }, { rejectWithValue, dispatch }) => {
    try {
      // Validate data first
      const validation = scheduleService.validateScheduleData(day, subjectlist);
      if (!validation.isValid) {
        return rejectWithValue(validation.errors.join(', '));
      }

      const result = await scheduleService.setScheduleForDay(day, subjectlist);
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      // Refresh weekly schedule after setting
      dispatch(fetchWeeklySchedule());
      
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateScheduleForDay = createAsyncThunk(
  'schedule/updateScheduleForDay',
  async ({ day, subjectlist }, { rejectWithValue, dispatch }) => {
    try {
      // Validate data first
      const validation = scheduleService.validateScheduleData(day, subjectlist);
      if (!validation.isValid) {
        return rejectWithValue(validation.errors.join(', '));
      }

      const result = await scheduleService.updateScheduleForDay(day, subjectlist);
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      // Refresh weekly schedule after updating
      dispatch(fetchWeeklySchedule());
      
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addSubjectToDay = createAsyncThunk(
  'schedule/addSubjectToDay',
  async ({ day, subjectName }, { rejectWithValue, dispatch }) => {
    try {
      const result = await scheduleService.addSubjectToDay(day, subjectName);
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      // Refresh relevant data
      dispatch(fetchWeeklySchedule());
      if (day === new Date().getDay()) {
        dispatch(fetchTodaysSchedule());
      }
      
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeSubjectFromDay = createAsyncThunk(
  'schedule/removeSubjectFromDay',
  async ({ day, subjectName }, { rejectWithValue, dispatch }) => {
    try {
      const result = await scheduleService.removeSubjectFromDay(day, subjectName);
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      // Refresh relevant data
      dispatch(fetchWeeklySchedule());
      if (day === new Date().getDay()) {
        dispatch(fetchTodaysSchedule());
      }
      
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const setWeeklySchedule = createAsyncThunk(
  'schedule/setWeeklySchedule',
  async (weeklyScheduleData, { rejectWithValue, dispatch }) => {
    try {
      // Validate all days
      const validationErrors = [];
      weeklyScheduleData.forEach((daySchedule) => {
        const validation = scheduleService.validateScheduleData(daySchedule.day, daySchedule.subjectlist || daySchedule.subjectlist);
        if (!validation.isValid) {
          validationErrors.push(`Day ${daySchedule.day}: ${validation.errors.join(', ')}`);
        }
      });

      if (validationErrors.length > 0) {
        return rejectWithValue(validationErrors.join('; '));
      }

      const result = await scheduleService.setWeeklySchedule(weeklyScheduleData);
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      // Refresh all schedule data
      dispatch(fetchWeeklySchedule());
      dispatch(fetchTodaysSchedule());
      
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTodaysSubjects = createAsyncThunk(
  'schedule/fetchTodaysSubjects',
  async (_, { rejectWithValue }) => {
    try {
      const result = await scheduleService.getTodaysSubjects();
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSubjectsForDay = createAsyncThunk(
  'schedule/fetchSubjectsForDay',
  async (day, { rejectWithValue }) => {
    try {
      const result = await scheduleService.getSubjectsForDay(day);
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      return { day, subjects: result.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteScheduleForDay = createAsyncThunk(
  'schedule/deleteScheduleForDay',
  async (day, { rejectWithValue, dispatch }) => {
    try {
      const result = await scheduleService.deleteScheduleForDay(day);
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      // Refresh relevant data
      dispatch(fetchWeeklySchedule());
      if (day === new Date().getDay()) {
        dispatch(fetchTodaysSchedule());
      }
      
      return day;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetScheduleData = createAsyncThunk(
  'schedule/resetScheduleData',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const result = await scheduleService.resetScheduleData();
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      // Refresh all schedule data after reset
      dispatch(fetchWeeklySchedule());
      dispatch(fetchTodaysSchedule());
      
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getSubjectIdByName = createAsyncThunk(
  'schedule/getSubjectIdByName',
  async (subjectName, { rejectWithValue }) => {
    try {
      const result = await scheduleService.getSubjectIdByName(subjectName);
      
      if (result.error) {
        return rejectWithValue(result.error);
      }
      
      return { subjectName, subjectId: result.subject_id };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Schedule data
  todaysSchedule: null, // Single object for today
  weeklySchedule: [], // Array of 7 objects (one per day)
  scheduleByDay: {}, // { day: scheduleObject }
  allScheduleEntries: [], // Raw schedule entries
  
  // Today's subjects
  todaysSubjects: [],
  
  // Subject mappings by day
  subjectsByDay: {}, // { day: [subjectNames] }
  
  // Subject ID mappings
  subjectIds: {}, // { subjectName: subjectId }
  
  // UI state
  loading: {
    todaysSchedule: false,
    weeklySchedule: false,
    scheduleByDay: false,
    allScheduleEntries: false,
    settingSchedule: false,
    updatingSchedule: false,
    addingSubject: false,
    removingSubject: false,
    settingWeekly: false,
    todaysSubjects: false,
    subjectsForDay: false,
    deletingDay: false,
    resetting: false,
    gettingSubjectId: false,
  },
  
  error: {
    todaysSchedule: null,
    weeklySchedule: null,
    scheduleByDay: null,
    allScheduleEntries: null,
    settingSchedule: null,
    updatingSchedule: null,
    addingSubject: null,
    removingSubject: null,
    settingWeekly: null,
    todaysSubjects: null,
    subjectsForDay: null,
    deletingDay: null,
    resetting: null,
    gettingSubjectId: null,
  },
  
  // UI helpers
  selectedDay: new Date().getDay(), // Currently selected day for editing
  isScheduleModalOpen: false,
  
  // Schedule statistics
  scheduleStats: null,
  
  // Utility data
  currentDay: new Date().getDay(),
};

// Helper function to safely get subjectlist
const getSubjectList = (scheduleEntry) => {
  return scheduleEntry?.subjectlist || scheduleEntry?.subjectlist || [];
};

// Slice
const scheduleSlice = createSlice({
  name: 'schedule',
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
    
    // Set selected day
    setSelectedDay: (state, action) => {
      state.selectedDay = action.payload;
    },
    
    // Update current day (for daily refresh)
    updateCurrentDay: (state) => {
      state.currentDay = new Date().getDay();
    },
    
    // Toggle schedule modal
    toggleScheduleModal: (state, action) => {
      state.isScheduleModalOpen = action.payload !== undefined ? action.payload : !state.isScheduleModalOpen;
    },
    
    // Optimistic add subject to day
    addSubjectToDayOptimistic: (state, action) => {
      const { day, subjectName } = action.payload;
      
      if (!state.subjectsByDay[day]) {
        state.subjectsByDay[day] = [];
      }
      
      if (!state.subjectsByDay[day].includes(subjectName)) {
        state.subjectsByDay[day].push(subjectName);
      }
      
      // Update weekly schedule if exists
      const weeklyEntry = state.weeklySchedule.find(entry => entry.day === day);
      if (weeklyEntry) {
        const subjectlist = getSubjectList(weeklyEntry);
        if (!subjectlist.includes(subjectName)) {
          subjectlist.push(subjectName);
        }
      }
      
      // Update today's subjects if it's today
      if (day === state.currentDay) {
        if (!state.todaysSubjects.includes(subjectName)) {
          state.todaysSubjects.push(subjectName);
        }
      }
    },
    
    // Optimistic remove subject from day
    removeSubjectFromDayOptimistic: (state, action) => {
      const { day, subjectName } = action.payload;
      
      if (state.subjectsByDay[day]) {
        state.subjectsByDay[day] = state.subjectsByDay[day].filter(subject => subject !== subjectName);
      }
      
      // Update weekly schedule if exists
      const weeklyEntry = state.weeklySchedule.find(entry => entry.day === day);
      if (weeklyEntry) {
        const subjectlist = getSubjectList(weeklyEntry);
        weeklyEntry.subjectlist = subjectlist.filter(subject => subject !== subjectName);
      }
      
      // Update today's subjects if it's today
      if (day === state.currentDay) {
        state.todaysSubjects = state.todaysSubjects.filter(subject => subject !== subjectName);
      }
    },
    
    // Calculate and set schedule statistics
    calculateScheduleStats: (state) => {
      state.scheduleStats = scheduleService.getScheduleStats(state.weeklySchedule);
    },
    
    // Reset schedule state
    resetScheduleState: (state) => {
      return {
        ...initialState,
        selectedDay: state.selectedDay,
        currentDay: new Date().getDay(),
      };
    },
    
    // Cache subject ID
    cacheSubjectId: (state, action) => {
      const { subjectName, subjectId } = action.payload;
      state.subjectIds[subjectName] = subjectId;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch today's schedule
      .addCase(fetchTodaysSchedule.pending, (state) => {
        state.loading.todaysSchedule = true;
        state.error.todaysSchedule = null;
      })
      .addCase(fetchTodaysSchedule.fulfilled, (state, action) => {
        state.loading.todaysSchedule = false;
        state.todaysSchedule = action.payload && action.payload.length > 0 ? action.payload[0] : null;
        
        // Extract today's subjects
        if (state.todaysSchedule) {
          state.todaysSubjects = getSubjectList(state.todaysSchedule);
        } else {
          state.todaysSubjects = [];
        }
      })
      .addCase(fetchTodaysSchedule.rejected, (state, action) => {
        state.loading.todaysSchedule = false;
        state.error.todaysSchedule = action.payload;
      })
      
      // Fetch weekly schedule
      .addCase(fetchWeeklySchedule.pending, (state) => {
        state.loading.weeklySchedule = true;
        state.error.weeklySchedule = null;
      })
      .addCase(fetchWeeklySchedule.fulfilled, (state, action) => {
        state.loading.weeklySchedule = false;
        state.weeklySchedule = action.payload || [];
        
        // Update scheduleByDay and subjectsByDay
        state.scheduleByDay = {};
        state.subjectsByDay = {};
        
        action.payload?.forEach(daySchedule => {
          state.scheduleByDay[daySchedule.day] = daySchedule;
          state.subjectsByDay[daySchedule.day] = getSubjectList(daySchedule);
        });
        
        // Calculate statistics
        state.scheduleStats = scheduleService.getScheduleStats(state.weeklySchedule);
      })
      .addCase(fetchWeeklySchedule.rejected, (state, action) => {
        state.loading.weeklySchedule = false;
        state.error.weeklySchedule = action.payload;
      })
      
      // Fetch schedule by day
      .addCase(fetchScheduleByDay.pending, (state) => {
        state.loading.scheduleByDay = true;
        state.error.scheduleByDay = null;
      })
      .addCase(fetchScheduleByDay.fulfilled, (state, action) => {
        state.loading.scheduleByDay = false;
        const { day, data } = action.payload;
        
        if (data && data.length > 0) {
          state.scheduleByDay[day] = data[0];
          state.subjectsByDay[day] = getSubjectList(data[0]);
        } else {
          state.scheduleByDay[day] = null;
          state.subjectsByDay[day] = [];
        }
      })
      .addCase(fetchScheduleByDay.rejected, (state, action) => {
        state.loading.scheduleByDay = false;
        state.error.scheduleByDay = action.payload;
      })
      
      // Fetch all schedule entries
      .addCase(fetchAllScheduleEntries.pending, (state) => {
        state.loading.allScheduleEntries = true;
        state.error.allScheduleEntries = null;
      })
      .addCase(fetchAllScheduleEntries.fulfilled, (state, action) => {
        state.loading.allScheduleEntries = false;
        state.allScheduleEntries = action.payload || [];
      })
      .addCase(fetchAllScheduleEntries.rejected, (state, action) => {
        state.loading.allScheduleEntries = false;
        state.error.allScheduleEntries = action.payload;
      })
      
      // Set schedule for day
      .addCase(setScheduleForDay.pending, (state) => {
        state.loading.settingSchedule = true;
        state.error.settingSchedule = null;
      })
      .addCase(setScheduleForDay.fulfilled, (state, action) => {
        state.loading.settingSchedule = false;
        state.isScheduleModalOpen = false;
        
        // Update local state optimistically (will be refreshed by fetchWeeklySchedule)
        const updatedSchedule = action.payload;
        if (updatedSchedule) {
          state.scheduleByDay[updatedSchedule.day] = updatedSchedule;
          state.subjectsByDay[updatedSchedule.day] = getSubjectList(updatedSchedule);
          
          // Update today's subjects if it's today
          if (updatedSchedule.day === state.currentDay) {
            state.todaysSubjects = getSubjectList(updatedSchedule);
            state.todaysSchedule = updatedSchedule;
          }
        }
      })
      .addCase(setScheduleForDay.rejected, (state, action) => {
        state.loading.settingSchedule = false;
        state.error.settingSchedule = action.payload;
      })
      
      // Update schedule for day
      .addCase(updateScheduleForDay.pending, (state) => {
        state.loading.updatingSchedule = true;
        state.error.updatingSchedule = null;
      })
      .addCase(updateScheduleForDay.fulfilled, (state, action) => {
        state.loading.updatingSchedule = false;
        
        // Update local state optimistically
        const updatedSchedule = action.payload;
        if (updatedSchedule) {
          state.scheduleByDay[updatedSchedule.day] = updatedSchedule;
          state.subjectsByDay[updatedSchedule.day] = getSubjectList(updatedSchedule);
          
          // Update today's subjects if it's today
          if (updatedSchedule.day === state.currentDay) {
            state.todaysSubjects = getSubjectList(updatedSchedule);
            state.todaysSchedule = updatedSchedule;
          }
        }
      })
      .addCase(updateScheduleForDay.rejected, (state, action) => {
        state.loading.updatingSchedule = false;
        state.error.updatingSchedule = action.payload;
      })
      
      // Add subject to day
      .addCase(addSubjectToDay.pending, (state) => {
        state.loading.addingSubject = true;
        state.error.addingSubject = null;
      })
      .addCase(addSubjectToDay.fulfilled, (state, action) => {
        state.loading.addingSubject = false;
        // Weekly schedule will be refreshed automatically
      })
      .addCase(addSubjectToDay.rejected, (state, action) => {
        state.loading.addingSubject = false;
        state.error.addingSubject = action.payload;
      })
      
      // Remove subject from day
      .addCase(removeSubjectFromDay.pending, (state) => {
        state.loading.removingSubject = true;
        state.error.removingSubject = null;
      })
      .addCase(removeSubjectFromDay.fulfilled, (state, action) => {
        state.loading.removingSubject = false;
        // Weekly schedule will be refreshed automatically
      })
      .addCase(removeSubjectFromDay.rejected, (state, action) => {
        state.loading.removingSubject = false;
        state.error.removingSubject = action.payload;
      })
      
      // Set weekly schedule
      .addCase(setWeeklySchedule.pending, (state) => {
        state.loading.settingWeekly = true;
        state.error.settingWeekly = null;
      })
      .addCase(setWeeklySchedule.fulfilled, (state, action) => {
        state.loading.settingWeekly = false;
        // Weekly schedule will be refreshed automatically
      })
      .addCase(setWeeklySchedule.rejected, (state, action) => {
        state.loading.settingWeekly = false;
        state.error.settingWeekly = action.payload;
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
      
      // Fetch subjects for day
      .addCase(fetchSubjectsForDay.pending, (state) => {
        state.loading.subjectsForDay = true;
        state.error.subjectsForDay = null;
      })
      .addCase(fetchSubjectsForDay.fulfilled, (state, action) => {
        state.loading.subjectsForDay = false;
        const { day, subjects } = action.payload;
        state.subjectsByDay[day] = subjects;
      })
      .addCase(fetchSubjectsForDay.rejected, (state, action) => {
        state.loading.subjectsForDay = false;
        state.error.subjectsForDay = action.payload;
      })
      
      // Delete schedule for day
      .addCase(deleteScheduleForDay.pending, (state) => {
        state.loading.deletingDay = true;
        state.error.deletingDay = null;
      })
      .addCase(deleteScheduleForDay.fulfilled, (state, action) => {
        state.loading.deletingDay = false;
        const day = action.payload;
        
        // Remove from local state
        delete state.scheduleByDay[day];
        state.subjectsByDay[day] = [];
        
        // Clear today's data if it's today
        if (day === state.currentDay) {
          state.todaysSchedule = null;
          state.todaysSubjects = [];
        }
        
        // Remove from weekly schedule
        state.weeklySchedule = state.weeklySchedule.filter(entry => entry.day !== day);
        
        // Recalculate statistics
        state.scheduleStats = scheduleService.getScheduleStats(state.weeklySchedule);
      })
      .addCase(deleteScheduleForDay.rejected, (state, action) => {
        state.loading.deletingDay = false;
        state.error.deletingDay = action.payload;
      })
      
      // Reset schedule data
      .addCase(resetScheduleData.pending, (state) => {
        state.loading.resetting = true;
        state.error.resetting = null;
      })
      .addCase(resetScheduleData.fulfilled, (state) => {
        state.loading.resetting = false;
        // Clear all schedule data
        state.todaysSchedule = null;
        state.weeklySchedule = [];
        state.scheduleByDay = {};
        state.allScheduleEntries = [];
        state.todaysSubjects = [];
        state.subjectsByDay = {};
        state.scheduleStats = null;
      })
      .addCase(resetScheduleData.rejected, (state, action) => {
        state.loading.resetting = false;
        state.error.resetting = action.payload;
      })
      
      // Get subject ID by name
      .addCase(getSubjectIdByName.pending, (state) => {
        state.loading.gettingSubjectId = true;
        state.error.gettingSubjectId = null;
      })
      .addCase(getSubjectIdByName.fulfilled, (state, action) => {
        state.loading.gettingSubjectId = false;
        const { subjectName, subjectId } = action.payload;
        state.subjectIds[subjectName] = subjectId;
      })
      .addCase(getSubjectIdByName.rejected, (state, action) => {
        state.loading.gettingSubjectId = false;
        state.error.gettingSubjectId = action.payload;
      });
  },
});

// Export actions
export const {
  clearError,
  setSelectedDay,
  updateCurrentDay,
  toggleScheduleModal,
  addSubjectToDayOptimistic,
  removeSubjectFromDayOptimistic,
  calculateScheduleStats,
  resetScheduleState,
  cacheSubjectId,
} = scheduleSlice.actions;

// Selectors
export const selectTodaysSchedule = (state) => state.schedule.todaysSchedule;
export const selectWeeklySchedule = (state) => state.schedule.weeklySchedule;
export const selectScheduleByDay = (state) => state.schedule.scheduleByDay;
export const selectAllScheduleEntries = (state) => state.schedule.allScheduleEntries;
export const selectTodaysSubjects = (state) => state.schedule.todaysSubjects;
export const selectSubjectsByDay = (state) => state.schedule.subjectsByDay;
export const selectSubjectIds = (state) => state.schedule.subjectIds;
export const selectScheduleLoading = (state) => state.schedule.loading;
export const selectScheduleError = (state) => state.schedule.error;
export const selectSelectedDay = (state) => state.schedule.selectedDay;
export const selectCurrentDay = (state) => state.schedule.currentDay;
export const selectIsScheduleModalOpen = (state) => state.schedule.isScheduleModalOpen;
export const selectScheduleStats = (state) => state.schedule.scheduleStats;

// Complex selectors
export const selectScheduleForDay = (state, day) => 
  state.schedule.scheduleByDay[day] || null;

export const selectSubjectsForDay = (state, day) =>
  state.schedule.subjectsByDay[day] || [];

export const selectSubjectIdByName = (state, subjectName) =>
  state.schedule.subjectIds[subjectName] || null;

export const selectHasScheduleForDay = (state, day) =>
  Boolean(state.schedule.scheduleByDay[day] && 
         getSubjectList(state.schedule.scheduleByDay[day]).length > 0);

export const selectTotalScheduledDays = (state) =>
  Object.keys(state.schedule.scheduleByDay).filter(day => 
    state.schedule.scheduleByDay[day] && 
    getSubjectList(state.schedule.scheduleByDay[day]).length > 0
  ).length;

export const selectAllUniqueSubjects = (state) => {
  const allSubjects = new Set();
  Object.values(state.schedule.subjectsByDay).forEach(subjects => {
    subjects.forEach(subject => allSubjects.add(subject));
  });
  return Array.from(allSubjects);
};

export const selectDaysWithSubject = (state, subjectName) => {
  const days = [];
  Object.entries(state.schedule.subjectsByDay).forEach(([day, subjects]) => {
    if (subjects.includes(subjectName)) {
      days.push(parseInt(day));
    }
  });
  return days;
};

export const selectIsScheduleEmpty = (state) =>
  state.schedule.weeklySchedule.length === 0 || 
  state.schedule.weeklySchedule.every(day => 
    getSubjectList(day).length === 0
  );

// Helper selector for UI display
export const selectWeeklyScheduleForUI = (state) => {
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return weekDays.map((dayName, index) => ({
    day: index,
    dayName,
    subjects: state.schedule.subjectsByDay[index] || [],
    hasSchedule: Boolean(state.schedule.scheduleByDay[index]),
    scheduleEntry: state.schedule.scheduleByDay[index] || null
  }));
};

// Selector for validation results
export const selectScheduleValidation = (state, day, subjectlist) => {
  if (typeof scheduleService.validateScheduleData === 'function') {
    return scheduleService.validateScheduleData(day, subjectlist);
  }
  return { isValid: true, errors: [] };
};

// Selector for day name
export const selectDayName = (state, day) => {
  return scheduleService.getDayName ? scheduleService.getDayName(day) : 
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day] || 'Unknown';
};

// Selector for checking if today
export const selectIsToday = (state, day) => {
  return day === state.schedule.currentDay;
};

// Selector for schedule statistics with fallback
export const selectScheduleStatsWithFallback = (state) => {
  if (state.schedule.scheduleStats) {
    return state.schedule.scheduleStats;
  }
  
  // Calculate stats if not available
  if (typeof scheduleService.getScheduleStats === 'function') {
    return scheduleService.getScheduleStats(state.schedule.weeklySchedule);
  }
  
  return null;
};

// Selector for checking if any loading state is active
export const selectIsAnyLoading = (state) => {
  return Object.values(state.schedule.loading).some(loading => loading === true);
};

// Selector for checking if any error exists
export const selectHasAnyError = (state) => {
  return Object.values(state.schedule.error).some(error => error !== null);
};

// Selector for getting all errors
export const selectAllErrors = (state) => {
  return Object.entries(state.schedule.error)
    .filter(([_, error]) => error !== null)
    .map(([type, error]) => ({ type, error }));
};

export default scheduleSlice.reducer;