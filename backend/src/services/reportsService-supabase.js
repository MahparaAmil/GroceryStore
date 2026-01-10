const { invoiceOps, orderOps, userOps, productOps } = require("./supabaseService");

/**
 * KPI 1: Total Sales in last X days
 */
exports.getTotalSales = async (daysBack = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const allInvoices = await invoiceOps.getAll();
    
    // Filter by date and payment status
    const filtered = allInvoices.filter(inv => {
      const invDate = new Date(inv.createdAt);
      return invDate >= startDate && inv.paymentStatus === 'completed';
    });

    const totalSales = filtered.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    return {
      totalSales: parseFloat(totalSales).toFixed(2),
      invoiceCount: filtered.length,
      period: `Last ${daysBack} days`,
    };
  } catch (error) {
    console.error("Error calculating total sales:", error.message);
    return { totalSales: 0, invoiceCount: 0, period: `Last ${daysBack} days` };
  }
};

/**
 * KPI 2: Average Transaction Value
 */
exports.getAverageTransactionValue = async (daysBack = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const allInvoices = await invoiceOps.getAll();
    
    // Filter by date and payment status
    const filtered = allInvoices.filter(inv => {
      const invDate = new Date(inv.createdAt);
      return invDate >= startDate && inv.paymentStatus === 'completed';
    });

    const avgValue = filtered.length > 0 
      ? filtered.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0) / filtered.length
      : 0;

    return {
      averageTransactionValue: parseFloat(avgValue).toFixed(2),
      period: `Last ${daysBack} days`,
    };
  } catch (error) {
    console.error("Error calculating average transaction value:", error.message);
    return { averageTransactionValue: 0, period: `Last ${daysBack} days` };
  }
};

/**
 * KPI 3: Most Purchased Products
 */
exports.getMostPurchasedProducts = async (limit = 10, daysBack = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const allInvoices = await invoiceOps.getAll();
    
    // Filter by date and payment status
    const filtered = allInvoices.filter(inv => {
      const invDate = new Date(inv.createdAt);
      return invDate >= startDate && inv.paymentStatus === 'completed';
    });

    // Aggregate product purchases
    const productMap = {};
    filtered.forEach(inv => {
      if (inv.items && Array.isArray(inv.items)) {
        inv.items.forEach(item => {
          if (!productMap[item.productId]) {
            productMap[item.productId] = { quantity: 0, revenue: 0 };
          }
          productMap[item.productId].quantity += item.quantity || 1;
          productMap[item.productId].revenue += (item.price || 0) * (item.quantity || 1);
        });
      }
    });

    // Convert to array and sort
    const topProducts = Object.entries(productMap)
      .map(([productId, data]) => ({
        productId: parseInt(productId),
        quantity: data.quantity,
        revenue: parseFloat(data.revenue).toFixed(2),
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);

    return {
      topProducts,
      period: `Last ${daysBack} days`,
    };
  } catch (error) {
    console.error("Error fetching most purchased products:", error.message);
    return { topProducts: [], period: `Last ${daysBack} days` };
  }
};

/**
 * KPI 4: Active Customers
 */
exports.getActiveCustomers = async (daysBack = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const allOrders = await orderOps.getAll();
    const allUsers = await userOps.findAll();

    // Get unique users who made orders in the last X days
    const activeUserIds = new Set();
    allOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= startDate && order.userId) {
        activeUserIds.add(order.userId);
      }
    });

    // Count non-guest users
    const totalCustomers = allUsers.filter(u => !u.isGuest).length;

    return {
      activeCustomers: activeUserIds.size,
      totalCustomers,
      period: `Last ${daysBack} days`,
    };
  } catch (error) {
    console.error("Error calculating active customers:", error.message);
    return { activeCustomers: 0, totalCustomers: 0, period: `Last ${daysBack} days` };
  }
};

/**
 * KPI 5: Low Stock Products
 */
exports.getLowStockProducts = async (threshold = 10) => {
  try {
    const allProducts = await productOps.getAll();
    
    const lowStockProducts = allProducts
      .filter(p => p.quantityInStock <= threshold)
      .map(p => ({
        id: p.id,
        name: p.name,
        quantity: p.quantityInStock,
        threshold,
      }));

    return {
      lowStockProducts,
      threshold,
      count: lowStockProducts.length,
    };
  } catch (error) {
    console.error("Error fetching low stock products:", error.message);
    return { lowStockProducts: [], threshold, count: 0 };
  }
};

/**
 * KPI 6: Revenue By Category
 */
exports.getRevenueByCategory = async (daysBack = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const allInvoices = await invoiceOps.getAll();
    const allProducts = await productOps.getAll();

    // Create product map for lookup
    const productMap = {};
    allProducts.forEach(p => {
      productMap[p.id] = p;
    });

    // Filter and aggregate by category
    const categoryMap = {};
    allInvoices.forEach(inv => {
      const invDate = new Date(inv.createdAt);
      if (invDate >= startDate && inv.paymentStatus === 'completed' && inv.items) {
        inv.items.forEach(item => {
          const product = productMap[item.productId];
          const category = product?.category || 'Uncategorized';
          
          if (!categoryMap[category]) {
            categoryMap[category] = { revenue: 0, count: 0 };
          }
          categoryMap[category].revenue += (item.price || 0) * (item.quantity || 1);
          categoryMap[category].count += item.quantity || 1;
        });
      }
    });

    // Convert to array
    const revenueByCategory = Object.entries(categoryMap)
      .map(([category, data]) => ({
        category,
        revenue: parseFloat(data.revenue).toFixed(2),
        itemsCount: data.count,
      }))
      .sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue));

    return {
      revenueByCategory,
      period: `Last ${daysBack} days`,
    };
  } catch (error) {
    console.error("Error calculating revenue by category:", error.message);
    return { revenueByCategory: [], period: `Last ${daysBack} days` };
  }
};

/**
 * Aggregate all KPIs
 */
exports.getAllKPIs = async (daysBack = 30) => {
  const [
    totalSales,
    avgTransaction,
    topProducts,
    activeCustomers,
    lowStock,
    revenueByCategory
  ] = await Promise.all([
    exports.getTotalSales(daysBack),
    exports.getAverageTransactionValue(daysBack),
    exports.getMostPurchasedProducts(10, daysBack),
    exports.getActiveCustomers(daysBack),
    exports.getLowStockProducts(10),
    exports.getRevenueByCategory(daysBack),
  ]);

  return {
    summary: {
      totalSales: totalSales.totalSales,
      invoiceCount: totalSales.invoiceCount,
      averageTransactionValue: avgTransaction.averageTransactionValue,
      activeCustomers: activeCustomers.activeCustomers,
      totalCustomers: activeCustomers.totalCustomers,
    },
    details: {
      totalSales,
      avgTransaction,
      topProducts,
      activeCustomers,
      lowStock,
      revenueByCategory,
    },
    period: `Last ${daysBack} days`,
    generatedAt: new Date().toISOString(),
  };
};
