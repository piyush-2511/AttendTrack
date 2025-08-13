import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subjectService } from '../supabase/subjectService';

// Async thunks for subject operations
export const fetchSubjects = createAsyncThunk(
  'subjects/fetchSubjects',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }
      const data = await subjectService.getSubjects(userId)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createSubject = createAsyncThunk(
  'subjects/createSubject',
  async ({ userId, subjectData }, { rejectWithValue }) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }
      if (!subjectData) {
        throw new Error('Subject data is required')
      }
      if (!subjectData.name || !subjectData.name.trim()) {
        throw new Error('Subject name is required')
      }
      
      // Call the service with the correct parameters
      const data = await subjectService.createSubject(userId, subjectData)
      return data
    } catch (error) {
      console.error('Error creating subject:', error)
      return rejectWithValue(error.message)
    }
  }
)


export const createMultipleSubjects = createAsyncThunk(
  'subjects/createMultipleSubjects',
  async ({ userId, subjects }, { rejectWithValue }) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }
      if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
        throw new Error('Valid subjects array is required')
      }
      
      const data = await subjectService.createMultipleSubjects(userId, subjects)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateSubject = createAsyncThunk(
  'subjects/updateSubject',
  async ({ subjectId, userId, updates }, { rejectWithValue }) => {
    try {
      if (!subjectId) {
        throw new Error('Subject ID is required')
      }
      if (!userId) {
        throw new Error('User ID is required')
      }
      if (!updates) {
        throw new Error('Updates are required')
      }
      
      const data = await subjectService.updateSubject(subjectId, userId, updates)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteSubject = createAsyncThunk(
  'subjects/deleteSubject',
  async ({ subjectId, userId }, { rejectWithValue }) => {
    try {
      if (!subjectId) {
        throw new Error('Subject ID is required')
      }
      if (!userId) {
        throw new Error('User ID is required')
      }
      
      const data = await subjectService.deleteSubject(subjectId, userId)
      return { deletedSubject: data, subjectId }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteAllSubjects = createAsyncThunk(
  'subjects/deleteAllSubjects',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }
      
      const data = await subjectService.deleteAllSubjects(userId)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const searchSubjects = createAsyncThunk(
  'subjects/searchSubjects',
  async ({ userId, searchTerm }, { rejectWithValue }) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }
      if (!searchTerm || !searchTerm.trim()) {
        throw new Error('Search term is required')
      }
      
      const data = await subjectService.searchSubjects(userId, searchTerm)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getSubjectById = createAsyncThunk(
  'subjects/getSubjectById',
  async ({ subjectId, userId }, { rejectWithValue }) => {
    try {
      if (!subjectId) {
        throw new Error('Subject ID is required')
      }
      if (!userId) {
        throw new Error('User ID is required')
      }
      
      const data = await subjectService.getSubjectById(subjectId, userId)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const bulkUpdateSubjects = createAsyncThunk(
  'subjects/bulkUpdateSubjects',
  async ({ userId, updates }, { rejectWithValue }) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }
      if (!updates || !Array.isArray(updates) || updates.length === 0) {
        throw new Error('Valid updates array is required')
      }
      
      const data = await subjectService.bulkUpdateSubjects(userId, updates)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  subjects: [],
  selectedSubject: null,
  searchResults: [],
  loading: false,
  searchLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  error: null,
  searchError: null,
  lastFetched: null,
  hasMore: true,
  totalCount: 0,
  initialized: false
}

const subjectsSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    // Clear errors
    clearError: (state) => {
      state.error = null
      state.searchError = null
    },

    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = []
      state.searchError = null
    },

    // Set selected subject
    setSelectedSubject: (state, action) => {
      state.selectedSubject = action.payload
    },

    // Clear selected subject
    clearSelectedSubject: (state) => {
      state.selectedSubject = null
    },

    // Local subject update (for optimistic updates)
    updateSubjectLocal: (state, action) => {
      const { subjectId, updates } = action.payload
      if (!subjectId || !updates) return
      
      const index = state.subjects.findIndex(subject => subject.id === subjectId)
      if (index !== -1) {
        state.subjects[index] = { ...state.subjects[index], ...updates }
      }
    },

    // Add subject locally (for optimistic updates)
    addSubjectLocal: (state, action) => {
      if (action.payload && action.payload.id) {
        // Check if subject already exists
        const exists = state.subjects.some(subject => subject.id === action.payload.id)
        if (!exists) {
          state.subjects.push(action.payload)
          state.totalCount += 1
        }
      }
    },

    // Remove subject locally (for optimistic updates)
    removeSubjectLocal: (state, action) => {
      const subjectId = action.payload
      if (subjectId) {
        const initialLength = state.subjects.length
        state.subjects = state.subjects.filter(subject => subject.id !== subjectId)
        if (state.subjects.length < initialLength) {
          state.totalCount = Math.max(0, state.totalCount - 1)
        }
      }
    },

    // Reset subjects state
    resetSubjectsState: (state) => {
      return { ...initialState }
    },

    // Set initialized flag
    setInitialized: (state, action) => {
      state.initialized = action.payload
    }
  },

  extraReducers: (builder) => {
    // Fetch subjects
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false
        const subjects = Array.isArray(action.payload) ? action.payload : []
        state.subjects = subjects
        state.totalCount = subjects.length
        state.lastFetched = new Date().toISOString()
        state.initialized = true
        state.error = null
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch subjects'
        state.initialized = true
      })

    // Create subject
    builder
      .addCase(createSubject.pending, (state) => {
        state.createLoading = true
        state.error = null
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.createLoading = false
        if (action.payload && action.payload.id) {
          const exists = state.subjects.some(subject => subject.id === action.payload.id)
          if (!exists) {
            state.subjects.push(action.payload)
            state.totalCount += 1
          }
        }
        state.error = null
      })
      .addCase(createSubject.rejected, (state, action) => {
        state.createLoading = false
        state.error = action.payload || 'Failed to create subject'
      })

    // Create multiple subjects
    builder
      .addCase(createMultipleSubjects.pending, (state) => {
        state.createLoading = true
        state.error = null
      })
      .addCase(createMultipleSubjects.fulfilled, (state, action) => {
        state.createLoading = false
        if (action.payload && action.payload.created && Array.isArray(action.payload.created)) {
          const newSubjects = action.payload.created.filter(newSubject => 
            !state.subjects.some(existing => existing.id === newSubject.id)
          )
          state.subjects.push(...newSubjects)
          state.totalCount += newSubjects.length
        }
        state.error = null
      })
      .addCase(createMultipleSubjects.rejected, (state, action) => {
        state.createLoading = false
        state.error = action.payload || 'Failed to create subjects'
      })

    // Update subject
    builder
      .addCase(updateSubject.pending, (state) => {
        state.updateLoading = true
        state.error = null
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        state.updateLoading = false
        if (action.payload && action.payload.id) {
          const index = state.subjects.findIndex(subject => subject.id === action.payload.id)
          if (index !== -1) {
            state.subjects[index] = action.payload
          }
          if (state.selectedSubject && state.selectedSubject.id === action.payload.id) {
            state.selectedSubject = action.payload
          }
        }
        state.error = null
      })
      .addCase(updateSubject.rejected, (state, action) => {
        state.updateLoading = false
        state.error = action.payload || 'Failed to update subject'
      })

    // Delete subject
    builder
      .addCase(deleteSubject.pending, (state) => {
        state.deleteLoading = true
        state.error = null
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.deleteLoading = false
        if (action.payload && action.payload.subjectId) {
          const initialLength = state.subjects.length
          state.subjects = state.subjects.filter(subject => subject.id !== action.payload.subjectId)
          if (state.subjects.length < initialLength) {
            state.totalCount = Math.max(0, state.totalCount - 1)
          }
          if (state.selectedSubject && state.selectedSubject.id === action.payload.subjectId) {
            state.selectedSubject = null
          }
        }
        state.error = null
      })
      .addCase(deleteSubject.rejected, (state, action) => {
        state.deleteLoading = false
        state.error = action.payload || 'Failed to delete subject'
      })

    // Delete all subjects
    builder
      .addCase(deleteAllSubjects.pending, (state) => {
        state.deleteLoading = true
        state.error = null
      })
      .addCase(deleteAllSubjects.fulfilled, (state, action) => {
        state.deleteLoading = false
        state.subjects = []
        state.selectedSubject = null
        state.totalCount = 0
        state.error = null
      })
      .addCase(deleteAllSubjects.rejected, (state, action) => {
        state.deleteLoading = false
        state.error = action.payload || 'Failed to delete all subjects'
      })

    // Search subjects
    builder
      .addCase(searchSubjects.pending, (state) => {
        state.searchLoading = true
        state.searchError = null
      })
      .addCase(searchSubjects.fulfilled, (state, action) => {
        state.searchLoading = false
        const results = Array.isArray(action.payload) ? action.payload : []
        state.searchResults = results
        state.searchError = null
      })
      .addCase(searchSubjects.rejected, (state, action) => {
        state.searchLoading = false
        state.searchError = action.payload || 'Failed to search subjects'
      })

    // Get subject by ID
    builder
      .addCase(getSubjectById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSubjectById.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.selectedSubject = action.payload
        }
        state.error = null
      })
      .addCase(getSubjectById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch subject'
      })

    // Bulk update subjects
    builder
      .addCase(bulkUpdateSubjects.pending, (state) => {
        state.updateLoading = true
        state.error = null
      })
      .addCase(bulkUpdateSubjects.fulfilled, (state, action) => {
        state.updateLoading = false
        if (action.payload && action.payload.successful && Array.isArray(action.payload.successful)) {
          action.payload.successful.forEach(updatedSubject => {
            if (updatedSubject && updatedSubject.id) {
              const index = state.subjects.findIndex(subject => subject.id === updatedSubject.id)
              if (index !== -1) {
                state.subjects[index] = updatedSubject
              }
            }
          })
        }
        state.error = null
      })
      .addCase(bulkUpdateSubjects.rejected, (state, action) => {
        state.updateLoading = false
        state.error = action.payload || 'Failed to bulk update subjects'
      })
  }
})

