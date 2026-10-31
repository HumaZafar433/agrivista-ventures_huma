import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button
} from "@mui/material";

const workerRoles = [
  "Farm Hand",
  "Driver",
  "Supervisor",
  "Sprayer"
];

function WorkerForm({
  form,
  editingId,
  updateField,
  handleSubmit,
  resetForm,
  loading
}) {
  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        mb: 4,
        border: "1px solid #e0e9e0"
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ color: "#183b29", mb: 3 }}
      >
        {editingId !== null
          ? "Edit Worker"
          : "Register New Worker"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)"
            },
            gap: 2
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
              updateField("cnic", e.target.value)
            }
            required
            fullWidth
          />

          <TextField
            label="Phone Number"
            value={form.phone}
            onChange={(e) =>
              updateField("phone", e.target.value)
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
            {workerRoles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
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
            label="Employment Status"
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

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 3
          }}
        >
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: "#1b5e20",
              textTransform: "none"
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
  );
}

export default WorkerForm;