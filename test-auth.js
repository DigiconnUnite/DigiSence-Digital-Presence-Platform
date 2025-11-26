// Using built-in fetch

const BASE_URL = "http://localhost:3000";

// Test credentials from seed data
const testCredentials = [
  {
    email: "superadmin@digisence.com",
    password: "admin123",
    role: "SUPER_ADMIN",
  },
  {
    email: "admin@jakson.com",
    password: "business123",
    role: "BUSINESS_ADMIN",
  },
];

async function testAuthentication() {
  console.log("🔐 Testing Authentication System...\n");

  for (const creds of testCredentials) {
    console.log(`Testing login for ${creds.role}: ${creds.email}`);

    try {
      // Test login
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: creds.email,
          password: creds.password,
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        console.log(`❌ Login failed: ${errorData.error}`);
        continue;
      }

      const loginData = await loginResponse.json();
      console.log(`✅ Login successful for ${creds.role}`);
      console.log(`   User: ${loginData.user.name} (${loginData.user.email})`);
      console.log(`   Role: ${loginData.user.role}`);
      console.log(`   Token received: ${loginData.token ? "Yes" : "No"}`);

      // Extract token from cookies
      const cookies = loginResponse.headers.get("set-cookie");
      const tokenMatch = cookies?.match(/auth-token=([^;]+)/);
      const token = tokenMatch ? tokenMatch[1] : loginData.token;

      if (!token) {
        console.log("❌ No token found in response");
        continue;
      }

      // Test /me endpoint with token
      console.log("   Testing /me endpoint...");
      const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: {
          Cookie: `auth-token=${token}`,
        },
      });

      if (meResponse.ok) {
        const meData = await meResponse.json();
        console.log(`✅ /me endpoint works: ${meData.user.email}`);
      } else {
        const errorData = await meResponse.json();
        console.log(`❌ /me endpoint failed: ${errorData.error}`);
      }

      // Test invalid credentials
      console.log("   Testing invalid credentials...");
      const invalidResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: creds.email,
          password: "wrongpassword",
        }),
      });

      if (invalidResponse.status === 401) {
        console.log("✅ Invalid credentials properly rejected");
      } else {
        console.log("❌ Invalid credentials not properly rejected");
      }
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }

    console.log(""); // Empty line between tests
  }

  console.log("🎉 Authentication testing completed!");
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    return response.ok; // 200 means server running
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log("🚀 Checking if development server is running...\n");

  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log("❌ Development server is not running!");
    console.log("Please start the server first with: npm run dev");
    console.log("Then run this test: node test-auth.js");
    process.exit(1);
  }

  console.log("✅ Development server is running\n");

  await testAuthentication();
}

main().catch(console.error);
