import { createSlice } from "@reduxjs/toolkit";

const loadSession = () => {
  try {
    const saved = localStorage.getItem("agri_session");

    if (saved) {
      const session = JSON.parse(saved);

      if (
        session.user &&
        ["Admin", "Manager"].includes(session.role)
      ) {
        return {
          user: session.user,
          role: session.role,
          isAuthenticated: true
        };
      }
    }
  } catch (error) {
    console.error("Session loading error:", error);
  }

  return {
    user: null,
    role: null,
    isAuthenticated: false
  };
};

const authSlice = createSlice({
  name: "auth",

  initialState: loadSession(),

  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.isAuthenticated = true;
    },

    logout: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
    }
  }
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;