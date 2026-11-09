
import { createSlice } from "@reduxjs/toolkit";

const expensesSlice = createSlice({
  name: "expenses",

  initialState: [],

  reducers: {
    setExpensesFromDatabase: (state, action) => {
      return Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    addExpense: (state, action) => {
      const exists = state.some(
        (expense) =>
          String(expense.id) === String(action.payload.id)
      );

      if (!exists) {
        state.push(action.payload);
      }
    },

    updateExpense: (state, action) => {
      const index = state.findIndex(
        (expense) =>
          String(expense.id) === String(action.payload.id)
      );

      if (index !== -1) {
        state[index] = {
          ...state[index],
          ...action.payload
        };
      }
    },

    deleteExpense: (state, action) => {
      return state.filter(
        (expense) =>
          String(expense.id) !== String(action.payload)
      );
    }
  }
});

export const {
  setExpensesFromDatabase,
  addExpense,
  updateExpense,
  deleteExpense
} = expensesSlice.actions;

export default expensesSlice.reducer;
