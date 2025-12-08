/**
 * Test script for the ingest API endpoints
 * Run with: node docs/test-api.js
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'
const TENANT_API_KEY = process.env.TENANT_API_KEY || 'your-tenant-api-key'

async function testUrlIngestion() {
  console.log('🧪 Testing URL ingestion...')
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/ingest/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TENANT_API_KEY}`
      },
      body: JSON.stringify({
        url: 'https://en.wikipedia.org/wiki/Artificial_intelligence'
      })
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ URL ingestion successful:', result)
    } else {
      console.log('❌ URL ingestion failed:', result)
    }
  } catch (error) {
    console.log('❌ URL ingestion error:', error.message)
  }
}

async function testFileUpload() {
  console.log('🧪 Testing file upload...')
  
  // Create a simple text file for testing
  const textContent = 'This is a test document for the chatbot platform. It contains sample text that will be processed and embedded for semantic search capabilities.'
  const blob = new Blob([textContent], { type: 'text/plain' })
  const file = new File([blob], 'test-document.txt', { type: 'text/plain' })
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_BASE_URL}/api/ingest/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TENANT_API_KEY}`
      },
      body: formData
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ File upload successful:', result)
    } else {
      console.log('❌ File upload failed:', result)
    }
  } catch (error) {
    console.log('❌ File upload error:', error.message)
  }
}

async function testAuthentication() {
  console.log('🧪 Testing authentication...')
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/ingest/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-key'
      },
      body: JSON.stringify({
        url: 'https://example.com'
      })
    })

    const result = await response.json()
    
    if (response.status === 401) {
      console.log('✅ Authentication correctly rejected invalid key')
    } else {
      console.log('❌ Authentication should have failed:', result)
    }
  } catch (error) {
    console.log('❌ Authentication test error:', error.message)
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...')
  console.log(`API Base URL: ${API_BASE_URL}`)
  console.log(`Tenant API Key: ${TENANT_API_KEY.substring(0, 8)}...`)
  console.log('')
  
  await testAuthentication()
  console.log('')
  
  await testUrlIngestion()
  console.log('')
  
  await testFileUpload()
  console.log('')
  
  console.log('🏁 Tests completed!')
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = {
  testUrlIngestion,
  testFileUpload,
  testAuthentication,
  runTests
}
