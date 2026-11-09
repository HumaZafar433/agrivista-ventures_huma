
import { createSlice } from "@reduxjs/toolkit";

const loadSession = () => {
  try {
    const saved = localStorage.getItem("agri_session");

    if (saved) {
      const session = JSON.parse(saved);

      if (
        session.user &&
        session.token &&
        ["Admin", "Manager"].includes(session.role)
      ) {
        return {
          user: session.user,
          role: session.role,
          token: session.token,
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
    token: null,
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
      state.token = action.payload.token;
      state.isAuthenticated = true;

      localStorage.setItem(
        "agri_session",
        JSON.stringify({
          user: state.user,
          role: state.role,
          token: state.token
        })
      );
    },

    logout: (state) => {
      state.user = null;
      state.role = null;
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem("agri_session");
    }
  }
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
