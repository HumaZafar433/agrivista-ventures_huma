import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AttendanceRegister from "./AttendanceRegister";

import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Chip,
  Alert,
  Divider
} from "@mui/material";

import {
  GETWORKERS,
  ADDWORKER,
  UPDATEWORKER,
  REMOVEWORKER
} from "../app/redux/actions/workers";

const initialForm = {
  fullName: "",
  cnic: "",
  phone: "",
  role: "Farm Hand",
  dailyWage: "",
  joinDate: "",
  status: "Active"
};

const workerRoles = [
  "Farm Hand",
  "Driver",
  "Supervisor",
  "Sprayer"
];

function Workers() {
  const dispatch = useDispatch();

  const {
    workers = [],
    workersLoading,
    addLoading,
    updateLoading,
    workersError,
    addError,
    updateError,
    removeError
  } = useSelector((state) => state.workers);

  const role = useSelector((state) => state.auth.role);
  const isAdmin = role === "Admin";

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(GETWORKERS());
  }, [dispatch]);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));

    setMessage("");
    setFormError("");
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setFormError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const name = form.fullName.trim();
    const cnic = form.cnic.replace(/\D/g, "");
    const wage = Number(form.dailyWage);

    if (!/^[A-Za-z ]{3,}$/.test(name)) {
      setFormError("Enter a valid worker name.");
      return;
    }

    if (cnic.length !== 13) {
      setFormError("CNIC must contain 13 digits.");
      return;
    }

    if (!/^\d{11}$/.test(form.phone)) {
      setFormError("Phone must contain 11 digits.");
      return;
    }

    if (!Number.isFinite(wage) || wage <= 0) {
      setFormError("Enter a valid daily wage.");
      return;
    }

    if (!form.joinDate) {
      setFormError("Select joining date.");
      return;
    }

    const workerData = {
      ...form,
      fullName: name,
      dailyWage: wage
    };

    if (editingId !== null) {
      if (!isAdmin) return;

      dispatch(
        UPDATEWORKER(
          { ...workerData, id: editingId },
          () => {
            resetForm();
            setMessage("Worker updated successfully!");
          }
        )
      );
    } else {
      dispatch(
        ADDWORKER(workerData, () => {
          resetForm();
          setMessage("Worker added successfully!");
        })
      );
    }
  };

  const handleEdit = (worker) => {
    if (!isAdmin) return;

    setEditingId(worker.id);

    setForm({
      fullName: worker.fullName,
      cnic: worker.cnic,
      phone: worker.phone,
      role: worker.role,
      dailyWage: worker.dailyWage,
      joinDate: worker.joinDate,
      status: worker.status
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (worker) => {
    if (!isAdmin) return;

    if (window.confirm(`Delete ${worker.fullName}?`)) {
      dispatch(
        REMOVEWORKER(worker.id, () => {
          setMessage("Worker deleted successfully!");
        })
      );
    }
  };

  const filteredWorkers = workers.filter((worker) => {
    const query = search.toLowerCase();

    const matchesSearch =
      (worker.fullName || "").toLowerCase().includes(query) ||
      (worker.cnic || "").includes(search);

    const matchesRole =
      roleFilter === "All" ||
      worker.role === roleFilter;

    const matchesStatus =
      statusFilter === "All" ||
      worker.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeWorkers = workers.filter(
    (worker) => worker.status === "Active"
  ).length;

  const error =
    formError ||
    workersError ||
    addError ||
    updateError ||
    removeError;

  return (
    <Box
      sx={{
        bgcolor: "#f4f8f4",
        minHeight: "100vh",
        py: 4
      }}
    >
      <Container maxWidth="xl">

        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ color: "#183b29", mb: 1 }}
        >
          Workers & Labour Management
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Manage farm workers, employment details and wages.
        </Typography>

        {/* SUMMARY CARDS */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, 1fr)"
            },
            gap: 2,
            mb: 4
          }}
        >
          {[
            { label: "Total Workers", value: workers.length },
            { label: "Active Workers", value: activeWorkers },
            {
              label: "Inactive Workers",
              value: workers.length - activeWorkers
            }
          ].map((item) => (
            <Paper
              key={item.label}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e0e9e0"
              }}
            >
              <Typography color="text.secondary">
                {item.label}
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
                color="success.dark"
                sx={{ mt: 1 }}
              >
                {item.value}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* WORKER FORM */}

        <Paper
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 3,
            mb: 4,
            border: "1px solid #e0e9e0"
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={3}>
            {editingId !== null
              ? "Edit Worker"
              : "Register New Worker"}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, 1fr)"
                },
                gap: 2.5
              }}
            >
              <TextField
                label="Full Name"
                value={form.fullName}
                onChange={(e) =>
                  updateField("fullName", e.target.value)
                }
                required
                fullWidth
              />

              <TextField
                label="CNIC"
                placeholder="12345-1234567-1"
                value={form.cnic}
                onChange={(e) =>
                  updateField(
                    "cnic",
                    e.target.value.replace(/[^\d-]/g, "")
                  )
                }
                required
                fullWidth
              />

              <TextField
                label="Phone Number"
                placeholder="03001234567"
                value={form.phone}
                onChange={(e) =>
                  updateField(
                    "phone",
                    e.target.value.replace(/\D/g, "").slice(0, 11)
                  )
                }
                required
                fullWidth
              />

              <TextField
                select
                label="Worker Role"
                value={form.role}
                onChange={(e) =>
                  updateField("role", e.target.value)
                }
                fullWidth
              >
                {workerRoles.map((workerRole) => (
                  <MenuItem
                    key={workerRole}
                    value={workerRole}
                  >
                    {workerRole}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Daily Wage (PKR)"
                type="number"
                value={form.dailyWage}
                onChange={(e) =>
                  updateField("dailyWage", e.target.value)
                }
                slotProps={{
                  htmlInput: { min: 1 }
                }}
                required
                fullWidth
              />

              <TextField
                label="Joining Date"
                type="date"
                value={form.joinDate}
                onChange={(e) =>
                  updateField("joinDate", e.target.value)
                }
                slotProps={{
                  inputLabel: { shrink: true }
                }}
                required
                fullWidth
              />

              <TextField
                select
                label="Status"
                value={form.status}
                onChange={(e) =>
                  updateField("status", e.target.value)
                }
                fullWidth
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={addLoading || updateLoading}
                sx={{
                  bgcolor: "#1b5e20",
                  px: 4,
                  py: 1.2,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#12451a" }
                }}
              >
                {editingId !== null
                  ? "Update Worker"
                  : "Add Worker"}
              </Button>

              {editingId !== null && (
                <Button
                  variant="outlined"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* WORKERS LIST */}

        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid #e0e9e0"
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={3}>
            Registered Workers
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              mb: 3
            }}
          >
            <TextField
              label="Search Worker"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ flex: 1, minWidth: 180 }}
            />

            <TextField
              select
              label="Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="All">All Roles</MenuItem>
              {workerRoles.map((workerRole) => (
                <MenuItem
                  key={workerRole}
                  value={workerRole}
                >
                  {workerRole}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Box>

          {workersLoading ? (
            <Typography>Loading workers...</Typography>
          ) : filteredWorkers.length === 0 ? (
            <Typography color="text.secondary">
              No workers found.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)"
                },
                gap: 2
              }}
            >
              {filteredWorkers.map((worker) => (
                <Paper
                  key={worker.id}
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: "#fafcf9"
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                      gap: 1
                    }}
                  >
                    <Typography fontWeight={700}>
                      {worker.fullName}
                    </Typography>

                    <Chip
                      label={worker.status}
                      size="small"
                      color={
                        worker.status === "Active"
                          ? "success"
                          : "default"
                      }
                    />
                  </Box>

                  <Typography variant="body2" mb={1}>
                    Role: {worker.role}
                  </Typography>

                  <Typography variant="body2" mb={1}>
                    CNIC: {worker.cnic}
                  </Typography>

                  <Typography variant="body2" mb={1}>
                    Phone: {worker.phone}
                  </Typography>

                  <Typography variant="body2" mb={1}>
                    Daily Wage: Rs.{" "}
                    {Number(worker.dailyWage).toLocaleString("en-PK")}
                  </Typography>

                  <Typography variant="body2" mb={2}>
                    Joined: {worker.joinDate}
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  {isAdmin && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEdit(worker)}
                      >
                        Edit
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(worker)}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </Paper>

            <AttendanceRegister />

      </Container>
    </Box>
  );
}

export default Workers;