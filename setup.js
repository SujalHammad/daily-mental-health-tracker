#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Mental Health Tracker...\n');

// Check if .env exists, if not create it
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mental-health-tracker
JWT_SECRET=your-super-secret-jwt-key-here-${Math.random().toString(36).substring(2, 15)}
JWT_EXPIRE=7d`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created with random JWT secret');
} else {
  console.log('✅ .env file already exists');
}

// Install backend dependencies
console.log('\n📦 Installing backend dependencies...');
try {
  execSync('npm install', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Backend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install backend dependencies:', error.message);
  process.exit(1);
}

// Install frontend dependencies
console.log('\n📦 Installing frontend dependencies...');
try {
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'client') });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies:', error.message);
  process.exit(1);
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Start the backend server: npm run dev');
console.log('3. In a new terminal, start the frontend: cd client && npm start');
console.log('4. Or run both together: npm run dev:full');
console.log('\n🌐 The application will be available at:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend API: http://localhost:5000');
console.log('\n📚 Check the README.md for detailed documentation');
