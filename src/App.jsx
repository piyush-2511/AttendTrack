import { useState } from 'react'
import './App.css'
import {Routes, Route} from 'react-router-dom'
import ProtectedRoutes from './Components/ProtectedRoutes'
import PublicRoutes from './Components/PublicRoutes'
import {useAuth} from './Hooks/useAuth'
import LoadingSpinner from './Components/LoadingSpinner'

//import pages 
import SignUp from './Components/SignUp'
import Login from './Components/Login'
import DashBoard from './Components/DashBoard'
import NotFound from './Components/NotFound'
import ResetPassword from './Components/ResetPassword'
import Schedule from './Components/Schedule'
import AddSubjects from './Components/AddSubjects'
import Calendar from './Components/Calendar'
import Settings from './Components/Setting'
import TodayClasses from './Components/TodayClasses'
import Analytics from './Components/Analytics'

function App() {
  const { isInitialized, isLoading} = useAuth()

  //Show loading while checking auth state 
  if (!isInitialized || isLoading){
    return <LoadingSpinner />
  }

  return (
    <div className="App">
      <Routes>
        {/* Public routes - redirect to dashboard if authenticated */}
        <Route path="/login" element={
          <PublicRoutes>
            <Login />
          </PublicRoutes>
        } />
        
        <Route path="/signup" element={
          <PublicRoutes>
            <SignUp />
          </PublicRoutes>
        } />
        
        <Route path="/reset-password" element={
          <PublicRoutes>
            <ResetPassword />
          </PublicRoutes>
        } />

        {/* Protected routes - require authentication */}
        <Route path="/" element={
          <ProtectedRoutes>
            <DashBoard />
          </ProtectedRoutes>
        } />
        <Route path="/schedule" element={
          <ProtectedRoutes>
            <Schedule />
          </ProtectedRoutes>
        } />
        <Route path="/add-subjects" element={
          <ProtectedRoutes>
            <AddSubjects />
          </ProtectedRoutes>
        } />
        <Route path="/calendar" element={
          <ProtectedRoutes>
            <Calendar />
          </ProtectedRoutes>
        } />
        <Route path="/todays" element={
          <ProtectedRoutes>
            <TodayClasses />
          </ProtectedRoutes>
        } />
        <Route path="/settings" element={
          <ProtectedRoutes>
            <Settings />
          </ProtectedRoutes>
        } />
        <Route path="/analytics" element={
          <ProtectedRoutes>
            <Analytics />
          </ProtectedRoutes>
        } />
        
        
      

        {/* Default route */}
        <Route path="/" element={
          <PublicRoutes>
            <Login />
          </PublicRoutes>
        } />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
