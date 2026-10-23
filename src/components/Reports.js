import { useState } from "react";
import { useSelector } from "react-redux";
import { Alert, Box, Button, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";

const monthOf = date => String(date || "").slice(0, 7);
const cash = n => `Rs. ${Number(n || 0).toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
const safeCsv = v => {
  let str = String(v ?? "");
  if (/^[=+@\-\t\r]/.test(str)) str = "'" + str;
  return '"' + str.replace(/"/g, '""') + '"';
};

export default function Reports() {
  const orders = useSelector(s => s.orders || []);
  const expenses = useSelector(s => s.expenses || []);
  const crops = useSelector(s => s.crops || []);
  const log = useSelector(s => s.activity || []);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const sales = orders.filter(o => monthOf(o.orderDate) === month && o.status === "Delivered");
  const spent = expenses.filter(e => monthOf(e.date) === month);
  const revenue = sales.filter(o => Number(o.totalAmount) > 0).reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const expenseTotal = spent.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const unpriced = sales.filter(o => !(Number(o.totalAmount) > 0)).length;
  const harvestTotal = crops.reduce((sum, c) => sum + Number(c.harvestQty || 0), 0);

  const exportCsv = () => {
    const rows = [
      ["AgriVista Monthly Report", month],
      ["Metric", "Value"],
      ["Recorded harvest stock (current)", harvestTotal],
      ["Delivered orders in month", sales.length],
      ["Priced delivered revenue (PKR)", revenue],
      ["Expenses in month (PKR)", expenseTotal],
      ["Net (incomplete if unpriced sales exist)", revenue - expenseTotal],
      ["Delivered orders without prices", unpriced],
      [], ["Order Date", "Crop", "Quantity kg", "Total Amount PKR", "Status"],
      ...sales.map(o => [o.orderDate, o.crop, o.quantity, o.totalAmount ?? "Unpriced", o.status]),
      [], ["Expense Date", "Category", "Amount PKR", "Note"],
      ...spent.map(e => [e.date, e.category, e.amount, e.note || ""])
    ];
    const csv = rows.map(row => row.map(safeCsv).join(",")).join("\r\n");
    const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `agrivista-report-${month}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return <Box sx={{ bgcolor: "#f4f8f4", py: 4, minHeight: "80vh" }}><Container maxWidth="xl">
    <Typography variant="h4" fontWeight={700} color="#183b29">Reports & Activity Log</Typography>
    <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>Monthly performance and a record of changes made in the application.</Typography>
    <Paper sx={{ p: 3, border: "1px solid #e2ebe3", borderRadius: 3, mb: 3 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
        <TextField label="Report Month" type="month" value={month} onChange={e => setMonth(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <Button variant="contained" onClick={exportCsv} sx={{ bgcolor: "#1b5e20" }}>Export CSV</Button>
        <Button variant="outlined" onClick={() => window.print()}>Print / Save as PDF</Button>
      </Box>
    </Paper>
    {unpriced > 0 && <Alert severity="warning" sx={{ mb: 3 }}>{unpriced} delivered order(s) in this month have no price; reported revenue and net are incomplete.</Alert>}
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" }, gap: 2, mb: 4 }}>
      {[
        ["Current Harvest (kg)", harvestTotal],
        ["Delivered Orders", sales.length],
        ["Priced Sales", cash(revenue)],
        ["Expenses", cash(expenseTotal)]
      ].map(([label, val]) => <Paper key={label} sx={{ p: 3, border: "1px solid #e2ebe3", borderRadius: 3 }}><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="h5" fontWeight={700} color="#1b5e20" sx={{ mt: 1 }}>{val}</Typography></Paper>)}
    </Box>
    <Paper sx={{ p: 3, border: "1px solid #e2ebe3", borderRadius: 3, mb: 4 }}>
      <Typography variant="h6" fontWeight={700}>Monthly Net: {cash(revenue - expenseTotal)}</Typography>
      <Typography variant="body2" color="text.secondary">Net = priced Delivered sales − expenses. Current harvest shown separately is NOT monthly production.</Typography>
    </Paper>
    <Typography variant="h5" fontWeight={700} color="#183b29" sx={{ mb: 2 }}>Activity Log</Typography>
    <TableContainer component={Paper} sx={{ border: "1px solid #e2ebe3", borderRadius: 3 }}>
      <Table size="small"><TableHead sx={{ bgcolor: "#e8f5e9" }}><TableRow><TableCell><b>When</b></TableCell><TableCell><b>Who</b></TableCell><TableCell><b>Action</b></TableCell></TableRow></TableHead>
        <TableBody>{log.slice(0, 100).map(entry => <TableRow key={entry.id}><TableCell>{new Date(entry.when).toLocaleString()}</TableCell><TableCell>{entry.by} ({entry.role})</TableCell><TableCell>{entry.description}</TableCell></TableRow>)}</TableBody>
      </Table>
      {!log.length && <Typography color="text.secondary" sx={{ p: 3 }}>New activity will appear here when crops, buyers, orders, tasks, expenses or inventory change.</Typography>}
    </TableContainer>
    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>Data comes from this browser's localStorage; it is not a tamper-proof audit log. Reports can be downloaded as CSV or printed to PDF.</Typography>
  </Container></Box>;
}
