export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          domain: string | null
          api_key: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          domain?: string | null
          api_key: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string | null
          api_key?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          email: string
          role: 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          email: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: number
          name: string
          storage_object_id: string
          created_by: string
          created_at: string
          tenant_id: string | null
        }
        Insert: {
          id?: never
          name: string
          storage_object_id: string
          created_by?: string
          created_at?: string
          tenant_id?: string | null
        }
        Update: {
          id?: never
          name?: string
          storage_object_id?: string
          created_by?: string
          created_at?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      document_sections: {
        Row: {
          id: number
          document_id: number
          content: string
          embedding: number[] | null
          tenant_id: string | null
        }
        Insert: {
          id?: never
          document_id: number
          content: string
          embedding?: number[] | null
          tenant_id?: string | null
        }
        Update: {
          id?: never
          document_id?: number
          content?: string
          embedding?: number[] | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_sections_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_sections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          tenant_id: string
          user_id: string | null
          content: string
          role: 'user' | 'assistant' | 'system'
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id?: string | null
          content: string
          role: 'user' | 'assistant' | 'system'
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string | null
          content?: string
          role?: 'user' | 'assistant' | 'system'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      usage_logs: {
        Row: {
          id: string
          tenant_id: string
          user_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      requests: {
        Row: {
          id: string
          tenant_id: string
          endpoint: string
          day: string
          count: number
        }
        Insert: {
          id?: string
          tenant_id: string
          endpoint: string
          day: string
          count?: number
        }
        Update: {
          id?: string
          tenant_id?: string
          endpoint?: string
          day?: string
          count?: number
        }
        Relationships: [
          {
            foreignKeyName: "requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      documents_with_storage_path: {
        Row: {
          id: number
          name: string
          storage_object_id: string
          created_by: string
          created_at: string
          tenant_id: string | null
          storage_object_path: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Functions: {
      search_documents_by_tenant: {
        Args: {
          tenant_id_param: string
          query_text: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: number
          document_id: number
          content: string
          similarity: number
        }[]
      }
      match_document_sections: {
        Args: {
          embedding: number[]
          match_threshold: number
          tenant_id_param?: string
        }
        Returns: {
          id: number
          document_id: number
          content: string
          embedding: number[] | null
          tenant_id: string | null
        }[]
      }
      get_user_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      user_belongs_to_tenant: {
        Args: {
          tenant_id_param: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'admin' | 'user'
      message_role: 'user' | 'assistant' | 'system'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

// Helper types for multi-tenancy
export type Tenant = Tables<'tenants'>
export type User = Tables<'users'>
export type Document = Tables<'documents'>
export type DocumentSection = Tables<'document_sections'>
export type Message = Tables<'messages'>
export type UsageLog = Tables<'usage_logs'>

export type TenantInsert = TablesInsert<'tenants'>
export type UserInsert = TablesInsert<'users'>
export type DocumentInsert = TablesInsert<'documents'>
export type DocumentSectionInsert = TablesInsert<'document_sections'>
export type MessageInsert = TablesInsert<'messages'>
export type UsageLogInsert = TablesInsert<'usage_logs'>

export type TenantUpdate = TablesUpdate<'tenants'>
export type UserUpdate = TablesUpdate<'users'>
export type DocumentUpdate = TablesUpdate<'documents'>
export type DocumentSectionUpdate = TablesUpdate<'document_sections'>
export type MessageUpdate = TablesUpdate<'messages'>
export type UsageLogUpdate = TablesUpdate<'usage_logs'>

