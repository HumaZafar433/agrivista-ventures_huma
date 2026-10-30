import { Paper, Typography, Box, Chip, Button, Stack, Divider } from "@mui/material";
export default function MaintenanceLog({ services, items, isAdmin, onEdit, onDelete }) {
  const names = new Map(items.map(item => [String(item.id), item.name]));
  const sorted = [...services].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: "1px solid #dbe8dd", boxShadow: "none" }}>
      <Typography variant="h6" color="#183b29" fontWeight={700} mb={2}>Maintenance History</Typography>
      {sorted.length === 0 ? <Typography color="text.secondary">No services recorded yet.</Typography> : sorted.map(s =>
        <Box key={s.id} py={1.5}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "start", sm: "center" }} spacing={1}>
            <Box>
              <Typography fontWeight={700}>{names.get(String(s.equipmentId)) || "Unknown equipment"}</Typography>
              <Typography variant="body2" color="text.secondary">{s.date} • {s.description} • {s.performedBy}</Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={`Rs. ${Number(s.cost).toLocaleString("en-PK")}`} color="success" variant="outlined" size="small" />
              {isAdmin && <><Button size="small" onClick={() => onEdit(s)}>Edit</Button><Button size="small" color="error" onClick={() => onDelete(s)}>Delete</Button></>}
            </Stack>
          </Stack>
          <Divider sx={{ mt: 2 }} />
        </Box>)}
    </Paper>
  );
}
