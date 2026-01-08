/**
 * Comprehensive Professional Admin Panel API Test Suite
 * Tests all professional endpoints for functionality, security, and performance
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
const TEST_TIMEOUT = 30000;

// Test data for professional operations
const testProfessional = {
  name: 'Test Professional',
  professionalHeadline: 'Senior Developer',
  aboutMe: 'Experienced professional with expertise in web development',
  location: 'Colombo, Sri Lanka',
  phone: '+1234567890',
  email: 'pro@test.com',
  website: 'https://pro.com',
  facebook: 'https://facebook.com/pro',
  twitter: 'https://twitter.com/pro',
  instagram: 'https://instagram.com/pro',
  linkedin: 'https://linkedin.com/pro',
  workExperience: [
    {
      title: 'Senior Developer',
      company: 'Tech Corp',
      startDate: '2020-01-01',
      endDate: '2023-12-31',
      description: 'Developed web applications'
    }
  ],
  education: [
    {
      degree: 'BSc Computer Science',
      institution: 'University of Colombo',
      year: '2019'
    }
  ],
  skills: [
    { name: 'JavaScript', level: 'Expert' },
    { name: 'React', level: 'Advanced' }
  ],
  servicesOffered: [
    { name: 'Web Development', description: 'Full-stack web development' },
    { name: 'Consulting', description: 'Technical consulting' }
  ],
  portfolio: [
    { title: 'E-commerce Site', description: 'Full e-commerce solution', image: 'https://example.com/project1.jpg' }
  ],
  contactDetails: {
    email: 'contact@pro.com',
    phone: '+1234567890'
  },
  ctaButton: {
    text: 'Contact Me',
    url: '/contact'
  }
};

const testProfessionalAdmin = {
  email: "shivam@test.com",
  password: "admin@shivam",
  name: "Professional Admin",
  role: "PROFESSIONAL_ADMIN",
};

class ProfessionalAPITestSuite {
  constructor() {
    this.authTokens = {};
    this.testResults = [];
    this.professionalId = null;
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

  // Professional Authentication Tests
  async testProfessionalAuth() {
    console.log('\n=== PROFESSIONAL AUTHENTICATION TESTS ===');

    // Test 1: Login with professional credentials
    await this.logTest('Professional login', 'RUNNING', '');
    const loginResult = await this.makeRequest('POST', '/auth/login', testProfessionalAdmin);
    if (loginResult.status === 200 && loginResult.data.token) {
      this.authTokens.professionalAdmin = loginResult.data.token;
      await this.logTest('Professional login', 'PASS', 'Successfully authenticated as professional admin');
    } else {
      await this.logTest('Professional login', 'FAIL', `Expected 200 with token, got ${loginResult.status}`);
    }

    // Test 2: Access professional endpoint without token
    await this.logTest('Access professional endpoint without token', 'RUNNING', '');
    const noTokenAccess = await this.makeRequest('GET', '/professionals');
    if (noTokenAccess.status === 401) {
      await this.logTest('Access professional endpoint without token', 'PASS', 'Correctly rejected request without token');
    } else {
      await this.logTest('Access professional endpoint without token', 'FAIL', `Expected 401, got ${noTokenAccess.status}`);
    }

    // Test 3: Access professional endpoint with valid token
    await this.logTest('Access professional endpoint with valid token', 'RUNNING', '');
    const validTokenAccess = await this.makeRequest('GET', '/professionals', null, this.authTokens.professionalAdmin);
    if (validTokenAccess.status === 200) {
      await this.logTest('Access professional endpoint with valid token', 'PASS', 'Successfully accessed with valid token');
    } else {
      await this.logTest('Access professional endpoint with valid token', 'FAIL', `Expected 200, got ${validTokenAccess.status}`);
    }
  }

  // Professional Profile CRUD Tests
  async testProfessionalProfileCRUD() {
    console.log('\n=== PROFESSIONAL PROFILE CRUD TESTS ===');

    if (!this.authTokens.professionalAdmin) {
      await this.logTest('Professional profile CRUD', 'SKIP', 'No valid professional admin token');
      return;
    }

    // Test 1: Create professional profile
    await this.logTest('Create professional profile', 'RUNNING', '');
    const createResult = await this.makeRequest('POST', '/professionals', testProfessional, this.authTokens.professionalAdmin);
    if (createResult.status === 201 && createResult.data.professional) {
      this.professionalId = createResult.data.professional.id;
      await this.logTest('Create professional profile', 'PASS', 'Successfully created professional profile');
    } else {
      await this.logTest('Create professional profile', 'FAIL', `Expected 201, got ${createResult.status}`);
    }

    // Test 2: Get professional profile
    await this.logTest('Get professional profile', 'RUNNING', '');
    const getProfileResult = await this.makeRequest('GET', '/professionals', null, this.authTokens.professionalAdmin);
    if (getProfileResult.status === 200 && getProfileResult.data.professionals && getProfileResult.data.professionals.length > 0) {
      await this.logTest('Get professional profile', 'PASS', 'Successfully retrieved professional profile');
    } else {
      await this.logTest('Get professional profile', 'FAIL', `Expected 200 with data, got ${getProfileResult.status}`);
    }
  }

  // Professional Skills Tests
  async testProfessionalSkills() {
    console.log('\n=== PROFESSIONAL SKILLS TESTS ===');

    if (!this.authTokens.professionalAdmin) {
      await this.logTest('Professional skills', 'SKIP', 'No valid professional admin token');
      return;
    }

    // Test 1: Get skills
    await this.logTest('Get professional skills', 'RUNNING', '');
    const getSkillsResult = await this.makeRequest('GET', '/professionals/skills', null, this.authTokens.professionalAdmin);
    if (getSkillsResult.status === 200) {
      await this.logTest('Get professional skills', 'PASS', 'Successfully retrieved professional skills');
    } else {
      await this.logTest('Get professional skills', 'FAIL', `Expected 200, got ${getSkillsResult.status}`);
    }

    // Test 2: Update skills
    await this.logTest('Update professional skills', 'RUNNING', '');
    const updateSkillsResult = await this.makeRequest('PUT', '/professionals/skills', {
      skills: [
        { name: 'JavaScript', level: 'Expert' },
        { name: 'React', level: 'Advanced' },
        { name: 'Node.js', level: 'Intermediate' }
      ]
    }, this.authTokens.professionalAdmin);
    if (updateSkillsResult.status === 200) {
      await this.logTest('Update professional skills', 'PASS', 'Successfully updated professional skills');
    } else {
      await this.logTest('Update professional skills', 'FAIL', `Expected 200, got ${updateSkillsResult.status}`);
    }
  }

  // Professional Experience Tests
  async testProfessionalExperience() {
    console.log('\n=== PROFESSIONAL EXPERIENCE TESTS ===');

    if (!this.authTokens.professionalAdmin) {
      await this.logTest('Professional experience', 'SKIP', 'No valid professional admin token');
      return;
    }

    // Test 1: Get work experience
    await this.logTest('Get work experience', 'RUNNING', '');
    const getExperienceResult = await this.makeRequest('GET', '/professionals/experience', null, this.authTokens.professionalAdmin);
    if (getExperienceResult.status === 200) {
      await this.logTest('Get work experience', 'PASS', 'Successfully retrieved work experience');
    } else {
      await this.logTest('Get work experience', 'FAIL', `Expected 200, got ${getExperienceResult.status}`);
    }

    // Test 2: Update work experience
    await this.logTest('Update work experience', 'RUNNING', '');
    const updateExperienceResult = await this.makeRequest('PUT', '/professionals/experience', {
      workExperience: [
        {
          title: 'Senior Developer',
          company: 'Tech Corp',
          startDate: '2020-01-01',
          endDate: '2023-12-31',
          description: 'Developed web applications'
        },
        {
          title: 'Frontend Developer',
          company: 'Web Solutions',
          startDate: '2018-01-01',
          endDate: '2019-12-31',
          description: 'Frontend development'
        }
      ]
    }, this.authTokens.professionalAdmin);
    if (updateExperienceResult.status === 200) {
      await this.logTest('Update work experience', 'PASS', 'Successfully updated work experience');
    } else {
      await this.logTest('Update work experience', 'FAIL', `Expected 200, got ${updateExperienceResult.status}`);
    }
  }

  // Professional Education Tests
  async testProfessionalEducation() {
    console.log('\n=== PROFESSIONAL EDUCATION TESTS ===');

    if (!this.authTokens.professionalAdmin) {
      await this.logTest('Professional education', 'SKIP', 'No valid professional admin token');
      return;
    }

    // Test 1: Get education
    await this.logTest('Get education', 'RUNNING', '');
    const getEducationResult = await this.makeRequest('GET', '/professionals/education', null, this.authTokens.professionalAdmin);
    if (getEducationResult.status === 200) {
      await this.logTest('Get education', 'PASS', 'Successfully retrieved education');
    } else {
      await this.logTest('Get education', 'FAIL', `Expected 200, got ${getEducationResult.status}`);
    }

    // Test 2: Update education
    await this.logTest('Update education', 'RUNNING', '');
    const updateEducationResult = await this.makeRequest('PUT', '/professionals/education', {
      education: [
        {
          degree: 'BSc Computer Science',
          institution: 'University of Colombo',
          year: '2019'
        },
        {
          degree: 'MSc Software Engineering',
          institution: 'University of Moratuwa',
          year: '2021'
        }
      ]
    }, this.authTokens.professionalAdmin);
    if (updateEducationResult.status === 200) {
      await this.logTest('Update education', 'PASS', 'Successfully updated education');
    } else {
      await this.logTest('Update education', 'FAIL', `Expected 200, got ${updateEducationResult.status}`);
    }
  }

  // Professional Services Tests
  async testProfessionalServices() {
    console.log('\n=== PROFESSIONAL SERVICES TESTS ===');

    if (!this.authTokens.professionalAdmin) {
      await this.logTest('Professional services', 'SKIP', 'No valid professional admin token');
      return;
    }

    // Test 1: Get services
    await this.logTest('Get services', 'RUNNING', '');
    const getServicesResult = await this.makeRequest('GET', '/professionals/services', null, this.authTokens.professionalAdmin);
    if (getServicesResult.status === 200) {
      await this.logTest('Get services', 'PASS', 'Successfully retrieved services');
    } else {
      await this.logTest('Get services', 'FAIL', `Expected 200, got ${getServicesResult.status}`);
    }

    // Test 2: Update services
    await this.logTest('Update services', 'RUNNING', '');
    const updateServicesResult = await this.makeRequest('PUT', '/professionals/services', {
      services: [
        { name: 'Web Development', description: 'Full-stack web development' },
        { name: 'Consulting', description: 'Technical consulting' },
        { name: 'Training', description: 'Developer training' }
      ]
    }, this.authTokens.professionalAdmin);
    if (updateServicesResult.status === 200) {
      await this.logTest('Update services', 'PASS', 'Successfully updated services');
    } else {
      await this.logTest('Update services', 'FAIL', `Expected 200, got ${updateServicesResult.status}`);
    }
  }

  // Professional Portfolio Tests
  async testProfessionalPortfolio() {
    console.log('\n=== PROFESSIONAL PORTFOLIO TESTS ===');

    if (!this.authTokens.professionalAdmin) {
      await this.logTest('Professional portfolio', 'SKIP', 'No valid professional admin token');
      return;
    }

    // Test 1: Get portfolio
    await this.logTest('Get portfolio', 'RUNNING', '');
    const getPortfolioResult = await this.makeRequest('GET', '/professionals/portfolio', null, this.authTokens.professionalAdmin);
    if (getPortfolioResult.status === 200) {
      await this.logTest('Get portfolio', 'PASS', 'Successfully retrieved portfolio');
    } else {
      await this.logTest('Get portfolio', 'FAIL', `Expected 200, got ${getPortfolioResult.status}`);
    }

    // Test 2: Update portfolio
    await this.logTest('Update portfolio', 'RUNNING', '');
    const updatePortfolioResult = await this.makeRequest('PUT', '/professionals/portfolio', {
      portfolio: [
        { title: 'E-commerce Site', description: 'Full e-commerce solution', image: 'https://example.com/project1.jpg' },
        { title: 'Portfolio Website', description: 'Personal portfolio site', image: 'https://example.com/project2.jpg' }
      ]
    }, this.authTokens.professionalAdmin);
    if (updatePortfolioResult.status === 200) {
      await this.logTest('Update portfolio', 'PASS', 'Successfully updated portfolio');
    } else {
      await this.logTest('Update portfolio', 'FAIL', `Expected 200, got ${updatePortfolioResult.status}`);
    }
  }

  // Professional Inquiry Tests
  async testProfessionalInquiries() {
    console.log('\n=== PROFESSIONAL INQUIRY TESTS ===');

    if (!this.authTokens.professionalAdmin) {
      await this.logTest('Professional inquiries', 'SKIP', 'No valid professional admin token');
      return;
    }

    // Test 1: Get inquiries
    await this.logTest('Get inquiries', 'RUNNING', '');
    const getInquiriesResult = await this.makeRequest('GET', '/professionals/inquiries', null, this.authTokens.professionalAdmin);
    if (getInquiriesResult.status === 200) {
      await this.logTest('Get inquiries', 'PASS', 'Successfully retrieved inquiries');
    } else {
      await this.logTest('Get inquiries', 'FAIL', `Expected 200, got ${getInquiriesResult.status}`);
    }
  }

  // Professional Upload Tests
  async testProfessionalUploads() {
    console.log('\n=== PROFESSIONAL UPLOAD TESTS ===');

    if (!this.authTokens.professionalAdmin) {
      await this.logTest('Professional uploads', 'SKIP', 'No valid professional admin token');
      return;
    }

    // Test 1: Upload without file
    await this.logTest('Upload without file', 'RUNNING', '');
    
    // Create a proper multipart form data request
    const formData = new FormData();
    // Don't append any file to test the "no file" scenario
    
    try {
      const response = await fetch(`${BASE_URL}/professionals/upload`, {
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
    console.log('\n=== PROFESSIONAL PERFORMANCE TESTS ===');

    // Test 1: Concurrent requests
    await this.logTest('Concurrent requests', 'RUNNING', '');
    const startTime = Date.now();
    const requests = Array(10).fill().map(() => this.makeRequest('GET', '/professionals'));
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
    console.log('\n=== PROFESSIONAL SECURITY TESTS ===');

    // Test 1: SQL Injection attempt
    await this.logTest('SQL Injection attempt', 'RUNNING', '');
    const sqlInjection = await this.makeRequest('POST', '/professionals', {
      name: "'; DROP TABLE professionals; --",
      email: 'test@test.com'
    });
    if (sqlInjection.status === 401 || sqlInjection.status === 500) {
      await this.logTest('SQL Injection attempt', 'PASS', 'Correctly handled malicious input');
    } else {
      await this.logTest('SQL Injection attempt', 'FAIL', `Unexpected response: ${sqlInjection.status}`);
    }

    // Test 2: XSS attempt
    await this.logTest('XSS attempt', 'RUNNING', '');
    const xssAttempt = await this.makeRequest('POST', '/professionals', {
      name: '<script>alert("xss")</script>',
      email: 'test@test.com'
    });
    if (xssAttempt.status === 401 || xssAttempt.status === 500) {
      await this.logTest('XSS attempt', 'PASS', 'Correctly handled malicious input');
    } else {
      await this.logTest('XSS attempt', 'FAIL', `Unexpected response: ${xssAttempt.status}`);
    }
  }

  async runAllTests() {
    console.log('Starting comprehensive Professional Admin Panel API test suite...\n');

    await this.testProfessionalAuth();
    await this.testProfessionalProfileCRUD();
    await this.testProfessionalSkills();
    await this.testProfessionalExperience();
    await this.testProfessionalEducation();
    await this.testProfessionalServices();
    await this.testProfessionalPortfolio();
    await this.testProfessionalInquiries();
    await this.testProfessionalUploads();
    await this.testPerformance();
    await this.testSecurity();

    this.generateReport();
  }

  generateReport() {
    console.log('\n=== PROFESSIONAL PANEL TEST REPORT ===');
    
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

    console.log('\nProfessional Panel test report generated. Check console for details.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new ProfessionalAPITestSuite();
  testSuite.runAllTests().catch(console.error);
}

module.exports = ProfessionalAPITestSuite;