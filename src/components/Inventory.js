import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Box, Button, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { addInventoryItem, updateInventoryItem, deleteInventoryItem, useInventoryItem as recordStockUsage } from "../store/reducers/inventoryReducer";
import { selectLowStock } from "../store/selectors/financialSelectors";

const initial = { name: "", category: "Fertilizer", unit: "kg", quantity: "", minQty: "" };

export default function Inventory() {
  const dispatch = useDispatch();
  const items = useSelector(state => state.inventory || []);
  const lowStock = useSelector(selectLowStock);
  const isAdmin = useSelector(state => state.auth.role === "Admin");
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [usage, setUsage] = useState(null);
  const [useAmount, setUseAmount] = useState("");
  const [useNote, setUseNote] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const submit = e => {
    e.preventDefault(); setError("");
    const quantity = Number(form.quantity), minQty = Number(form.minQty);
    if (!form.name.trim() || !Number.isFinite(quantity) || quantity < 0 || !Number.isFinite(minQty) || minQty < 0 || form.quantity === "" || form.minQty === "") {
      setError("Enter a valid item name, quantity and minimum stock."); return;
    }
    if (editing !== null && !isAdmin) return;
    const payload = { ...form, name: form.name.trim(), quantity, minQty, id: editing || `${Date.now()}-${Math.random().toString(36).slice(2,6)}` };
    dispatch(editing !== null ? updateInventoryItem(payload) : addInventoryItem({ ...payload, history: [] }));
    setForm(initial); setEditing(null);
  };

  const edit = item => { if (!isAdmin) return; setEditing(item.id); setForm({ name: item.name, category: item.category, unit: item.unit, quantity: String(item.quantity), minQty: String(item.minQty) }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const remove = id => { if (isAdmin && window.confirm("Delete this inventory item?")) dispatch(deleteInventoryItem(id)); };
  const consume = () => {
    if (!isAdmin || !usage) return;
    const n = Number(useAmount);
    if (!Number.isFinite(n) || n <= 0 || n > Number(usage.quantity)) { setError("Usage must be greater than zero and cannot exceed available stock."); return; }
    dispatch(recordStockUsage({ id: usage.id, amount: n, note: useNote.trim(), usedAt: new Date().toISOString() }));
    setUsage(null); setUseAmount(""); setUseNote(""); setError("");
  };

  const shown = items.filter(i => `${i.name} ${i.category}`.toLowerCase().includes(search.toLowerCase()));
  return <Box sx={{ bgcolor: "#f4f8f4", minHeight: "80vh", py: 4 }}><Container maxWidth="xl">
    <Typography variant="h4" fontWeight={700} color="#183b29">Inputs Inventory</Typography>
    <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>Track seeds, fertilizer and pesticides, with low-stock alerts and usage history.</Typography>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" }, gap: 2, mb: 4 }}>
      {[{ title: "Inventory Items", count: items.length }, { title: "Low / Out of Stock", count: lowStock.length }, { title: "Stock Usage Records", count: items.reduce((n, i) => n + (i.history || []).length, 0) }].map(c => <Paper key={c.title} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2ebe3" }}><Typography color="text.secondary">{c.title}</Typography><Typography variant="h4" fontWeight={700} color="#1b5e20">{c.count}</Typography></Paper>)}
    </Box>
    {lowStock.length > 0 && <Alert severity="warning" sx={{ mb: 3 }}>{lowStock.map(i => i.name).join(", ")} {lowStock.length === 1 ? "needs" : "need"} restocking.</Alert>}
    <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #e2ebe3", mb: 4 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{editing ? "Edit Inventory Item" : "Add Inventory Item"}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={submit} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" }, gap: 2 }}>
        <TextField label="Item Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <TextField select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{["Fertilizer","Seeds","Pesticide","Other"].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField>
        <TextField select label="Unit" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>{["kg","litres","bags","units"].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField>
        <TextField label="Current Quantity" required type="number" value={form.quantity} slotProps={{ htmlInput: { min: 0, step: "0.01" } }} onChange={e => setForm({ ...form, quantity: e.target.value })} />
        <TextField label="Minimum Stock Alert Level" required type="number" value={form.minQty} slotProps={{ htmlInput: { min: 0, step: "0.01" } }} onChange={e => setForm({ ...form, minQty: e.target.value })} />
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}><Button type="submit" variant="contained" sx={{ bgcolor: "#1b5e20" }}>{editing ? "Save Changes" : "Add Item"}</Button>{editing && <Button onClick={() => { setEditing(null); setForm(initial); }}>Cancel</Button>}</Box>
      </Box>
    </Paper>
    <Typography variant="h5" fontWeight={700} color="#183b29" sx={{ mb: 2 }}>Inventory Records</Typography>
    <TextField placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} fullWidth sx={{ mb: 3, maxWidth: 500 }} />
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)", lg: "repeat(3,1fr)" }, gap: 2.5 }}>
      {shown.map(item => { const low = Number(item.quantity) <= Number(item.minQty); return <Paper key={item.id} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2ebe3" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 1 }}><Typography variant="h6" fontWeight={700}>{item.name}</Typography><Chip label={low ? "Low Stock" : "In Stock"} color={low ? "warning" : "success"} size="small" /></Box>
        <Typography color="text.secondary">{item.category} · {item.unit}</Typography>
        <Typography variant="h4" fontWeight={700} color="#1b5e20" sx={{ my: 2 }}>{item.quantity} <Typography component="span" variant="body2">{item.unit}</Typography></Typography>
        <Typography variant="body2">Alert when stock ≤ {item.minQty} {item.unit}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>Usage entries: {(item.history || []).length}</Typography>
        {isAdmin && <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}><Button variant="outlined" size="small" onClick={() => edit(item)}>Edit</Button><Button variant="outlined" size="small" onClick={() => { setUsage(item); setError(""); }}>Use Stock</Button><Button variant="outlined" size="small" color="error" onClick={() => remove(item.id)}>Delete</Button></Box>}
        {(item.history || []).slice(-3).map((h, idx) => <Typography key={idx} variant="caption" display="block" sx={{ mt: 1, color: "text.secondary" }}>Used {h.amount} {item.unit} on {new Date(h.usedAt).toLocaleDateString()} {h.note ? `· ${h.note}` : ""}</Typography>)}
      </Paper>; })}
    </Box>
    {shown.length === 0 && <Typography sx={{ py: 4 }} color="text.secondary">No matching inventory records.</Typography>}
    <Dialog open={!!usage} onClose={() => setUsage(null)} fullWidth maxWidth="xs"><DialogTitle>Record Stock Usage</DialogTitle><DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
      <Typography color="text.secondary">{usage?.name}: {usage?.quantity} {usage?.unit} available</Typography>
      <TextField label="Quantity Used" type="number" value={useAmount} onChange={e => setUseAmount(e.target.value)} slotProps={{ htmlInput: { min: 0.01, step: "0.01" } }} />
      <TextField label="Purpose / Notes" value={useNote} onChange={e => setUseNote(e.target.value)} />
      {error && <Alert severity="error">{error}</Alert>}
    </DialogContent><DialogActions><Button onClick={() => setUsage(null)}>Cancel</Button><Button onClick={consume} variant="contained">Save Usage</Button></DialogActions></Dialog>
  </Container></Box>;
}
