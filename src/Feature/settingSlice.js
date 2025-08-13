import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { settingService } from '../supabase/settingService'

// Async thunks using your settingService
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (userId, { rejectWithValue }) => {
    try {
      // Replace with your settingService method
      const data = await settingService.getSettings(userId)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createSettings = createAsyncThunk(
  'settings/createSettings',
  async ({ userId, settings }, { rejectWithValue }) => {
    try {
      const data = await settingService.upsertSettings(userId, settings)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateSettingsInDB = createAsyncThunk(
  'settings/updateSettingsInDB',
  async ({ userId, settings }, { rejectWithValue }) => {
    try {
      const data = await settingService.updateSettings(userId, settings)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const performResetSubject = createAsyncThunk(
  'settings/performResetSubject',
  async (userId, { rejectWithValue }) => {
    try {
      const result = await settingService.resetsubjects(userId)
      return result
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const performResetAttendance = createAsyncThunk(
  'settings/performResetAttendance',
  async (userId, { rejectWithValue }) => {
    try {
      const result = await settingService.resetattendance(userId)
      return result
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const performResetData = createAsyncThunk(
  'settings/performResetData',
  async (userId, { rejectWithValue }) => {
    try {
      const result = await settingService.resetAllData(userId)
      return result
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  theme: 'dark',
  minpercentage: 75,
  reset: {
    resetsubject: false,
    resetattendance: false,
    resetdata: false
  },
  loading: false,
  error: null,
  resetLoading: {
    subject: false,
    attendance: false,
    data: false
  }
}



const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Local state actions (for immediate UI updates)
    setTheme: (state, action) => {
      state.theme = action.payload
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
    },
    setMinPercentage: (state, action) => {
      console.log('setMinPercentage action hit')
      const percentage = Math.max(0, Math.min(100, action.payload))
      state.minpercentage = percentage
    },
    clearError: (state) => {
      state.error = null
    },
    resetToDefault: (state) => {
      state.theme = 'dark'
      state.minpercentage = 75
      state.reset = {
        resetsubject: false,
        resetattendance: false,
        resetdata: false
      }
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Fetch settings
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false
        const { theme, minpercentage, resetsubject, resetattendance, resetdata } = action.payload
        
        if (theme) state.theme = theme
        if (minpercentage !== undefined) {
          state.minpercentage = Math.max(0, Math.min(100, minpercentage))
        }
        state.reset = {
          resetsubject: resetsubject || false,
          resetattendance: resetattendance || false,
          resetdata: resetdata || false
        }
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Create settings
    builder
      .addCase(createSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSettings.fulfilled, (state, action) => {
        state.loading = false
        const { theme, minpercentage, resetsubject, resetattendance, resetdata } = action.payload
        
        if (theme) state.theme = theme
        if (minpercentage !== undefined) {
          state.minpercentage = Math.max(0, Math.min(100, minpercentage))
        }
        state.reset = {
          resetsubject: resetsubject || false,
          resetattendance: resetattendance || false,
          resetdata: resetdata || false
        }
      })
      .addCase(createSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Update settings in DB
    builder
      .addCase(updateSettingsInDB.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSettingsInDB.fulfilled, (state, action) => {
        state.loading = false
        // Settings are already updated in local state via reducers
      })
      .addCase(updateSettingsInDB.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Reset Subject
    builder
      .addCase(performResetSubject.pending, (state) => {
        state.resetLoading.subject = true
        state.error = null
      })
      .addCase(performResetSubject.fulfilled, (state) => {
        state.resetLoading.subject = false
        state.reset.resetsubject = false
      })
      .addCase(performResetSubject.rejected, (state, action) => {
        state.resetLoading.subject = false
        state.error = action.payload
      })

    // Reset Attendance
    builder
      .addCase(performResetAttendance.pending, (state) => {
        state.resetLoading.attendance = true
        state.error = null
      })
      .addCase(performResetAttendance.fulfilled, (state) => {
        state.resetLoading.attendance = false
        state.reset.resetattendance = false
      })
      .addCase(performResetAttendance.rejected, (state, action) => {
        state.resetLoading.attendance = false
        state.error = action.payload
      })

    // Reset All Data
    builder
      .addCase(performResetData.pending, (state) => {
        state.resetLoading.data = true
        state.error = null
      })
      .addCase(performResetData.fulfilled, (state) => {
        state.resetLoading.data = false
        state.reset.resetdata = false
      })
      .addCase(performResetData.rejected, (state, action) => {
        state.resetLoading.data = false
        state.error = action.payload
      })
  }
})

// Export actions
export const {
  setTheme,
  toggleTheme,
  setMinPercentage,
  clearError,
  resetToDefault
} = settingsSlice.actions

// Selectors with proper error handling
export const selectTheme = (state) => {
  // Add debugging and error handling
  if (!state.settings) {
    console.error('Settings state is undefined. Check if settingsSlice is properly registered in store.')
    return 'dark' // Return default value
  }
  return state.settings.theme
}

export const selectMinPercentage = (state) => {
  if (!state.settings) {
    console.error('Settings state is undefined. Check if settingsSlice is properly registered in store.')
    return 75 // Return default value
  }
  return state.settings.minpercentage
}

export const selectResetStates = (state) => {
  if (!state.settings) {
    console.error('Settings state is undefined. Check if settingsSlice is properly registered in store.')
    return { resetsubject: false, resetattendance: false, resetdata: false } // Return default value
  }
  return state.settings.reset
}

export const selectIsLoading = (state) => {
  if (!state.settings) {
    console.error('Settings state is undefined. Check if settingsSlice is properly registered in store.')
    return false // Return default value
  }
  return state.settings.loading
}

export const selectResetLoading = (state) => {
  if (!state.settings) {
    console.error('Settings state is undefined. Check if settingsSlice is properly registered in store.')
    return { subject: false, attendance: false, data: false } // Return default value
  }
  return state.settings.resetLoading
}

export const selectError = (state) => {
  if (!state.settings) {
    console.error('Settings state is undefined. Check if settingsSlice is properly registered in store.')
    return null // Return default value
  }
  return state.settings.error
}

// Export reducer
export default settingsSlice.reducer