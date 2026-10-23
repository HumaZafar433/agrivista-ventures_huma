import { createSlice } from "@reduxjs/toolkit";
import { starterCrops } from "../../data/seedData";

const loadCrops = () => {
  try {
    const saved = localStorage.getItem("agri_crops");

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error loading crops:", error);
  }

  return starterCrops;
};

const cropsSlice = createSlice({
  name: "crops",

  initialState: loadCrops(),

  reducers: {

    setCrops: (state, action) => {
      return action.payload;
    },

    addCrop: (state, action) => {
      state.push(action.payload);
    },

    updateCrop: (state, action) => {
      const index = state.findIndex(
        (crop) => crop.id === action.payload.id
      );

      if (index !== -1) {
        state[index] = {
          ...state[index],
          ...action.payload
        };
      }
    },

    deleteCrop: (state, action) => {
      return state.filter(
        (crop) => crop.id !== action.payload
      );
    }
  }
});

export const {
  setCrops,
  addCrop,
  updateCrop,
  deleteCrop
} = cropsSlice.actions;

export default cropsSlice.reducer;