import { combineReducers } from "@reduxjs/toolkit";

import uiReducer from "../../../store/reducers/uiReducer";
import authReducer from "../../../store/reducers/authReducer";
import cropsReducer from "./crops";
import buyersReducer from "./buyers";
import ordersReducer from "./orders";
import tasksReducer from "../../../store/reducers/tasksReducer";
import expensesReducer from "../../../store/reducers/expensesReducer";
import inventoryReducer from "../../../store/reducers/inventoryReducer";
import activityReducer from "../../../store/reducers/activityReducer";

import weatherReducer from "./weather";
import workersReducer from "./workers";
import attendanceReducer from "./attendance";
import equipmentReducer from "./equipment";
import maintenanceReducer from "./maintenance";

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
  maintenance: maintenanceReducer
});

export default rootReducer;


