import { createSlice } from "@reduxjs/toolkit";

function loadInventory() {
  try {
    const data = JSON.parse(localStorage.getItem("agri_inventory") || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Inventory loading failed:", error);
    return [];
  }
}

const inventorySlice = createSlice({
  name: "inventory",
  initialState: loadInventory(),
  reducers: {
    addInventoryItem(state, action) {
      state.push(action.payload);
    },
    updateInventoryItem(state, action) {
      const index = state.findIndex(item => item.id === action.payload.id);
      if (index !== -1) state[index] = { ...state[index], ...action.payload };
    },
    deleteInventoryItem(state, action) {
      return state.filter(item => item.id !== action.payload);
    },
    useInventoryItem(state, action) {
      const { id, amount, note, usedAt } = action.payload;
      const item = state.find(x => x.id === id);
      if (!item || !Number.isFinite(amount) || amount <= 0 || amount > Number(item.quantity)) return;
      item.quantity = Math.round((Number(item.quantity) - amount) * 100) / 100;
      item.history = [...(item.history || []), { amount, note, usedAt }];
    }
  }
});

export const { addInventoryItem, updateInventoryItem, deleteInventoryItem, useInventoryItem } = inventorySlice.actions;
export default inventorySlice.reducer;
