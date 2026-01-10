#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getSchema() {
  console.log('📊 Checking Supabase table schemas...\n');

  const tables = ['users', 'products', 'orders', 'invoices'];

  for (const table of tables) {
    console.log(`\n📋 ${table} table:`);
    console.log(''.padEnd(40, '='));
    
    try {
      // Query information_schema
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name,data_type,is_nullable')
        .eq('table_name', table)
        .eq('table_schema', 'public');

      if (error) {
        console.log(`  ⚠️  Cannot query schema: ${error.message}`);
        console.log('  Attempting fallback query...');
        
        // Fallback: Try getting one row to see columns
        const { data: row, error: err2 } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (!err2 && row && row.length > 0) {
          console.log('  Columns detected:');
          Object.keys(row[0]).forEach(col => {
            const val = row[0][col];
            const type = typeof val === 'object' ? (val === null ? 'NULL' : 'JSON') : typeof val;
            console.log(`    - ${col}: ${type}`);
          });
        }
      } else {
        console.log('  Columns:');
        data.forEach(col => {
          console.log(`    - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
      }
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
  }
}

getSchema();
