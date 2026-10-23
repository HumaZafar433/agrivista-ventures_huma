export const selectFinancialSummary = state => {
  const orders = Array.isArray(state.orders) ? state.orders : [];
  const expenses = Array.isArray(state.expenses) ? state.expenses : [];
  const crops = Array.isArray(state.crops) ? state.crops : [];
  const delivered = orders.filter(o => o.status === "Delivered");
  const validSales = delivered.filter(o => Number.isFinite(Number(o.totalAmount)) && Number(o.totalAmount) > 0);
  const unpricedCount = delivered.length - validSales.length;
  const revenue = validSales.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const expenseTotal = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const byCrop = crops.map(crop => {
    const cropOrders = validSales.filter(o => String(o.cropId) === String(crop.id));
    const cropExpenses = expenses.filter(e => String(e.cropId) === String(crop.id));
    const sales = cropOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const spent = cropExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return { id: crop.id, name: `${crop.name} — ${crop.field}`, sales, spent, net: sales - spent };
  });
  return { revenue, expenses: expenseTotal, net: revenue - expenseTotal, byCrop, unpricedCount };
};

export const selectLowStock = state =>
  (state.inventory || []).filter(item => Number(item.quantity) <= Number(item.minQty));
