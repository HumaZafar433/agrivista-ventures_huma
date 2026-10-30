import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

export default function ConfirmModal({ open, title, description, onCancel, onConfirm, busy = false }) {
  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{title || "Confirm deletion"}</DialogTitle>
      <DialogContent><DialogContentText>{description || "This action cannot be undone."}</DialogContentText></DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error" disabled={busy}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
}
