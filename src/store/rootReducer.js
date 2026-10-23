import { combineReducers } from "@reduxjs/toolkit";

import uiReducer from "./reducers/uiReducer";
import authReducer from "./reducers/authReducer";
import cropsReducer from "./reducers/cropsReducer";
import buyersReducer from "./reducers/buyersReducer";
import ordersReducer from "./reducers/ordersReducer";
import tasksReducer from "./reducers/tasksReducer";
import expensesReducer from "./reducers/expensesReducer";
import inventoryReducer from "./reducers/inventoryReducer";
import activityReducer from "./reducers/activityReducer";
import weatherReducer from "./reducers/weatherReducer";
const rootReducer = combineReducers({
  ui: uiReducer,
  auth: authReducer,
  crops: cropsReducer,
  buyers: buyersReducer,
  orders: ordersReducer,
  tasks: tasksReducer,
  expenses: expensesReducer,
  inventory: inventoryReducer,
  activity: activityReducer,
  weather: weatherReducer
});

export default rootReducer;