/**
 * Simple in-memory job queue for background processing
 * For production, consider using a proper queue service like Bull, RabbitMQ, or Supabase Queue
 */

export interface Job {
  id: string
  type: 'file-processing' | 'url-crawling' | 'embedding-generation'
  data: any
  createdAt: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: any
  error?: string
}

class JobQueue {
  private jobs: Map<string, Job> = new Map()
  private processing: Set<string> = new Set()
  private maxConcurrent = 3

  async enqueue(type: Job['type'], data: any): Promise<string> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const job: Job = {
      id,
      type,
      data,
      createdAt: new Date(),
      status: 'pending',
    }
    
    this.jobs.set(id, job)
    
    // Process job asynchronously (don't await)
    this.processQueue().catch(err => {
      console.error('Job queue processing error:', err)
    })
    
    return id
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id)
  }

  private async processQueue() {
    if (this.processing.size >= this.maxConcurrent) {
      return
    }

    const pendingJobs = Array.from(this.jobs.values())
      .filter(job => job.status === 'pending')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    for (const job of pendingJobs) {
      if (this.processing.size >= this.maxConcurrent) {
        break
      }

      this.processing.add(job.id)
      job.status = 'processing'
      
      // Process job asynchronously
      this.processJob(job).catch(err => {
        console.error(`Job ${job.id} processing error:`, err)
        job.status = 'failed'
        job.error = err.message
        this.processing.delete(job.id)
      })
    }
  }

  private async processJob(job: Job) {
    try {
      // This will be handled by the actual job handlers
      // For now, just mark as completed
      job.status = 'completed'
    } catch (error) {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Unknown error'
    } finally {
      this.processing.delete(job.id)
      // Clean up old jobs (older than 1 hour)
      this.cleanupOldJobs()
    }
  }

  private cleanupOldJobs() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    this.jobs.forEach((job, id) => {
      if (job.createdAt.getTime() < oneHourAgo && job.status !== 'processing') {
        this.jobs.delete(id)
      }
    })
  }
}

// Singleton instance
export const jobQueue = new JobQueue()






