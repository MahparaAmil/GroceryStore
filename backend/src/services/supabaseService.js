const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize tables
const initializeTables = async () => {
  try {
    // Create users table
    await supabase.rpc('create_users_table').catch(() => {
      // Table might already exist, that's ok
      console.log('ℹ️  Users table already exists or created');
    });
    console.log('✅ Supabase tables initialized');
  } catch (error) {
    console.log('ℹ️  Tables check completed');
  }
};

// Product operations
const productOps = {
  getAll: async ({ page = 1, limit = 50 } = {}) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);
    return { data, count, page, limit };
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  create: async (productData) => {
    const { tags, gallery, ...cleanData } = productData;
    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...cleanData,
        // Store tags/gallery in nutritionalInfo (JSON column) to avoid schema issues
        nutritionalInfo: {
          ...cleanData.nutritionalInfo,
          tags: tags || [],
          gallery: gallery || []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  },

  upsert: async (productData) => {
    const { tags, gallery, ...cleanData } = productData;

    // Prepare data for insertion/update
    const payload = {
      ...cleanData,
      nutritionalInfo: {
        ...cleanData.nutritionalInfo,
        tags: tags || [],
        gallery: gallery || []
      },
      updatedAt: new Date().toISOString()
    };

    // If creating, add createdAt
    if (!payload.id) {
      payload.createdAt = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('products')
      .upsert(payload, { onConflict: 'barcode' }) // Assumes barcode is unique constraint
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
};

// Brand operations
const brandOps = {
  upsert: async (brandData) => {
    // Try to find by name first to avoid duplicates if unique constraint on name isn't strict string
    // Or just use Supabase upsert if 'name' is unique
    const { data, error } = await supabase
      .from('brands')
      .upsert({
        ...brandData,
        updatedAt: new Date().toISOString()
      }, { onConflict: 'name' })
      .select()
      .single();

    if (error) {
      // Graceful fallback if brands table doesn't exist yet (for development resilience)
      if (error.code === '42P01') {
        console.warn("⚠️ 'brands' table does not exist. Skipping brand upsert.");
        return { id: null, ...brandData };
      }
      throw new Error(error.message);
    }
    return data;
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('brands')
      .select('*');

    if (error) return []; // Return empty if error (e.g. missing table)
    return data;
  }
};

// Order operations
const orderOps = {
  create: async (orderData) => {
    const { data, error } = await supabase
      .from('Orders')
      .insert([{
        ...orderData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('Orders')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('Orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('Orders')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('Orders')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('Orders')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }
};

// Invoice operations
const invoiceOps = {
  create: async (invoiceData) => {
    const { data, error } = await supabase
      .from('Invoices')
      .insert([{
        ...invoiceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('Invoices')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('Invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('Invoices')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  countTotal: async () => {
    const { count, error } = await supabase
      .from('Invoices')
      .select('*', { count: 'exact', head: true });

    if (error) throw new Error(error.message);
    return count;
  },

  countByStatus: async (status) => {
    const { count, error } = await supabase
      .from('Invoices')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);

    if (error) throw new Error(error.message);
    return count || 0;
  },

  countTotal: async () => {
    const { count, error } = await supabase
      .from('Invoices')
      .select('*', { count: 'exact', head: true });

    if (error) throw new Error(error.message);
    return count || 0;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('Invoices')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('Invoices')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }
};

// User operations
const userOps = {
  create: async (userData) => {
    const { email, password, role = 'customer', ...rest } = userData;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const { data, error } = await supabase
      .from('users')
      .insert([{
        email,
        password: hashedPassword,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...rest
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  findByEmail: async (email) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  },

  findAll: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) throw new Error(error.message);
    return data;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  },

  verifyPassword: async (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
};

module.exports = {
  supabase,
  userOps,
  productOps,
  brandOps,
  orderOps,
  invoiceOps,
  initializeTables
};
