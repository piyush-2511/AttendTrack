import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { AttendanceStatsService } from '../supabase/attendanceStatsService'

// Initial state
const initialState = {
  // User attendance data
  userAttendance: [],
  currentUserSummary: null,
  
  // Subject and professor data
  subjectAttendance: [],
  professorAttendance: [],
  allSubjects: [],
  allProfessors: [],
  
  // Analytics data
  subjectWiseStats: [],
  professorWiseStats: [],
  lowAttendanceUsers: [],
  highAttendanceUsers: [],
  
  // Search and filters
  searchResults: [],
  filteredAttendance: [],
  
  // UI state
  loading: {
    userAttendance: false,
    userSummary: false,
    subjectAttendance: false,
    professorAttendance: false,
    subjects: false,
    professors: false,
    subjectStats: false,
    professorStats: false,
    lowAttendance: false,
    highAttendance: false,
    search: false,
    filtered: false
  },
  
  error: {
    userAttendance: null,
    userSummary: null,
    subjectAttendance: null,
    professorAttendance: null,
    subjects: null,
    professors: null,
    subjectStats: null,
    professorStats: null,
    lowAttendance: null,
    highAttendance: null,
    search: null,
    filtered: null
  },
  
  // Filters
  filters: {
    attendanceThreshold: 75,
    selectedSubject: null,
    selectedProfessor: null,
    percentageRange: { min: 0, max: 100 }
  }
}

