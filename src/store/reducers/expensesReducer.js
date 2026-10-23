import { createSlice } from "@reduxjs/toolkit";

const loadExpenses = () => {
  try {
    const saved = localStorage.getItem("agri_expenses");

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error loading expenses:", error);
  }

  return [];
};

const expensesSlice = createSlice({
  name: "expenses",

  initialState: loadExpenses(),

  reducers: {

    addExpense: (state, action) => {
      state.push(action.payload);
    },

    updateExpense: (state, action) => {
      const index = state.findIndex(
        (expense) => expense.id === action.payload.id
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
        (expense) => expense.id !== action.payload
      );
    }
  }
});

export const {
  addExpense,
  updateExpense,
  deleteExpense
} = expensesSlice.actions;

export default expensesSlice.reducer;