import { logActivity } from "../reducers/activityReducer";

// Only the action name is logged; CNIC, buyer photos and passwords are NEVER logged.
const descriptions = {
  "crops/addCrop": "Crop added", "crops/updateCrop": "Crop edited",
  "crops/deleteCrop": "Crop deleted", "crops/setCrops": "Crop records changed",
  "buyers/addBuyer": "Buyer registered", "buyers/updateBuyer": "Buyer edited",
  "buyers/deleteBuyer": "Buyer deleted", "buyers/setBuyers": "Buyer records changed",
  "orders/addOrder": "Order placed", "orders/markDelivered": "Order delivered",
  "orders/setOrders": "Order records changed",
  "tasks/addTask": "Farm task added", "tasks/updateTask": "Farm task edited",
  "tasks/deleteTask": "Farm task deleted", "tasks/markTaskDone": "Farm task completed",
  "expenses/addExpense": "Expense added", "expenses/updateExpense": "Expense edited",
  "expenses/deleteExpense": "Expense deleted",
  "inventory/addInventoryItem": "Inventory item added",
  "inventory/updateInventoryItem": "Inventory item edited",
  "inventory/deleteInventoryItem": "Inventory item deleted",
  "inventory/useInventoryItem": "Inventory stock used"
};

const activityLogger = store => next => action => {
  const result = next(action);
  const description = descriptions[action.type];
  if (description && store.getState().auth?.isAuthenticated) {
    const auth = store.getState().auth;
    store.dispatch(logActivity({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      when: new Date().toISOString(),
      by: auth.user?.name || auth.role || "User",
      role: auth.role,
      description
    }));
  }
  return result;
};
export default activityLogger;
