// scheduleService.js
import supabase  from './conf';

class ScheduleService {
  // Get today's schedule
  async getTodaysSchedule() {
    try {
      const { data, error } = await supabase
        .rpc('get_todays_schedule');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching today\'s schedule:', error);
      return { data: null, error: error.message };
    }
  }

  // Get schedule for a specific day
  async getScheduleByDay(day) {
    try {
      const { data, error } = await supabase
        .rpc('get_schedule_by_day', { target_day: day });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching schedule by day:', error);
      return { data: null, error: error.message };
    }
  }

  // Get full weekly schedule
  async getWeeklySchedule() {
    try {
      const { data, error } = await supabase
        .rpc('get_weekly_schedule');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching weekly schedule:', error);
      return { data: null, error: error.message };
    }
  }

  // Get all schedule entries (raw data)
  async getAllScheduleEntries() {
    try {
      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .order('day', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching all schedule entries:', error);
      return { data: null, error: error.message };
    }
  }

  // Create or update schedule for a specific day
  async setScheduleForDay(day, subjectlist) {
    try {
      const { data: {user} } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      console.log(user)

      const scheduleData = {
        user_id: user?.id,
        day,
        subjectlist
      };

      // Use upsert to handle both create and update
      const { data, error } = await supabase
        .from('schedule')
        .upsert(scheduleData, {
          onConflict: 'user_id,day',
          returning: 'representation'
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error setting schedule for day:', error);
      return { data: null, error: error.message };
    }
  }

  // Update schedule for a specific day (add/remove subjects)
  async updateScheduleForDay(day, subjectlist) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('schedule')
        .update({ subjectlist })
        .eq('user_id', user.user.id)
        .eq('day', day)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating schedule for day:', error);
      return { data: null, error: error.message };
    }
  }

  // Add subject to a specific day
  async addSubjectToDay(day, subjectName) {
    try {
      // Get current schedule for the day
      const { data: currentSchedule } = await this.getScheduleByDay(day);
      
      let currentSubjects = [];
      if (currentSchedule && currentSchedule.length > 0) {
        currentSubjects = currentSchedule[0].subjectlist || [];
      }

      // Add subject if not already present
      if (!currentSubjects.includes(subjectName)) {
        currentSubjects.push(subjectName);
        return await this.setScheduleForDay(day, currentSubjects);
      }

      return { data: currentSchedule[0] || null, error: null };
    } catch (error) {
      console.error('Error adding subject to day:', error);
      return { data: null, error: error.message };
    }
  }

  // Remove subject from a specific day
  async removeSubjectFromDay(day, subjectName) {
    try {
      // Get current schedule for the day
      const { data: currentSchedule } = await this.getScheduleByDay(day);
      
      if (!currentSchedule || currentSchedule.length === 0) {
        return { data: null, error: 'No schedule found for this day' };
      }

      const currentSubjects = currentSchedule[0].subjectlist || [];
      const updatedSubjects = currentSubjects.filter(subject => subject !== subjectName);

      return await this.setScheduleForDay(day, updatedSubjects);
    } catch (error) {
      console.error('Error removing subject from day:', error);
      return { data: null, error: error.message };
    }
  }

  // Delete schedule for a specific day
  async deleteScheduleForDay(day) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('schedule')
        .delete()
        .eq('user_id', user.user.id)
        .eq('day', day);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error deleting schedule for day:', error);
      return { data: null, error: error.message };
    }
  }

  // Bulk set weekly schedule
  async setWeeklySchedule(weeklyScheduleData) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Prepare data for upsert
      const scheduleEntries = weeklyScheduleData.map(daySchedule => ({
        user_id: user.user.id,
        day: daySchedule.day,
        subjectlist: daySchedule.subjectlist
      }));

      const { data, error } = await supabase
        .from('schedule')
        .upsert(scheduleEntries, {
          onConflict: 'user_id,day',
          returning: 'representation'
        })
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error setting weekly schedule:', error);
      return { data: null, error: error.message };
    }
  }

  async getSubjectIdByName(subjectName) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', subjectName)
        .single(); // since names are unique
  
      if (error) throw error;
  
      return { subject_id: data.id, error: null };
    } catch (error) {
      console.error('Error fetching subject ID by name:', error);
      return { subject_id: null, error: error.message };
    }
  }
  



  // Get subjects scheduled for today
  async getTodaysSubjects() {
    try {
      const today = new Date().getDay();
      const { data: todaysSchedule } = await this.getScheduleByDay(today);
      
      if (!todaysSchedule || todaysSchedule.length === 0) {
        return { data: [], error: null };
      }

      const subjects = todaysSchedule[0].subjectlist || [];
      return { data: subjects, error: null };
    } catch (error) {
      console.error('Error fetching today\'s subjects:', error);
      return { data: null, error: error.message };
    }
  }
  // Get subjects for a specific day
  async getSubjectsForDay(day) {
    try {
      const { data: daySchedule } = await this.getScheduleByDay(day);
      
      if (!daySchedule || daySchedule.length === 0) {
        return { data: [], error: null };
      }

      const subjects = daySchedule[0].subjectlist || [];
      return { data: subjects, error: null };
    } catch (error) {
      console.error('Error fetching subjects for day:', error);
      return { data: null, error: error.message };
    }
  }

  // Reset all schedule data
  async resetScheduleData() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('schedule')
        .delete()
        .eq('user_id', user.user.id);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error resetting schedule data:', error);
      return { data: null, error: error.message };
    }
  }

  // Utility functions
  getDayName(day) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || 'Unknown';
  }

  getCurrentDay() {
    return new Date().getDay();
  }

  // Get schedule statistics
  getScheduleStats(weeklySchedule) {
    const stats = {
      totalDays: 0,
      totalSubjects: 0,
      subjectsByDay: {},
      mostBusyDay: null,
      leastBusyDay: null,
      averageSubjectsPerDay: 0
    };

    if (!weeklySchedule || weeklySchedule.length === 0) {
      return stats;
    }

    weeklySchedule.forEach(daySchedule => {
      const day = daySchedule.day;
      const subjects = daySchedule.subjectlist || [];
      const subjectCount = subjects.length;

      if (subjectCount > 0) {
        stats.totalDays++;
        stats.totalSubjects += subjectCount;
      }

      stats.subjectsByDay[day] = {
        dayName: this.getDayName(day),
        subjectCount,
        subjects
      };
    });

    // Find most and least busy days
    const daysWithSubjects = Object.entries(stats.subjectsByDay)
      .filter(([_, data]) => data.subjectCount > 0)
      .map(([day, data]) => ({ day: parseInt(day), ...data }));

    if (daysWithSubjects.length > 0) {
      stats.mostBusyDay = daysWithSubjects.reduce((max, current) => 
        current.subjectCount > max.subjectCount ? current : max
      );

      stats.leastBusyDay = daysWithSubjects.reduce((min, current) => 
        current.subjectCount < min.subjectCount ? current : min
      );

      stats.averageSubjectsPerDay = Math.round((stats.totalSubjects / stats.totalDays) * 100) / 100;
    }

    return stats;
  }

  // Validate schedule data
  validateScheduleData(day, subjectlist) {
    const errors = [];

    if (day < 0 || day > 6) {
      errors.push('Invalid day of week');
    }

    if (!Array.isArray(subjectlist)) {
      errors.push('Subject list must be an array');
    }

    if (subjectlist && subjectlist.length === 0) {
      errors.push('Subject list cannot be empty');
    }

    // Check for duplicate subjects
    if (subjectlist && Array.isArray(subjectlist)) {
      const uniqueSubjects = [...new Set(subjectlist)];
      if (uniqueSubjects.length !== subjectlist.length) {
        errors.push('Duplicate subjects found');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const scheduleService = new ScheduleService();