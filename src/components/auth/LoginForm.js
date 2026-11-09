import { useState } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWheatAwn } from "@fortawesome/free-solid-svg-icons";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert
} from "@mui/material";

import { loginSuccess } from "../../store/reducers/authReducer";

function LoginForm() {
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  

const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/users/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password
        })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.succeeded) {
      setError(
  `HTTP ${response.status}: ${result.message || "Login failed"}`
);
      return;
    }

    const user = result.user;

    const role =
      user.role?.toLowerCase() === "admin"
        ? "Admin"
        : "Manager";

    dispatch(
      loginSuccess({
        user: {
          id: user.id,
          name: user.fullName || user.username,
          username: user.username
        },
        role,
        token: user.token
      })
    );
  } catch (error) {
  console.error("Login error:", error);
  setError(error.message || "Login failed");
}
};
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f4f8f4",
        display: "flex",
        alignItems: "center",
        py: 5
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row"
            },
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid #e0e8e0",
            boxShadow: "0 15px 45px rgba(0,0,0,0.08)"
          }}
        >

          {/* Branding Section */}

          <Box
            sx={{
              width: { xs: "100%", md: "45%" },
              background:
                "linear-gradient(145deg, #1b5e20, #2e7d32)",
              color: "white",
              p: { xs: 4, md: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            <Box sx={{ mb: 2 }}>
  <FontAwesomeIcon
    icon={faWheatAwn}
    style={{
      fontSize: "48px",
      color: "white"
    }}
  />
</Box>

            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ mb: 2 }}
            >
              AgriVista Ventures
            </Typography>

            <Typography sx={{ opacity: 0.9, lineHeight: 1.8 }}>
              Smart Agriculture Management System
            </Typography>

            <Typography
              variant="body2"
              sx={{ mt: 3, opacity: 0.8 }}
            >
              Manage crops, buyers, orders, farm tasks,
              inventory and expenses in one place.
            </Typography>
          </Box>

          {/* Login Form */}

          <Box
            sx={{
              width: { xs: "100%", md: "55%" },
              p: { xs: 3, md: 5 }
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ color: "#183b29", mb: 1 }}
            >
              Welcome Back
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Sign in to access your farm dashboard.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin}>
              <Stack spacing={3}>

                <TextField
                  label="Username"
                  fullWidth
                  required
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                />

                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  required
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: "#1b5e20",
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: "bold",
                    "&:hover": {
                      backgroundColor: "#12451a"
                    }
                  }}
                >
                  Sign In
                </Button>

              </Stack>
            </Box>

            <Box
              sx={{
                mt: 4,
                p: 2,
                backgroundColor: "#f4f8f4",
                borderRadius: 2
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{ mb: 1 }}
              >
                Demo Login Credentials
              </Typography>

              <Typography variant="body2">
                Admin: admin / Admin@123
              </Typography>

              <Typography variant="body2">
                Manager: manager / Manager@123
              </Typography>
            </Box>

          </Box>

        </Paper>
      </Container>
    </Box>
  );
}

export default LoginForm;