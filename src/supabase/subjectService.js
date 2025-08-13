import { createClient } from '@supabase/supabase-js'
import conf from '../conf/conf.js'

class SubjectService {

  constructor() {
    this.supabase = createClient(conf.supabaseUrl, conf.supabaseKey)
  }
  // Get all subjects for a user
  async getSubjects(userId) {
    try {
      const { data, error } = await this.supabase
        .from('subjects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching subjects:', error)
      throw new Error(`Failed to fetch subjects: ${error.message}`)
    }
  }

  // Get a single subject by ID
  async getSubjectById(subjectId, userId) {
    try {
      const { data, error } = await this.supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Subject not found')
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching subject by ID:', error)
      throw new Error(`Failed to fetch subject: ${error.message}`)
    }
  }

  async createSubject(userId, subjectData) {
    console.log('Supabase Client : ',this.supabase)
    try {
      // Input validation
      if (!userId) throw new Error('User ID is required')
      if (!subjectData) throw new Error('Subject data is required')
      
      const { name, professor_name, color } = subjectData
      
      if (!name?.trim()) throw new Error('Subject name is required')
      
      // Check for existing subject
      const existingSubject = await this.getSubjectByName(userId, name.trim())
      if (existingSubject) {
        throw new Error('Subject already exists')
      }
  
      const { data, error } = await this.supabase
        .from('subjects')
        .insert([{
          user_id: userId,
          name: name.trim(),
          professor_name: professor_name?.trim() || null,
          color: color?.trim() || null,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
  
      if (error) throw error
      return data
      
    } catch (error) {
      console.error('Error creating subject:', error)
      throw error // Let the original error bubble up
    }
  }

  // Create multiple subjects at once
  async createMultipleSubjects(userId, subjectNames) {
    try {
      // Filter out duplicates and empty names
      const uniqueNames = [...new Set(subjectNames.map(name => name.trim()).filter(name => name))]
      
      if (uniqueNames.length === 0) {
        throw new Error('No valid subject names provided')
      }

      // Check for existing subjects
      const existingSubjects = await this.getSubjects(userId)
      const existingNames = existingSubjects.map(subject => subject.name.toLowerCase())
      
      const newSubjects = uniqueNames.filter(name => 
        !existingNames.includes(name.toLowerCase())
      )

      if (newSubjects.length === 0) {
        throw new Error('All subjects already exist')
      }

      const subjectsToInsert = newSubjects.map(name => ({
        user_id: userId,
        name: name,
        created_at: new Date().toISOString()
      }))

      const { data, error } = await this.supabase
        .from('subjects')
        .insert(subjectsToInsert)
        .select()

      if (error) throw error

      return {
        created: data,
        skipped: uniqueNames.length - newSubjects.length,
        total: uniqueNames.length
      }
    } catch (error) {
      console.error('Error creating multiple subjects:', error)
      throw new Error(`Failed to create subjects: ${error.message}`)
    }
  }

  // Update a subject
  async updateSubject(subjectId, userId, updates) {
    try {
      // If updating name, check for duplicates
      if (updates.name) {
        const existingSubject = await this.getSubjectByName(userId, updates.name)
        if (existingSubject && existingSubject.id !== subjectId) {
          throw new Error('Subject with this name already exists')
        }
        updates.name = updates.name.trim()
      }

      const { data, error } = await this.supabase
        .from('subjects')
        .update(updates)
        .eq('id', subjectId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating subject:', error)
      throw new Error(`Failed to update subject: ${error.message}`)
    }
  }

  // Delete a subject
  async deleteSubject(subjectId, userId) {
    try {
      const { data, error } = await this.supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error deleting subject:', error)
      throw new Error(`Failed to delete subject: ${error.message}`)
    }
  }

  // Delete all subjects for a user (used in reset functionality)
  async deleteAllSubjects(userId) {
    try {
      const { data, error } = await this.supabase
        .from('subjects')
        .delete()
        .eq('user_id', userId)
        .select()

      if (error) throw error

      return {
        deleted: data,
        count: data ? data.length : 0
      }
    } catch (error) {
      console.error('Error deleting all subjects:', error)
      throw new Error(`Failed to delete all subjects: ${error.message}`)
    }
  }

  // Get subject by name (helper method)
  async getSubjectByName(userId, subjectName) {
    try {
      const { data, error } = await this.supabase
        .from('subjects')
        .select('*')
        .eq('user_id', userId)
        .ilike('name', subjectName.trim())
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Subject not found
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching subject by name:', error)
      return null
    }
  }

  // Search subjects by name
  async searchSubjects(userId, searchTerm) {
    try {
      const { data, error } = await this.supabase
        .from('subjects')
        .select('*')
        .eq('user_id', userId)
        .ilike('name', `%${searchTerm.trim()}%`)
        .order('created_at', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error searching subjects:', error)
      throw new Error(`Failed to search subjects: ${error.message}`)
    }
  }

  // Get subjects count for a user
  async getSubjectsCount(userId) {
    try {
      const { count, error } = await this.supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (error) throw error

      return count || 0
    } catch (error) {
      console.error('Error getting subjects count:', error)
      throw new Error(`Failed to get subjects count: ${error.message}`)
    }
  }

  // Check if user has any subjects
  async hasSubjects(userId) {
    try {
      const count = await this.getSubjectsCount(userId)
      return count > 0
    } catch (error) {
      console.error('Error checking if user has subjects:', error)
      return false
    }
  }

  // Validate subject name
  validateSubjectName(name) {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Subject name is required' }
    }

    const trimmedName = name.trim()
    
    if (trimmedName.length === 0) {
      return { valid: false, error: 'Subject name cannot be empty' }
    }

    if (trimmedName.length < 2) {
      return { valid: false, error: 'Subject name must be at least 2 characters long' }
    }

    if (trimmedName.length > 50) {
      return { valid: false, error: 'Subject name cannot exceed 50 characters' }
    }

    // Check for special characters (allow letters, numbers, spaces, hyphens, apostrophes)
    const validNameRegex = /^[a-zA-Z0-9\s\-']+$/
    if (!validNameRegex.test(trimmedName)) {
      return { valid: false, error: 'Subject name contains invalid characters' }
    }

    return { valid: true, name: trimmedName }
  }

  // Bulk operations helper
  async bulkUpdateSubjects(userId, updates) {
    try {
      const promises = updates.map(update => 
        this.updateSubject(update.id, userId, { name: update.name })
      )

      const results = await Promise.allSettled(promises)
      
      const successful = results.filter(result => result.status === 'fulfilled')
      const failed = results.filter(result => result.status === 'rejected')

      return {
        successful: successful.map(result => result.value),
        failed: failed.map(result => result.reason.message),
        total: updates.length
      }
    } catch (error) {
      console.error('Error in bulk update:', error)
      throw new Error(`Failed to bulk update subjects: ${error.message}`)
    }
  }
}

// Export singleton instance
export const subjectService = new SubjectService()