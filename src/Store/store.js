import { configureStore } from "@reduxjs/toolkit";
import settingReducer from '../Feature/settingSlice'
import authReducer from '../Feature/authSlice'
import subjectReducer from '../Feature/subjectSlice'
import scheduleReducer from '../Feature/scheduleSlice'
import attendanceReducer from '../Feature/attendanceSlice'

export const store = configureStore({
  reducer : {
    auth : authReducer,
    subjects : subjectReducer,
    settings : settingReducer,
    attendance : attendanceReducer,
    schedule : scheduleReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setAuthState']
      }
    })
})

export default store