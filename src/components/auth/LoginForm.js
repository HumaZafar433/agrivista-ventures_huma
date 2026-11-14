import { useState } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWheatAwn,
  faEye,
  faEyeSlash,
  faArrowRight,
  faCheck
} from "@fortawesome/free-solid-svg-icons";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import { loginSuccess } from "../../store/reducers/authReducer";

const forest = "#185b35";
const deepForest = "#123a29";

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    minHeight: 56,
    borderRadius: "12px",
    backgroundColor: "#fbfcfa",
    transition: "background-color .2s ease, box-shadow .2s ease",
    "& fieldset": { borderColor: "#dfe6de" },
    "&:hover fieldset": { borderColor: "#9db5a3" },
    "&.Mui-focused": {
      backgroundColor: "#ffffff",
      boxShadow: "0 0 0 4px rgba(35,111,67,0.09)"
    },
    "&.Mui-focused fieldset": { borderColor: forest, borderWidth: 1.5 }
  },
  "& input": { fontSize: "0.95rem", color: "#193729" },
  "& input::placeholder": { color: "#82928a", opacity: 1 }
};

function LoginForm() {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      });

      const result = await response.json();

      if (!response.ok || !result.succeeded) {
        setError(result.message || "Could not sign in. Please check your details.");
        return;
      }

      const user = result.user;
      const role = user.role?.toLowerCase() === "admin" ? "Admin" : "Manager";

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
    } catch (loginError) {
      console.error("Login error:", loginError);
      setError("Unable to connect to the server. Please check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: { xs: 3, md: 6 },
        px: { xs: 1, sm: 2 },
        backgroundColor: "#f5f8f4",
        backgroundImage:
          "radial-gradient(circle at 6% 14%, rgba(126,176,123,.12), transparent 34%), radial-gradient(circle at 95% 93%, rgba(190,209,172,.18), transparent 40%)"
      }}
    >
      <Container maxWidth="lg" sx={{ maxWidth: "1050px !important" }}>
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            overflow: "hidden",
            borderRadius: { xs: "20px", md: "24px" },
            border: "1px solid #e5ebe3",
            boxShadow: "0 28px 85px rgba(20,54,33,.11), 0 2px 8px rgba(20,54,33,.025)",
            minHeight: { md: 580 }
          }}
        >
          {/* Branding panel */}
          <Box
            sx={{
              width: { xs: "100%", md: "45%" },
              position: "relative",
              isolation: "isolate",
              overflow: "hidden",
              background:
                "radial-gradient(circle at 95% 10%, rgba(94,165,105,.28), transparent 50%), linear-gradient(145deg, #123d29 0%, #195e36 100%)",
              color: "white",
              px: { xs: 3.5, sm: 5, md: 6 },
              py: { xs: 4, md: 5.5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: { xs: 5, md: 7 },
              "&::after": {
                content: '""',
                position: "absolute",
                width: 360,
                height: 360,
                border: "1px solid rgba(255,255,255,.13)",
                borderRadius: "50%",
                right: -195,
                bottom: -195,
                boxShadow: "0 0 0 58px rgba(255,255,255,.025), 0 0 0 118px rgba(255,255,255,.018)",
                pointerEvents: "none",
                zIndex: -1
              }
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "13px",
                  backgroundColor: "rgba(255,255,255,.14)",
                  border: "1px solid rgba(255,255,255,.19)"
                }}
              >
                <FontAwesomeIcon icon={faWheatAwn} style={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: "1.24rem", letterSpacing: "-.025em", lineHeight: 1.2 }}>
                  AgriVista Ventures
                </Typography>
                <Typography sx={{ fontSize: ".75rem", color: "#cee2d1", letterSpacing: ".075em", mt: .25 }}>
                  FARM MANAGEMENT SYSTEM
                </Typography>
              </Box>
            </Stack>

            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "2rem", sm: "2.35rem", md: "2.7rem" },
                  fontWeight: 800,
                  letterSpacing: "-.055em",
                  lineHeight: 1.12,
                  maxWidth: 340
                }}
              >
                Smarter farming.
                <Box component="span" sx={{ display: "block", color: "#c2e5a2" }}>
                  Better management.
                </Box>
              </Typography>
              <Typography
                sx={{
                  fontSize: ".98rem",
                  color: "#d4e7d8",
                  lineHeight: 1.8,
                  maxWidth: 325,
                  mt: 2.25
                }}
              >
                Everything you need to manage farm operations, all in one organized place.
              </Typography>
            </Box>

            <Stack spacing={1.45}>
              {[
                "Crops and harvest planning",
                "Team and daily operations",
                "Inventory and expenses"
              ].map((item) => (
                <Stack direction="row" alignItems="center" spacing={1.45} key={item}>
                  <Box
                    sx={{
                      width: 23,
                      height: 23,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "50%",
                      backgroundColor: "rgba(203,236,188,.17)",
                      color: "#cce8c0",
                      flexShrink: 0
                    }}
                  >
                    <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10 }} />
                  </Box>
                  <Typography sx={{ fontSize: ".88rem", color: "#ecf5ed" }}>{item}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* Login panel */}
          <Box
            sx={{
              width: { xs: "100%", md: "55%" },
              bgcolor: "#fff",
              px: { xs: 3, sm: 6, md: 7 },
              py: { xs: 5, sm: 6, md: 7 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            <Box sx={{ maxWidth: 425, width: "100%", mx: "auto" }}>
              <Typography
                sx={{
                  display: "inline-block",
                  color: forest,
                  bgcolor: "#eff7f0",
                  border: "1px solid #dcebdd",
                  px: 1.6,
                  py: .7,
                  borderRadius: 99,
                  fontSize: ".73rem",
                  letterSpacing: ".07em",
                  fontWeight: 800,
                  mb: 2.6
                }}
              >
                SECURE SIGN IN
              </Typography>
              <Typography
                component="h1"
                sx={{
                  color: deepForest,
                  fontSize: { xs: "2rem", sm: "2.35rem" },
                  fontWeight: 800,
                  letterSpacing: "-.05em",
                  lineHeight: 1.16
                }}
              >
                Welcome back
              </Typography>
              <Typography sx={{ color: "#77867d", fontSize: ".96rem", mt: 1.3, mb: 4 }}>
                Sign in to your AgriVista dashboard.
              </Typography>

              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError("")}
                  sx={{ mb: 2.5, borderRadius: "11px" }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleLogin} noValidate>
                <Stack spacing={2.6}>
                  <Box>
                    <Typography
                      component="label"
                      htmlFor="agrivista-username"
                      sx={{ display: "block", fontWeight: 700, color: "#294334", fontSize: ".84rem", mb: 1 }}
                    >
                      Username
                    </Typography>
                    <TextField
                      id="agrivista-username"
                      placeholder="Enter your username"
                      variant="outlined"
                      fullWidth
                      required
                      autoComplete="username"
                      autoFocus
                      value={username}
                      onChange={(event) => { setUsername(event.target.value); if (error) setError(""); }}
                      sx={inputStyles}
                    />
                  </Box>

                  <Box>
                    <Typography
                      component="label"
                      htmlFor="agrivista-password"
                      sx={{ display: "block", fontWeight: 700, color: "#294334", fontSize: ".84rem", mb: 1 }}
                    >
                      Password
                    </Typography>
                    <TextField
                      id="agrivista-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      variant="outlined"
                      fullWidth
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => { setPassword(event.target.value); if (error) setError(""); }}
                      sx={inputStyles}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              type="button"
                              onClick={() => setShowPassword((shown) => !shown)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                              edge="end"
                              sx={{ color: "#789282" }}
                            >
                              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} style={{ fontSize: 17 }} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading || !username.trim() || !password}
                    endIcon={!loading && <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 13 }} />}
                    sx={{
                      mt: ".6rem !important",
                      py: 1.75,
                      borderRadius: "12px",
                      textTransform: "none",
                      letterSpacing: ".01em",
                      fontWeight: 800,
                      fontSize: "1rem",
                      backgroundColor: forest,
                      boxShadow: "0 8px 18px rgba(24,91,53,.17)",
                      "&:hover": { backgroundColor: deepForest, boxShadow: "0 10px 22px rgba(24,91,53,.2)" },
                      "&.Mui-disabled": { backgroundColor: "#acc6b2", color: "white" }
                    }}
                  >
                    {loading ? <CircularProgress size={21} sx={{ color: "white" }} /> : "Sign In"}
                  </Button>
                </Stack>
              </Box>

              <Box sx={{ borderTop: "1px solid #edf1eb", mt: 5, pt: 2.3 }}>
                <Typography sx={{ fontSize: ".78rem", color: "#829188", textAlign: "center", lineHeight: 1.6 }}>
                  Access to this system is managed by your administrator.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
        <Typography sx={{ textAlign: "center", mt: 3, color: "#94a398", fontSize: ".77rem" }}>
          © 2026 AgriVista Ventures · Farm Management System
        </Typography>
      </Container>
    </Box>
  );
}

export default LoginForm;