// Export actions
export const {
  clearError,
  clearSearchResults,
  setSelectedSubject,
  clearSelectedSubject,
  updateSubjectLocal,
  addSubjectLocal,
  removeSubjectLocal,
  resetSubjectsState,
  setInitialized
} = subjectsSlice.actions

// Enhanced selectors with proper error handling
export const selectAllSubjects = (state) => {
  // console.log('selectAllSubjects function is hit')
  try {
    if (!state || !state.subjects) {
      console.warn('Redux state or subjects slice not found')
      return []
    }
    const result = Array.isArray(state.subjects.subjects) ? state.subjects.subjects : []
    // console.log('selectAllSubjects:', result)
    return result
  } catch (error) {
    console.error('Error in selectAllSubjects:', error)
    return []
  }
}

export const selectSelectedSubject = (state) => {
  try {
    return state?.subjects?.selectedSubject || null
  } catch (error) {
    console.error('Error in selectSelectedSubject:', error)
    return null
  }
}

export const selectSearchResults = (state) => {
  try {
    if (!state?.subjects?.searchResults) return []
    return Array.isArray(state.subjects.searchResults) ? state.subjects.searchResults : []
  } catch (error) {
    console.error('Error in selectSearchResults:', error)
    return []
  }
}

export const selectSubjectsLoading = (state) => {
  try {
    return state?.subjects?.loading || false
  } catch (error) {
    console.error('Error in selectSubjectsLoading:', error)
    return false
  }
}

