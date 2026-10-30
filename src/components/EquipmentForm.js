import { useEffect, useState } from "react";
import { Paper, Box, Typography, TextField, MenuItem, Button } from "@mui/material";
const empty = { name: "", type: "Tractor", purchaseDate: "", status: "Active", lastServiceDate: "", serviceIntervalDays: "30", notes: "" };
const types = ["Tractor", "Water Pump", "Sprayer", "Harvester", "Other"];

export default function EquipmentForm({ editing, onSave, onCancel, saving }) {
  const [form, setForm] = useState(empty);
  useEffect(() => { setForm(editing ? { ...editing } : { ...empty }); }, [editing]);
  const change = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const save = e => { e.preventDefault(); onSave({ ...form, serviceIntervalDays: Number(form.serviceIntervalDays) }); };
  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: "1px solid #dbe8dd", boxShadow: "none" }}>
      <Typography variant="h6" fontWeight={700} color="#183b29" mb={2}>
        {editing ? "Edit Equipment" : "Register Equipment"}
      </Typography>
      <Box component="form" onSubmit={save} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
        <TextField required label="Equipment Name" value={form.name} onChange={e => change("name", e.target.value)} />
        <TextField select required label="Type" value={form.type} onChange={e => change("type", e.target.value)}>
          {types.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
        <TextField required type="date" label="Purchase Date" value={form.purchaseDate} onChange={e => change("purchaseDate", e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField select required label="Status" value={form.status} onChange={e => change("status", e.target.value)}>
          {["Active", "Under Repair", "Idle"].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
        <TextField required type="date" label="Last Service Date" value={form.lastServiceDate} onChange={e => change("lastServiceDate", e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField required type="number" label="Service Interval (days)" value={form.serviceIntervalDays} onChange={e => change("serviceIntervalDays", e.target.value)} slotProps={{ htmlInput: { min: 1, step: 1 } }} />
        <TextField label="Notes" value={form.notes || ""} onChange={e => change("notes", e.target.value)} multiline rows={2} sx={{ gridColumn: { md: "1 / -1" } }} />
        <Box sx={{ display: "flex", gap: 1, gridColumn: { md: "1 / -1" } }}>
          <Button type="submit" variant="contained" disabled={saving} sx={{ bgcolor: "#1b5e20", textTransform: "none" }}>{editing ? "Save Changes" : "Add Equipment"}</Button>
          {editing && <Button onClick={onCancel}>Cancel</Button>}
        </Box>
      </Box>
    </Paper>
  );
}
