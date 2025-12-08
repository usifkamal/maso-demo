-- Seed data for multi-tenancy setup
-- This file contains sample tenant and user data for testing

-- Insert sample tenants
INSERT INTO tenants (id, name, domain, api_key) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Acme Corp', 'acme.example.com', 'ak_acme_1234567890abcdef'),
  ('550e8400-e29b-41d4-a716-446655440002', 'TechStart Inc', 'techstart.example.com', 'ak_techstart_abcdef1234567890'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Global Solutions', 'global.example.com', 'ak_global_9876543210fedcba');

-- Insert sample users for each tenant
INSERT INTO users (id, tenant_id, email, role) VALUES
  -- Acme Corp users
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'admin@acme.example.com', 'admin'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'user1@acme.example.com', 'user'),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'user2@acme.example.com', 'user'),
  
  -- TechStart Inc users
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'admin@techstart.example.com', 'admin'),
  ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'developer@techstart.example.com', 'user'),
  
  -- Global Solutions users
  ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'admin@global.example.com', 'admin'),
  ('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'support@global.example.com', 'user');

-- Insert sample documents for each tenant
INSERT INTO documents (name, storage_object_id, tenant_id) VALUES
  -- Acme Corp documents
  ('Company Handbook', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
  ('Product Catalog', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
  
  -- TechStart Inc documents
  ('API Documentation', '770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'),
  ('Development Guide', '770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002'),
  
  -- Global Solutions documents
  ('Service Agreement', '770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003'),
  ('Support Manual', '770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003');

-- Insert sample messages for each tenant
INSERT INTO messages (tenant_id, user_id, content, role) VALUES
  -- Acme Corp messages
  ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'Hello, I need help with our product catalog', 'user'),
  ('550e8400-e29b-41d4-a716-446655440001', null, 'I can help you with the product catalog. What specific information do you need?', 'assistant'),
  
  -- TechStart Inc messages
  ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', 'How do I integrate the API?', 'user'),
  ('550e8400-e29b-41d4-a716-446655440002', null, 'To integrate our API, you need to authenticate using your API key and make requests to our endpoints.', 'assistant'),
  
  -- Global Solutions messages
  ('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440007', 'I have a support ticket', 'user'),
  ('550e8400-e29b-41d4-a716-446655440003', null, 'I can help you with your support ticket. Please provide the ticket number.', 'assistant');

-- Insert sample usage logs
INSERT INTO usage_logs (tenant_id, user_id, action, resource_type, metadata) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'document_upload', 'document', '{"file_size": 1024000, "file_type": "pdf"}'),
  ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'message_sent', 'message', '{"message_length": 45}'),
  ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', 'api_call', 'api', '{"endpoint": "/search", "response_time": 150}'),
  ('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440007', 'support_request', 'ticket', '{"priority": "high", "category": "technical"}');

-- Create some sample document sections (chunks) for testing
INSERT INTO document_sections (document_id, content, tenant_id) VALUES
  -- Acme Corp document sections
  (1, 'Welcome to Acme Corp. We are a leading provider of innovative solutions.', '550e8400-e29b-41d4-a716-446655440001'),
  (1, 'Our company values include innovation, integrity, and customer satisfaction.', '550e8400-e29b-41d4-a716-446655440001'),
  (2, 'Product A: Advanced widget with premium features.', '550e8400-e29b-41d4-a716-446655440001'),
  (2, 'Product B: Standard widget for everyday use.', '550e8400-e29b-41d4-a716-446655440001'),
  
  -- TechStart Inc document sections
  (3, 'API Authentication: Use your API key in the Authorization header.', '550e8400-e29b-41d4-a716-446655440002'),
  (3, 'Rate Limits: 1000 requests per hour per API key.', '550e8400-e29b-41d4-a716-446655440002'),
  (4, 'Development Setup: Install dependencies using npm install.', '550e8400-e29b-41d4-a716-446655440002'),
  (4, 'Testing: Run tests using npm test command.', '550e8400-e29b-41d4-a716-446655440002'),
  
  -- Global Solutions document sections
  (5, 'Service Level Agreement: 99.9% uptime guarantee.', '550e8400-e29b-41d4-a716-446655440003'),
  (5, 'Support Hours: 24/7 customer support available.', '550e8400-e29b-41d4-a716-446655440003'),
  (6, 'Troubleshooting: Check system status before contacting support.', '550e8400-e29b-41d4-a716-446655440003'),
  (6, 'Escalation: Contact supervisor for urgent issues.', '550e8400-e29b-41d4-a716-446655440003');
