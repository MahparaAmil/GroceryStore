const { invoiceOps, userOps, supabase } = require("../services/supabaseService");

/**
 * GET /admin/dashboard/summary
 * Get dashboard summary stats
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalOrders = await invoiceOps.countTotal();
    
    // Get unique users count
    const { data: uniqueUsers, error: userError } = await supabase
      .from('invoices')
      .select('userId', { count: 'exact' })
      .not('userId', 'is', null);
    
    const totalUsersWithOrders = uniqueUsers ? new Set(uniqueUsers.map(u => u.userId)).size : 0;

    res.json({
      totalOrders,
      totalInvoices: totalOrders,
      totalUsersWithOrders,
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching dashboard summary", 
      error: error.message 
    });
  }
};

/**
 * GET /admin/dashboard/orders
 * Get all orders with user details and payment status
 */
exports.getDashboardOrders = async (req, res) => {
  try {
    const invoices = await invoiceOps.getAll();
    
    // Enrich with user data
    const enrichedInvoices = await Promise.all(
      invoices.map(async (invoice) => {
        let user = null;
        if (invoice.userId) {
          try {
            user = await userOps.findById(invoice.userId);
          } catch (error) {
            console.log('User not found for invoice');
          }
        }
        return {
          ...invoice,
          user: user ? { id: user.id, email: user.email, isGuest: user.isGuest } : null,
        };
      })
    );

    res.json(enrichedInvoices);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching dashboard orders",
      error: error.message
    });
  }
};

