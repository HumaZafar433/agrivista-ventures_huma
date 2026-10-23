import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Chip
} from "@mui/material";

import {
  addTask,
  updateTask,
  deleteTask,
  markTaskDone
} from "../store/reducers/tasksReducer";

function Tasks() {
  const dispatch = useDispatch();

  const tasks = useSelector((state) => state.tasks);
  const crops = useSelector((state) => state.crops);
  const role = useSelector((state) => state.auth.role);

  const isAdmin = role === "Admin";

  const [form, setForm] = useState({
    title: "",
    type: "Irrigation",
    cropId: "",
    dueDate: ""
  });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getStatus = (task) => {
    if (task.status === "Done") return "Done";

    const dueDate = new Date(task.dueDate + "T00:00:00");

    if (dueDate < today) return "Overdue";

    return "Pending";
  };

  const resetForm = () => {
    setForm({
      title: "",
      type: "Irrigation",
      cropId: "",
      dueDate: ""
    });

    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.cropId ||
      !form.dueDate
    ) {
      return;
    }

    if (editingId !== null) {
      if (!isAdmin) return;

      dispatch(
        updateTask({
          id: editingId,
          ...form,
          title: form.title.trim()
        })
      );
    } else {
      dispatch(
        addTask({
          id: Date.now().toString(),
          ...form,
          title: form.title.trim(),
          status: "Pending"
        })
      );
    }

    resetForm();
  };

  const handleEdit = (task) => {
    if (!isAdmin) return;

    setEditingId(task.id);

    setForm({
      title: task.title,
      type: task.type,
      cropId: task.cropId,
      dueDate: task.dueDate
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = (id) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (confirmed) {
      dispatch(deleteTask(id));
    }
  };

  const getCropName = (cropId) => {
    const crop = crops.find(
      (item) => String(item.id) === String(cropId)
    );

    return crop ? crop.name : "Unknown Crop";
  };

  const filteredTasks = tasks.filter((task) => {
    const cropName = getCropName(task.cropId);

    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      cropName.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || getStatus(task) === filter;

    return matchesSearch && matchesFilter;
  });

  const doneCount = tasks.filter(
    (task) => getStatus(task) === "Done"
  ).length;

  const overdueCount = tasks.filter(
    (task) => getStatus(task) === "Overdue"
  ).length;

  const pendingCount = tasks.filter(
    (task) => getStatus(task) === "Pending"
  ).length;

  return (
    <Box sx={{ bgcolor: "#f4f8f4", minHeight: "85vh", py: 4 }}>
      <Container maxWidth="xl">

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: "#183b29" }}
          >
            Farm Task Scheduler
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Plan and track daily farming activities.
          </Typography>
        </Box>

        {/* SUMMARY CARDS */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              md: "repeat(4, 1fr)"
            },
            gap: 2,
            mb: 4
          }}
        >
          {[
            { label: "Total Tasks", value: tasks.length, color: "#1b5e20" },
            { label: "Pending", value: pendingCount, color: "#ed6c02" },
            { label: "Completed", value: doneCount, color: "#2e7d32" },
            { label: "Overdue", value: overdueCount, color: "#d32f2f" }
          ].map((item) => (
            <Paper
              key={item.label}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e3ebe4",
                boxShadow: "0 4px 15px rgba(0,0,0,0.04)"
              }}
            >
              <Typography color="text.secondary" variant="body2">
                {item.label}
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ color: item.color, mt: 1 }}
              >
                {item.value}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* ADD / EDIT FORM */}

        <Paper
          sx={{
            p: { xs: 2.5, md: 4 },
            mb: 4,
            borderRadius: 3,
            border: "1px solid #e3ebe4",
            boxShadow: "0 4px 18px rgba(0,0,0,0.04)"
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ mb: 3, color: "#183b29" }}
          >
            {editingId !== null ? "Edit Farm Task" : "Add New Task"}
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
                label="Task Title"
                placeholder="e.g. Water wheat field"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                fullWidth
                required
              />

              <TextField
                select
                label="Task Type"
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value })
                }
                fullWidth
              >
                {["Irrigation", "Fertilizer", "Spraying", "Labour"].map(
                  (type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  )
                )}
              </TextField>

              <TextField
                select
                label="Select Crop"
                value={form.cropId}
                onChange={(e) =>
                  setForm({ ...form, cropId: e.target.value })
                }
                fullWidth
                required
              >
                {crops.map((crop) => (
                  <MenuItem
                    key={crop.id}
                    value={String(crop.id)}
                  >
                    {crop.name} — {crop.field}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Due Date"
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm({ ...form, dueDate: e.target.value })
                }
                slotProps={{
                  inputLabel: { shrink: true }
                }}
                fullWidth
                required
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: "#1b5e20",
                  textTransform: "none",
                  px: 3,
                  "&:hover": { bgcolor: "#12451a" }
                }}
              >
                {editingId !== null ? "Update Task" : "Add Task"}
              </Button>

              {editingId !== null && (
                <Button onClick={resetForm} variant="outlined">
                  Cancel
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* SEARCH AND FILTER */}

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mb: 3
          }}
        >
          <TextField
            placeholder="Search tasks or crops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
          />

          <TextField
            select
            label="Filter by Status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            {["All", "Pending", "Done", "Overdue"].map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* TASK CARDS */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)"
            },
            gap: 3
          }}
        >
          {filteredTasks.map((task) => {
            const status = getStatus(task);

            return (
              <Paper
                key={task.id}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid #e3ebe4",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.04)"
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 1,
                    mb: 2
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: "#183b29" }}
                  >
                    {task.title}
                  </Typography>

                  <Chip
                    label={status}
                    size="small"
                    color={
                      status === "Done"
                        ? "success"
                        : status === "Overdue"
                        ? "error"
                        : "warning"
                    }
                  />
                </Box>

                <Typography sx={{ mb: 1 }}>
                  <b>Type:</b> {task.type}
                </Typography>

                <Typography sx={{ mb: 1 }}>
                  <b>Crop:</b> {getCropName(task.cropId)}
                </Typography>

                <Typography sx={{ mb: 3 }}>
                  <b>Due Date:</b> {task.dueDate}
                </Typography>

                {isAdmin && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {task.status !== "Done" && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => dispatch(markTaskDone(task.id))}
                      >
                        Mark Done
                      </Button>
                    )}

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleEdit(task)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>

        {filteredTasks.length === 0 && (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 3
            }}
          >
            <Typography color="text.secondary">
              No tasks found.
            </Typography>
          </Paper>
        )}

      </Container>
    </Box>
  );
}

export default Tasks;