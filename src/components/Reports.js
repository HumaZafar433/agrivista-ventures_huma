
import { useState } from "react";
import { useSelector } from "react-redux";

import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";

const monthOf = (date) =>
  String(date || "").slice(0, 7);

const cash = (n) =>
  `Rs. ${Number(n || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 2
  })}`;

const safeCsv = (value) => {
  let str = String(value ?? "");

  if (/^[=+\-@\t\r\n]/.test(str)) {
    str = "'" + str;
  }

  return `"${str.replace(/"/g, '""')}"`;
};

const formatMonth = (month) => {
  if (!/^\d{4}-\d{2}$/.test(month)) return month;

  const [year, m] = month.split("-").map(Number);

  return new Date(year, m - 1, 1).toLocaleDateString(
    "en-PK",
    { month: "long", year: "numeric" }
  );
};


const formatActivity = (entry) => {
  const entity = String(entry.entity || "Record")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const actionNames = {
    add: "Added",
    edit: "Updated",
    delete: "Deleted"
  };

  const action = actionNames[entry.action];

  if (action) {
    return `${entity} ${action}`;
  }

  return entry.description || "Record changed";
};

const formatActivityDate = (entry) => {
  const value = entry.timestamp || entry.when || entry.createdAt;

  if (!value) return "Unknown";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toLocaleString("en-PK");
};

