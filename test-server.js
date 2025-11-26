const axios = require('axios')

async function checkServer() {
  try {
    const response = await axios.get('http://localhost:3000/api/auth/me')
    console.log('Status:', response.status)
    console.log('Data:', JSON.stringify(response.data, null, 2))
  } catch (error) {
    console.log('Error:', error.message)
    if (error.response) {
      console.log('Response status:', error.response.status)
      console.log('Response data:', error.response.data)
    }
  }
}

checkServer()