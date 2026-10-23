import { useSelector } from "react-redux";
import { Box, Container, Paper, Typography, Chip, Alert, Divider } from "@mui/material";
import { selectFinancialSummary } from "../store/selectors/financialSelectors";

const money = n => `Rs. ${Number(n || 0).toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;

function ComparisonBar({ label, value, max, color }) {
  return <Box sx={{ mb: 2.5 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 1 }}>
      <Typography fontWeight={600}>{label}</Typography>
      <Typography fontWeight={700}>{money(value)}</Typography>
    </Box>
    <Box sx={{ height: 12, bgcolor: "#e7ede7", borderRadius: 6, overflow: "hidden" }}>
      <Box sx={{ height: "100%", width: `${max > 0 ? Math.min(100, 100 * value / max) : 0}%`, bgcolor: color, borderRadius: 6 }} />
    </Box>
  </Box>;
}

export default function ProfitLoss() {
  const summary = useSelector(selectFinancialSummary);
  const max = Math.max(1, summary.revenue, summary.expenses);
  return <Box sx={{ bgcolor: "#f4f8f4", py: 4, minHeight: "80vh" }}>
    <Container maxWidth="xl">
      <Typography variant="h4" fontWeight={700} sx={{ color: "#183b29" }}>Profit & Loss</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>Income from delivered, priced orders compared with recorded farm expenses.</Typography>
      {summary.unpricedCount > 0 && <Alert severity="warning" sx={{ mb: 3 }}>
        {summary.unpricedCount} older delivered order(s) have no selling price. Their income is unknown and is NOT included here, so the profit figure is incomplete until their prices are entered.
      </Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" }, gap: 2.5, mb: 4 }}>
        {[
          { label: "Confirmed Revenue", val: summary.revenue, color: "#1b5e20" },
          { label: "Recorded Expenses", val: summary.expenses, color: "#bf6418" },
          { label: summary.net >= 0 ? "Net Profit" : "Net Loss", val: Math.abs(summary.net), color: summary.net >= 0 ? "#1b5e20" : "#c62828" }
        ].map(card => <Paper key={card.label} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2ebe3", boxShadow: "0 4px 18px rgba(0,0,0,.04)" }}>
          <Typography color="text.secondary">{card.label}</Typography>
          <Typography variant="h4" fontWeight={700} sx={{ mt: 1, color: card.color }}>{money(card.val)}</Typography>
        </Paper>)}
      </Box>
      <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, mb: 4, border: "1px solid #e2ebe3" }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Revenue vs Expenses</Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>Only Delivered orders with a recorded selling price count as revenue.</Typography>
        <ComparisonBar label="Revenue" value={summary.revenue} max={max} color="#2e7d32" />
        <ComparisonBar label="Expenses" value={summary.expenses} max={max} color="#ef8f38" />
      </Paper>
      <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #e2ebe3" }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Profit / Loss by Crop</Typography>
        {summary.byCrop.length === 0 && <Typography color="text.secondary">Add a crop to see its financial summary.</Typography>}
        {summary.byCrop.map(crop => <Box key={crop.id} sx={{ py: 2, borderBottom: "1px solid #edf1ed", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box><Typography fontWeight={700}>{crop.name}</Typography><Typography variant="body2" color="text.secondary">Sales: {money(crop.sales)} · Expenses: {money(crop.spent)}</Typography></Box>
          <Chip label={`${crop.net >= 0 ? "Profit" : "Loss"}: ${money(Math.abs(crop.net))}`} color={crop.net >= 0 ? "success" : "error"} />
        </Box>)}
        <Divider sx={{ my: 2 }}/>
        <Typography color="text.secondary" variant="caption">Figures are based on records saved in this browser. Pending orders do not count as sales. This is not an audited financial statement.</Typography>
      </Paper>
    </Container>
  </Box>;
}
