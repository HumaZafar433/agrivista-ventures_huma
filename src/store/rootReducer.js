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

import workersReducer from "../app/redux/reducers/workers";
import attendanceReducer from "../app/redux/reducers/attendance";
import equipmentReducer from "../app/redux/reducers/equipment";
import maintenanceReducer from "../app/redux/reducers/maintenance";

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
  weather: weatherReducer,
  workers: workersReducer,
  attendance: attendanceReducer,
  equipment: equipmentReducer,
  maintenance:  maintenanceReducer
});

export default rootReducer;