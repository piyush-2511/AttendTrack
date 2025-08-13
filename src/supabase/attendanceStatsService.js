import supabase from './conf'

export class AttendanceStatsService {
  static tableName = 'attendance_stats'

  /**
   * Get all attendance stats for a specific user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Response with data or error
   */
  static async getAttendanceByUserId(userId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('subject_name', { ascending: true })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get attendance stats for a specific user and subject
   * @param {string} userId - The user ID
   * @param {string} subjectId - The subject ID
   * @returns {Promise<Object>} Response with data or error
   */
  static async getAttendanceByUserAndSubject(userId, subjectId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('subject_id', subjectId)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get all attendance stats for a specific subject
   * @param {string} subjectId - The subject ID
   * @returns {Promise<Object>} Response with data or error
   */
  static async getAttendanceBySubject(subjectId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('subject_id', subjectId)
        .order('attendance_percentage', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get attendance stats by professor
   * @param {string} professorName - The professor's name
   * @returns {Promise<Object>} Response with data or error
   */
  static async getAttendanceByProfessor(professorName) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('professor_name', professorName)
        .order('attendance_percentage', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get users with low attendance (below specified percentage)
   * @param {number} threshold - Attendance percentage threshold (default: 75)
   * @param {string} subjectId - Optional: filter by specific subject
   * @returns {Promise<Object>} Response with data or error
   */
  static async getLowAttendanceUsers(threshold = 75, subjectId = null) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .lt('attendance_percentage', threshold)

      if (subjectId) {
        query = query.eq('subject_id', subjectId)
      }

      const { data, error } = await query.order('attendance_percentage', { ascending: true })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get users with high attendance (above specified percentage)
   * @param {number} threshold - Attendance percentage threshold (default: 90)
   * @param {string} subjectId - Optional: filter by specific subject
   * @returns {Promise<Object>} Response with data or error
   */
  static async getHighAttendanceUsers(threshold = 90, subjectId = null) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .gte('attendance_percentage', threshold)

      if (subjectId) {
        query = query.eq('subject_id', subjectId)
      }

      const { data, error } = await query.order('attendance_percentage', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get attendance summary for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Response with summary data or error
   */
  static async getAttendanceSummary(userId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)

      if (error) throw error

      if (data.length === 0) {
        return { 
          success: true, 
          data: {
            totalSubjects: 0,
            averageAttendance: 0,
            totalPresentDays: 0,
            totalAbsentDays: 0,
            totalOffDays: 0,
            totalDays: 0,
            subjectsBelow75: 0,
            subjectsBelow80: 0,
            subjectsAbove90: 0,
            subjects: []
          }
        }
      }

      const summary = {
        totalSubjects: data.length,
        averageAttendance: Math.round(data.reduce((sum, record) => sum + record.attendance_percentage, 0) / data.length * 100) / 100,
        totalPresentDays: data.reduce((sum, record) => sum + record.present_days, 0),
        totalAbsentDays: data.reduce((sum, record) => sum + record.absent_days, 0),
        totalOffDays: data.reduce((sum, record) => sum + record.off_days, 0),
        totalDays: data.reduce((sum, record) => sum + record.total_days, 0),
        subjectsBelow75: data.filter(record => record.attendance_percentage < 75).length,
        subjectsBelow80: data.filter(record => record.attendance_percentage < 80).length,
        subjectsAbove90: data.filter(record => record.attendance_percentage >= 90).length,
        subjects: data.sort((a, b) => b.attendance_percentage - a.attendance_percentage)
      }

      return { success: true, data: summary }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get attendance stats within a percentage range
   * @param {number} minPercentage - Minimum attendance percentage
   * @param {number} maxPercentage - Maximum attendance percentage
   * @param {string} subjectId - Optional: filter by specific subject
   * @returns {Promise<Object>} Response with data or error
   */
  static async getAttendanceByPercentageRange(minPercentage, maxPercentage, subjectId = null) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .gte('attendance_percentage', minPercentage)
        .lte('attendance_percentage', maxPercentage)

      if (subjectId) {
        query = query.eq('subject_id', subjectId)
      }

      const { data, error } = await query.order('attendance_percentage', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get all unique professors
   * @returns {Promise<Object>} Response with professors list or error
   */
  static async getAllProfessors() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('professor_name')
        .order('professor_name', { ascending: true })

      if (error) throw error
      
      const uniqueProfessors = [...new Set(data.map(item => item.professor_name))]
        .filter(name => name) // Remove any null/undefined names
      
      return { success: true, data: uniqueProfessors }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get all unique subjects with their details
   * @returns {Promise<Object>} Response with subjects list or error
   */
  static async getAllSubjects() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('subject_id, subject_name, professor_name')
        .order('subject_name', { ascending: true })

      if (error) throw error
      
      const uniqueSubjects = data.reduce((acc, curr) => {
        const existing = acc.find(item => item.subject_id === curr.subject_id)
        if (!existing) {
          acc.push(curr)
        }
        return acc
      }, [])
      
      return { success: true, data: uniqueSubjects }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get attendance statistics grouped by subject
   * @returns {Promise<Object>} Response with subject-wise stats or error
   */
  static async getSubjectWiseStats() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('subject_name', { ascending: true })

      if (error) throw error

      const subjectStats = data.reduce((acc, record) => {
        const subjectId = record.subject_id
        
        if (!acc[subjectId]) {
          acc[subjectId] = {
            subject_id: record.subject_id,
            subject_name: record.subject_name,
            professor_name: record.professor_name,
            total_students: 0,
            average_attendance: 0,
            students_below_75: 0,
            students_above_90: 0,
            highest_attendance: 0,
            lowest_attendance: 100
          }
        }

        acc[subjectId].total_students += 1
        acc[subjectId].average_attendance += record.attendance_percentage
        
        if (record.attendance_percentage < 75) {
          acc[subjectId].students_below_75 += 1
        }
        
        if (record.attendance_percentage >= 90) {
          acc[subjectId].students_above_90 += 1
        }
        
        acc[subjectId].highest_attendance = Math.max(acc[subjectId].highest_attendance, record.attendance_percentage)
        acc[subjectId].lowest_attendance = Math.min(acc[subjectId].lowest_attendance, record.attendance_percentage)

        return acc
      }, {})

      // Calculate averages
      Object.values(subjectStats).forEach(subject => {
        subject.average_attendance = Math.round((subject.average_attendance / subject.total_students) * 100) / 100
      })

      return { success: true, data: Object.values(subjectStats) }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get attendance statistics grouped by professor
   * @returns {Promise<Object>} Response with professor-wise stats or error
   */
  static async getProfessorWiseStats() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('professor_name', { ascending: true })

      if (error) throw error

      const professorStats = data.reduce((acc, record) => {
        const professorName = record.professor_name
        
        if (!acc[professorName]) {
          acc[professorName] = {
            professor_name: professorName,
            total_students: 0,
            total_subjects: new Set(),
            average_attendance: 0,
            students_below_75: 0,
            students_above_90: 0,
            highest_attendance: 0,
            lowest_attendance: 100
          }
        }

        acc[professorName].total_students += 1
        acc[professorName].total_subjects.add(record.subject_id)
        acc[professorName].average_attendance += record.attendance_percentage
        
        if (record.attendance_percentage < 75) {
          acc[professorName].students_below_75 += 1
        }
        
        if (record.attendance_percentage >= 90) {
          acc[professorName].students_above_90 += 1
        }
        
        acc[professorName].highest_attendance = Math.max(acc[professorName].highest_attendance, record.attendance_percentage)
        acc[professorName].lowest_attendance = Math.min(acc[professorName].lowest_attendance, record.attendance_percentage)

        return acc
      }, {})

      // Calculate averages and convert Set to count
      Object.values(professorStats).forEach(professor => {
        professor.average_attendance = Math.round((professor.average_attendance / professor.total_students) * 100) / 100
        professor.total_subjects = professor.total_subjects.size
      })

      return { success: true, data: Object.values(professorStats) }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Search attendance records by user, subject, or professor name
   * @param {string} searchTerm - Search term
   * @returns {Promise<Object>} Response with filtered data or error
   */
  static async searchAttendanceRecords(searchTerm) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .or(`subject_name.ilike.%${searchTerm}%,professor_name.ilike.%${searchTerm}%`)
        .order('attendance_percentage', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}