const axios = require('axios')

const BASE_URL = 'http://localhost:3000'

async function testInquirySubmission() {
  console.log('Testing inquiry submission...\n')

  // Test valid inquiry
  try {
    console.log('Testing valid inquiry submission...')
    const response = await axios.post(`${BASE_URL}/api/inquiries`, {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      message: 'This is a test inquiry message with more than 10 characters.',
      businessId: 'cmhvyznbf0007upvk0mv1uy39', // From seed data
      productId: null
    })
    console.log('✅ Valid inquiry submitted:', response.data.success)
  } catch (error) {
    console.log('❌ Valid inquiry failed:', error.response?.data || error.message)
  }

  // Test invalid inquiry - missing required fields
  try {
    console.log('Testing invalid inquiry (missing name)...')
    await axios.post(`${BASE_URL}/api/inquiries`, {
      email: 'test@example.com',
      message: 'Test message',
      businessId: 'cmhvyznbf0007upvk0mv1uy39'
    })
    console.log('❌ Should have failed')
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid inquiry properly rejected')
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message)
    }
  }

  // Test invalid inquiry - non-existent business
  try {
    console.log('Testing inquiry with non-existent business...')
    await axios.post(`${BASE_URL}/api/inquiries`, {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Test message with more than 10 characters.',
      businessId: 'non-existent-id'
    })
    console.log('❌ Should have failed')
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Non-existent business properly rejected')
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message)
    }
  }

  console.log('\nInquiry testing completed!')
}

testInquirySubmission().catch(console.error)