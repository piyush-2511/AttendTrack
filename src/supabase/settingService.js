import supabase from './conf' // Adjust path as needed

class SettingService {
  // Get user settings
  async getSettings(userId) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // If no settings found, create default settings
        if (error.code === 'PGRST116') {
          return await this.createDefaultSettings(userId)
        }
        throw error
      }

      return {
        theme: data.theme,
        minpercentage: data.minpercentage,
        resetsubject: data.resetsubject,
        resetattendance: data.resetattendance,
        resetdata: data.resetdata
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      throw new Error(`Failed to fetch settings: ${error.message}`)
    }
  }

  // Create default settings for new user
  async createDefaultSettings(userId) {
    try {
      const defaultSettings = {
        user_id: userId,
        theme: 'dark',
        minpercentage: 75,
        resetsubject: false,
        resetattendance: false,
        resetdata: false
      }

      const { data, error } = await supabase
        .from('settings')
        .insert([defaultSettings])
        .select()
        .single()

      if (error) throw error

      return {
        theme: data.theme,
        minpercentage: data.minpercentage,
        resetsubject: data.resetsubject,
        resetattendance: data.resetattendance,
        resetdata: data.resetdata
      }
    } catch (error) {
      console.error('Error creating default settings:', error)
      throw new Error(`Failed to create default settings: ${error.message}`)
    }
  }

  // Update user settings
  async updateSettings(userId, settings) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .update(settings)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return {
        theme: data.theme,
        minpercentage: data.minpercentage,
        resetsubject: data.resetsubject,
        resetattendance: data.resetattendance,
        resetdata: data.resetdata
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      throw new Error(`Failed to update settings: ${error.message}`)
    }
  }

  // Reset subjects data
  async resetsubjects(userId) {
    try {
      // Delete all subjects for the user
      const { error: subjectsError } = await supabase
        .from('subjects') // Assuming you have a subjects table
        .delete()
        .eq('user_id', userId)

      if (subjectsError) throw subjectsError

      // Update reset flag to false
      const { error: settingsError } = await supabase
        .from('settings')
        .update({ resetsubject: false })
        .eq('user_id', userId)

      if (settingsError) throw settingsError

      return { message: 'Subjects reset successfully' }
    } catch (error) {
      console.error('Error resetting subjects:', error)
      throw new Error(`Failed to reset subjects: ${error.message}`)
    }
  }

  // Reset attendance data
  async resetattendance(userId) {
    try {
      // Delete all attendance records for the user
      const { error: attendanceError } = await supabase
        .from('attendance') // Assuming you have an attendance table
        .delete()
        .eq('user_id', userId)

      if (attendanceError) throw attendanceError

      // Update reset flag to false
      const { error: settingsError } = await supabase
        .from('settings')
        .update({ resetattendance: false })
        .eq('user_id', userId)

      if (settingsError) throw settingsError

      return { message: 'Attendance reset successfully' }
    } catch (error) {
      console.error('Error resetting attendance:', error)
      throw new Error(`Failed to reset attendance: ${error.message}`)
    }
  }

  // Reset all user data
  async resetAllData(userId) {
    try {
      // Start a transaction-like operation
      const promises = []

      // Delete subjects
      promises.push(
        supabase
          .from('subjects')
          .delete()
          .eq('user_id', userId)
      )

      // Delete attendance
      promises.push(
        supabase
          .from('attendance')
          .delete()
          .eq('user_id', userId)
      )

      // Delete schedule (if you have one)
      promises.push(
        supabase
          .from('schedule') // Assuming you have a schedule table
          .delete()
          .eq('user_id', userId)
      )

      // Execute all deletions
      const results = await Promise.all(promises)
      
      // Check for errors
      for (const result of results) {
        if (result.error) throw result.error
      }

      // Reset settings to default and update reset flags
      const { error: settingsError } = await supabase
        .from('settings')
        .update({
          theme: 'light',
          minpercentage: 75,
          resetsubject: false,
          resetattendance: false,
          resetdata: false
        })
        .eq('user_id', userId)

      if (settingsError) throw settingsError

      return { message: 'All data reset successfully' }
    } catch (error) {
      console.error('Error resetting all data:', error)
      throw new Error(`Failed to reset all data: ${error.message}`)
    }
  }

  // Check if user settings exist
  async settingsExist(userId) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return !!data
    } catch (error) {
      console.error('Error checking settings existence:', error)
      return false
    }
  }

  // Upsert settings (insert or update)
  async upsertSettings(userId, settings) {
    try {
      const settingsData = {
        user_id: userId,
        ...settings
      }

      const { data, error } = await supabase
        .from('settings')
        .upsert([settingsData], {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (error) throw error

      return {
        theme: data.theme,
        minpercentage: data.minpercentage,
        resetsubject: data.resetsubject,
        resetattendance: data.resetattendance,
        resetdata: data.resetdata
      }
    } catch (error) {
      console.error('Error upserting settings:', error)
      throw new Error(`Failed to upsert settings: ${error.message}`)
    }
  }
}

// Export singleton instance
export const settingService = new SettingService()