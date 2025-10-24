const axios = require('axios');

// Test session creation
async function testSessionCreation() {
  try {
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'emma@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');

    // Test session creation
    const sessionData = {
      title: 'Test Study Session',
      description: 'This is a test session',
      subject: 'Mathematics',
      sessionType: 'in-person',
      location: 'Main Library, Room 301',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // Tomorrow + 2 hours
      maxParticipants: 5
    };

    console.log('📤 Sending session data:', sessionData);

    const createResponse = await axios.post('http://localhost:3001/api/schedule/sessions', sessionData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Session created successfully:', createResponse.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('Validation errors:', error.response.data.details);
    }
  }
}

testSessionCreation();
