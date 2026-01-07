// Comprehensive test script to verify database persistence
// This script tests that data is properly deleted from the database and doesn't reappear after refresh

async function testDatabasePersistence() {
  console.log('💾 Testing Database Persistence');
  console.log('===============================');

  const testResults = {
    businessDeletionPersistence: false,
    professionalDeletionPersistence: false,
    businessUpdatePersistence: false,
    professionalUpdatePersistence: false,
    businessTogglePersistence: false,
    professionalTogglePersistence: false
  };

  // Test 1: Business Deletion Database Persistence
  console.log('\n🏢 Testing Business Deletion Database Persistence');
  console.log('-----------------------------------------------');

  try {
    // Create a test business
    const businessData = {
      name: 'Test Business Persistence ' + Date.now(),
      email: 'test-persistence@example.com',
      password: 'TestPass123!',
      adminName: 'Test Admin',
      categoryId: 'test-category',
      description: 'Test business for database persistence verification',
      address: 'Test Address',
      phone: '+1234567890',
      website: 'https://test.com'
    };

    const createResponse = await fetch('/api/admin/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(businessData)
    });

    if (createResponse.ok) {
      const result = await createResponse.json();
      const businessId = result.business.id;
      console.log('✅ Test business created:', businessId);

      // Verify business exists in database
      const listResponse1 = await fetch('/api/admin/businesses');
      const listData1 = await listResponse1.json();
      const businessExistsBefore = listData1.businesses.some(b => b.id === businessId);
      console.log('✅ Business exists in database before deletion:', businessExistsBefore);

      // Delete the business
      const deleteResponse = await fetch(`/api/admin/businesses/${businessId}`, {
        method: 'DELETE'
      });

      if (deleteResponse.ok) {
        console.log('✅ Business deletion API call successful');

        // Verify business no longer exists in database
        const listResponse2 = await fetch('/api/admin/businesses');
        const listData2 = await listResponse2.json();
        const businessExistsAfter = listData2.businesses.some(b => b.id === businessId);
        console.log('✅ Business exists in database after deletion:', businessExistsAfter);

        if (!businessExistsAfter) {
          testResults.businessDeletionPersistence = true;
          console.log('✅ Business deletion database persistence: PASSED');
        } else {
          console.log('❌ Business deletion database persistence: FAILED - Business still in database');
        }
      } else {
        console.log('❌ Business deletion API call failed');
      }
    } else {
      console.log('❌ Failed to create test business');
    }
  } catch (error) {
    console.log('❌ Business deletion persistence test: ERROR -', error instanceof Error ? error.message : 'Unknown error');
  }

  // Test 2: Professional Deletion Database Persistence
  console.log('\n👤 Testing Professional Deletion Database Persistence');
  console.log('---------------------------------------------------');

  try {
    // Create a test professional
    const professionalData = {
      name: 'Test Professional Persistence ' + Date.now(),
      email: 'prof-persistence@example.com',
      password: 'TestPass123!',
      adminName: 'Test Admin',
      phone: '+1234567890'
    };

    const createProResponse = await fetch('/api/admin/professionals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(professionalData)
    });

    if (createProResponse.ok) {
      const result = await createProResponse.json();
      const professionalId = result.professional.id;
      console.log('✅ Test professional created:', professionalId);

      // Verify professional exists in database
      const listResponse1 = await fetch('/api/professionals');
      const listData1 = await listResponse1.json();
      const professionalExistsBefore = listData1.professionals.some(p => p.id === professionalId);
      console.log('✅ Professional exists in database before deletion:', professionalExistsBefore);

      // Delete the professional
      const deleteResponse = await fetch(`/api/professionals/${professionalId}`, {
        method: 'DELETE'
      });

      if (deleteResponse.ok) {
        console.log('✅ Professional deletion API call successful');

        // Verify professional no longer exists in database
        const listResponse2 = await fetch('/api/professionals');
        const listData2 = await listResponse2.json();
        const professionalExistsAfter = listData2.professionals.some(p => p.id === professionalId);
        console.log('✅ Professional exists in database after deletion:', professionalExistsAfter);

        if (!professionalExistsAfter) {
          testResults.professionalDeletionPersistence = true;
          console.log('✅ Professional deletion database persistence: PASSED');
        } else {
          console.log('❌ Professional deletion database persistence: FAILED - Professional still in database');
        }
      } else {
        console.log('❌ Professional deletion API call failed');
      }
    } else {
      console.log('❌ Failed to create test professional');
    }
  } catch (error) {
    console.log('❌ Professional deletion persistence test: ERROR -', error instanceof Error ? error.message : 'Unknown error');
  }

  // Test 3: Business Update Database Persistence
  console.log('\n📝 Testing Business Update Database Persistence');
  console.log('----------------------------------------------');

  try {
    // Create a test business for update
    const businessData = {
      name: 'Test Business Update Persistence ' + Date.now(),
      email: 'test-update-persistence@example.com',
      password: 'TestPass123!',
      adminName: 'Test Admin',
      categoryId: 'test-category',
      description: 'Original description',
      address: 'Original address',
      phone: '+1234567890',
      website: 'https://test.com'
    };

    const createResponse = await fetch('/api/admin/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(businessData)
    });

    if (createResponse.ok) {
      const result = await createResponse.json();
      const businessId = result.business.id;
      console.log('✅ Test business created for update:', businessId);

      // Update the business
      const updateData = {
        name: 'Updated Business Name Persistence',
        description: 'Updated description persistence',
        address: 'Updated address persistence'
      };

      const updateResponse = await fetch(`/api/admin/businesses/${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        console.log('✅ Business update API call successful');

        // Verify business was updated in database
        const listResponse = await fetch('/api/admin/businesses');
        const listData = await listResponse.json();
        const updatedBusiness = listData.businesses.find(b => b.id === businessId);
        
        if (updatedBusiness && updatedBusiness.name === 'Updated Business Name Persistence') {
          testResults.businessUpdatePersistence = true;
          console.log('✅ Business update database persistence: PASSED');
        } else {
          console.log('❌ Business update database persistence: FAILED - Business not updated in database');
        }
      } else {
        console.log('❌ Business update API call failed');
      }
    } else {
      console.log('❌ Failed to create test business for update');
    }
  } catch (error) {
    console.log('❌ Business update persistence test: ERROR -', error instanceof Error ? error.message : 'Unknown error');
  }

  // Test 4: Professional Update Database Persistence
  console.log('\n📝 Testing Professional Update Database Persistence');
  console.log('-------------------------------------------------');

  try {
    // Create a test professional for update
    const professionalData = {
      name: 'Test Professional Update Persistence ' + Date.now(),
      email: 'prof-update-persistence@example.com',
      password: 'TestPass123!',
      adminName: 'Test Admin',
      phone: '+1234567890'
    };

    const createProResponse = await fetch('/api/admin/professionals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(professionalData)
    });

    if (createProResponse.ok) {
      const result = await createProResponse.json();
      const professionalId = result.professional.id;
      console.log('✅ Test professional created for update:', professionalId);

      // Update the professional
      const updateData = {
        name: 'Updated Professional Name Persistence',
        phone: '+0987654321'
      };

      const updateResponse = await fetch(`/api/professionals/${professionalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        console.log('✅ Professional update API call successful');

        // Verify professional was updated in database
        const listResponse = await fetch('/api/professionals');
        const listData = await listResponse.json();
        const updatedProfessional = listData.professionals.find(p => p.id === professionalId);
        
        if (updatedProfessional && updatedProfessional.name === 'Updated Professional Name Persistence') {
          testResults.professionalUpdatePersistence = true;
          console.log('✅ Professional update database persistence: PASSED');
        } else {
          console.log('❌ Professional update database persistence: FAILED - Professional not updated in database');
        }
      } else {
        console.log('❌ Professional update API call failed');
      }
    } else {
      console.log('❌ Failed to create test professional for update');
    }
  } catch (error) {
    console.log('❌ Professional update persistence test: ERROR -', error instanceof Error ? error.message : 'Unknown error');
  }

  // Summary
  console.log('\n📈 Database Persistence Test Summary');
  console.log('====================================');

  const totalTests = Object.values(testResults).length;
  const passedTests = Object.values(testResults).filter(Boolean).length;

  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All database persistence tests PASSED! Data is properly synchronized with the database.');
  } else {
    console.log('\n⚠️  Some database persistence tests FAILED. Database operations may not be working correctly.');
  }

  return testResults;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testDatabasePersistence = testDatabasePersistence;
}

export { testDatabasePersistence };