/**
 * Edge Case and Integration Test Suite
 * Tests for boundary conditions, error handling, and integration scenarios
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

class EdgeCaseTestSuite {
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

  // Edge Case Tests
  async testEdgeCases() {
    console.log('\n=== EDGE CASE TESTS ===');

    // Test 1: Empty strings
    await this.logTest('Empty string validation', 'RUNNING', '');
    const emptyStringTest = await this.makeRequest('POST', '/business', {
      name: '',
      description: '',
      email: ''
    }, this.authTokens.businessAdmin);
    if (emptyStringTest.status === 400) {
      await this.logTest('Empty string validation', 'PASS', 'Correctly rejected empty strings');
    } else {
      await this.logTest('Empty string validation', 'FAIL', `Expected 400, got ${emptyStringTest.status}`);
    }

    // Test 2: Very long strings
    await this.logTest('Long string validation', 'RUNNING', '');
    const longString = 'A'.repeat(10000);
    const longStringTest = await this.makeRequest('POST', '/business', {
      name: longString,
      description: longString
    }, this.authTokens.businessAdmin);
    if (longStringTest.status === 400) {
      await this.logTest('Long string validation', 'PASS', 'Correctly rejected overly long strings');
    } else {
      await this.logTest('Long string validation', 'FAIL', `Expected 400, got ${longStringTest.status}`);
    }

    // Test 3: Special characters
    await this.logTest('Special character handling', 'RUNNING', '');
    const specialCharTest = await this.makeRequest('POST', '/business', {
      name: 'Test Business & Co.',
      description: 'Test with special chars: @#$%^&*()',
      email: 'test@company.com'
    }, this.authTokens.businessAdmin);
    if (specialCharTest.status === 200 || specialCharTest.status === 400) {
      await this.logTest('Special character handling', 'PASS', 'Handled special characters appropriately');
    } else {
      await this.logTest('Special character handling', 'FAIL', `Unexpected response: ${specialCharTest.status}`);
    }

    // Test 4: Invalid email formats
    await this.logTest('Invalid email validation', 'RUNNING', '');
    const invalidEmailTest = await this.makeRequest('POST', '/auth/login', {
      email: 'invalid-email',
      password: 'test123'
    });
    if (invalidEmailTest.status === 400) {
      await this.logTest('Invalid email validation', 'PASS', 'Correctly rejected invalid email');
    } else {
      await this.logTest('Invalid email validation', 'FAIL', `Expected 400, got ${invalidEmailTest.status}`);
    }

    // Test 5: Missing required fields
    await this.logTest('Missing required fields', 'RUNNING', '');
    const missingFieldsTest = await this.makeRequest('POST', '/auth/login', {
      email: 'test@test.com'
      // Missing password
    });
    if (missingFieldsTest.status === 400) {
      await this.logTest('Missing required fields', 'PASS', 'Correctly rejected missing fields');
    } else {
      await this.logTest('Missing required fields', 'FAIL', `Expected 400, got ${missingFieldsTest.status}`);
    }
  }

  // Integration Tests
  async testIntegration() {
    console.log('\n=== INTEGRATION TESTS ===');

    // Test 1: Business creation and product association
    await this.logTest('Business-Product integration', 'RUNNING', '');
    if (this.authTokens.businessAdmin) {
      // Create a product
      const productResponse = await this.makeRequest('POST', '/business/products', {
        name: 'Integration Test Product',
        description: 'Product for integration testing',
        price: '29.99'
      }, this.authTokens.businessAdmin);

      if (productResponse.status === 201) {
        // Get products to verify
        const getProductsResponse = await this.makeRequest('GET', '/business/products', null, this.authTokens.businessAdmin);
        if (getProductsResponse.status === 200 && getProductsResponse.data.products) {
          await this.logTest('Business-Product integration', 'PASS', 'Successfully created and retrieved product');
        } else {
          await this.logTest('Business-Product integration', 'FAIL', 'Failed to retrieve products after creation');
        }
      } else {
        await this.logTest('Business-Product integration', 'FAIL', `Failed to create product: ${productResponse.status}`);
      }
    } else {
      await this.logTest('Business-Product integration', 'SKIP', 'No business admin token');
    }

    // Test 2: Inquiry flow
    await this.logTest('Inquiry flow integration', 'RUNNING', '');
    if (this.authTokens.businessAdmin) {
      // Create an inquiry
      const inquiryResponse = await this.makeRequest('POST', '/inquiries', {
        name: 'Integration Test Customer',
        email: 'integration@test.com',
        message: 'Testing inquiry flow',
        businessId: 'test-business-id' // This would need to be a real business ID
      });

      if (inquiryResponse.status === 201) {
        await this.logTest('Inquiry flow integration', 'PASS', 'Successfully created inquiry');
      } else {
        await this.logTest('Inquiry flow integration', 'FAIL', `Failed to create inquiry: ${inquiryResponse.status}`);
      }
    } else {
      await this.logTest('Inquiry flow integration', 'SKIP', 'No business admin token');
    }
  }

  // Error Handling Tests
  async testErrorHandling() {
    console.log('\n=== ERROR HANDLING TESTS ===');

    // Test 1: Non-existent endpoint
    await this.logTest('Non-existent endpoint', 'RUNNING', '');
    const nonExistentEndpoint = await this.makeRequest('GET', '/api/non-existent');
    if (nonExistentEndpoint.status === 404) {
      await this.logTest('Non-existent endpoint', 'PASS', 'Correctly returned 404');
    } else {
      await this.logTest('Non-existent endpoint', 'FAIL', `Expected 404, got ${nonExistentEndpoint.status}`);
    }

    // Test 2: Method not allowed
    await this.logTest('Method not allowed', 'RUNNING', '');
    const methodNotAllowed = await this.makeRequest('DELETE', '/categories');
    if (methodNotAllowed.status === 405) {
      await this.logTest('Method not allowed', 'PASS', 'Correctly returned 405');
    } else {
      await this.logTest('Method not allowed', 'FAIL', `Expected 405, got ${methodNotAllowed.status}`);
    }

    // Test 3: Malformed JSON
    await this.logTest('Malformed JSON', 'RUNNING', '');
    const malformedJsonResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{ invalid json }'
    });

    if (malformedJsonResponse.status === 400) {
      await this.logTest('Malformed JSON', 'PASS', 'Correctly handled malformed JSON');
    } else {
      await this.logTest('Malformed JSON', 'FAIL', `Expected 400, got ${malformedJsonResponse.status}`);
    }
  }

  // Rate Limiting Tests
  async testRateLimiting() {
    console.log('\n=== RATE LIMITING TESTS ===');

    await this.logTest('Rate limiting', 'RUNNING', '');
    
    // Make multiple rapid requests
    const requests = [];
    for (let i = 0; i < 20; i++) {
      requests.push(this.makeRequest('GET', '/categories'));
    }

    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(r => r.status === 429);

    if (rateLimitedResponses.length > 0) {
      await this.logTest('Rate limiting', 'PASS', `Rate limiting triggered for ${rateLimitedResponses.length} requests`);
    } else {
      await this.logTest('Rate limiting', 'INFO', 'Rate limiting may not be configured or threshold not reached');
    }
  }

  async runAllTests() {
    console.log('Starting edge case and integration test suite...\n');

    await this.testEdgeCases();
    await this.testIntegration();
    await this.testErrorHandling();
    await this.testRateLimiting();

    this.generateReport();
  }

  generateReport() {
    console.log('\n=== EDGE CASE TEST REPORT ===');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    const skippedTests = this.testResults.filter(r => r.status === 'SKIP').length;
    const infoTests = this.testResults.filter(r => r.status === 'INFO').length;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Skipped: ${skippedTests}`);
    console.log(`Info: ${infoTests}`);

    if (failedTests > 0) {
      console.log('\nFailed Tests:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`- ${r.test}: ${r.details}`));
    }

    const successRate = ((passedTests / totalTests) * 100).toFixed(2);
    console.log(`\nSuccess Rate: ${successRate}%`);
  }
}

module.exports = EdgeCaseTestSuite;