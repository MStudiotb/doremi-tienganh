const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔍 Testing MongoDB Atlas connection...\n');
  
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  
  console.log('📝 Connection details:');
  console.log('URI:', uri ? uri.replace(/:[^:@]+@/, ':****@') : 'NOT SET');
  console.log('DB Name:', dbName || 'NOT SET');
  console.log('');
  
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env.local');
    process.exit(1);
  }
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });
  
  try {
    console.log('🔌 Attempting to connect...');
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    console.log('📊 Testing database access...');
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`, collections.map(c => c.name).join(', ') || 'none');
    
    console.log('\n🎉 MongoDB Atlas connection is working!');
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('\nPossible causes:');
    console.error('1. Network/Firewall blocking MongoDB Atlas');
    console.error('2. IP not whitelisted (should be 0.0.0.0/0)');
    console.error('3. Invalid credentials');
    console.error('4. DNS resolution issue');
    process.exit(1);
  } finally {
    await client.close();
  }
}

testConnection();