// Async thunks for API calls
export const fetchUserAttendance = createAsyncThunk(
  'attendanceStats/fetchUserAttendance',
  async (userId, { rejectWithValue }) => {
    try {
      const result = await AttendanceStatsService.getAttendanceByUserId(userId)
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchUserSummary = createAsyncThunk(
  'attendanceStats/fetchUserSummary',
  async (userId, { rejectWithValue }) => {
    try {
      const result = await AttendanceStatsService.getAttendanceSummary(userId)
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchUserAndSubjectAttendance = createAsyncThunk(
  'attendanceStats/fetchUserAndSubjectAttendance',
  async ({ userId, subjectId }, { rejectWithValue }) => {
    try {
      const result = await AttendanceStatsService.getAttendanceByUserAndSubject(userId, subjectId)
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchSubjectAttendance = createAsyncThunk(
  'attendanceStats/fetchSubjectAttendance',
  async (subjectId, { rejectWithValue }) => {
    try {
      const result = await AttendanceStatsService.getAttendanceBySubject(subjectId)
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchProfessorAttendance = createAsyncThunk(
  'attendanceStats/fetchProfessorAttendance',
  async (professorName, { rejectWithValue }) => {
    try {
      const result = await AttendanceStatsService.getAttendanceByProfessor(professorName)
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchAllSubjects = createAsyncThunk(
  'attendanceStats/fetchAllSubjects',
  async (_, { rejectWithValue }) => {
    try {
      const result = await AttendanceStatsService.getAllSubjects()
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchAllProfessors = createAsyncThunk(
  'attendanceStats/fetchAllProfessors',
  async (_, { rejectWithValue }) => {
    try {
      const result = await AttendanceStatsService.getAllProfessors()
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchSubjectWiseStats = createAsyncThunk(
  'attendanceStats/fetchSubjectWiseStats',
  async (_, { rejectWithValue }) => {
    try {
      const result = await AttendanceStatsService.getSubjectWiseStats()
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchProfessorWiseStats = createAsyncThunk(
  'attendanceStats/fetchProfessorWiseStats',
  async (_, { rejectWithValue }) => {
    try {
      const result = await AttendanceStatsService.getProfessorWiseStats()
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchLowAttendanceUsers = createAsyncThunk(
  'attendanceStats/fetchLowAttendanceUsers',
  async ({ threshold = 75, subjectId = null }, { rejectWithValue }) => {
    try {
      const result = await AttendanceStatsService.getLowAttendanceUsers(threshold, subjectId)
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchHighAttendanceUsers = createAsyncThunk(
  'attendanceStats/fetchHighAttendanceUsers',
  async ({ threshold = 90, subjectId = null }, { rejectWithValue }) => {
    try {
      const result = await AttendanceStatsService.getHighAttendanceUsers(threshold, subjectId)
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const searchAttendanceRecords = createAsyncThunk(
  'attendanceStats/searchAttendanceRecords',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const result = await AttendanceStatsService.searchAttendanceRecords(searchTerm)
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchAttendanceByPercentageRange = createAsyncThunk(
  'attendanceStats/fetchAttendanceByPercentageRange',
  async ({ minPercentage, maxPercentage, subjectId = null }, { rejectWithValue }) => {
    try {
      const result = await AttendanceStatsService.getAttendanceByPercentageRange(minPercentage, maxPercentage, subjectId)
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Create slice
const attendanceStatsSlice = createSlice({
  name: 'attendanceStats',
  initialState,
  reducers: {
    // Clear data actions
    clearUserAttendance: (state) => {
      state.userAttendance = []
      state.error.userAttendance = null
    },
    
    clearUserSummary: (state) => {
      state.currentUserSummary = null
      state.error.userSummary = null
    },
    
    clearSubjectAttendance: (state) => {
      state.subjectAttendance = []
      state.error.subjectAttendance = null
    },
    
    clearProfessorAttendance: (state) => {
      state.professorAttendance = []
      state.error.professorAttendance = null
    },
    
    clearSearchResults: (state) => {
      state.searchResults = []
      state.error.search = null
    },
    
    clearFilteredAttendance: (state) => {
      state.filteredAttendance = []
      state.error.filtered = null
    },
    
    clearAllErrors: (state) => {
      state.error = { ...initialState.error }
    },
    
    // Filter actions
    setAttendanceThreshold: (state, action) => {
      state.filters.attendanceThreshold = action.payload
    },
    
    setSelectedSubject: (state, action) => {
      state.filters.selectedSubject = action.payload
    },
    
    setSelectedProfessor: (state, action) => {
      state.filters.selectedProfessor = action.payload
    },
    
    setPercentageRange: (state, action) => {
      state.filters.percentageRange = action.payload
    },
    
    resetFilters: (state) => {
      state.filters = { ...initialState.filters }
    },
    
    // Clear all data
    resetAttendanceStats: (state) => {
      return { ...initialState }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user attendance
      .addCase(fetchUserAttendance.pending, (state) => {
        state.loading.userAttendance = true
        state.error.userAttendance = null
      })
      .addCase(fetchUserAttendance.fulfilled, (state, action) => {
        state.loading.userAttendance = false
        state.userAttendance = action.payload
      })
      .addCase(fetchUserAttendance.rejected, (state, action) => {
        state.loading.userAttendance = false
        state.error.userAttendance = action.payload
      })
      
      // Fetch user summary
      .addCase(fetchUserSummary.pending, (state) => {
        state.loading.userSummary = true
        state.error.userSummary = null
      })
      .addCase(fetchUserSummary.fulfilled, (state, action) => {
        state.loading.userSummary = false
        state.currentUserSummary = action.payload
      })
      .addCase(fetchUserSummary.rejected, (state, action) => {
        state.loading.userSummary = false
        state.error.userSummary = action.payload
      })
      
      // Fetch subject attendance
      .addCase(fetchSubjectAttendance.pending, (state) => {
        state.loading.subjectAttendance = true
        state.error.subjectAttendance = null
      })
      .addCase(fetchSubjectAttendance.fulfilled, (state, action) => {
        state.loading.subjectAttendance = false
        state.subjectAttendance = action.payload
      })
      .addCase(fetchSubjectAttendance.rejected, (state, action) => {
        state.loading.subjectAttendance = false
        state.error.subjectAttendance = action.payload
      })
      
      // Fetch professor attendance
      .addCase(fetchProfessorAttendance.pending, (state) => {
        state.loading.professorAttendance = true
        state.error.professorAttendance = null
      })
      .addCase(fetchProfessorAttendance.fulfilled, (state, action) => {
        state.loading.professorAttendance = false
        state.professorAttendance = action.payload
      })
      .addCase(fetchProfessorAttendance.rejected, (state, action) => {
        state.loading.professorAttendance = false
        state.error.professorAttendance = action.payload
      })
      
      // Fetch all subjects
      .addCase(fetchAllSubjects.pending, (state) => {
        state.loading.subjects = true
        state.error.subjects = null
      })
      .addCase(fetchAllSubjects.fulfilled, (state, action) => {
        state.loading.subjects = false
        state.allSubjects = action.payload
      })
      .addCase(fetchAllSubjects.rejected, (state, action) => {
        state.loading.subjects = false
        state.error.subjects = action.payload
      })
      
      // Fetch all professors
      .addCase(fetchAllProfessors.pending, (state) => {
        state.loading.professors = true
        state.error.professors = null
      })
      .addCase(fetchAllProfessors.fulfilled, (state, action) => {
        state.loading.professors = false
        state.allProfessors = action.payload
      })
      .addCase(fetchAllProfessors.rejected, (state, action) => {
        state.loading.professors = false
        state.error.professors = action.payload
      })
      
      // Fetch subject-wise stats
      .addCase(fetchSubjectWiseStats.pending, (state) => {
        state.loading.subjectStats = true
        state.error.subjectStats = null
      })
      .addCase(fetchSubjectWiseStats.fulfilled, (state, action) => {
        state.loading.subjectStats = false
        state.subjectWiseStats = action.payload
      })
      .addCase(fetchSubjectWiseStats.rejected, (state, action) => {
        state.loading.subjectStats = false
        state.error.subjectStats = action.payload
      })
      
      // Fetch professor-wise stats
      .addCase(fetchProfessorWiseStats.pending, (state) => {
        state.loading.professorStats = true
        state.error.professorStats = null
      })
      .addCase(fetchProfessorWiseStats.fulfilled, (state, action) => {
        state.loading.professorStats = false
        state.professorWiseStats = action.payload
      })
      .addCase(fetchProfessorWiseStats.rejected, (state, action) => {
        state.loading.professorStats = false
        state.error.professorStats = action.payload
      })
      
      // Fetch low attendance users
      .addCase(fetchLowAttendanceUsers.pending, (state) => {
        state.loading.lowAttendance = true
        state.error.lowAttendance = null
      })
      .addCase(fetchLowAttendanceUsers.fulfilled, (state, action) => {
        state.loading.lowAttendance = false
        state.lowAttendanceUsers = action.payload
      })
      .addCase(fetchLowAttendanceUsers.rejected, (state, action) => {
        state.loading.lowAttendance = false
        state.error.lowAttendance = action.payload
      })
      
      // Fetch high attendance users
      .addCase(fetchHighAttendanceUsers.pending, (state) => {
        state.loading.highAttendance = true
        state.error.highAttendance = null
      })
      .addCase(fetchHighAttendanceUsers.fulfilled, (state, action) => {
        state.loading.highAttendance = false
        state.highAttendanceUsers = action.payload
      })
      .addCase(fetchHighAttendanceUsers.rejected, (state, action) => {
        state.loading.highAttendance = false
        state.error.highAttendance = action.payload
      })
      
      // Search attendance records
      .addCase(searchAttendanceRecords.pending, (state) => {
        state.loading.search = true
        state.error.search = null
      })
      .addCase(searchAttendanceRecords.fulfilled, (state, action) => {
        state.loading.search = false
        state.searchResults = action.payload
      })
      .addCase(searchAttendanceRecords.rejected, (state, action) => {
        state.loading.search = false
        state.error.search = action.payload
      })
      
      // Fetch attendance by percentage range
      .addCase(fetchAttendanceByPercentageRange.pending, (state) => {
        state.loading.filtered = true
        state.error.filtered = null
      })
      .addCase(fetchAttendanceByPercentageRange.fulfilled, (state, action) => {
        state.loading.filtered = false
        state.filteredAttendance = action.payload
      })
      .addCase(fetchAttendanceByPercentageRange.rejected, (state, action) => {
        state.loading.filtered = false
        state.error.filtered = action.payload
      })
  }
})

// Export actions
export const {
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
  resetAttendanceStats
} = attendanceStatsSlice.actions

// Selectors
export const selectUserAttendance = (state) => state.attendanceStats.userAttendance
export const selectCurrentUserSummary = (state) => state.attendanceStats.currentUserSummary
export const selectSubjectAttendance = (state) => state.attendanceStats.subjectAttendance
export const selectProfessorAttendance = (state) => state.attendanceStats.professorAttendance
export const selectAllSubjects = (state) => state.attendanceStats.allSubjects
export const selectAllProfessors = (state) => state.attendanceStats.allProfessors
export const selectSubjectWiseStats = (state) => state.attendanceStats.subjectWiseStats
export const selectProfessorWiseStats = (state) => state.attendanceStats.professorWiseStats
export const selectLowAttendanceUsers = (state) => state.attendanceStats.lowAttendanceUsers
export const selectHighAttendanceUsers = (state) => state.attendanceStats.highAttendanceUsers
export const selectSearchResults = (state) => state.attendanceStats.searchResults
export const selectFilteredAttendance = (state) => state.attendanceStats.filteredAttendance

export const selectLoading = (state) => state.attendanceStats.loading
export const selectErrors = (state) => state.attendanceStats.error
export const selectFilters = (state) => state.attendanceStats.filters

export const selectIsLoading = (state) => 
  Object.values(state.attendanceStats.loading).some(loading => loading)

export const selectHasErrors = (state) => 
  Object.values(state.attendanceStats.error).some(error => error !== null)

// Export reducer
export default attendanceStatsSlice.reducer