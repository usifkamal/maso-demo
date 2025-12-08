-- Create function to match document sections using vector similarity
-- This function is used for RAG (Retrieval Augmented Generation) in the chat

create or replace function match_document_sections(
  query_embedding vector(768),
  match_threshold float default 0.5,
  match_count int default 5
)
returns table (
  id bigint,
  document_id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    document_sections.id,
    document_sections.document_id,
    document_sections.content,
    1 - (document_sections.embedding <=> query_embedding) as similarity
  from document_sections
  where 1 - (document_sections.embedding <=> query_embedding) > match_threshold
  order by document_sections.embedding <=> query_embedding
  limit match_count;
$$;

-- Grant execute permission to authenticated users and service role
grant execute on function match_document_sections to authenticated, service_role;






