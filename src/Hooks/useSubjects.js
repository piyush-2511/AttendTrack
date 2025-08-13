import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useMemo, useEffect } from 'react'
import {
  // Async thunks
  fetchSubjects,
  createSubject,
  createMultipleSubjects,
  updateSubject,
  deleteSubject,
  deleteAllSubjects,
  searchSubjects,
  getSubjectById,
  bulkUpdateSubjects,
  // Actions
  clearError,
  clearSearchResults,
  setSelectedSubject,
  clearSelectedSubject,
  updateSubjectLocal,
  addSubjectLocal,
  removeSubjectLocal,
  resetSubjectsState,
  // Selectors
  selectAllSubjects,
  selectSelectedSubject,
  selectSearchResults,
  selectSubjectsLoading,
  selectCreateLoading,
  selectUpdateLoading,
  selectDeleteLoading,
  selectSearchLoading,
  selectSubjectsError,
  selectSearchError,
  selectTotalCount,
  selectLastFetched,
  selectSubjectById,
  selectSubjectsByName,
  selectSubjectsByProfessor,
  selectHasSubjects
} from '../Feature/subjectSlice' // Adjust path as needed

export const useSubjects = (userId) => {
  const dispatch = useDispatch()

  // Input validation
  if (!userId) {
    console.warn('useSubjects: userId is required')
  }

  // Selectors
  const subjects = useSelector(selectAllSubjects)
  const selectedSubject = useSelector(selectSelectedSubject)
  const searchResults = useSelector(selectSearchResults)
  const loading = useSelector(selectSubjectsLoading)
  const createLoading = useSelector(selectCreateLoading)
  const updateLoading = useSelector(selectUpdateLoading)
  const deleteLoading = useSelector(selectDeleteLoading)
  const searchLoading = useSelector(selectSearchLoading)
  const error = useSelector(selectSubjectsError)
  const searchError = useSelector(selectSearchError)
  const totalCount = useSelector(selectTotalCount)
  const lastFetched = useSelector(selectLastFetched)
  const hasSubjects = useSelector(selectHasSubjects)

  // Action dispatchers
  const actions = useMemo(() => ({
    // Fetch operations
    fetchSubjects: () => {
      if (!userId) {
        console.error('fetchSubjects: userId is required')
        return Promise.reject(new Error('userId is required'))
      }
      return dispatch(fetchSubjects(userId))
    },
    
    // Create operations
    createSubject: (subjectData) => {
      if (!userId) {
        console.error('createSubject: userId is required')
        return Promise.reject(new Error('userId is required'))
      }
      return dispatch(createSubject({ userId, subjectData }))
    },
    
    createMultipleSubjects: (subjects) => {
      if (!userId) {
        console.error('createMultipleSubjects: userId is required')
        return Promise.reject(new Error('userId is required'))
      }
      return dispatch(createMultipleSubjects({ userId, subjects }))
    },
    
    // Update operations
    updateSubject: (subjectId, updates) => {
      if (!userId || !subjectId) {
        console.error('updateSubject: userId and subjectId are required')
        return Promise.reject(new Error('userId and subjectId are required'))
      }
      return dispatch(updateSubject({ subjectId, userId, updates }))
    },
    
    bulkUpdateSubjects: (updates) => {
      if (!userId) {
        console.error('bulkUpdateSubjects: userId is required')
        return Promise.reject(new Error('userId is required'))
      }
      return dispatch(bulkUpdateSubjects({ userId, updates }))
    },
    
    // Delete operations
    deleteSubject: (subjectId) => {
      if (!userId || !subjectId) {
        console.error('deleteSubject: userId and subjectId are required')
        return Promise.reject(new Error('userId and subjectId are required'))
      }
      return dispatch(deleteSubject({ subjectId, userId }))
    },
    
    deleteAllSubjects: () => {
      if (!userId) {
        console.error('deleteAllSubjects: userId is required')
        return Promise.reject(new Error('userId is required'))
      }
      return dispatch(deleteAllSubjects(userId))
    },
    
    // Search operations
    searchSubjects: (searchTerm) => {
      if (!userId) {
        console.error('searchSubjects: userId is required')
        return Promise.reject(new Error('userId is required'))
      }
      return dispatch(searchSubjects({ userId, searchTerm }))
    },
    
    // Get single subject
    getSubjectById: (subjectId) => {
      if (!userId || !subjectId) {
        console.error('getSubjectById: userId and subjectId are required')
        return Promise.reject(new Error('userId and subjectId are required'))
      }
      return dispatch(getSubjectById({ subjectId, userId }))
    },
    
    // Local state actions
    clearError: () => dispatch(clearError()),
    clearSearchResults: () => dispatch(clearSearchResults()),
    setSelectedSubject: (subject) => dispatch(setSelectedSubject(subject)),
    clearSelectedSubject: () => dispatch(clearSelectedSubject()),
    resetState: () => dispatch(resetSubjectsState()),
    
    // Optimistic updates
    updateSubjectLocal: (subjectId, updates) => 
      dispatch(updateSubjectLocal({ subjectId, updates })),
    addSubjectLocal: (subject) => dispatch(addSubjectLocal(subject)),
    removeSubjectLocal: (subjectId) => dispatch(removeSubjectLocal(subjectId))
  }), [dispatch, userId])

  // Computed selectors with memoization - FIXED: Removed useSelector inside useMemo
  const selectors = useMemo(() => ({
    getSubjectById: (subjectId) => 
      subjects.find(subject => subject.id === subjectId),
    
    getSubjectsByName: (searchTerm) => 
      subjects.filter(subject => 
        subject.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    
    getSubjectsByProfessor: (professorName) => 
      subjects.filter(subject => 
        subject.professor_name && 
        subject.professor_name.toLowerCase().includes(professorName.toLowerCase())
      )
  }), [subjects])

  // Utility functions
  const utils = useMemo(() => ({
    // Check if data needs refresh (older than 5 minutes)
    needsRefresh: () => {
      if (!lastFetched) return true
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      return new Date(lastFetched) < fiveMinutesAgo
    },

    // Get subject by ID from current state
    findSubjectById: (subjectId) => 
      subjects.find(subject => subject.id === subjectId),

    // Filter subjects by criteria
    filterSubjects: (criteria) => {
      if (!criteria || typeof criteria !== 'object') return subjects
      
      return subjects.filter(subject => {
        if (criteria.name && !subject.name?.toLowerCase().includes(criteria.name.toLowerCase())) {
          return false
        }
        if (criteria.professorName && subject.professor_name && 
            !subject.professor_name.toLowerCase().includes(criteria.professorName.toLowerCase())) {
          return false
        }
        if (criteria.id && subject.id !== criteria.id) {
          return false
        }
        return true
      })
    },

    // Sort subjects - IMPROVED: Better type handling and validation
    sortSubjects: (sortBy = 'created_at', order = 'asc') => {
      if (!Array.isArray(subjects)) return []
      
      return [...subjects].sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        
        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return order === 'asc' ? 1 : -1
        if (bVal == null) return order === 'asc' ? -1 : 1
        
        // Handle different data types
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const comparison = aVal.localeCompare(bVal)
          return order === 'asc' ? comparison : -comparison
        }
        
        if (order === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
        }
      })
    },

    // Get subjects statistics
    getStats: () => ({
      total: totalCount || 0,
      withProfessor: subjects.filter(s => s.professor_name).length,
      withoutProfessor: subjects.filter(s => !s.professor_name).length,
      lastUpdated: lastFetched,
      hasData: subjects.length > 0
    })
  }), [subjects, totalCount, lastFetched])

  // Combined loading states
  const loadingStates = useMemo(() => ({
    isLoading: loading,
    isCreating: createLoading,
    isUpdating: updateLoading,
    isDeleting: deleteLoading,
    isSearching: searchLoading,
    isAnyLoading: loading || createLoading || updateLoading || deleteLoading || searchLoading
  }), [loading, createLoading, updateLoading, deleteLoading, searchLoading])

  // Error states
  const errorStates = useMemo(() => ({
    hasError: !!error,
    hasSearchError: !!searchError,
    hasAnyError: !!error || !!searchError,
    error,
    searchError
  }), [error, searchError])

  // Convenience methods with error handling
  const safeMethods = useMemo(() => ({
    // Safe create with validation
    safeCreateSubject: async (subjectData) => {
      try {
        if (!userId) {
          throw new Error('User ID is required')
        }
        if (!subjectData?.name?.trim()) {
          throw new Error('Subject name is required')
        }
        const result = await dispatch(createSubject({ userId, subjectData })).unwrap()
        console.log('Create Subject dispatched')
        return result
      } catch (error) {
        console.error('Error creating subject:', error)
        throw error
      }
    },

    // Safe update with validation
    safeUpdateSubject: async (subjectId, updates) => {
      try {
        if (!userId) {
          throw new Error('User ID is required')
        }
        if (!subjectId) {
          throw new Error('Subject ID is required')
        }
        if (!updates || typeof updates !== 'object') {
          throw new Error('Updates object is required')
        }
        const result = await dispatch(updateSubject({ subjectId, userId, updates })).unwrap()
        return result
      } catch (error) {
        console.error('Error updating subject:', error)
        throw error
      }
    },

    // Safe delete with confirmation
    safeDeleteSubject: async (subjectId, confirmCallback = null) => {
      try {
        if (!userId) {
          throw new Error('User ID is required')
        }
        if (!subjectId) {
          throw new Error('Subject ID is required')
        }
        
        if (confirmCallback && typeof confirmCallback === 'function' && !confirmCallback()) {
          return { cancelled: true }
        }
        
        const result = await dispatch(deleteSubject({ subjectId, userId })).unwrap()
        return result
      } catch (error) {
        console.error('Error deleting subject:', error)
        throw error
      }
    },
  
    // Safe fetch with refresh check
    safeFetchSubjects: async (forceRefresh = false) => {
      // console.log('safeFetchSubjects function hit')
 
      try {
        if (!userId) {
          throw new Error('User ID is required')
        }
        
        if (!forceRefresh && !utils.needsRefresh() && subjects.length > 0) {
          return subjects // Return cached data
        }
        
        const result = await dispatch(fetchSubjects(userId)).unwrap()
        // console.log('Fetch Subjects dispatched')
        return result
      } catch (error) {
        console.error('Error fetching subjects:', error)
        throw error
      }
    }
  }), [dispatch, userId, subjects, utils])

  return {
    // State
    subjects,
    selectedSubject,
    searchResults,
    totalCount,
    lastFetched,
    hasSubjects,

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
    ...safeMethods
  }
}