export default function Reports() {
  const orders = useSelector((s) => s.orders || []);
  const expenses = useSelector((s) => s.expenses || []);
  const crops = useSelector((s) => s.crops || []);
  const log = useSelector((s) => s.activity || []);

  const [month, setMonth] = useState(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
  });

  const sales = orders.filter(
    (order) =>
      monthOf(order.orderDate) === month &&
      order.status === "Delivered"
  );

  const spent = expenses.filter(
    (expense) => monthOf(expense.date) === month
  );

  const pricedSales = sales.filter(
    (order) =>
      Number.isFinite(Number(order.totalAmount)) &&
      Number(order.totalAmount) > 0
  );

  const revenue = pricedSales.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0
  );

  const expenseTotal = spent.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const unpriced = sales.length - pricedSales.length;

  const harvestTotal = crops.reduce(
    (sum, crop) => sum + Number(crop.harvestQty || 0),
    0
  );

  const net = revenue - expenseTotal;

  const getCropName = (cropId) => {
    const crop = crops.find(
      (item) => String(item.id) === String(cropId)
    );

    return crop
      ? `${crop.name} — ${crop.field}`
      : "Unknown Crop";
  };

  const exportCsv = () => {
    const rows = [
      ["AgriVista Monthly Report", month],
      [],
      ["Metric", "Value"],
      ["Recorded harvest stock (current)", harvestTotal],
      ["Delivered orders in month", sales.length],
      ["Priced delivered revenue (PKR)", revenue],
      ["Expenses in month (PKR)", expenseTotal],
      ["Net (PKR)", net],
      ["Delivered orders without prices", unpriced],
      [],
      [
        "Order Date",
        "Crop",
        "Quantity kg",
        "Total Amount PKR",
        "Status"
      ],
      ...sales.map((order) => [
        order.orderDate,
        order.crop || getCropName(order.cropId),
        order.quantity,
        Number(order.totalAmount) > 0
          ? order.totalAmount
          : "Unpriced",
        order.status
      ]),
      [],
      [
        "Expense Date",
        "Crop",
        "Category",
        "Amount PKR",
        "Note"
      ],
      ...spent.map((expense) => [
        expense.date,
        getCropName(expense.cropId),
        expense.category,
        expense.amount,
        expense.note || ""
      ])
    ];

    const csv = rows
      .map((row) => row.map(safeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(
      ["\uFEFF", csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `agrivista-report-${month}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const reportCards = [
    ["Current Harvest (kg)", harvestTotal],
    ["Delivered Orders", sales.length],
    ["Priced Sales", cash(revenue)],
    ["Expenses", cash(expenseTotal)]
  ];

  const activityEntries = [...log]
    .sort((a, b) => {
      const dateA = new Date(
        a.timestamp || a.when || a.createdAt || 0
      ).getTime();

      const dateB = new Date(
        b.timestamp || b.when || b.createdAt || 0
      ).getTime();

      return (dateB || 0) - (dateA || 0);
    })
    .slice(0, 250);

  return (
    <Box
      className="report-print-area"
      sx={{
        bgcolor: "#f4f8f4",
        py: 4,
        minHeight: "80vh"
      }}
    >
      <Container maxWidth="xl">
        <Box className="report-financial-section">
          <Box className="report-print-header">
            <Typography
              variant="overline"
              sx={{
                color: "#2e7d32",
                fontWeight: 700,
                letterSpacing: 2
              }}
            >
              AGRIVISTA VENTURES
            </Typography>

            <Typography
              variant="h4"
              fontWeight={700}
              color="#183b29"
            >
              Monthly Financial Report
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Reporting Period: {formatMonth(month)}
            </Typography>
          </Box>

          <Typography
            className="report-screen-title"
            variant="h4"
            fontWeight={700}
            color="#183b29"
          >
            Reports & Activity Log
          </Typography>

          <Typography
            className="report-screen-title"
            color="text.secondary"
            sx={{ mt: 1, mb: 4 }}
          >
            Monthly performance and a record of changes
            made in the application.
          </Typography>

          <Paper
            className="report-no-print"
            sx={{
              p: 3,
              border: "1px solid #e2ebe3",
              borderRadius: 3,
              mb: 3
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "center"
              }}
            >
              <TextField
                label="Report Month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true }
                }}
              />

              <Button
                variant="contained"
                onClick={exportCsv}
                sx={{ bgcolor: "#1b5e20" }}
              >
                Export CSV
              </Button>

              <Button
                variant="outlined"
                onClick={() => window.print()}
              >
                Print / Save as PDF
              </Button>
            </Box>
          </Paper>

          {unpriced > 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {unpriced} delivered order(s) in this
              month have no price. Reported revenue
              and net profit are incomplete.
            </Alert>
          )}

          <Box
            className="report-metrics"
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                md: "repeat(4,1fr)"
              },
              gap: 2,
              mb: 4
            }}
          >
            {reportCards.map(([label, value]) => (
              <Paper
                key={label}
                sx={{
                  p: 3,
                  border: "1px solid #e2ebe3",
                  borderRadius: 3
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {label}
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="#1b5e20"
                  sx={{ mt: 1 }}
                >
                  {value}
                </Typography>
              </Paper>
            ))}
          </Box>

          <Paper
            className="report-net-card"
            sx={{
              p: 3,
              border: "1px solid #e2ebe3",
              borderRadius: 3,
              mb: 4
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Monthly Net: {cash(net)}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Net = priced Delivered sales − expenses.
              Current harvest shown separately is NOT
              monthly production.
            </Typography>
          </Paper>

          <Box className="report-print-summary">
            <Typography fontWeight={700}>
              Financial Summary
            </Typography>

            <Typography>
              Revenue: {cash(revenue)}
            </Typography>

            <Typography>
              Expenses: {cash(expenseTotal)}
            </Typography>

            <Typography fontWeight={700}>
              {net >= 0 ? "Net Profit" : "Net Loss"}:
              {" "}{cash(Math.abs(net))}
            </Typography>
          </Box>

          <Typography
            className="report-print-disclaimer"
            variant="caption"
            color="text.secondary"
          >
            Financial figures are based on recorded
            transactions. Only delivered orders with
            selling prices count as revenue. This is
            not an audited financial statement.
          </Typography>
        </Box>

        <Box className="report-activity-section">
          <Box className="report-activity-print-header">
            <Typography
              variant="overline"
              sx={{
                color: "#2e7d32",
                fontWeight: 700,
                letterSpacing: 2
              }}
            >
              AGRIVISTA VENTURES
            </Typography>

            <Typography
              variant="h5"
              fontWeight={700}
              color="#183b29"
            >
              Activity Log
            </Typography>

            <Typography color="text.secondary">
              Application Activity Records
            </Typography>
          </Box>

          <Typography
            className="report-activity-screen-title"
            variant="h5"
            fontWeight={700}
            color="#183b29"
            sx={{ mb: 2 }}
          >
            Activity Log
          </Typography>

          <TableContainer
            component={Paper}
            sx={{
              border: "1px solid #e2ebe3",
              borderRadius: 3
            }}
          >
            <Table size="small">
              <TableHead sx={{ bgcolor: "#e8f5e9" }}>
                <TableRow>
                  <TableCell>
                    <b>When</b>
                  </TableCell>

                  <TableCell>
                    <b>Who</b>
                  </TableCell>

                  <TableCell>
                    <b>Action</b>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {activityEntries.map((entry, index) => {
                  const username =
                    entry.user ||
                    entry.by ||
                    "Unknown";

                  const role =
                    entry.role &&
                    entry.role !== "User"
                      ? ` (${entry.role})`
                      : "";

                  return (
                    <TableRow
                      key={entry.id || index}
                    >
                      <TableCell>
                        {formatActivityDate(entry)}
                      </TableCell>

                      <TableCell>
                        {username}{role}
                      </TableCell>

                      <TableCell>
                        {formatActivity(entry)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {!activityEntries.length && (
            <Typography
              color="text.secondary"
              sx={{ p: 3 }}
            >
              No activity records available.
            </Typography>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mt: 2
            }}
          >
            Activity records are loaded from
            PostgreSQL. Showing up to 250 most
            recent records. Only actions connected
            to backend activity logging are recorded.
          </Typography>
        </Box>

        <Typography
          className="report-no-print"
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 2
          }}
        >
          Financial figures use Orders, Crops and
          Expenses loaded from PostgreSQL.
          Reports can be exported as CSV or
          printed to PDF.
        </Typography>
      </Container>
    </Box>
  );
}
