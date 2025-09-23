export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      email_queue: {
        Row: {
          id: string
          recipient_email: string
          recipient_name: string | null
          employee_name: string
          date: string
          refinery: string | null
          points: number | null
          observations: string | null
          status: 'pending' | 'sent' | 'failed'
          error: string | null
          created_at: string
          sent_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          recipient_email: string
          recipient_name?: string | null
          employee_name: string
          date: string
          refinery?: string | null
          points?: number | null
          observations?: string | null
          status?: 'pending' | 'sent' | 'failed'
          error?: string | null
          created_at?: string
          sent_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          recipient_email?: string
          recipient_name?: string | null
          employee_name?: string
          date?: string
          refinery?: string | null
          points?: number | null
          observations?: string | null
          status?: 'pending' | 'sent' | 'failed'
          error?: string | null
          created_at?: string
          sent_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      employee: {
        Row: {
          id: number
          name: string
          real_name: string
          username: string
          access_key: string
          role: string
          weekly_goal: number
          default_refinery: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          real_name: string
          username: string
          access_key: string
          role?: string
          weekly_goal?: number
          default_refinery?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          real_name?: string
          username?: string
          access_key?: string
          role?: string
          weekly_goal?: number
          default_refinery?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      entry: {
        Row: {
          id: number
          employee_id: number
          date: string
          refinery: string
          points: number
          observations: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          employee_id: number
          date: string
          refinery: string
          points: number
          observations?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          employee_id?: number
          date?: string
          refinery?: string
          points?: number
          observations?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entry_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}