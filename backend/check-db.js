#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...\n');

  try {
    // First, verify connection by querying users table
    console.log('1️⃣  Testing Supabase connection...');
    let { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error && error.code === 'PGRST116') {
      console.log('  ℹ️  Users table exists but is empty');
    } else if (error && error.message.includes('does not exist')) {
      console.log('  ℹ️  Users table does not exist yet - needs to be created via Supabase dashboard');
    } else if (error) {
      console.log('  ⚠️  Error:', error.message);
    } else {
      console.log('  ✅ Users table exists');
    }

    // Check products table
    console.log('\n2️⃣  Checking products table...');
    ({ data, error } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true }));

    if (!error) {
      console.log('  ✅ Products table exists');
    } else {
      console.log('  ❌ Products table missing:', error.message);
    }

    // Check orders table
    console.log('\n3️⃣  Checking orders table...');
    ({ data, error } = await supabase
      .from('orders')
      .select('count', { count: 'exact', head: true }));

    if (!error) {
      console.log('  ✅ Orders table exists');
    } else {
      console.log('  ❌ Orders table missing:', error.message);
    }

    // Check invoices table
    console.log('\n4️⃣  Checking invoices table...');
    ({ data, error } = await supabase
      .from('invoices')
      .select('count', { count: 'exact', head: true }));

    if (!error) {
      console.log('  ✅ Invoices table exists');
    } else {
      console.log('  ❌ Invoices table missing:', error.message);
    }

    console.log('\n📋 INSTRUCTIONS FOR CREATING TABLES:');
    console.log('=====================================');
    console.log('1. Go to https://app.supabase.com/');
    console.log('2. Sign in and navigate to project: ktqdfwludqkijgrnrfxm');
    console.log('3. Go to SQL Editor');
    console.log('4. Create a new query and paste the SQL from create-tables.sql');
    console.log('5. Run the query to create all tables');
    console.log('6. After creation, run this script again to verify\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupDatabase();
