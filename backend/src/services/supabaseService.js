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
  getAll: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
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
    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...productData,
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
  orderOps,
  invoiceOps,
  initializeTables
};
