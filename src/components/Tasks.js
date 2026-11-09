
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Chip,
  Alert,
  CircularProgress
} from "@mui/material";

const TASKS_API = "http://localhost:5000/api/tasks";

function getToken() {
  try {
    const session = JSON.parse(
      localStorage.getItem("agri_session") || "{}"
    );
    return session.token || "";
  } catch {
    return "";
  }
}

async function taskRequest(path = "", options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Login session missing. Please log in again."
    );
  }

  let response;

  try {
    response = await fetch(`${TASKS_API}${path}`, {
      ...options,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    });
  } catch {
    throw new Error(
      "Cannot connect to backend. Check node app.js on port 5000."
    );
  }

  const result = await response.json().catch(() => null);

  if (
    !response.ok ||
    !result ||
    result.succeeded === false
  ) {
    throw new Error(
      result?.message ||
      `Task request failed (${response.status})`
    );
  }

  return result;
}

function Tasks() {
  const crops = useSelector((state) => state.crops);
  const role = useSelector((state) => state.auth.role);

  const isAdmin = role === "Admin";


  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const [form, setForm] = useState({
    title: "",
    type: "Irrigation",
    cropId: "",
    dueDate: ""
  });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const loadTasks = useCallback(async (showSpinner = true) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const result = await taskRequest();

      if (!Array.isArray(result.data)) {
        throw new Error(
          "Tasks API returned unexpected data."
        );
      }

      setTasks(result.data);
      setApiError("");
    } catch (error) {
      setApiError(error.message);
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);


  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getStatus = (task) => {
    if (task.status === "Done") {
      return "Done";
    }

    const dateText = String(
      task.dueDate || ""
    ).slice(0, 10);

    const dueDate = new Date(
      dateText + "T00:00:00"
    );

    if (dueDate < today) {
      return "Overdue";
    }

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


  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (
      !form.title.trim() ||
      !form.cropId ||
      !form.dueDate
    ) {
      return;
    }

    if (editingId !== null && !isAdmin) {
      return;
    }

    const data = {
      title: form.title.trim(),
      type: form.type,
      cropId: form.cropId,
      dueDate: form.dueDate
    };

    setSaving(true);
    setApiError("");

    try {
      if (editingId !== null) {
        await taskRequest(`/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(data)
        });
      } else {
        await taskRequest("", {
          method: "POST",
          body: JSON.stringify({
            ...data,
            status: "Pending"
          })
        });
      }

      await loadTasks(false);
      resetForm();
    } catch (error) {
      setApiError(error.message);
    } finally {
      setSaving(false);
    }
  };


  const handleEdit = (task) => {
    if (!isAdmin) return;

    setEditingId(task.id);

    setForm({
      title: task.title,
      type: task.type,
      cropId: String(task.cropId || ""),
      dueDate: String(
        task.dueDate || ""
      ).slice(0, 10)
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };


  const handleDelete = async (id) => {
    if (!isAdmin || saving) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    setSaving(true);
    setApiError("");

    try {
      await taskRequest(`/${id}`, {
        method: "DELETE"
      });

      await loadTasks(false);

      if (String(editingId) === String(id)) {
        resetForm();
      }
    } catch (error) {
      setApiError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkDone = async (id) => {
    if (!isAdmin || saving) return;

    setSaving(true);
    setApiError("");

    try {
      await taskRequest(`/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "Done"
        })
      });

      await loadTasks(false);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const getCropName = (cropId) => {
    const cropList = Array.isArray(crops)
      ? crops
      : [];

    const crop = cropList.find(
      (item) =>
        String(item.id) === String(cropId)
    );

    return crop
      ? crop.name
      : "Unknown Crop";
  };


  const filteredTasks = tasks.filter((task) => {
    const cropName = getCropName(task.cropId);

    const matchesSearch =
      String(task.title || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      cropName
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      getStatus(task) === filter;

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
    <Box
      sx={{
        bgcolor: "#f4f8f4",
        minHeight: "85vh",
        py: 4
      }}
    >
      <Container maxWidth="xl">

        {/* HEADER */}

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: "#183b29" }}
          >
            Farm Task Scheduler
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Plan and track daily farming activities.
          </Typography>
        </Box>

        {/* API ERRORS */}

        {apiError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button
                size="small"
                color="inherit"
                onClick={() => loadTasks()}
              >
                Retry
              </Button>
            }
          >
            {apiError}
          </Alert>
        )}

        {/* LOADING */}

        {loading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2
            }}
          >
            <CircularProgress size={18} />

            <Typography variant="body2">
              Loading tasks from database...
            </Typography>
          </Box>
        )}

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
            {
              label: "Total Tasks",
              value: tasks.length,
              color: "#1b5e20"
            },
            {
              label: "Pending",
              value: pendingCount,
              color: "#ed6c02"
            },
            {
              label: "Completed",
              value: doneCount,
              color: "#2e7d32"
            },
            {
              label: "Overdue",
              value: overdueCount,
              color: "#d32f2f"
            }
          ].map((item) => (
            <Paper
              key={item.label}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e3ebe4",
                boxShadow:
                  "0 4px 15px rgba(0,0,0,0.04)"
              }}
            >
              <Typography
                color="text.secondary"
                variant="body2"
              >
                {item.label}
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
                sx={{
                  color: item.color,
                  mt: 1
                }}
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
            boxShadow:
              "0 4px 18px rgba(0,0,0,0.04)"
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              mb: 3,
              color: "#183b29"
            }}
          >
            {editingId !== null
              ? "Edit Farm Task"
              : "Add New Task"}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
          >
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
                onChange={(event) =>
                  setForm({
                    ...form,
                    title: event.target.value
                  })
                }
                fullWidth
                required
              />

              <TextField
                select
                label="Task Type"
                value={form.type}
                onChange={(event) =>
                  setForm({
                    ...form,
                    type: event.target.value
                  })
                }
                fullWidth
              >
                {[
                  "Irrigation",
                  "Fertilizer",
                  "Spraying",
                  "Labour"
                ].map((type) => (
                  <MenuItem
                    key={type}
                    value={type}
                  >
                    {type}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Select Crop"
                value={form.cropId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    cropId: event.target.value
                  })
                }
                fullWidth
                required
              >
                {(Array.isArray(crops) ? crops : []).map(
                  (crop) => (
                    <MenuItem
                      key={crop.id}
                      value={String(crop.id)}
                    >
                      {crop.name} — {crop.field}
                    </MenuItem>
                  )
                )}
              </TextField>

              <TextField
                label="Due Date"
                type="date"
                value={form.dueDate}
                onChange={(event) =>
                  setForm({
                    ...form,
                    dueDate: event.target.value
                  })
                }
                slotProps={{
                  inputLabel: {
                    shrink: true
                  }
                }}
                fullWidth
                required
              />
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
                disabled={saving || loading}
                variant="contained"
                sx={{
                  bgcolor: "#1b5e20",
                  textTransform: "none",
                  px: 3,
                  "&:hover": {
                    bgcolor: "#12451a"
                  }
                }}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Task"
                    : "Add Task"}
              </Button>

              {editingId !== null && (
                <Button
                  onClick={resetForm}
                  variant="outlined"
                  disabled={saving}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* SEARCH / FILTER */}

        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row"
            },
            gap: 2,
            mb: 3
          }}
        >
          <TextField
            placeholder="Search tasks or crops..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            sx={{ flex: 1 }}
          />

          <TextField
            select
            label="Filter by Status"
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
            sx={{
              minWidth: 200
            }}
          >
            {[
              "All",
              "Pending",
              "Done",
              "Overdue"
            ].map((status) => (
              <MenuItem
                key={status}
                value={status}
              >
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
                  boxShadow:
                    "0 4px 18px rgba(0,0,0,0.04)"
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
                    sx={{
                      color: "#183b29"
                    }}
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
                  <b>Crop:</b>{" "}
                  {getCropName(task.cropId)}
                </Typography>

                <Typography sx={{ mb: 3 }}>
                  <b>Due Date:</b>{" "}
                  {String(task.dueDate || "").slice(0, 10)}
                </Typography>

                {isAdmin && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap"
                    }}
                  >
                    {task.status !== "Done" && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        disabled={saving || loading}
                        onClick={() =>
                          handleMarkDone(task.id)
                        }
                      >
                        Mark Done
                      </Button>
                    )}

                    <Button
                      size="small"
                      variant="outlined"
                      disabled={saving || loading}
                      onClick={() =>
                        handleEdit(task)
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      disabled={saving || loading}
                      onClick={() =>
                        handleDelete(task.id)
                      }
                    >
                      Delete
                    </Button>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>

        {/* EMPTY STATE */}

        {!loading &&
          !apiError &&
          filteredTasks.length === 0 && (
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
