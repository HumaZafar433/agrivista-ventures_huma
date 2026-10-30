import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Container, Typography, Paper, Alert, Snackbar } from "@mui/material";
import { GETEQUIPMENT, ADDEQUIPMENT, UPDATEEQUIPMENT, REMOVEEQUIPMENT } from "../app/redux/actions/equipment";
import { GETMAINTENANCE, ADDSERVICE, UPDATESERVICE, REMOVESERVICE } from "../app/redux/actions/maintenance";
import { selectEquipmentWithService, selectEquipmentStats, selectServiceDue } from "../app/redux/selectors/equipment";
import EquipmentForm from "./EquipmentForm";
import EquipmentTable from "./EquipmentTable";
import MaintenanceForm from "./MaintenanceForm";
import MaintenanceLog from "./MaintenanceLog";
import ConfirmModal from "./ConfirmModal";

function Equipment() {
  const dispatch = useDispatch();
  const role = useSelector(s => s.auth?.role);
  const isAdmin = role === "Admin";
  const items = useSelector(selectEquipmentWithService);
  const stats = useSelector(selectEquipmentStats);
  const due = useSelector(selectServiceDue);
  const services = useSelector(s => s.maintenance?.services || []);
  const busy = useSelector(s => Boolean(s.equipment?.loading || s.maintenance?.loading));
  const error = useSelector(s => s.equipment?.error || s.maintenance?.error);
  const [notice, setNotice] = useState("");
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [confirm, setConfirm] = useState(null);
  useEffect(() => { dispatch(GETEQUIPMENT()); dispatch(GETMAINTENANCE()); }, [dispatch]);
  const done = msg => { setNotice(msg); setEditingEquipment(null); setEditingService(null); };
  const saveEquipment = data => {
    if (editingEquipment && !isAdmin) return;
    dispatch(editingEquipment ? UPDATEEQUIPMENT(data, () => done("Equipment updated.")) : ADDEQUIPMENT(data, () => done("Equipment added.")));
  };
  const saveService = data => {
    if (editingService && !isAdmin) return;
    dispatch(editingService ? UPDATESERVICE(data, () => done("Maintenance updated.")) : ADDSERVICE(data, () => done("Maintenance saved.")));
  };
  const deleteItem = () => {
    if (!isAdmin || !confirm) return;
    const current = confirm;
    setConfirm(null);
    if (current.type === "equipment") dispatch(REMOVEEQUIPMENT(current.record.id, () => done("Equipment deleted.")));
    if (current.type === "maintenance") dispatch(REMOVESERVICE(current.record.id, () => done("Service deleted.")));
  };
  const card = (label, value) => <Paper key={label} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dbe8dd", boxShadow: "none" }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="h4" fontWeight={700} mt={0.5} color="#1b5e20">{value}</Typography>
  </Paper>;
  return (
    <Box sx={{ bgcolor: "#f4f8f4", py: 4, minHeight: "85vh" }}>
      <Container maxWidth="xl">
        <Typography variant="h4" color="#183b29" fontWeight={700}>Equipment & Maintenance</Typography>
        <Typography color="text.secondary" mb={3}>Register machinery, monitor service schedules and track repair costs.</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,minmax(0,1fr))", lg: "repeat(5,minmax(0,1fr))" }, gap: 2, mb: 3 }}>
          {[["Machines", stats.total], ["Active", stats.active], ["Under Repair", stats.repair], ["Idle", stats.idle], ["Service Alerts", stats.due]].map(([label, value]) => card(label, value))}
        </Box>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid #dbe8dd", boxShadow: "none" }}>
          <Typography fontWeight={700} variant="h6" mb={2} color="#183b29">Upcoming Services</Typography>
          {due.length === 0 ? <Typography color="text.secondary">No equipment registered yet.</Typography> : due.map(item =>
            <Typography key={item.id} variant="body2" sx={{ py: 0.6 }} color={item.serviceStatus === "Overdue" ? "error.main" : "text.primary"}>
              <strong>{item.name}</strong> — {item.nextServiceDate} ({item.serviceStatus})
            </Typography>)}
        </Paper>
        <Box sx={{ display: "grid", gap: 3 }}>
          <EquipmentForm editing={editingEquipment} onSave={saveEquipment} onCancel={() => setEditingEquipment(null)} saving={busy} />
          <EquipmentTable items={items} isAdmin={isAdmin} onEdit={setEditingEquipment} onDelete={record => setConfirm({ type: "equipment", record })} />
          <MaintenanceForm items={items} editing={editingService} onSave={saveService} onCancel={() => setEditingService(null)} saving={busy} />
          <MaintenanceLog services={services} items={items} isAdmin={isAdmin} onEdit={setEditingService} onDelete={record => setConfirm({ type: "maintenance", record })} />
        </Box>
        <ConfirmModal open={Boolean(confirm)} onCancel={() => setConfirm(null)} onConfirm={deleteItem}
          title={`Delete ${confirm?.type === "equipment" ? "equipment" : "maintenance record"}?`}
          description={`Remove ${confirm?.record?.name || confirm?.record?.description || "this record"}? This cannot be undone.`} />
        <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice("")} message={notice} />
      </Container>
    </Box>
  );
}
export default Equipment;
