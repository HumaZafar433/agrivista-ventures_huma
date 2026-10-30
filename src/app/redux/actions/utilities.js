export const REQUEST = (type) => ({
  type
});

export const SUCCESS = (type, payload) => ({
  type,
  payload
});

export const FAILURE = (type, payload) => ({
  type,
  payload
});

export const WORKER_REQUEST = {
  GET_WORKERS_REQUEST: "workers/get_request",
  GET_WORKERS_SUCCESS: "workers/get_success",
  GET_WORKERS_FAILURE: "workers/get_failure",

  ADD_WORKER_REQUEST: "workers/add_request",
  ADD_WORKER_SUCCESS: "workers/add_success",
  ADD_WORKER_FAILURE: "workers/add_failure",

  UPDATE_WORKER_REQUEST: "workers/update_request",
  UPDATE_WORKER_SUCCESS: "workers/update_success",
  UPDATE_WORKER_FAILURE: "workers/update_failure",

  REMOVE_WORKER_REQUEST: "workers/remove_request",
  REMOVE_WORKER_SUCCESS: "workers/remove_success",
  REMOVE_WORKER_FAILURE: "workers/remove_failure"
};
export const ATTENDANCE_REQUEST = {
  GET_ATTENDANCE_REQUEST: "attendance/get_request",
  GET_ATTENDANCE_SUCCESS: "attendance/get_success",
  GET_ATTENDANCE_FAILURE: "attendance/get_failure",

  MARK_ATTENDANCE_REQUEST: "attendance/mark_request",
  MARK_ATTENDANCE_SUCCESS: "attendance/mark_success",
  MARK_ATTENDANCE_FAILURE: "attendance/mark_failure",

  UPDATE_ATTENDANCE_REQUEST: "attendance/update_request",
  UPDATE_ATTENDANCE_SUCCESS: "attendance/update_success",
  UPDATE_ATTENDANCE_FAILURE: "attendance/update_failure",

  REMOVE_ATTENDANCE_REQUEST: "attendance/remove_request",
  REMOVE_ATTENDANCE_SUCCESS: "attendance/remove_success",
  REMOVE_ATTENDANCE_FAILURE: "attendance/remove_failure"
};
export const EQUIPMENT_REQUEST = {
  GET_EQUIPMENT_REQUEST: "equipment/get_request",
  GET_EQUIPMENT_SUCCESS: "equipment/get_success",
  GET_EQUIPMENT_FAILURE: "equipment/get_failure",

  ADD_EQUIPMENT_REQUEST: "equipment/add_request",
  ADD_EQUIPMENT_SUCCESS: "equipment/add_success",
  ADD_EQUIPMENT_FAILURE: "equipment/add_failure",

  UPDATE_EQUIPMENT_REQUEST: "equipment/update_request",
  UPDATE_EQUIPMENT_SUCCESS: "equipment/update_success",
  UPDATE_EQUIPMENT_FAILURE: "equipment/update_failure",

  REMOVE_EQUIPMENT_REQUEST: "equipment/remove_request",
  REMOVE_EQUIPMENT_SUCCESS: "equipment/remove_success",
  REMOVE_EQUIPMENT_FAILURE: "equipment/remove_failure"
};

export const MAINTENANCE_REQUEST = {
  GET_MAINTENANCE_REQUEST: "maintenance/get_request",
  GET_MAINTENANCE_SUCCESS: "maintenance/get_success",
  GET_MAINTENANCE_FAILURE: "maintenance/get_failure",

  ADD_SERVICE_REQUEST: "maintenance/add_request",
  ADD_SERVICE_SUCCESS: "maintenance/add_success",
  ADD_SERVICE_FAILURE: "maintenance/add_failure",

  UPDATE_SERVICE_REQUEST: "maintenance/update_request",
  UPDATE_SERVICE_SUCCESS: "maintenance/update_success",
  UPDATE_SERVICE_FAILURE: "maintenance/update_failure",

  REMOVE_SERVICE_REQUEST: "maintenance/remove_request",
  REMOVE_SERVICE_SUCCESS: "maintenance/remove_success",
  REMOVE_SERVICE_FAILURE: "maintenance/remove_failure"
};