import {
  REQUEST,
  SUCCESS,
  FAILURE,
  MAINTENANCE_REQUEST as T
} from "../utilities";

import {
  getMaintenance,
  createService,
  updateService,
  removeService
} from "../../api/maintenance";

import { GETEQUIPMENT } from "../equipment";

import {
  addExpense,
  updateExpense,
  deleteExpense
} from "../../../../store/reducers/expensesReducer";


// Create a fixed expense ID for each service
const getExpenseId = (serviceId) =>
  `maintenance-${serviceId}`;


// Keep maintenance costs linked with Expenses
const syncMaintenanceExpense = (
  dispatch,
  getState,
  service,
  isDeleted = false
) => {

  const expenses = getState().expenses || [];

  const existingExpense = expenses.find(
    (expense) =>
      String(expense.id) === getExpenseId(service.id) ||
      (
        expense.sourceType === "maintenance" &&
        String(expense.sourceId) === String(service.id)
      )
  );

  const amount = Number(service.cost || 0);

  // Remove expense if service is deleted or costs zero
  if (isDeleted || amount <= 0) {
    if (existingExpense) {
      dispatch(deleteExpense(existingExpense.id));
    }
    return;
  }

  const expenseData = {
    ...existingExpense,

    id: existingExpense?.id || getExpenseId(service.id),

    cropId: existingExpense?.cropId || "",

    category: "Other",

    amount,

    date: service.date,

    note: `Equipment Repair: ${service.description} - ${service.performedBy}`,

    sourceType: "maintenance",

    sourceId: String(service.id)
  };

  // Avoid duplicate expenses
  if (existingExpense) {

    const unchanged =
      Number(existingExpense.amount) === expenseData.amount &&
      existingExpense.date === expenseData.date &&
      existingExpense.note === expenseData.note &&
      existingExpense.category === expenseData.category;

    if (!unchanged) {
      dispatch(updateExpense(expenseData));
    }

  } else {

    dispatch(addExpense(expenseData));

  }
};


// Common Redux action handler
const perform = (
  requestType,
  successType,
  failureType,
  apiCall,
  operation,
  onSuccess,
  onFailure
) => async (dispatch, getState) => {

  dispatch(REQUEST(requestType));

  try {

    const response = await apiCall();

    if (!response.data.succeeded) {

      dispatch(
        FAILURE(
          failureType,
          response.data.message
        )
      );

      if (onFailure) {
        onFailure(response.data.message);
      }

      return false;
    }

    const result = response.data.data;

    dispatch(SUCCESS(successType, result));

    // Load and synchronize existing services
    if (operation === "load") {
      result.forEach((service) => {
        syncMaintenanceExpense(
          dispatch,
          getState,
          service
        );
      });
    }

    // Add or update the linked expense
    if (operation === "save") {
      syncMaintenanceExpense(
        dispatch,
        getState,
        result
      );
    }

    // Delete expense when service is removed
    if (operation === "delete") {
      syncMaintenanceExpense(
        dispatch,
        getState,
        result,
        true
      );
    }

    // Update equipment service dates
    if (operation !== "load") {
      await dispatch(GETEQUIPMENT());
    }

    if (onSuccess) {
      onSuccess();
    }

    return true;

  } catch (error) {

    dispatch(
      FAILURE(failureType, error.message)
    );

    if (onFailure) {
      onFailure(error.message);
    }

    return false;
  }
};


// Get all maintenance records
export const GETMAINTENANCE = () =>
  perform(
    T.GET_MAINTENANCE_REQUEST,
    T.GET_MAINTENANCE_SUCCESS,
    T.GET_MAINTENANCE_FAILURE,
    getMaintenance,
    "load"
  );


// Add maintenance
export const ADDSERVICE = (
  data,
  onSuccess,
  onFailure
) =>
  perform(
    T.ADD_SERVICE_REQUEST,
    T.ADD_SERVICE_SUCCESS,
    T.ADD_SERVICE_FAILURE,
    () => createService(data),
    "save",
    onSuccess,
    onFailure
  );


// Update maintenance
export const UPDATESERVICE = (
  data,
  onSuccess,
  onFailure
) =>
  perform(
    T.UPDATE_SERVICE_REQUEST,
    T.UPDATE_SERVICE_SUCCESS,
    T.UPDATE_SERVICE_FAILURE,
    () => updateService(data),
    "save",
    onSuccess,
    onFailure
  );


// Delete maintenance
export const REMOVESERVICE = (
  id,
  onSuccess,
  onFailure
) =>
  perform(
    T.REMOVE_SERVICE_REQUEST,
    T.REMOVE_SERVICE_SUCCESS,
    T.REMOVE_SERVICE_FAILURE,
    () => removeService(id),
    "delete",
    onSuccess,
    onFailure
  );