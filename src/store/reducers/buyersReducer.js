import { createSlice } from "@reduxjs/toolkit";

const loadBuyers = () => {
  try {
    const saved = localStorage.getItem("agri_buyers");

    if (saved !== null) {
      const buyers = JSON.parse(saved);

      if (Array.isArray(buyers)) {
        return buyers;
      }
    }
  } catch (error) {
    console.error("Error loading buyers:", error);
  }

  return [];
};

const buyersSlice = createSlice({
  name: "buyers",

  initialState: loadBuyers(),

  reducers: {
    setBuyers: (state, action) => {
      return action.payload;
    },

    addBuyer: (state, action) => {
      const newBuyer = action.payload;

      const alreadyExists = state.some(
        (buyer) => buyer.cnic === newBuyer.cnic
      );

      if (!alreadyExists) {
        state.push(newBuyer);
      }
    },

    updateBuyer: (state, action) => {
      const index = state.findIndex(
        (buyer) => buyer.id === action.payload.id
      );

      if (index !== -1) {
        state[index] = {
          ...state[index],
          ...action.payload
        };
      }
    },

    deleteBuyer: (state, action) => {
      return state.filter(
        (buyer) => buyer.id !== action.payload
      );
    }
  }
});

export const {
  setBuyers,
  addBuyer,
  updateBuyer,
  deleteBuyer
} = buyersSlice.actions;

export default buyersSlice.reducer;