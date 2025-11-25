#!/usr/bin/env node

/**
 * Server Health Check Script
 * Run this to diagnose server startup issues
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

console.log('🔍 IFA EMS Server Health Check\n');
console.log('=' .repeat(50));

// Check 1: Environment Variables
console.log('\n✓ Checking Environment Variables...');
const requiredEnvVars = [
  'MONGODB_URI',
  'PORT',
  'NODE_ENV',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_ORIGIN',
];

let envCheckPassed = true;
requiredEnvVars.forEach((varName) => {
  if (process.env[varName]) {
    console.log(`  ✅ ${varName}: Set`);
  } else {
    console.log(`  ❌ ${varName}: Missing`);
    envCheckPassed = false;
  }
});

if (!envCheckPassed) {
  console.log('\n❌ Some environment variables are missing!');
  console.log('   Please check your server/.env file');
  process.exit(1);
}

// Check 2: Node Environment
console.log('\n✓ Checking Node Environment...');
console.log(`  Node Version: ${process.version}`);
console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`  PORT: ${process.env.PORT}`);

if (process.env.NODE_ENV === 'production') {
  console.log('  ⚠️  Warning: NODE_ENV is set to production');
  console.log('     For local development, use NODE_ENV=development');
}

// Check 3: MongoDB Connection
console.log('\n✓ Testing MongoDB Connection...');
try {
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log('  ✅ MongoDB connection successful');
  console.log(`  Database: ${mongoose.connection.name}`);
  await mongoose.connection.close();
} catch (error) {
  console.log('  ❌ MongoDB connection failed');
  console.log(`  Error: ${error.message}`);
  console.log('\n  Troubleshooting:');
  console.log('  1. Check your MONGODB_URI in .env file');
  console.log('  2. Verify internet connection');
  console.log('  3. Check MongoDB Atlas IP whitelist');
  console.log('  4. Verify database credentials');
  process.exit(1);
}

// Check 4: Port Availability
console.log('\n✓ Checking Port Availability...');
const port = process.env.PORT || 3000;
const net = await import('net');

const checkPort = () => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
};

const portAvailable = await checkPort();
if (portAvailable) {
  console.log(`  ✅ Port ${port} is available`);
} else {
  console.log(`  ❌ Port ${port} is already in use`);
  console.log('\n  Troubleshooting:');
  console.log('  Windows: netstat -ano | findstr :' + port);
  console.log('  Then: taskkill /PID <PID> /F');
  process.exit(1);
}

// Check 5: CORS Configuration
console.log('\n✓ Checking CORS Configuration...');
const clientOrigin = process.env.CLIENT_ORIGIN;
if (clientOrigin) {
  const origins = clientOrigin.split(',').map(o => o.trim());
  console.log('  Allowed Origins:');
  origins.forEach(origin => {
    console.log(`    - ${origin}`);
  });
  
  if (process.env.NODE_ENV === 'development' && !origins.includes('http://localhost:5173')) {
    console.log('  ⚠️  Warning: localhost:5173 not in allowed origins');
    console.log('     Add http://localhost:5173 to CLIENT_ORIGIN for local development');
  }
} else {
  console.log('  ⚠️  CLIENT_ORIGIN not set, using default');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('✅ All checks passed! Server should start successfully.');
console.log('\nTo start the server, run:');
console.log('  npm run dev    (development)');
console.log('  npm start      (production)');
console.log('='.repeat(50) + '\n');

process.exit(0);
