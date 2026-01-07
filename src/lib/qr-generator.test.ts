import { generateBusinessCard, ProfessionalData } from './qr-generator';

// Test data
const testProfessional: ProfessionalData = {
  name: "John Doe",
  professionalHeadline: "Senior Software Engineer",
  location: "San Francisco, CA",
  phone: "+91 (555) 123-4567",
  email: "john.doe@example.com",
  website: "https://johndoe.dev",
  facebook: "https://facebook.com/johndoe",
  twitter: "https://twitter.com/johndoe",
  instagram: "https://instagram.com/johndoe",
  linkedin: "https://linkedin.com/in/johndoe"
};

// Simple test function
export async function testQRGenerator() {
  try {
    console.log('Testing QR code generator...');
    
    const cardBuffer = await generateBusinessCard(testProfessional);
    
    if (cardBuffer && cardBuffer.length > 0) {
      console.log('✅ QR code generator test passed!');
      console.log(`Generated card size: ${cardBuffer.length} bytes`);
      return true;
    } else {
      console.log('❌ QR code generator test failed: Empty buffer');
      return false;
    }
  } catch (error) {
    console.error('❌ QR code generator test failed:', error);
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testQRGenerator().then(success => {
    process.exit(success ? 0 : 1);
  });
}