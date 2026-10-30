import { useEffect, useState } from "react";
import { Paper, Typography, Box, TextField, MenuItem, Button, Stack } from "@mui/material";
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const empty = () => ({ equipmentId: "", date: today(), description: "", cost: "", performedBy: "" });
export default function MaintenanceForm({ items, editing, onSave, onCancel, saving }) {
  const [form, setForm] = useState(empty);
  useEffect(() => { setForm(editing ? { ...editing } : empty()); }, [editing]);
  const change = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: "1px solid #dbe8dd", boxShadow: "none" }}>
      <Typography variant="h6" color="#183b29" fontWeight={700} mb={2}>{editing ? "Edit Service" : "Record Maintenance"}</Typography>
      <Box component="form" onSubmit={e => { e.preventDefault(); onSave({ ...form, cost: Number(form.cost) }); }} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0,1fr))" }, gap: 2 }}>
        <TextField select label="Equipment" required value={form.equipmentId} onChange={e => change("equipmentId", e.target.value)}>
          {items.map(item => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
        </TextField>
        <TextField required type="date" label="Service Date" value={form.date} onChange={e => change("date", e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField required label="Service Description" value={form.description} onChange={e => change("description", e.target.value)} />
        <TextField required type="number" label="Service Cost (PKR)" value={form.cost} onChange={e => change("cost", e.target.value)} slotProps={{ htmlInput: { min: 0, step: 1 } }} />
        <TextField required label="Performed By" value={form.performedBy} onChange={e => change("performedBy", e.target.value)} />
        <Stack direction="row" spacing={1} alignItems="center">
          <Button type="submit" variant="contained" disabled={saving || items.length === 0} sx={{ bgcolor: "#1b5e20", textTransform: "none" }}>{editing ? "Save Service" : "Add Service"}</Button>
          {editing && <Button onClick={onCancel}>Cancel</Button>}
        </Stack>
      </Box>
    </Paper>
  );
}
