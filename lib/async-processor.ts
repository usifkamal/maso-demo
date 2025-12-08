/**
 * Async processor utilities for serverless-safe background jobs
 * These functions handle long-running tasks without blocking HTTP responses
 */

/**
 * Process file upload asynchronously
 * Returns immediately with a job ID, processes in background
 */
export async function processFileUploadAsync(
  tenantId: string,
  file: File,
  processor: (tenantId: string, file: File) => Promise<any>
): Promise<{ jobId: string; status: 'queued' }> {
  const jobId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Process asynchronously - don't await
  processor(tenantId, file)
    .then(result => {
      console.log(`File processing job ${jobId} completed:`, result)
    })
    .catch(error => {
      console.error(`File processing job ${jobId} failed:`, error)
    })
  
  return { jobId, status: 'queued' as const }
}

/**
 * Process URL crawling asynchronously
 * Returns immediately with a job ID, processes in background
 */
export async function processUrlCrawlAsync(
  tenantId: string,
  url: string,
  processor: (tenantId: string, url: string) => Promise<any>
): Promise<{ jobId: string; status: 'queued' }> {
  const jobId = `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Process asynchronously - don't await
  processor(tenantId, url)
    .then(result => {
      console.log(`URL crawling job ${jobId} completed:`, result)
    })
    .catch(error => {
      console.error(`URL crawling job ${jobId} failed:`, error)
    })
  
  return { jobId, status: 'queued' as const }
}

/**
 * Execute with timeout protection
 * Ensures operations don't run indefinitely
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  })
  
  return Promise.race([promise, timeout])
}

/**
 * Process in chunks to avoid memory issues
 */
export async function processInChunks<T, R>(
  items: T[],
  chunkSize: number,
  processor: (chunk: T[]) => Promise<R[]>
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize)
    const chunkResults = await processor(chunk)
    results.push(...chunkResults)
  }
  
  return results
}






