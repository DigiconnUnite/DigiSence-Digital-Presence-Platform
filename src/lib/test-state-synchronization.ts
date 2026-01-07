// Enhanced test script to verify state synchronization fixes
// This script tests real-time state updates after CRUD operations

async function testStateSynchronization() {
  console.log('🔄 Testing State Synchronization');
  console.log('================================');

  const testResults = {
    businessDeletion: false,
    professionalDeletion: false,
    businessUpdate: false,
    professionalUpdate: false,
    businessToggle: false,
    professionalToggle: false
  };

  // Test 1: Business Deletion State Sync
  console.log('\n🏢 Testing Business Deletion State Synchronization');
  console.log('--------------------------------------------------');

  try {
    // First, create a test business
    const businessData = {
      name: 'Test Business State Sync ' + Date.now(),
      email: 'test-state@example.com',
      password: 'TestPass123!',
      adminName: 'Test Admin',
      categoryId: 'test-category',
      description: 'Test business for state sync verification',
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

      // Verify business exists in list
      const listResponse = await fetch('/api/admin/businesses');
      const listData = await listResponse.json();
      const businessExistsBefore = listData.businesses.some(b => b.id === businessId);
      console.log('✅ Business exists in list before deletion:', businessExistsBefore);

      // Delete the business
      const deleteResponse = await fetch(`/api/admin/businesses/${businessId}`, {
        method: 'DELETE'
      });

      if (deleteResponse.ok) {
        console.log('✅ Business deletion API call successful');

        // Verify business no longer exists in list
        const listResponseAfter = await fetch('/api/admin/businesses');
        const listDataAfter = await listResponseAfter.json();
        const businessExistsAfter = listDataAfter.businesses.some(b => b.id === businessId);
        console.log('✅ Business exists in list after deletion:', businessExistsAfter);

        if (!businessExistsAfter) {
          testResults.businessDeletion = true;
          console.log('✅ Business deletion state synchronization: PASSED');
        } else {
          console.log('❌ Business deletion state synchronization: FAILED - Business still in list');
        }
      } else {
        console.log('❌ Business deletion API call failed');
      }
    } else {
      console.log('❌ Failed to create test business');
    }
  } catch (error) {
    console.log('❌ Business deletion test: ERROR -', error instanceof Error ? error.message : 'Unknown error');
  }

  // Test 2: Professional Deletion State Sync
  console.log('\n👤 Testing Professional Deletion State Synchronization');
  console.log('-----------------------------------------------------');

  try {
    // First, create a test professional
    const professionalData = {
      name: 'Test Professional State Sync ' + Date.now(),
      email: 'prof-state@example.com',
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

      // Verify professional exists in list
      const listResponse = await fetch('/api/professionals');
      const listData = await listResponse.json();
      const professionalExistsBefore = listData.professionals.some(p => p.id === professionalId);
      console.log('✅ Professional exists in list before deletion:', professionalExistsBefore);

      // Delete the professional
      const deleteResponse = await fetch(`/api/professionals/${professionalId}`, {
        method: 'DELETE'
      });

      if (deleteResponse.ok) {
        console.log('✅ Professional deletion API call successful');

        // Verify professional no longer exists in list
        const listResponseAfter = await fetch('/api/professionals');
        const listDataAfter = await listResponseAfter.json();
        const professionalExistsAfter = listDataAfter.professionals.some(p => p.id === professionalId);
        console.log('✅ Professional exists in list after deletion:', professionalExistsAfter);

        if (!professionalExistsAfter) {
          testResults.professionalDeletion = true;
          console.log('✅ Professional deletion state synchronization: PASSED');
        } else {
          console.log('❌ Professional deletion state synchronization: FAILED - Professional still in list');
        }
      } else {
        console.log('❌ Professional deletion API call failed');
      }
    } else {
      console.log('❌ Failed to create test professional');
    }
  } catch (error) {
    console.log('❌ Professional deletion test: ERROR -', error instanceof Error ? error.message : 'Unknown error');
  }

  // Test 3: Business Update State Sync
  console.log('\n📝 Testing Business Update State Synchronization');
  console.log('-----------------------------------------------');

  try {
    // Create a test business for update
    const businessData = {
      name: 'Test Business Update ' + Date.now(),
      email: 'test-update@example.com',
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
        name: 'Updated Business Name',
        description: 'Updated description',
        address: 'Updated address'
      };

      const updateResponse = await fetch(`/api/admin/businesses/${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        console.log('✅ Business update API call successful');

        // Verify business was updated in list
        const listResponse = await fetch('/api/admin/businesses');
        const listData = await listResponse.json();
        const updatedBusiness = listData.businesses.find(b => b.id === businessId);
        
        if (updatedBusiness && updatedBusiness.name === 'Updated Business Name') {
          testResults.businessUpdate = true;
          console.log('✅ Business update state synchronization: PASSED');
        } else {
          console.log('❌ Business update state synchronization: FAILED - Business not updated');
        }
      } else {
        console.log('❌ Business update API call failed');
      }
    } else {
      console.log('❌ Failed to create test business for update');
    }
  } catch (error) {
    console.log('❌ Business update test: ERROR -', error instanceof Error ? error.message : 'Unknown error');
  }

  // Test 4: Professional Update State Sync
  console.log('\n📝 Testing Professional Update State Synchronization');
  console.log('--------------------------------------------------');

  try {
    // Create a test professional for update
    const professionalData = {
      name: 'Test Professional Update ' + Date.now(),
      email: 'prof-update@example.com',
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
        name: 'Updated Professional Name',
        phone: '+0987654321'
      };

      const updateResponse = await fetch(`/api/professionals/${professionalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        console.log('✅ Professional update API call successful');

        // Verify professional was updated in list
        const listResponse = await fetch('/api/professionals');
        const listData = await listResponse.json();
        const updatedProfessional = listData.professionals.find(p => p.id === professionalId);
        
        if (updatedProfessional && updatedProfessional.name === 'Updated Professional Name') {
          testResults.professionalUpdate = true;
          console.log('✅ Professional update state synchronization: PASSED');
        } else {
          console.log('❌ Professional update state synchronization: FAILED - Professional not updated');
        }
      } else {
        console.log('❌ Professional update API call failed');
      }
    } else {
      console.log('❌ Failed to create test professional for update');
    }
  } catch (error) {
    console.log('❌ Professional update test: ERROR -', error instanceof Error ? error.message : 'Unknown error');
  }

  // Summary
  console.log('\n📈 State Synchronization Test Summary');
  console.log('=====================================');

  const totalTests = Object.values(testResults).length;
  const passedTests = Object.values(testResults).filter(Boolean).length;

  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All state synchronization tests PASSED! Real-time updates are working correctly.');
  } else {
    console.log('\n⚠️  Some state synchronization tests FAILED. Please check the implementation.');
  }

  return testResults;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testStateSynchronization = testStateSynchronization;
}

export { testStateSynchronization };