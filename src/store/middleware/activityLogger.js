import { logActivity } from "../reducers/activityReducer";


const descriptions = {
  "crops/addCrop": "Crop added",
  "crops/updateCrop": "Crop edited",
  "crops/deleteCrop": "Crop deleted",
  "crops/setCrops": "Crop records changed",

  "buyers/addBuyer": "Buyer registered",
  "buyers/updateBuyer": "Buyer edited",
  "buyers/deleteBuyer": "Buyer deleted",
  "buyers/setBuyers": "Buyer records changed",

  "orders/addOrder": "Order placed",
  "orders/markDelivered": "Order delivered",
  "orders/setOrders": "Order records changed",

  "tasks/addTask": "Farm task added",
  "tasks/updateTask": "Farm task edited",
  "tasks/deleteTask": "Farm task deleted",
  "tasks/markTaskDone": "Farm task completed",

  "expenses/addExpense": "Expense added",
  "expenses/updateExpense": "Expense edited",
  "expenses/deleteExpense": "Expense deleted",

  "inventory/addInventoryItem": "Inventory item added",
  "inventory/updateInventoryItem": "Inventory item edited",
  "inventory/deleteInventoryItem": "Inventory item deleted",
  "inventory/useInventoryItem": "Inventory stock used",

  "workers/add_success": "New worker registered",
  "workers/update_success": "Worker details updated",
  "workers/remove_success": "Worker deleted",

  "attendance/mark_success": "Worker attendance marked",
  "attendance/update_success": "Attendance record updated",
  "attendance/remove_success": "Attendance record deleted",

  "equipment/add_success": "New farm equipment registered",
  "equipment/update_success": "Equipment details updated",
  "equipment/remove_success": "Equipment deleted",

  "maintenance/add_success": "Equipment maintenance recorded",
  "maintenance/update_success": "Maintenance record updated",
  "maintenance/remove_success": "Maintenance record deleted"

};


const activityLogger = (store) => (next) => (action) => {

  const result = next(action);

  const description = descriptions[action.type];

  const auth = store.getState().auth;

  if (
    description &&
    auth?.isAuthenticated
  ) {

    store.dispatch(
      logActivity({

        id:
          `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,

        when: new Date().toISOString(),

        by:
          auth.user?.name ||
          auth.role ||
          "User",

        role: auth.role,

        description

      })
    );

  }

  return result;
};

export default activityLogger;