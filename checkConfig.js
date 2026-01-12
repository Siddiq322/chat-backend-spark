/**
 * Environment Configuration Checker
 * Run this to verify your .env setup before starting the server
 * 
 * Usage: node checkConfig.js
 */

require('dotenv').config();

const checks = {
  required: [
    'MONGODB_URI',
    'JWT_SECRET',
  ],
  optional: [
    'PORT',
    'NODE_ENV',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'CLIENT_URL',
    'JWT_EXPIRE',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS',
  ],
};

console.log('\n🔍 Checking Environment Configuration...\n');

let hasErrors = false;
let hasWarnings = false;

// Check required variables
console.log('✅ Required Variables:');
checks.required.forEach((key) => {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    console.log(`  ❌ ${key}: MISSING (Required!)`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const displayValue = key.includes('SECRET') || key.includes('PASSWORD')
      ? '***' + value.slice(-4)
      : value.length > 50
      ? value.substring(0, 47) + '...'
      : value;
    console.log(`  ✅ ${key}: ${displayValue}`);
  }
});

// Check optional variables
console.log('\n⚙️  Optional Variables (defaults will be used if missing):');
checks.optional.forEach((key) => {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    console.log(`  ⚠️  ${key}: Not set (using default)`);
    hasWarnings = true;
  } else {
    const displayValue = key.includes('SECRET') || key.includes('KEY')
      ? '***' + value.slice(-4)
      : value;
    console.log(`  ✅ ${key}: ${displayValue}`);
  }
});

// Specific checks
console.log('\n🔐 Security Checks:');

// JWT Secret strength
if (process.env.JWT_SECRET) {
  if (process.env.JWT_SECRET.length < 32) {
    console.log('  ⚠️  JWT_SECRET is short. Use at least 32 characters for production.');
    hasWarnings = true;
  } else {
    console.log('  ✅ JWT_SECRET length is good');
  }
}

// MongoDB URI format
if (process.env.MONGODB_URI) {
  if (process.env.MONGODB_URI.startsWith('mongodb://') || 
      process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
    console.log('  ✅ MongoDB URI format is valid');
  } else {
    console.log('  ❌ MongoDB URI should start with mongodb:// or mongodb+srv://');
    hasErrors = true;
  }
}

// Cloudinary check
console.log('\n📸 Image Upload (Cloudinary):');
if (process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET) {
  console.log('  ✅ Cloudinary configured - Image uploads enabled');
} else {
  console.log('  ⚠️  Cloudinary not configured - Image uploads will fail');
  console.log('     Get credentials from: https://cloudinary.com/');
  hasWarnings = true;
}

// Summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('❌ Configuration has ERRORS! Fix them before starting server.');
  console.log('\nSteps to fix:');
  console.log('1. Copy .env.example to .env');
  console.log('2. Fill in the missing required values');
  console.log('3. Run this script again: node checkConfig.js');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Configuration is OK but has warnings.');
  console.log('Server will start but some features may not work.');
  console.log('Consider fixing warnings for full functionality.');
  console.log('\n✅ You can start the server with: npm run dev');
  process.exit(0);
} else {
  console.log('✅ Configuration is perfect! All systems ready.');
  console.log('\n🚀 Start the server with: npm run dev');
  process.exit(0);
}
