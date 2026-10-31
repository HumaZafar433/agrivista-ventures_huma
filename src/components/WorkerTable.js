import { useState } from "react";

import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";

const workerRoles = [
  "Farm Hand",
  "Driver",
  "Supervisor",
  "Sprayer"
];

function WorkerTable({
  workers = [],
  loading = false,
  isAdmin = false,
  onEdit,
  onDelete
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredWorkers = workers.filter((worker) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      (worker.fullName || "").toLowerCase().includes(query) ||
      (worker.cnic || "").includes(query) ||
      (worker.phone || "").includes(query);

    const matchesRole =
      roleFilter === "All" ||
      worker.role === roleFilter;

    const matchesStatus =
      statusFilter === "All" ||
      worker.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 4,
        borderRadius: 3,
        border: "1px solid #e3ebe4",
        boxShadow: "0 4px 18px rgba(0,0,0,0.04)"
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ color: "#183b29", mb: 1 }}
      >
        Registered Workers
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        View and manage registered farm workers.
      </Typography>

      {/* SEARCH AND FILTERS */}

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
          placeholder="Name, CNIC or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 200 }}
        />

        <TextField
          select
          label="Worker Role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="All">All Roles</MenuItem>

          {workerRoles.map((role) => (
            <MenuItem key={role} value={role}>
              {role}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="All">All Statuses</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>
      </Box>

      {/* WORKERS TABLE */}

      {loading ? (
        <Typography
          color="text.secondary"
          sx={{ py: 3, textAlign: "center" }}
        >
          Loading workers...
        </Typography>
      ) : filteredWorkers.length === 0 ? (
        <Typography
          color="text.secondary"
          sx={{ py: 4, textAlign: "center" }}
        >
          No workers found.
        </Typography>
      ) : (
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead sx={{ bgcolor: "#e8f5e9" }}>
              <TableRow>
                <TableCell><b>Worker Name</b></TableCell>
                <TableCell><b>Role</b></TableCell>
                <TableCell><b>Phone</b></TableCell>
                <TableCell><b>Daily Wage</b></TableCell>
                <TableCell><b>Joining Date</b></TableCell>
                <TableCell><b>Status</b></TableCell>

                {isAdmin && (
                  <TableCell><b>Actions</b></TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredWorkers.map((worker) => (
                <TableRow key={worker.id} hover>
                  <TableCell>
                    <Typography
                      fontWeight={700}
                      sx={{ color: "#183b29" }}
                    >
                      {worker.fullName}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {worker.role}
                  </TableCell>

                  <TableCell>
                    {worker.phone}
                  </TableCell>

                  <TableCell>
                    Rs.{" "}
                    {Number(
                      worker.dailyWage || 0
                    ).toLocaleString("en-PK")}
                  </TableCell>

                  <TableCell>
                    {worker.joinDate}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={worker.status}
                      size="small"
                      color={
                        worker.status === "Active"
                          ? "success"
                          : "default"
                      }
                    />
                  </TableCell>

                  {isAdmin && (
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => onEdit(worker)}
                        >
                          Edit
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => onDelete(worker)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

export default WorkerTable;