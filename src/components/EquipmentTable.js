import { Box, Paper, Typography, Chip, Button, TextField, MenuItem, Stack } from "@mui/material";
import { useState } from "react";

export default function EquipmentTable({ items, onEdit, onDelete, isAdmin }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const visible = [...items].filter(item =>
    (item.name.toLowerCase().includes(search.toLowerCase()) || item.type.toLowerCase().includes(search.toLowerCase())) &&
    (status === "All" || item.status === status) && (type === "All" || item.type === type)
  ).sort((a, b) => a.daysLeft - b.daysLeft);
  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: "1px solid #dbe8dd", boxShadow: "none" }}>
      <Typography variant="h6" fontWeight={700} mb={2} color="#183b29">Equipment Registry</Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
        <TextField label="Search equipment" size="small" value={search} onChange={e => setSearch(e.target.value)} sx={{ flex: 1 }} />
        <TextField select label="Status" size="small" value={status} onChange={e => setStatus(e.target.value)} sx={{ minWidth: 170 }}>
          {["All", "Active", "Under Repair", "Idle"].map(x => <MenuItem key={x} value={x}>{x === "All" ? "All statuses" : x}</MenuItem>)}
        </TextField>
        <TextField select label="Type" size="small" value={type} onChange={e => setType(e.target.value)} sx={{ minWidth: 170 }}>
          {["All", "Tractor", "Water Pump", "Sprayer", "Harvester", "Other"].map(x => <MenuItem key={x} value={x}>{x === "All" ? "All types" : x}</MenuItem>)}
        </TextField>
      </Stack>
      {visible.length === 0 ? <Typography color="text.secondary" py={2}>No equipment matches your filters.</Typography> :
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0,1fr))", xl: "repeat(3, minmax(0,1fr))" }, gap: 2 }}>
          {visible.map(item => <Paper key={item.id} variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: "#fafcf9" }}>
            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Typography fontWeight={700} sx={{ overflowWrap: "anywhere" }}>{item.name}</Typography>
              <Chip label={item.status} size="small" color={item.status === "Under Repair" ? "error" : item.status === "Active" ? "success" : "default"} />
            </Stack>
            <Typography variant="body2" color="text.secondary">{item.type} • Purchased {item.purchaseDate}</Typography>
            <Typography variant="body2" mt={1}>Last service: <strong>{item.lastServiceDate}</strong></Typography>
            <Typography variant="body2">Next service: <strong>{item.nextServiceDate}</strong></Typography>
            <Box mt={1}><Chip size="small" label={item.serviceStatus === "Overdue" ? `Overdue by ${Math.abs(item.daysLeft)} day(s)` : item.serviceStatus === "Due Soon" ? `Due in ${item.daysLeft} day(s)` : "Service on schedule"}
              color={item.serviceStatus === "Overdue" ? "error" : item.serviceStatus === "Due Soon" ? "warning" : "success"} /></Box>
            {isAdmin && <Stack direction="row" spacing={1} mt={2}>
              <Button variant="outlined" size="small" onClick={() => onEdit(item)}>Edit</Button>
              <Button variant="outlined" size="small" color="error" onClick={() => onDelete(item)}>Delete</Button>
            </Stack>}
          </Paper>)}
        </Box>}
    </Paper>
  );
}
