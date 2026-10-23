import { createSlice } from "@reduxjs/toolkit";

const loadOrders = () => {
  try {
    const saved =
      localStorage.getItem("agri_orders") ??
      localStorage.getItem("agricultureOrders");

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error loading orders:", error);
  }

  return [];
};

const ordersSlice = createSlice({
  name: "orders",

  initialState: loadOrders(),

  reducers: {
    addOrder: (state, action) => {
      state.push(action.payload);
    },

    markDelivered: (state, action) => {
      const order = state.find(
        (item) => item.id === action.payload
      );

      if (order && order.status === "Pending") {
        order.status = "Delivered";
      }
    },

    setOrders: (state, action) => {
      return action.payload;
    }
  }
});

export const {
  addOrder,
  markDelivered,
  setOrders
} = ordersSlice.actions;

export default ordersSlice.reducer;