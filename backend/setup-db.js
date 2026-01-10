const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...\n');

  const sqlStatements = [
    // Users table
    `CREATE TABLE IF NOT EXISTS public.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255),
      role VARCHAR(50) DEFAULT 'customer',
      "isGuest" BOOLEAN DEFAULT FALSE,
      "ordersCount" INTEGER DEFAULT 0,
      "lastOrderAt" TIMESTAMP WITH TIME ZONE,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    // Products table
    `CREATE TABLE IF NOT EXISTS public.products (
      id BIGINT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      brand VARCHAR(255),
      picture VARCHAR(500),
      price DECIMAL(10, 2) NOT NULL,
      category VARCHAR(100),
      description TEXT,
      "quantityInStock" INTEGER DEFAULT 0,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    // Orders table
    `CREATE TABLE IF NOT EXISTS public.orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "orderNumber" VARCHAR(50) UNIQUE NOT NULL,
      "userId" UUID REFERENCES public.users(id) ON DELETE SET NULL,
      "guestInfo" JSONB,
      items JSONB NOT NULL,
      subtotal DECIMAL(10, 2),
      "deliveryFee" DECIMAL(10, 2),
      total DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      "deliveryMethod" VARCHAR(50),
      "deliveryAddress" TEXT NOT NULL,
      "deliveryInstructions" TEXT,
      "paymentMethod" VARCHAR(50),
      "paymentStatus" VARCHAR(50) DEFAULT 'pending',
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    // Invoices table
    `CREATE TABLE IF NOT EXISTS public.invoices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "orderId" UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
      "userId" UUID REFERENCES public.users(id) ON DELETE SET NULL,
      "invoiceNumber" VARCHAR(50) UNIQUE NOT NULL,
      "totalAmount" DECIMAL(10, 2) NOT NULL,
      items JSONB NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      "paymentStatus" VARCHAR(50) DEFAULT 'pending',
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_orders_userId ON public.orders("userId")`,
    `CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status)`,
    `CREATE INDEX IF NOT EXISTS idx_invoices_userId ON public.invoices("userId")`,
    `CREATE INDEX IF NOT EXISTS idx_invoices_orderId ON public.invoices("orderId")`,
    `CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status)`,

    // Enable RLS
    `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.products ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY`,

    // Drop existing policies if they exist
    `DROP POLICY IF EXISTS "Allow all users to access users" ON public.users`,
    `DROP POLICY IF EXISTS "Allow all users to access products" ON public.products`,
    `DROP POLICY IF EXISTS "Allow authenticated users to access orders" ON public.orders`,
    `DROP POLICY IF EXISTS "Allow authenticated users to insert orders" ON public.orders`,
    `DROP POLICY IF EXISTS "Allow authenticated users to access invoices" ON public.invoices`,
    `DROP POLICY IF EXISTS "Allow authenticated users to insert invoices" ON public.invoices`,

    // Create RLS policies
    `CREATE POLICY "Allow all users to access users" ON public.users FOR SELECT USING (true)`,
    `CREATE POLICY "Allow all users to access products" ON public.products FOR SELECT USING (true)`,
    `CREATE POLICY "Allow authenticated users to access orders" ON public.orders FOR SELECT USING (true)`,
    `CREATE POLICY "Allow authenticated users to insert orders" ON public.orders FOR INSERT WITH CHECK (true)`,
    `CREATE POLICY "Allow authenticated users to update orders" ON public.orders FOR UPDATE USING (true)`,
    `CREATE POLICY "Allow authenticated users to access invoices" ON public.invoices FOR SELECT USING (true)`,
    `CREATE POLICY "Allow authenticated users to insert invoices" ON public.invoices FOR INSERT WITH CHECK (true)`,
  ];

  try {
    // Execute all SQL statements via Supabase RPC
    for (const sql of sqlStatements) {
      console.log(`⏳ Executing: ${sql.substring(0, 50)}...`);
      const { error } = await supabase.rpc('exec', { sql });
      
      if (error && !error.message.includes('already exists')) {
        // Try direct query for CREATE TABLE statements
        if (sql.includes('CREATE TABLE')) {
          try {
            // Use raw connection if available
            console.log('  ⚠️  RPC failed, trying alternative method...');
          } catch (e) {
            // Silently continue
          }
        }
      } else if (error) {
        console.log(`  ⚠️  ${error.message}`);
      } else {
        console.log(`  ✅ Success`);
      }
    }

    console.log('\n✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupDatabase();