// Hook for single subject operations - IMPROVED: Better error handling and validation
export const useSubject = (subjectId, userId, autoFetch = true) => {
  const dispatch = useDispatch()
  const subject = useSelector(state => selectSubjectById(state, subjectId))
  const loading = useSelector(selectSubjectsLoading)
  const error = useSelector(selectSubjectsError)

  // Validation
  if (!userId) {
    console.warn('useSubject: userId is required')
  }

  // Auto-fetch subject if not in state
  const fetchSubject = useCallback(() => {
    if (subjectId && userId && (!subject || autoFetch)) {
      return dispatch(getSubjectById({ subjectId, userId }))
    }
    return Promise.resolve(subject)
  }, [dispatch, subjectId, userId, subject, autoFetch])

  // Auto-fetch on mount if enabled - FIXED: Use useEffect instead of useMemo
  useEffect(() => {
    if (autoFetch && subjectId && userId && !subject) {
      fetchSubject()
    }
  }, [fetchSubject, autoFetch, subjectId, userId, subject])

  return {
    subject,
    loading,
    error,
    fetchSubject,
    refetch: fetchSubject,
    hasSubject: !!subject
  }
}

// Hook for search functionality - IMPROVED: Added debouncing capability
export const useSubjectSearch = (userId, debounceMs = 300) => {
  const dispatch = useDispatch()
  const searchResults = useSelector(selectSearchResults)
  const searchLoading = useSelector(selectSearchLoading)
  const searchError = useSelector(selectSearchError)

  // Validation
  if (!userId) {
    console.warn('useSubjectSearch: userId is required')
  }

  const search = useCallback((searchTerm) => {
    if (!userId) {
      console.error('search: userId is required')
      return
    }
    
    if (searchTerm?.trim()) {
      dispatch(searchSubjects({ userId, searchTerm: searchTerm.trim() }))
    } else {
      dispatch(clearSearchResults())
    }
  }, [dispatch, userId])

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId
      return (searchTerm) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => search(searchTerm), debounceMs)
      }
    })(),
    [search, debounceMs]
  )

  const clearResults = useCallback(() => {
    dispatch(clearSearchResults())
  }, [dispatch])

  return {
    searchResults,
    searchLoading,
    searchError,
    search,
    debouncedSearch,
    clearResults,
    hasResults: searchResults.length > 0
  }
}