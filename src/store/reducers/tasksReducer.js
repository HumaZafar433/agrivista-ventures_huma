import { createSlice } from "@reduxjs/toolkit";

const loadTasks = () => {
  try {
    const saved = localStorage.getItem("agri_tasks");

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error loading tasks:", error);
  }

  return [];
};

const tasksSlice = createSlice({
  name: "tasks",

  initialState: loadTasks(),

  reducers: {
    addTask: (state, action) => {
      state.push(action.payload);
    },

    updateTask: (state, action) => {
      const index = state.findIndex(
        (task) => task.id === action.payload.id
      );

      if (index !== -1) {
        state[index] = {
          ...state[index],
          ...action.payload
        };
      }
    },

    deleteTask: (state, action) => {
      return state.filter(
        (task) => task.id !== action.payload
      );
    },

    markTaskDone: (state, action) => {
      const task = state.find(
        (item) => item.id === action.payload
      );

      if (task) {
        task.status = "Done";
      }
    }
  }
});

export const {
  addTask,
  updateTask,
  deleteTask,
  markTaskDone
} = tasksSlice.actions;

export default tasksSlice.reducer;