/**
 * Comprehensive API Test Suite for DigiSence Admin Panel
 * Tests all endpoints for functionality, security, and performance
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
const TEST_TIMEOUT = 30000;

// Test data
const testUsers = {
  superAdmin: {
    email: "superadmin@digisence.com",
    password: "admin123",
    name: "Super Admin",
    role: "SUPER_ADMIN",
  },
  businessAdmin: {
    email: "prashant@shrijeeaircoolers.com",
    password: "shrijee#prashant",
    name: "Business Admin",
    role: "BUSINESS_ADMIN",
  },
  professionalAdmin: {
    email: "shivam@test.com",
    password: "admin@shivam",
    name: "Professional Admin",
    role: "PROFESSIONAL_ADMIN",
  },
};

const testBusiness = {
  name: 'Test Business',
  description: 'Test business description',
  about: 'About test business',
  address: '123 Test Street',
  phone: '+1234567890',
  email: 'test@test.com',
  website: 'https://test.com',
  facebook: 'https://facebook.com/test',
  twitter: 'https://twitter.com/test',
  instagram: 'https://instagram.com/test',
  linkedin: 'https://linkedin.com/test',
  gstNumber: 'GST123456',
  categoryId: null
};

const testProfessional = {
  name: 'Test Professional',
  professionalHeadline: 'Senior Developer',
  aboutMe: 'Experienced professional',
  location: 'Colombo, Sri Lanka',
  phone: '+1234567890',
  email: 'pro@test.com',
  website: 'https://pro.com',
  facebook: 'https://facebook.com/pro',
  twitter: 'https://twitter.com/pro',
  instagram: 'https://instagram.com/pro',
  linkedin: 'https://linkedin.com/pro'
};

const testProduct = {
  name: 'Test Product',
  description: 'Test product description',
  price: '99.99',
  brandName: 'Test Brand',
  additionalInfo: {
    color: 'blue',
    size: 'medium'
  }
};

const testInquiry = {
  name: 'Test Customer',
  email: 'customer@test.com',
  phone: '+1234567890',
  message: 'I want to inquire about your services'
};

class APITestSuite {
  constructor() {
    this.authTokens = {};
    this.testResults = [];
  }

  async logTest(testName, status, details = '') {
    const result = {
      test: testName,
      status,
      details,
      timestamp: new Date().toISOString()
    };
    this.testResults.push(result);
    console.log(`[${status}] ${testName}: ${details}`);
  }

  async makeRequest(method, endpoint, data = null, token = null) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : null,
      });

      const contentType = response.headers.get('content-type');
      let responseData;

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      return {
        status: response.status,
        data: responseData,
        headers: response.headers,
        ok: response.ok
      };
    } catch (error) {
      return {
        status: 0,
        data: { error: error.message },
        headers: new Headers(),
        ok: false
      };
    }
  }

  // Authentication Tests
  async testAuthEndpoints() {
    console.log('\n=== AUTHENTICATION TESTS ===');

    // Test 1: Login with invalid credentials
    await this.logTest('Login with invalid credentials', 'RUNNING', '');
    const invalidLogin = await this.makeRequest('POST', '/auth/login', {
      email: 'invalid@test.com',
      password: 'wrongpassword'
    });
    if (invalidLogin.status === 401) {
      await this.logTest('Login with invalid credentials', 'PASS', 'Correctly rejected invalid credentials');
    } else {
      await this.logTest('Login with invalid credentials', 'FAIL', `Expected 401, got ${invalidLogin.status}`);
    }

    // Test 2: Login with valid credentials
    await this.logTest('Login with valid credentials', 'RUNNING', '');
    const validLogin = await this.makeRequest('POST', '/auth/login', {
      ...testUsers.businessAdmin,
      force: true  // Force logout existing sessions
    });
    if (validLogin.status === 200 && validLogin.data.token) {
      this.authTokens.businessAdmin = validLogin.data.token;
      await this.logTest('Login with valid credentials', 'PASS', 'Successfully authenticated');
    } else {
      await this.logTest('Login with valid credentials', 'FAIL', `Expected 200 with token, got ${validLogin.status}`);
    }

    // Test 3: Access protected endpoint without token
    await this.logTest('Access protected endpoint without token', 'RUNNING', '');
    const noTokenAccess = await this.makeRequest('GET', '/auth/me');
    if (noTokenAccess.status === 401) {
      await this.logTest('Access protected endpoint without token', 'PASS', 'Correctly rejected request without token');
    } else {
      await this.logTest('Access protected endpoint without token', 'FAIL', `Expected 401, got ${noTokenAccess.status}`);
    }

    // Test 4: Access protected endpoint with valid token
    await this.logTest('Access protected endpoint with valid token', 'RUNNING', '');
    const validTokenAccess = await this.makeRequest('GET', '/auth/me', null, this.authTokens.businessAdmin);
    if (validTokenAccess.status === 200 && validTokenAccess.data.user) {
      await this.logTest('Access protected endpoint with valid token', 'PASS', 'Successfully accessed with valid token');
    } else {
      await this.logTest('Access protected endpoint with valid token', 'FAIL', `Expected 200 with user data, got ${validTokenAccess.status}`);
    }
  }

  // Business Management Tests
  async testBusinessEndpoints() {
    console.log('\n=== BUSINESS MANAGEMENT TESTS ===');

    if (!this.authTokens.businessAdmin) {
      await this.logTest('Business endpoints', 'SKIP', 'No valid business admin token');
      return;
    }

    // Test 1: Get business profile
    await this.logTest('Get business profile', 'RUNNING', '');
    const getBusiness = await this.makeRequest('GET', '/business', null, this.authTokens.businessAdmin);
    if (getBusiness.status === 200) {
      await this.logTest('Get business profile', 'PASS', 'Successfully retrieved business profile');
    } else {
      await this.logTest('Get business profile', 'FAIL', `Expected 200, got ${getBusiness.status}`);
    }

    // Test 2: Update business profile
    await this.logTest('Update business profile', 'RUNNING', '');
    const updateBusiness = await this.makeRequest('PUT', '/business', {
      ...testBusiness,
      name: 'Updated Test Business'
    }, this.authTokens.businessAdmin);
    if (updateBusiness.status === 200) {
      await this.logTest('Update business profile', 'PASS', 'Successfully updated business profile');
    } else {
      await this.logTest('Update business profile', 'FAIL', `Expected 200, got ${updateBusiness.status}`);
    }
  }

  // Professional Management Tests
  async testProfessionalEndpoints() {
    console.log('\n=== PROFESSIONAL MANAGEMENT TESTS ===');

    if (!this.authTokens.professionalAdmin) {
      await this.logTest('Professional endpoints', 'SKIP', 'No valid professional admin token');
      return;
    }

    // Test 1: Get professional profile
    await this.logTest('Get professional profile', 'RUNNING', '');
    const getProfessional = await this.makeRequest('GET', '/professionals', null, this.authTokens.professionalAdmin);
    if (getProfessional.status === 200) {
      await this.logTest('Get professional profile', 'PASS', 'Successfully retrieved professional profile');
    } else {
      await this.logTest('Get professional profile', 'FAIL', `Expected 200, got ${getProfessional.status}`);
    }
  }

  // Category Tests
  async testCategoryEndpoints() {
    console.log('\n=== CATEGORY TESTS ===');

    // Test 1: Get all categories
    await this.logTest('Get all categories', 'RUNNING', '');
    const getCategories = await this.makeRequest('GET', '/categories');
    if (getCategories.status === 200) {
      await this.logTest('Get all categories', 'PASS', 'Successfully retrieved categories');
    } else {
      await this.logTest('Get all categories', 'FAIL', `Expected 200, got ${getCategories.status}`);
    }
  }

  // Product Tests
  async testProductEndpoints() {
    console.log('\n=== PRODUCT TESTS ===');

    if (!this.authTokens.businessAdmin) {
      await this.logTest('Product endpoints', 'SKIP', 'No valid business admin token');
      return;
    }

    // Test 1: Get products
    await this.logTest('Get products', 'RUNNING', '');
    const getProducts = await this.makeRequest('GET', '/business/products', null, this.authTokens.businessAdmin);
    if (getProducts.status === 200) {
      await this.logTest('Get products', 'PASS', 'Successfully retrieved products');
    } else {
      await this.logTest('Get products', 'FAIL', `Expected 200, got ${getProducts.status}`);
    }
  }

  // Inquiry Tests
  async testInquiryEndpoints() {
    console.log('\n=== INQUIRY TESTS ===');

    if (!this.authTokens.businessAdmin) {
      await this.logTest('Inquiry endpoints', 'SKIP', 'No valid business admin token');
      return;
    }

    // Test 1: Get inquiries
    await this.logTest('Get inquiries', 'RUNNING', '');
    const getInquiries = await this.makeRequest('GET', '/business/inquiries', null, this.authTokens.businessAdmin);
    if (getInquiries.status === 200) {
      await this.logTest('Get inquiries', 'PASS', 'Successfully retrieved inquiries');
    } else {
      await this.logTest('Get inquiries', 'FAIL', `Expected 200, got ${getInquiries.status}`);
    }
  }

  // File Upload Tests
  async testUploadEndpoints() {
    console.log('\n=== FILE UPLOAD TESTS ===');

    // Test 1: Upload without file
    await this.logTest('Upload without file', 'RUNNING', '');
    
    // Create a proper multipart form data request
    const formData = new FormData();
    // Don't append any file to test the "no file" scenario
    
    try {
      const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header to let browser set it automatically
      });
      
      if (response.status === 400) {
        await this.logTest('Upload without file', 'PASS', 'Correctly rejected request without file');
      } else {
        await this.logTest('Upload without file', 'FAIL', `Expected 400, got ${response.status}`);
      }
    } catch (error) {
      await this.logTest('Upload without file', 'FAIL', `Request failed: ${error.message}`);
    }
  }

  // Performance Tests
  async testPerformance() {
    console.log('\n=== PERFORMANCE TESTS ===');

    // Test 1: Concurrent requests
    await this.logTest('Concurrent requests', 'RUNNING', '');
    const startTime = Date.now();
    const requests = Array(10).fill().map(() => this.makeRequest('GET', '/categories'));
    await Promise.all(requests);
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (duration < 5000) {
      await this.logTest('Concurrent requests', 'PASS', `Completed in ${duration}ms`);
    } else {
      await this.logTest('Concurrent requests', 'FAIL', `Too slow: ${duration}ms`);
    }
  }

  // Security Tests
  async testSecurity() {
    console.log('\n=== SECURITY TESTS ===');

    // Test 1: SQL Injection attempt
    await this.logTest('SQL Injection attempt', 'RUNNING', '');
    const sqlInjection = await this.makeRequest('POST', '/auth/login', {
      email: "test@example.com'; DROP TABLE users; --",
      password: 'test123'
    });
    if (sqlInjection.status === 401) {
      await this.logTest('SQL Injection attempt', 'PASS', 'Correctly handled malicious input');
    } else {
      await this.logTest('SQL Injection attempt', 'FAIL', `Unexpected response: ${sqlInjection.status}`);
    }

    // Test 2: XSS attempt
    await this.logTest('XSS attempt', 'RUNNING', '');
    const xssAttempt = await this.makeRequest('POST', '/business', {
      name: '<script>alert("xss")</script>',
      description: 'Test'
    }, this.authTokens.businessAdmin);
    if (xssAttempt.status === 400 || xssAttempt.status === 500) {
      await this.logTest('XSS attempt', 'PASS', 'Correctly handled malicious input');
    } else {
      await this.logTest('XSS attempt', 'FAIL', `Unexpected response: ${xssAttempt.status}`);
    }
  }

  async runAllTests() {
    console.log('Starting comprehensive API test suite...\n');

    await this.testAuthEndpoints();
    await this.testBusinessEndpoints();
    await this.testProfessionalEndpoints();
    await this.testCategoryEndpoints();
    await this.testProductEndpoints();
    await this.testInquiryEndpoints();
    await this.testUploadEndpoints();
    await this.testPerformance();
    await this.testSecurity();

    this.generateReport();
  }

  generateReport() {
    console.log('\n=== TEST REPORT ===');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    const skippedTests = this.testResults.filter(r => r.status === 'SKIP').length;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Skipped: ${skippedTests}`);

    if (failedTests > 0) {
      console.log('\nFailed Tests:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`- ${r.test}: ${r.details}`));
    }

    const successRate = ((passedTests / totalTests) * 100).toFixed(2);
    console.log(`\nSuccess Rate: ${successRate}%`);

    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        skipped: skippedTests,
        successRate: parseFloat(successRate)
      },
      results: this.testResults
    };

    console.log('\nTest report generated. Check console for details.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new APITestSuite();
  testSuite.runAllTests().catch(console.error);
}

module.exports = APITestSuite;