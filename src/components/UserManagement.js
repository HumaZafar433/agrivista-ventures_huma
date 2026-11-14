import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Alert, Box, Button, CircularProgress, MenuItem,
  Paper, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography
} from "@mui/material";

const API = "http://localhost:5000/api/users";
const emptyForm = { fullName: "", username: "", email: "", password: "", role: "manager" };

export default function UserManagement() {
  const { token, role } = useSelector((state) => state.auth);
  const [form, setForm] = useState(emptyForm);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = useCallback(async () => {
    if (role !== "Admin" || !token) return;
    setFetching(true);
    try {
      const response = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok || !result.succeeded) {
        throw new Error(result.message || "Could not load users");
      }
      setUsers(result.data?.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  }, [role, token]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  if (role !== "Admin") {
    return <Alert severity="error">Only Admin can register new users.</Alert>;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await fetch(`${API}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok || !result.succeeded) {
        throw new Error(result.message || "Registration failed");
      }
      setSuccess(`Account created for ${result.data.username}. They can now sign in.`);
      setForm(emptyForm);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1050, mx: "auto", py: 2 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        User Registration
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Only administrators can create new accounts. New users can log in with their username and password.
      </Typography>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Create New User</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField label="Full name" required fullWidth value={form.fullName}
              inputProps={{ maxLength: 80 }}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <TextField label="Username" required fullWidth value={form.username}
              inputProps={{ maxLength: 40 }}
              onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <TextField label="Email" type="email" required fullWidth value={form.email}
              inputProps={{ maxLength: 120 }}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Password" type="password" required fullWidth value={form.password}
              inputProps={{ minLength: 8 }} helperText="At least 8 characters"
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <TextField label="Role" select fullWidth value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" disabled={loading}
              sx={{ alignSelf: "flex-start", bgcolor: "#1b5e20" }}>
              {loading ? "Creating..." : "Register User"}
            </Button>
          </Stack>
        </Box>
      </Paper>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">Registered Users</Typography>
          <Button size="small" onClick={loadUsers} disabled={fetching}>Refresh</Button>
        </Box>
        {fetching && <Box sx={{ px: 2, pb: 1 }}><CircularProgress size={20} /></Box>}
        <TableContainer>
          <Table size="small">
            <TableHead><TableRow>
              <TableCell>Name</TableCell><TableCell>Username</TableCell>
              <TableCell>Email</TableCell><TableCell>Role</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow><TableCell colSpan={4}>No users to display.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
