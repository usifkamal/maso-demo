-- Run this in Supabase SQL Editor to check your current database schema

-- Check if tenants table exists and its structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'tenants' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if documents table exists and its structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'documents' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if document_sections table exists and its structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'document_sections' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- List all tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;






