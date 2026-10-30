import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  Chip,
  Divider
} from "@mui/material";

import {
  GETATTENDANCE,
  MARKATTENDANCE,
  UPDATEATTENDANCE,
  REMOVEATTENDANCE
} from "../app/redux/actions/attendance";

import {
  selectDailyAttendance,
  selectMonthlyWages
} from "../app/redux/selectors/attendance";
import { addExpense } from "../store/reducers/expensesReducer";

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const statuses = [
  "Present",
  "Absent",
  "Half-day",
  "Leave"
];

function AttendanceRegister() {
  const dispatch = useDispatch();
  const expenses = useSelector(
  (state) => state.expenses || []
);

  const workers = useSelector(
    (state) => state.workers?.workers || []
  );

  const records = useSelector(
    (state) => state.attendance?.records || []
  );

  const role = useSelector(
    (state) => state.auth.role
  );

  const isAdmin = role === "Admin";

  const [date, setDate] = useState(getToday());
  const [month, setMonth] = useState(getToday().slice(0, 7));

  const [workerId, setWorkerId] = useState("");
  const [status, setStatus] = useState("Present");
  const [note, setNote] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const daily = useSelector((state) =>
    selectDailyAttendance(state, date)
  );

  const wages = useSelector((state) =>
    selectMonthlyWages(state, month)
  );

  useEffect(() => {
    dispatch(GETATTENDANCE());
  }, [dispatch]);

  const resetForm = () => {
    setWorkerId("");
    setStatus("Present");
    setNote("");
    setEditingId(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!workerId || !date) {
      setError("Please select a worker and date.");
      return;
    }

    const data = {
      workerId,
      date,
      status,
      note: note.trim()
    };

    const success = () => {
      resetForm();
      setMessage("Attendance saved successfully.");
    };

    const failure = (message) => {
      setError(message);
    };

    if (editingId !== null) {
      if (!isAdmin) return;

      dispatch(
        UPDATEATTENDANCE(
          { ...data, id: editingId },
          success,
          failure
        )
      );
    } else {
      dispatch(
        MARKATTENDANCE(
          data,
          success,
          failure
        )
      );
    }
  };

  const handleEdit = (record) => {
    if (!isAdmin) return;

    setEditingId(record.id);
    setWorkerId(String(record.workerId));
    setDate(record.date);
    setStatus(record.status);
    setNote(record.note || "");

    setError("");
    setMessage("");
  };

  const handleDelete = (record) => {
    if (!isAdmin) return;

    if (!window.confirm("Delete this attendance record?")) {
      return;
    }

    dispatch(
      REMOVEATTENDANCE(
        record.id,
        () => {
          setMessage("Attendance deleted.");
          setError("");
        },
        (message) => setError(message)
      )
    );
  };

  const handleMarkAllPresent = async () => {
    setError("");
    setMessage("");

    const unmarkedWorkers = workers.filter(
      (worker) =>
        worker.status === "Active" &&
        !records.some(
          (record) =>
            String(record.workerId) === String(worker.id) &&
            record.date === date
        )
    );

    if (unmarkedWorkers.length === 0) {
      setMessage("All active workers already have attendance.");
      return;
    }

    const failures = [];

    for (const worker of unmarkedWorkers) {
      await dispatch(
        MARKATTENDANCE(
          {
            workerId: worker.id,
            date,
            status: "Present",
            note: ""
          },
          undefined,
          (message) => failures.push(message)
        )
      );
    }

    if (failures.length > 0) {
      setError(failures[0]);
    } else {
      setMessage("Attendance marked for all active workers.");
    }
  };

  const getWorkerName = (id) => {
    const worker = workers.find(
      (item) => String(item.id) === String(id)
    );

    return worker?.fullName || "Unknown Worker";
  };

  const selectedRecords = records.filter(
    (record) => record.date === date
  );

  const totalWages = wages.reduce(
    (total, worker) => total + worker.payable,
    0
  );
  const handlePayWages = (worker) => {
  if (!isAdmin) return;

  const expenseId = `wage-${worker.id}-${month}`;

  const alreadyPaid = expenses.some(
    (expense) => String(expense.id) === expenseId
  );

  if (alreadyPaid) {
    setError("This worker's wages are already paid.");
    return;
  }

  if (worker.payable <= 0) {
    setError("No wages are payable for this worker.");
    return;
  }

  const confirmed = window.confirm(
    `Pay Rs. ${worker.payable} to ${worker.fullName}?`
  );

  if (!confirmed) return;

  const today = getToday();

  dispatch(
    addExpense({
      id: expenseId,
      cropId: "",
      category: "Labour",
      amount: worker.payable,
      date: today,
      note: `Monthly wages - ${worker.fullName} - ${month}`,
      sourceType: "payroll",
      sourceId: `${worker.id}-${month}`
    })
  );

  setError("");
  setMessage("Wages paid and expense recorded!");
};
  const money = (amount) =>
    `Rs. ${Number(amount).toLocaleString("en-PK")}`;

  return (
    <Box sx={{ mt: 4 }}>

      {/* PAGE HEADING */}

      <Typography
        variant="h5"
        fontWeight={700}
        sx={{ color: "#183b29", mb: 1 }}
      >
        Daily Attendance & Payroll
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Record daily attendance and calculate monthly wages.
      </Typography>

      {/* ATTENDANCE SUMMARY */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)"
          },
          gap: 2,
          mb: 3
        }}
      >
        {[
          { label: "Present", value: daily.present },
          { label: "Absent", value: daily.absent },
          { label: "Half-day", value: daily.halfDay },
          { label: "Leave", value: daily.leave }
        ].map((item) => (
          <Paper
            key={item.label}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid #e3ebe4"
            }}
          >
            <Typography color="text.secondary">
              {item.label}
            </Typography>

            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ color: "#1b5e20" }}
            >
              {item.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* ATTENDANCE FORM */}

      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 3,
          border: "1px solid #e3ebe4"
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 3 }}
        >
          {editingId !== null
            ? "Edit Attendance"
            : "Mark Attendance"}
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
              gap: 2
            }}
          >
            <TextField
              type="date"
              label="Attendance Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true }
              }}
              fullWidth
              required
            />

            <TextField
              select
              label="Select Worker"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              fullWidth
              required
            >
              {workers.map((worker) => (
                <MenuItem
                  key={worker.id}
                  value={String(worker.id)}
                >
                  {worker.fullName}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Attendance Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
            >
              {statuses.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Notes (Optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              fullWidth
            />
          </Box>

          <Box
            sx={{
              mt: 3,
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap"
            }}
          >
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: "#1b5e20",
                textTransform: "none",
                "&:hover": { bgcolor: "#12451a" }
              }}
            >
              {editingId !== null
                ? "Update Attendance"
                : "Save Attendance"}
            </Button>

            {editingId === null && (
              <Button
                variant="outlined"
                onClick={handleMarkAllPresent}
                sx={{ textTransform: "none" }}
              >
                Mark All Present
              </Button>
            )}

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

      {/* DAILY ATTENDANCE RECORDS */}

      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: "1px solid #e3ebe4"
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 2 }}
        >
          Attendance Records — {date}
        </Typography>

        {selectedRecords.length === 0 ? (
          <Typography color="text.secondary">
            No attendance recorded for this date.
          </Typography>
        ) : (
          selectedRecords.map((record) => (
            <Box key={record.id}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 2,
                  py: 1.5
                }}
              >
                <Box>
                  <Typography fontWeight={600}>
                    {getWorkerName(record.workerId)}
                  </Typography>

                  {record.note && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {record.note}
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap"
                  }}
                >
                  <Chip
                    label={record.status}
                    color={
                      record.status === "Present"
                        ? "success"
                        : record.status === "Absent"
                        ? "error"
                        : "warning"
                    }
                    size="small"
                  />

                  {isAdmin && (
                    <>
                      <Button
                        size="small"
                        onClick={() => handleEdit(record)}
                      >
                        Edit
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(record)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </Box>
              </Box>

              <Divider />
            </Box>
          ))
        )}
      </Paper>

      {/* MONTHLY PAYROLL */}

      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #e3ebe4"
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 2 }}
        >
          Monthly Wage Summary
        </Typography>

        <TextField
          type="month"
          label="Select Month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          slotProps={{
            inputLabel: { shrink: true }
          }}
          sx={{ mb: 3, minWidth: 230 }}
        />

        <Box
          sx={{
            bgcolor: "#e8f5e9",
            borderRadius: 2,
            p: 2.5,
            mb: 3
          }}
        >
          <Typography color="text.secondary">
            Total Wages Payable
          </Typography>

          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: "#1b5e20" }}
          >
            {money(totalWages)}
          </Typography>
        </Box>

        {wages.map((worker) => (
          <Box key={worker.id} sx={{ mb: 2 }}>
            <Typography fontWeight={600}>
              {worker.fullName}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Present: {worker.presentDays} |
              Half-day: {worker.halfDays} |
              Absent: {worker.absentDays}
            </Typography>

            <Typography
              fontWeight={700}
              sx={{ color: "#1b5e20" }}
            >
              {money(worker.payable)}
            </Typography>
            {expenses.some(
  (expense) =>
    String(expense.id) === `wage-${worker.id}-${month}`
) ? (
  <Chip
    label="Paid"
    color="success"
    size="small"
    sx={{ mt: 1 }}
  />
) : (
  isAdmin &&
  worker.payable > 0 && (
    <Button
      variant="contained"
      size="small"
      onClick={() => handlePayWages(worker)}
      sx={{
        mt: 1,
        bgcolor: "#1b5e20",
        textTransform: "none",
        "&:hover": {
          bgcolor: "#12451a"
        }
      }}
    >
      Pay Wages
    </Button>
  )
)}

            <Divider sx={{ mt: 1.5 }} />
          </Box>
        ))}
      </Paper>

    </Box>
  );
}

export default AttendanceRegister;