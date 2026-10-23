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
  Chip,
  Divider
} from "@mui/material";

import {
  addExpense,
  updateExpense,
  deleteExpense
} from "../store/reducers/expensesReducer";

const categories = [
  "Seeds",
  "Fertilizer",
  "Labour",
  "Fuel",
  "Spraying",
  "Other"
];

const formatMoney = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;

function Expenses() {

  const dispatch = useDispatch();

  const expenses = useSelector((state) => state.expenses);
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.cropId ||
      !form.date ||
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) <= 0
    ) {
      setMessage("Please enter valid expense details.");
      return;
    }

    const expenseData = {
      ...form,
      amount: Number(form.amount),
      note: form.note.trim()
    };

    if (editingId !== null) {

      if (!isAdmin) return;

      dispatch(
        updateExpense({
          ...expenseData,
          id: editingId
        })
      );

      setMessage("Expense updated successfully.");

    } else {

      dispatch(
        addExpense({
          ...expenseData,
          id: Date.now().toString()
        })
      );

      setMessage("Expense added successfully.");
    }

    resetForm();
  };

  const handleEdit = (expense) => {
    if (!isAdmin) return;

    setEditingId(expense.id);

    setForm({
      cropId: String(expense.cropId),
      category: expense.category,
      amount: String(expense.amount),
      date: expense.date,
      note: expense.note || ""
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = (id) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (confirmed) {
      dispatch(deleteExpense(id));
      setMessage("Expense deleted successfully.");
    }
  };

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

  const categoriesUsed = new Set(
    expenses.map((expense) => expense.category)
  ).size;

  const filteredExpenses = expenses.filter((expense) => {

    const cropName = getCropName(expense.cropId);

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

    amount: expenses
      .filter((expense) => expense.category === category)
      .reduce(
        (total, expense) => total + Number(expense.amount || 0),
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

        {/* PAGE HEADER */}

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

        {/* SUMMARY CARDS */}

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
              value: expenses.length
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

        {/* EXPENSE FORM */}

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

            {message && (
              <Typography
                sx={{
                  mt: 2,
                  color: message.startsWith("Please")
                    ? "error.main"
                    : "success.main"
                }}
              >
                {message}
              </Typography>
            )}

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
                {editingId !== null
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

      {/* CATEGORY CHART */}

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
      label={`${categoryTotals.filter(
        (item) => item.amount > 0
      ).length} Active Categories`}
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
                  (item.amount / highestCategoryAmount) * 100
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

       {/* EXPENSE RECORDS */}

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

{/* SEARCH AND FILTER */}

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

{/* EMPTY STATE */}

{filteredExpenses.length === 0 && (
  <Paper
    sx={{
      p: 3,
      borderRadius: 2,
      textAlign: "center",
      border: "1px solid #e3ebe4",
      boxShadow: "none"
    }}
  >
    <Typography color="text.secondary">
      No expense records found.
    </Typography>
  </Paper>
)}

{/* EXPENSE CARDS */}

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
        boxShadow: "0 3px 12px rgba(0,0,0,0.035)",
        transition: "0.2s",
        "&:hover": {
          borderColor: "#a5c9a8",
          boxShadow: "0 5px 18px rgba(0,0,0,0.07)"
        }
      }}
    >

      {/* CROP AND CATEGORY */}

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
          sx={{
            color: "#183b29",
            overflowWrap: "anywhere"
          }}
        >
          {getCropName(expense.cropId)}
        </Typography>

        <Chip
          label={expense.category}
          size="small"
          variant="outlined"
          sx={{
            color: "#2e7d32",
            borderColor: "#b9d8bd",
            fontSize: 12,
            height: 25
          }}
        />
      </Box>

      {/* AMOUNT */}

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

      {/* DATE */}

      <Typography
        variant="body2"
        sx={{
          mb: 1,
          color: "#52635a"
        }}
      >
        <b>Date:</b> {expense.date}
      </Typography>

      {/* NOTES */}

      <Typography
        variant="body2"
        sx={{
          mb: isAdmin ? 2 : 0,
          color: "#52635a",
          overflowWrap: "anywhere"
        }}
      >
        <b>Notes:</b> {expense.note || "No notes"}
      </Typography>

      {/* ADMIN ACTIONS */}

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
              textTransform: "none",
              borderRadius: 1.5,
              px: 2,
              "&:hover": {
                borderColor: "#1b5e20",
                bgcolor: "#f0f7f1"
              }
            }}
          >
            Edit
          </Button>

          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={() => handleDelete(expense.id)}
            sx={{
              textTransform: "none",
              borderRadius: 1.5,
              px: 2
            }}
          >
            Delete
          </Button>
        </Box>
      )}

    </Paper>
  ))}
</Box>

      </Container>
    </Box>
  );
}

export default Expenses;