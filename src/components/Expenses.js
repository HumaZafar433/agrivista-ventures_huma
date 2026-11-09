
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Chip,
  Divider
} from "@mui/material";

import {
  addExpense,
  updateExpense,
  deleteExpense
} from "../store/reducers/expensesReducer";

const API_URL = "http://localhost:5000/api/expenses";

const categories = [
  "Seeds",
  "Fertilizer",
  "Labour",
  "Fuel",
  "Spraying",
  "Repair",
  "Other"
];

const formatMoney = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;

const getToken = () => {
  const session = JSON.parse(
    localStorage.getItem("agri_session") || "{}"
  );
  return session.token;
};

function Expenses() {
  const dispatch = useDispatch();


  const crops = useSelector((state) => state.crops);
  const role = useSelector((state) => state.auth.role);

  const isAdmin = role === "Admin";

  const [form, setForm] = useState({
    cropId: "",
    category: "Seeds",
    amount: "",
    date: "",
    note: ""
  });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expenseRecords, setExpenseRecords] = useState([]);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });

        const result = await response.json();

        if (!response.ok || !result.succeeded) {
          throw new Error(
            result.message || "Failed to load expenses."
          );
        }

        setExpenseRecords(
          (result.data || []).map((item) => ({
            ...item,
            amount: Number(item.amount)
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, []);

  const isPayrollExpense = (expense) => {
    const note = String(expense.note || "");

    return (
      expense.sourceType === "payroll" ||
      /\[PAYROLL:[^\]]+\]/.test(note) ||
      /^Monthly wages - .+ - \d{4}-(0[1-9]|1[0-2])$/.test(note)
    );
  };

  const displayExpenseNote = (note) => {
    const clean = String(note || "")
      .replace(/\s*\[PAYROLL:[^\]]+\]/g, "")
      .trim();

    if (!clean) return "No notes";

    const match = clean.match(
      /^(Monthly wages - .+ - )(\d{4})-(0[1-9]|1[0-2])$/
    );

    if (!match) return clean;

    const months = [
      "January", "February", "March", "April",
      "May", "June", "July", "August",
      "September", "October", "November", "December"
    ];

    return `${match[1]}${months[Number(match[3]) - 1]} ${match[2]}`;
  };

  const getCropName = (cropId) => {
    const crop = crops.find(
      (item) => String(item.id) === String(cropId)
    );

    return crop ? crop.name : "Unknown Crop";
  };

  const resetForm = () => {
    setForm({
      cropId: "",
      category: "Seeds",
      amount: "",
      date: "",
      note: ""
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin || saving) return;

    if (
      !form.cropId ||
      !form.date ||
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) <= 0
    ) {
      setError("Please enter valid expense details.");
      return;
    }

    const expenseData = {
      cropId: form.cropId,
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      note: form.note.trim()
    };

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing
          ? `${API_URL}/${editingId}`
          : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify(expenseData)
        }
      );

      const result = await response.json();

      if (!response.ok || !result.succeeded) {
        throw new Error(
          result.message || "Failed to save expense."
        );
      }

      const savedExpense = {
        ...result.data,
        amount: Number(result.data.amount)
      };

      if (isEditing) {
        setExpenseRecords((prev) =>
          prev.map((item) =>
            String(item.id) === String(editingId)
              ? savedExpense
              : item
          )
        );

        dispatch(updateExpense(savedExpense));
        setMessage("Expense updated successfully.");
      } else {
        setExpenseRecords((prev) => [
          savedExpense,
          ...prev
        ]);

        dispatch(addExpense(savedExpense));
        setMessage("Expense added successfully.");
      }

      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (expense) => {
    if (!isAdmin) return;

    setEditingId(expense.id);

    setForm({
      cropId: String(expense.cropId || ""),
      category: expense.category,
      amount: String(expense.amount),
      date: expense.date || "",
      note: expense.note || ""
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      const result = await response.json();

      if (!response.ok || !result.succeeded) {
        throw new Error(
          result.message || "Failed to delete expense."
        );
      }

      setExpenseRecords((prev) =>
        prev.filter(
          (item) => String(item.id) !== String(id)
        )
      );

      dispatch(deleteExpense(id));
      setMessage("Expense deleted successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

  const totalExpenses = expenseRecords.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

  const categoriesUsed = new Set(
    expenseRecords.map((expense) => expense.category)
  ).size;

  const filteredExpenses = expenseRecords.filter((expense) => {
    const cropName = isPayrollExpense(expense) ? "Staff Payroll" : getCropName(expense.cropId);

    const matchesSearch =
      cropName.toLowerCase().includes(search.toLowerCase()) ||
      (expense.note || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || expense.category === filter;

    return matchesSearch && matchesFilter;
  });

  const categoryTotals = categories.map((category) => ({
    category,
    amount: expenseRecords
      .filter((expense) => expense.category === category)
      .reduce(
        (total, expense) =>
          total + Number(expense.amount || 0),
        0
      )
  }));

  const highestCategoryAmount = Math.max(
    1,
    ...categoryTotals.map((item) => item.amount)
  );

  return (
    <Box
      sx={{
        bgcolor: "#f4f8f4",
        minHeight: "85vh",
        py: 4
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: "#183b29" }}
          >
            Expense Management
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Track farming costs and manage expenses by crop.
          </Typography>
        </Box>

        {error && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: "#ffebee" }}>
            <Typography color="error">
              {error}
            </Typography>
          </Paper>
        )}

        {message && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: "#e8f5e9" }}>
            <Typography color="success.main">
              {message}
            </Typography>
          </Paper>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)"
            },
            gap: 3,
            mb: 4
          }}
        >
          {[
            {
              title: "Total Expenses",
              value: formatMoney(totalExpenses)
            },
            {
              title: "Expense Records",
              value: expenseRecords.length
            },
            {
              title: "Categories Used",
              value: categoriesUsed
            }
          ].map((item) => (
            <Paper
              key={item.title}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e3ebe4",
                boxShadow: "0 5px 20px rgba(0,0,0,0.04)"
              }}
            >
              <Typography color="text.secondary">
                {item.title}
              </Typography>

              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  color: "#1b5e20",
                  mt: 1
                }}
              >
                {item.value}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: "1px solid #e3ebe4",
            mb: 4
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              color: "#183b29",
              mb: 3
            }}
          >
            {editingId !== null
              ? "Edit Expense"
              : "Add New Expense"}
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
                select
                label="Select Crop"
                value={form.cropId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    cropId: e.target.value
                  })
                }
                required
                fullWidth
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
                select
                label="Expense Category"
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value
                  })
                }
                fullWidth
              >
                {categories.map((category) => (
                  <MenuItem
                    key={category}
                    value={category}
                  >
                    {category}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Amount (PKR)"
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    amount: e.target.value
                  })
                }
                required
                fullWidth
                slotProps={{
                  htmlInput: {
                    min: 0.01,
                    step: "0.01"
                  }
                }}
              />

              <TextField
                label="Expense Date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    date: e.target.value
                  })
                }
                required
                fullWidth
                slotProps={{
                  inputLabel: { shrink: true }
                }}
              />

              <TextField
                label="Notes (Optional)"
                placeholder="e.g. Fertilizer purchased for wheat field"
                value={form.note}
                onChange={(e) =>
                  setForm({
                    ...form,
                    note: e.target.value
                  })
                }
                multiline
                rows={2}
                fullWidth
                sx={{
                  gridColumn: {
                    xs: "auto",
                    md: "span 2"
                  }
                }}
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
                variant="contained"
                disabled={!isAdmin || saving}
                sx={{
                  bgcolor: "#1b5e20",
                  px: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "#12451a"
                  }
                }}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                  ? "Update Expense"
                  : "Save Expense"}
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

        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            mb: 4,
            border: "1px solid #e3ebe4",
            boxShadow: "0 6px 24px rgba(0,0,0,0.04)"
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
              mb: 3
            }}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: "#183b29" }}
              >
                Expense Breakdown
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Category-wise farming expenses
              </Typography>
            </Box>

            <Chip
              label={`${
                categoryTotals.filter(
                  (item) => item.amount > 0
                ).length
              } Active Categories`}
              sx={{
                bgcolor: "#e8f5e9",
                color: "#1b5e20",
                fontWeight: 600
              }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          {totalExpenses === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">
                No expenses recorded yet.
              </Typography>
            </Box>
          ) : (
            categoryTotals
              .filter((item) => item.amount > 0)
              .sort((a, b) => b.amount - a.amount)
              .map((item) => (
                <Box
                  key={item.category}
                  sx={{
                    mb: 1,
                    p: 1.5,
                    bgcolor: "#f8fbf8",
                    border: "1px solid #e6eee6",
                    borderRadius: 2
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1
                    }}
                  >
                    <Typography
                      fontWeight={600}
                      sx={{ color: "#183b29" }}
                    >
                      {item.category}
                    </Typography>

                    <Typography
                      fontWeight={700}
                      sx={{ color: "#1b5e20" }}
                    >
                      {formatMoney(item.amount)}
                    </Typography>
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {Math.round(
                      (item.amount / totalExpenses) * 100
                    )}% of total expenses
                  </Typography>

                  <Box
                    sx={{
                      mt: 1,
                      height: 7,
                      bgcolor: "#e2ece3",
                      borderRadius: 5,
                      overflow: "hidden"
                    }}
                  >
                    <Box
                      sx={{
                        width: `${
                          (item.amount /
                            highestCategoryAmount) * 100
                        }%`,
                        height: "100%",
                        background:
                          "linear-gradient(90deg, #1b5e20, #66bb6a)",
                        borderRadius: 5
                      }}
                    />
                  </Box>
                </Box>
              ))
          )}
        </Paper>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              color: "#183b29",
              mb: 0.5
            }}
          >
            Expense Records
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            View and manage recorded farming expenses.
          </Typography>
        </Box>

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
            placeholder="Search by crop or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              flex: 1,
              bgcolor: "white"
            }}
          />

          <TextField
            select
            label="Filter Category"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            size="small"
            sx={{
              minWidth: 200,
              bgcolor: "white"
            }}
          >
            <MenuItem value="All">
              All Categories
            </MenuItem>

            {categories.map((category) => (
              <MenuItem
                key={category}
                value={category}
              >
                {category}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {loading ? (
          <Typography>
            Loading expenses...
          </Typography>
        ) : filteredExpenses.length === 0 ? (
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              textAlign: "center",
              border: "1px solid #e3ebe4"
            }}
          >
            <Typography color="text.secondary">
              No expense records found.
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))"
              },
              gap: 2
            }}
          >
            {filteredExpenses.map((expense) => (
              <Paper
                key={expense.id}
                elevation={0}
                sx={{
                  p: 2.2,
                  borderRadius: 2.5,
                  border: "1px solid #dfe9e0",
                  backgroundColor: "#ffffff",
                  boxShadow:
                    "0 3px 12px rgba(0,0,0,0.035)"
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                    mb: 1.5
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ color: "#183b29" }}
                  >
                    {isPayrollExpense(expense) ? "Staff Payroll" : getCropName(expense.cropId)}
                  </Typography>

                  <Chip
                    label={expense.category}
                    size="small"
                    variant="outlined"
                    sx={{
                      color: "#2e7d32",
                      borderColor: "#b9d8bd"
                    }}
                  />
                </Box>

                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    color: "#1b5e20",
                    mb: 1.5
                  }}
                >
                  {formatMoney(expense.amount)}
                </Typography>

                <Divider sx={{ mb: 1.5 }} />

                <Typography
                  variant="body2"
                  sx={{ mb: 1 }}
                >
                  <b>Date:</b> {expense.date}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ mb: isAdmin ? 2 : 0 }}
                >
                  <b>Notes:</b>{" "}
                  {displayExpenseNote(expense.note)}
                </Typography>

                {isAdmin && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap"
                    }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEdit(expense)}
                      sx={{
                        color: "#1b5e20",
                        borderColor: "#a5c9a8",
                        textTransform: "none"
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() =>
                        handleDelete(expense.id)
                      }
                      sx={{
                        textTransform: "none"
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default Expenses;
