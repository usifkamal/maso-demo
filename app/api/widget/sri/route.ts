import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * GET /api/widget/sri
 * Returns SHA384 SRI hash for embed.js
 * Used when generating embed code for CDN hosting
 */
export async function GET() {
  try {
    const embedPath = join(process.cwd(), 'public', 'embed.js')
    const fileContent = readFileSync(embedPath, 'utf-8')
    const hash = crypto.createHash('sha384').update(fileContent, 'utf-8').digest('base64')
    const sriHash = `sha384-${hash}`

    return NextResponse.json({ 
      sri: sriHash,
      integrity: `integrity="${sriHash}"`
    })
  } catch (error) {
    // If file doesn't exist or in development, return empty
    return NextResponse.json({ 
      sri: '',
      integrity: ''
    })
  }
}






