#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableRLS() {
  console.log('🔧 Disabling RLS on tables to fix schema cache issues...\n');

  const tables = ['users', 'products', 'orders', 'invoices'];

  for (const table of tables) {
    console.log(`Disabling RLS on ${table}...`);
    
    try {
      // First try to disable RLS
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;`
      });

      if (error) {
        console.log(`  ⚠️  Could not disable via RPC: ${error.message}`);
        console.log(`  ℹ️  You may need to manually disable RLS in Supabase dashboard`);
      } else {
        console.log(`  ✅ RLS disabled on ${table}`);
      }
    } catch (e) {
      console.log(`  ⚠️  Error: ${e.message}`);
    }
  }

  // Verify by doing a test query on each table
  console.log('\n✅ Testing table access after disabling RLS...\n');

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: accessible`);
    }
  }
}

// Try a simpler approach - just query the tables to see if they're accessible
async function testAccess() {
  console.log('🧪 Testing table access...\n');

  const tables = ['users', 'products', 'orders', 'invoices'];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`✅ ${table}: table exists (empty)`);
        } else if (error.message.includes('does not exist')) {
          console.log(`❌ ${table}: table does not exist`);
        } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`❌ ${table}: table does not exist (relation error)`);
        } else {
          console.log(`⚠️  ${table}: ${error.message}`);
        }
      } else {
        console.log(`✅ ${table}: accessible (${count} rows)`);
      }
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
    }
  }
}

testAccess();
