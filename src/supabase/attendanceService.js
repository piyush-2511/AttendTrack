// attendanceService.js
import supabase from './conf';

class AttendanceService {
  // Get attendance records for a specific date
  async getAttendanceByDate(date) {
    // console.log('Supabase Client:',supabase)
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          subjects (
            id,
            name,
            professor_name
          )
        `)
        .eq('date', date)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching attendance by date:', error);
      return { data: null, error: error.message };
    }
  }

  // Get attendance records for a specific subject
  async getAttendanceBySubject(subjectId, startDate = null, endDate = null) {
    try {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          subjects (
            id,
            name,
            professor_name
          )
        `)
        .eq('subject_id', subjectId)
        .order('date', { ascending: false });

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching attendance by subject:', error);
      return { data: null, error: error.message };
    }
  }

  // Get attendance records for a date range
  async getAttendanceByDateRange(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          subjects (
            id,
            name,
            professor_name
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching attendance by date range:', error);
      return { data: null, error: error.message };
    }
  }

  // Mark attendance (create or update)
  async markAttendance(subjectId, date, status) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const attendanceData = {
        user_id: user.user.id,
        subject_id: subjectId,
        date,
        status
      };

      // Use upsert to handle both create and update
      const { data, error } = await supabase
        .from('attendance')
        .upsert(attendanceData, {
          onConflict: 'user_id,subject_id,date',
          returning: 'representation'
        })
        .select(`
          *,
          subjects (
            id,
            name,
            professor_name
          )
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error marking attendance:', error);
      return { data: null, error: error.message };
    }
  }

  // Remove attendance record (set to null/none)
  async removeAttendance(subjectId, date) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('attendance')
        .delete()
        .eq('user_id', user.user.id)
        .eq('subject_id', subjectId)
        .eq('date', date);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error removing attendance:', error);
      return { data: null, error: error.message };
    }
  }

  // Get attendance statistics
  async getAttendanceStats() {
    try {
      const { data, error } = await supabase
        .rpc('get_attendance_stats');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      return { data: null, error: error.message };
    }
  }

  // Get attendance statistics for a specific subject
  async getSubjectAttendanceStats(subjectId) {
    try {
      const { data, error } = await supabase
        .rpc('get_attendance_stats')
        .eq('subject_id', subjectId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching subject attendance stats:', error);
      return { data: null, error: error.message };
    }
  }

  // Bulk mark attendance for multiple subjects on the same date
  async bulkMarkAttendance(attendanceRecords) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const recordsWithUserId = attendanceRecords.map(record => ({
        ...record,
        user_id: user.user.id
      }));

      const { data, error } = await supabase
        .from('attendance')
        .upsert(recordsWithUserId, {
          onConflict: 'user_id,subject_id,date',
          returning: 'representation'
        })
        .select(`
          *,
          subjects (
            id,
            name,
            professor_name
          )
        `);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error bulk marking attendance:', error);
      return { data: null, error: error.message };
    }
  }

  // Get today's subjects that need attendance marking
  async getTodaysSubjects() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.

      // This would require a schedule/timetable table
      // For now, we'll get all subjects and check if attendance is already marked
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('*');

      if (subjectsError) throw subjectsError;

      // Check which subjects already have attendance marked for today
      const { data: todaysAttendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('subject_id')
        .eq('date', today);

      if (attendanceError) throw attendanceError;

      const markedSubjectIds = new Set(todaysAttendance.map(a => a.subject_id));

      const subjectsWithAttendanceStatus = subjects.map(subject => ({
        ...subject,
        hasAttendanceMarked: markedSubjectIds.has(subject.id)
      }));

      return { data: subjectsWithAttendanceStatus, error: null };
    } catch (error) {
      console.error('Error fetching today\'s subjects:', error);
      return { data: null, error: error.message };
    }
  }

  // Calculate attendance percentage manually (fallback)
  calculateAttendancePercentage(attendanceRecords) {
    if (!attendanceRecords || attendanceRecords.length === 0) return 0;

    const validRecords = attendanceRecords.filter(record => record.status !== 'off');
    const presentRecords = attendanceRecords.filter(record => record.status === 'present');

    if (validRecords.length === 0) return 0;

    return Math.round((presentRecords.length / validRecords.length) * 100 * 100) / 100;
  }

  // Reset attendance data
  async resetAttendanceData() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('attendance')
        .delete()
        .eq('user_id', user.user.id);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error resetting attendance data:', error);
      return { data: null, error: error.message };
    }
  }
}

export const attendanceService = new AttendanceService();