export const selectCreateLoading = (state) => {
  try {
    return state?.subjects?.createLoading || false
  } catch (error) {
    console.error('Error in selectCreateLoading:', error)
    return false
  }
}

export const selectUpdateLoading = (state) => {
  try {
    return state?.subjects?.updateLoading || false
  } catch (error) {
    console.error('Error in selectUpdateLoading:', error)
    return false
  }
}

export const selectDeleteLoading = (state) => {
  try {
    return state?.subjects?.deleteLoading || false
  } catch (error) {
    console.error('Error in selectDeleteLoading:', error)
    return false
  }
}

export const selectSearchLoading = (state) => {
  try {
    return state?.subjects?.searchLoading || false
  } catch (error) {
    console.error('Error in selectSearchLoading:', error)
    return false
  }
}

export const selectSubjectsError = (state) => {
  try {
    return state?.subjects?.error || null
  } catch (error) {
    console.error('Error in selectSubjectsError:', error)
    return null
  }
}

export const selectSearchError = (state) => {
  try {
    return state?.subjects?.searchError || null
  } catch (error) {
    console.error('Error in selectSearchError:', error)
    return null
  }
}

export const selectTotalCount = (state) => {
  try {
    return state?.subjects?.totalCount || 0
  } catch (error) {
    console.error('Error in selectTotalCount:', error)
    return 0
  }
}

export const selectLastFetched = (state) => {
  try {
    return state?.subjects?.lastFetched || null
  } catch (error) {
    console.error('Error in selectLastFetched:', error)
    return null
  }
}

export const selectInitialized = (state) => {
  try {
    return state?.subjects?.initialized || false
  } catch (error) {
    console.error('Error in selectInitialized:', error)
    return false
  }
}

// Computed selectors with error handling
export const selectSubjectById = (state, subjectId) => {
  try {
    if (!subjectId) return null
    const subjects = selectAllSubjects(state)
    return subjects.find(subject => subject.id === subjectId) || null
  } catch (error) {
    console.error('Error in selectSubjectById:', error)
    return null
  }
}

export const selectSubjectsByName = (state, searchTerm) => {
  try {
    if (!searchTerm) return []
    const subjects = selectAllSubjects(state)
    return subjects.filter(subject =>
      subject.name && subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  } catch (error) {
    console.error('Error in selectSubjectsByName:', error)
    return []
  }
}

export const selectSubjectsByProfessor = (state, professorName) => {
  try {
    if (!professorName) return []
    const subjects = selectAllSubjects(state)
    return subjects.filter(subject =>
      subject.professor_name && 
      subject.professor_name.toLowerCase().includes(professorName.toLowerCase())
    )
  } catch (error) {
    console.error('Error in selectSubjectsByProfessor:', error)
    return []
  }
}

export const selectHasSubjects = (state) => {
  try {
    const subjects = selectAllSubjects(state)
    return subjects.length > 0
  } catch (error) {
    console.error('Error in selectHasSubjects:', error)
    return false
  }
}

// Debugging selector to help identify issues
export const selectSubjectsDebugInfo = (state) => {
  try {
    return {
      hasState: !!state,
      hasSubjectsSlice: !!state?.subjects,
      subjectsArray: state?.subjects?.subjects,
      subjectsLength: state?.subjects?.subjects?.length || 0,
      isArray: Array.isArray(state?.subjects?.subjects),
      loading: state?.subjects?.loading,
      error: state?.subjects?.error,
      initialized: state?.subjects?.initialized,
      lastFetched: state?.subjects?.lastFetched
    }
  } catch (error) {
    return {
      error: error.message,
      hasState: !!state
    }
  }
}

// Export reducer
export default subjectsSlice.reducer