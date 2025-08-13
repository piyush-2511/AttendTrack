import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchSettings,
  createSettings,
  updateSettingsInDB,
  performResetSubject,
  performResetAttendance,
  performResetData,
  setTheme,
  toggleTheme,
  setMinPercentage,
  clearError,
  resetToDefault,
  selectTheme,
  selectMinPercentage,
  selectResetStates,
  selectIsLoading,
  selectResetLoading,
  selectError
} from '../Feature/settingSlice'

export const useSettings = (userId) => {
  const dispatch = useDispatch()
  
  // Selectors
  const settingTheme = useSelector(selectTheme)
  const minPercentage = useSelector(selectMinPercentage)
  const resetStates = useSelector(selectResetStates)
  const isLoading = useSelector(selectIsLoading)
  const resetLoading = useSelector(selectResetLoading)
  const error = useSelector(selectError)

  // Initialize settings on mount
  useEffect(() => {
    if (userId) {
      dispatch(fetchSettings(userId))
    }
  }, [dispatch, userId])

  // Create settings (useful for first-time users)
  const createUserSettings = useCallback(async (initialSettings = {}) => {
    if (userId) {
      await dispatch(createSettings({ 
        userId, 
        settings: initialSettings 
      }))
    }
  }, [dispatch, userId])

  // Theme actions
  const changeTheme = useCallback(async (newTheme) => {
    dispatch(setTheme(newTheme))
    if (userId) {
      await dispatch(updateSettingsInDB({ 
        userId, 
        settings: { theme: newTheme } 
      }))
    }
  }, [dispatch, userId])

  // Fixed: Use settingTheme instead of undefined theme variable
  const handleToggleTheme = useCallback(async () => {
    dispatch(toggleTheme())
    const newTheme = settingTheme === 'light' ? 'dark' : 'light'
    if (userId) {
      await dispatch(updateSettingsInDB({ 
        userId, 
        settings: { theme: newTheme } 
      }))
    }
  }, [dispatch, userId, settingTheme]) // Fixed dependency

  // Percentage actions
  const changeMinPercentage = useCallback(async (percentage) => {

    dispatch(setMinPercentage(percentage))
    if (userId) {
      await dispatch(updateSettingsInDB({ 
        userId, 
        settings: { minpercentage: percentage }
      }))
    }
  }, [dispatch, userId])

  // Reset actions
  const resetSubjects = useCallback(async () => {
    if (userId) {
      await dispatch(performResetSubject(userId))
    }
  }, [dispatch, userId])

  const resetAttendance = useCallback(async () => {
    if (userId) {
      await dispatch(performResetAttendance(userId))
    }
  }, [dispatch, userId])

  const resetAllData = useCallback(async () => {
    if (userId) {
      await dispatch(performResetData(userId))
    }
  }, [dispatch, userId])

  // Utility actions
  const handleClearError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleResetToDefault = useCallback(async () => {
    dispatch(resetToDefault())
    if (userId) {
      await dispatch(updateSettingsInDB({ 
        userId, 
        settings: { 
          theme: 'dark', // Fixed: changed back to 'dark' to match initial state
          minpercentage: 75,
          resetsubject: false,
          resetattendance: false,
          resetdata: false
        } 
      }))
    }
  }, [dispatch, userId])

  // Initialize settings for new users (alternative approach)
  const initializeSettingsIfNeeded = useCallback(async (customSettings = {}) => {
    if (userId && !isLoading && error?.includes('no settings found')) {
      const defaultSettings = {
        theme: 'dark',
        minpercentage: 75,
        resetsubject: false,
        resetattendance: false,
        resetdata: false,
        ...customSettings
      }
      await dispatch(createSettings({ 
        userId, 
        settings: defaultSettings 
      }))
    }
  }, [dispatch, userId, isLoading, error])

  // Computed values
  const isDarkTheme = settingTheme === 'dark' // Fixed: use settingTheme instead of theme
  const isAnyResetInProgress = resetLoading.subject || resetLoading.attendance || resetLoading.data

  return {
    // State
    settingTheme,
    minPercentage,
    resetStates,
    isLoading,
    resetLoading,
    error,
    isDarkTheme,
    isAnyResetInProgress,

    // Settings creation
    createUserSettings,
    initializeSettingsIfNeeded,

    // Theme actions
    changeTheme,
    toggleTheme: handleToggleTheme,

    // Percentage actions
    changeMinPercentage,

    // Reset actions
    resetSubjects,
    resetAttendance,
    resetAllData,

    // Utility actions
    clearError: handleClearError,
    resetToDefault: handleResetToDefault
  }
}