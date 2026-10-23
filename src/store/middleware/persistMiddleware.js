const persistMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  try {
    const state = store.getState();

    // Login Session
    if (state.auth.isAuthenticated) {
      localStorage.setItem(
        "agri_session",
        JSON.stringify({
          user: state.auth.user,
          role: state.auth.role
        })
      );
    } else {
      localStorage.removeItem("agri_session");
    }

    // Crops
    if (action.type.startsWith("crops/")) {
      localStorage.setItem(
        "agri_crops",
        JSON.stringify(state.crops)
      );
    }

    // Buyers
    if (action.type.startsWith("buyers/")) {
      localStorage.setItem(
        "agri_buyers",
        JSON.stringify(state.buyers)
      );
    }

    // Orders
    if (action.type.startsWith("orders/")) {
      localStorage.setItem(
        "agri_orders",
        JSON.stringify(state.orders)
      );
    }

    // Farm Tasks
    if (action.type.startsWith("tasks/")) {
      localStorage.setItem(
        "agri_tasks",
        JSON.stringify(state.tasks)
      );
    }

    // Expenses
    if (action.type.startsWith("expenses/")) {
      localStorage.setItem(
        "agri_expenses",
        JSON.stringify(state.expenses)
      );
    }

  } catch (error) {
    console.error("Error saving data:", error);
  }
if (action.type.startsWith("inventory/")) {
  localStorage.setItem(
    "agri_inventory",
    JSON.stringify(store.getState().inventory)
  );
}
if (action.type.startsWith("activity/")) {
  localStorage.setItem(
    "agri_activity",
    JSON.stringify(store.getState().activity)
  );
}
  return result;
};

export default persistMiddleware;