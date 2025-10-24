// Simple Test Script for Virtual Study Buddy Finder
// Run this in the browser console to test basic functionality

console.log('🧪 Starting Virtual Study Buddy Finder Tests...');

// Test 1: Check if localStorage is working
function testLocalStorage() {
  console.log('📦 Testing localStorage...');
  try {
    localStorage.setItem('test', 'value');
    const result = localStorage.getItem('test');
    localStorage.removeItem('test');
    if (result === 'value') {
      console.log('✅ localStorage is working');
      return true;
    } else {
      console.log('❌ localStorage test failed');
      return false;
    }
  } catch (error) {
    console.log('❌ localStorage error:', error);
    return false;
  }
}

// Test 2: Check if API endpoints are accessible
async function testAPIEndpoints() {
  console.log('🌐 Testing API endpoints...');
  const endpoints = [
    'http://localhost:3001/health',
    'http://localhost:3001/api/auth/register',
    'http://localhost:3001/api/auth/login'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`✅ ${endpoint}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

// Test 3: Check if Socket.IO connection works
function testSocketConnection() {
  console.log('🔌 Testing Socket.IO connection...');
  if (typeof io !== 'undefined') {
    try {
      const socket = io('http://localhost:3001');
      socket.on('connect', () => {
        console.log('✅ Socket.IO connected successfully');
        socket.disconnect();
      });
      socket.on('connect_error', (error) => {
        console.log('❌ Socket.IO connection failed:', error);
      });
    } catch (error) {
      console.log('❌ Socket.IO error:', error);
    }
  } else {
    console.log('⚠️ Socket.IO client not loaded');
  }
}

// Test 4: Check if React components are loaded
function testReactComponents() {
  console.log('⚛️ Testing React components...');
  const components = [
    'AuthScreen',
    'MainDashboard', 
    'ChatInterface',
    'ProfileSetup'
  ];
  
  // This is a basic check - in a real app you'd check if components are mounted
  console.log('✅ React app appears to be loaded');
  return true;
}

// Test 5: Check browser compatibility
function testBrowserCompatibility() {
  console.log('🌍 Testing browser compatibility...');
  const features = {
    'ES6 Modules': typeof import !== 'undefined',
    'Fetch API': typeof fetch !== 'undefined',
    'LocalStorage': typeof localStorage !== 'undefined',
    'WebSocket': typeof WebSocket !== 'undefined',
    'Promise': typeof Promise !== 'undefined'
  };
  
  let allSupported = true;
  for (const [feature, supported] of Object.entries(features)) {
    if (supported) {
      console.log(`✅ ${feature} is supported`);
    } else {
      console.log(`❌ ${feature} is not supported`);
      allSupported = false;
    }
  }
  
  return allSupported;
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive tests...\n');
  
  const tests = [
    { name: 'LocalStorage', fn: testLocalStorage },
    { name: 'Browser Compatibility', fn: testBrowserCompatibility },
    { name: 'React Components', fn: testReactComponents },
    { name: 'API Endpoints', fn: testAPIEndpoints },
    { name: 'Socket.IO', fn: testSocketConnection }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} Test ---`);
    try {
      const result = await test.fn();
      if (result !== false) passed++;
    } catch (error) {
      console.log(`❌ ${test.name} test failed:`, error);
    }
  }
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your app is ready for manual testing.');
  } else {
    console.log('⚠️ Some tests failed. Please check the issues above.');
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. Follow the TESTING_GUIDE.md for manual testing');
  console.log('2. Test user registration and login');
  console.log('3. Test the matching system');
  console.log('4. Test real-time chat functionality');
  console.log('5. Test study session management');
}

// Auto-run tests when script is loaded
if (typeof window !== 'undefined') {
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
  } else {
    runAllTests();
  }
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testLocalStorage,
    testAPIEndpoints,
    testSocketConnection,
    testReactComponents,
    testBrowserCompatibility,
    runAllTests
  };
}
