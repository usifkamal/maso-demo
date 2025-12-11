export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          created_at?: string
          api_key?: string
          name?: string
        }
        Insert: {
          id: string
          api_key?: string
          name?: string
        }
        Update: {
          id?: string
          api_key?: string
          name?: string
        }
      }
      requests: {
        Row: {
          id: string
          tenant_id: string
          created_at: string
          path: string
          method: string
          status: number
        }
        Insert: {
          tenant_id: string
          path: string
          method: string
          status: number
        }
        Update: {
          tenant_id?: string
          path?: string
          method?: string
          status?: number
        }
      }
    }
  }
}