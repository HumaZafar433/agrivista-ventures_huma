
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  TextField,
  Typography
} from "@mui/material";

const API = "http://localhost:5000/api/inventory";

const initial = {
  name: "",
  category: "Fertilizer",
  unit: "kg",
  quantity: "",
  minQty: ""
};


function getToken() {
  try {
    const session = JSON.parse(
      localStorage.getItem("agri_session") || "{}"
    );

    return session.token || "";
  } catch {
    return "";
  }
}


async function inventoryRequest(path = "", options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Login session missing. Please log in again."
    );
  }

  let response;

  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    });
  } catch {
    throw new Error(
      "Backend not reachable. Check port 5000."
    );
  }

  const result = await response.json().catch(() => null);

  if (
    !response.ok ||
    !result ||
    result.succeeded === false
  ) {
    throw new Error(
      result?.message ||
      `Inventory request failed (${response.status})`
    );
  }

  return result;
}

function parseHistory(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeItem(item) {
  return {
    ...item,
    name: item.item || "",
    category:
      item.type === "Seed"
        ? "Seeds"
        : item.type || "",
    quantity: Number(item.qty ?? 0),
    minQty: Number(item.minQty ?? 0),
    history: parseHistory(item.history)
  };
}

export default function Inventory() {
  const isAdmin = useSelector(
    (state) => state.auth.role === "Admin"
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(null);

  const [usage, setUsage] = useState(null);
  const [useAmount, setUseAmount] = useState("");
  const [useNote, setUseNote] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");


  const loadInventory = useCallback(
    async (showSpinner = true) => {
      if (showSpinner) {
        setLoading(true);
      }

      try {
        const result = await inventoryRequest();

        if (!Array.isArray(result.data)) {
          throw new Error(
            "Inventory API returned unexpected data."
          );
        }

        const records = result.data.map(normalizeItem);

        setItems(records);
        setError("");

        return records;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        if (showSpinner) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadInventory().catch(() => {});
  }, [loadInventory]);

  const lowStock = items.filter(
    (item) => item.quantity <= item.minQty
  );

  const usageCount = items.reduce(
    (total, item) => total + item.history.length,
    0
  );

  const shown = items.filter((item) =>
    `${item.name} ${item.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );


  const submit = async (event) => {
    event.preventDefault();

    if (saving) return;

    setError("");
    setNotice("");

    const quantity = Number(form.quantity);
    const minQty = Number(form.minQty);

    if (
      !form.name.trim() ||
      form.quantity === "" ||
      form.minQty === "" ||
      !Number.isFinite(quantity) ||
      !Number.isFinite(minQty) ||
      quantity < 0 ||
      minQty < 0
    ) {
      setError(
        "Enter a valid item name, quantity and minimum stock."
      );
      return;
    }

    if (editing !== null && !isAdmin) {
      setError("Only Admin can edit inventory.");
      return;
    }

    const payload = {
      item: form.name.trim(),
      type:
        form.category === "Seeds"
          ? "Seed"
          : form.category,
      qty: quantity,
      minQty,
      unit: form.unit
    };

    setSaving(true);

    try {
      if (editing !== null) {
        await inventoryRequest(`/${editing}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await inventoryRequest("", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }

      await loadInventory(false);

      setNotice(
        editing !== null
          ? "Inventory item updated successfully."
          : "Inventory item added successfully."
      );

      setForm(initial);
      setEditing(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const edit = (item) => {
    if (!isAdmin) return;

    setEditing(item.id);
    setError("");
    setNotice("");

    setForm({
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: String(item.quantity),
      minQty: String(item.minQty)
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };


  const remove = async (id) => {
    if (!isAdmin || saving) return;

    const confirmed = window.confirm(
      "Delete this inventory item?"
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await inventoryRequest(`/${id}`, {
        method: "DELETE"
      });

      await loadInventory(false);

      if (String(editing) === String(id)) {
        setEditing(null);
        setForm(initial);
      }

      setNotice(
        "Inventory item deleted successfully."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };


  const consume = async () => {
    if (!isAdmin || !usage || saving) return;

    setError("");
    setNotice("");

    const amount = Number(useAmount);

    const current = items.find(
      (item) =>
        String(item.id) === String(usage.id)
    );

    if (!current) {
      setError("Inventory item not found.");
      return;
    }

    if (
      useAmount === "" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      Math.round(amount * 100) / 100 !== amount ||
      amount > current.quantity
    ) {
      setError(
        "Enter a valid quantity (max 2 decimals) within available stock."
      );
      return;
    }

    const usageRecord = {
      amount,
      note: useNote.trim(),
      usedAt: new Date().toISOString()
    };

    const updatedQuantity = Number(
      (current.quantity - amount).toFixed(2)
    );

    let requestSucceeded = false;

    setSaving(true);

    try {
      // Existing backend update route
      await inventoryRequest(`/${current.id}`, {
        method: "PUT",
        body: JSON.stringify({
          qty: updatedQuantity,
          history: [
            ...current.history,
            usageRecord
          ]
        })
      });

      requestSucceeded = true;

      // Close dialog to prevent double deduction
      setUsage(null);
      setUseAmount("");
      setUseNote("");

      const latest = await loadInventory(false);

      const saved = latest.find(
        (item) =>
          String(item.id) === String(current.id)
      );

      const quantityOK =
        saved &&
        Math.abs(
          saved.quantity - updatedQuantity
        ) < 0.001;

      const historyOK =
        saved &&
        saved.history.some(
          (record) =>
            record.usedAt === usageRecord.usedAt
        );

      if (quantityOK && historyOK) {
        setNotice(
          "Stock usage and history saved successfully."
        );
      } else {
        setError(
          "Stock may already be deducted, but history was not verified. Check the database before trying again."
        );
      }
    } catch (err) {
      setUsage(null);
      setUseAmount("");
      setUseNote("");

      setError(
        requestSucceeded
          ? `Stock request succeeded but reload failed: ${err.message}. Refresh before trying again.`
          : `Stock request failed: ${err.message}. Refresh and check the quantity before trying again.`
      );
    } finally {
      setSaving(false);
    }
  };

  const fieldChange = (key) => (event) => {
    setForm((old) => ({
      ...old,
      [key]: event.target.value
    }));
  };

  const cardStyle = {
    p: 3,
    borderRadius: 3,
    border: "1px solid #e2ebe3"
  };


  return (
    <Box
      sx={{
        bgcolor: "#f4f8f4",
        minHeight: "80vh",
        py: 4
      }}
    >
      <Container maxWidth="xl">

        {/* HEADER */}

        <Typography
          variant="h4"
          fontWeight={700}
          color="#183b29"
        >
          Inputs Inventory
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 1, mb: 4 }}
        >
          Track seeds, fertilizer and pesticides,
          with low-stock alerts and usage history.
        </Typography>

        {/* LOADING */}

        {loading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2
            }}
          >
            <CircularProgress size={20} />

            <Typography variant="body2">
              Loading inventory...
            </Typography>
          </Box>
        )}

        {/* ERROR */}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() =>
                  loadInventory().catch(() => {})
                }
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* SUCCESS */}

        {notice && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            onClose={() => setNotice("")}
          >
            {notice}
          </Alert>
        )}

        {/* SUMMARY CARDS */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3,1fr)"
            },
            gap: 2,
            mb: 4
          }}
        >
          {[
            {
              title: "Inventory Items",
              count: items.length
            },
            {
              title: "Low / Out of Stock",
              count: lowStock.length
            },
            {
              title: "Stock Usage Records",
              count: usageCount
            }
          ].map((card) => (
            <Paper
              key={card.title}
              sx={cardStyle}
            >
              <Typography color="text.secondary">
                {card.title}
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
                color="#1b5e20"
              >
                {card.count}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* LOW STOCK ALERT */}

        {lowStock.length > 0 && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
          >
            {lowStock
              .map((item) => item.name)
              .join(", ")}{" "}
            {lowStock.length === 1
              ? "needs"
              : "need"}{" "}
            restocking.
          </Alert>
        )}

        {/* ADD / EDIT FORM */}

        <Paper
          sx={{
            ...cardStyle,
            p: { xs: 3, md: 4 },
            mb: 4
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ mb: 2 }}
          >
            {editing !== null
              ? "Edit Inventory Item"
              : "Add Inventory Item"}
          </Typography>

          <Box
            component="form"
            onSubmit={submit}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2,1fr)"
              },
              gap: 2
            }}
          >
            <TextField
              label="Item Name"
              required
              value={form.name}
              onChange={fieldChange("name")}
            />

            <TextField
              select
              label="Category"
              value={form.category}
              onChange={fieldChange("category")}
            >
              {[
                "Fertilizer",
                "Seeds",
                "Pesticide"
              ].map((value) => (
                <MenuItem
                  key={value}
                  value={value}
                >
                  {value}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Unit"
              value={form.unit}
              onChange={fieldChange("unit")}
            >
              {[
                "kg",
                "litres",
                "bags",
                "units"
              ].map((value) => (
                <MenuItem
                  key={value}
                  value={value}
                >
                  {value}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Current Quantity"
              required
              type="number"
              value={form.quantity}
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: "0.01"
                }
              }}
              onChange={fieldChange("quantity")}
            />

            <TextField
              label="Minimum Stock Alert Level"
              required
              type="number"
              value={form.minQty}
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: "0.01"
                }
              }}
              onChange={fieldChange("minQty")}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={saving || loading}
                sx={{
                  bgcolor: "#1b5e20"
                }}
              >
                {saving
                  ? "Saving..."
                  : editing !== null
                    ? "Save Changes"
                    : "Add Item"}
              </Button>

              {editing !== null && (
                <Button
                  disabled={saving}
                  onClick={() => {
                    setEditing(null);
                    setForm(initial);
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* INVENTORY RECORDS */}

        <Typography
          variant="h5"
          fontWeight={700}
          color="#183b29"
          sx={{ mb: 2 }}
        >
          Inventory Records
        </Typography>

        <TextField
          placeholder="Search inventory..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          fullWidth
          sx={{
            mb: 3,
            maxWidth: 500
          }}
        />

        {/* RECORD CARDS */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2,1fr)",
              lg: "repeat(3,1fr)"
            },
            gap: 2.5
          }}
        >
          {shown.map((item) => {
            const low =
              item.quantity <= item.minQty;

            return (
              <Paper
                key={item.id}
                sx={cardStyle}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                    mb: 2
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    {item.name}
                  </Typography>

                  <Chip
                    size="small"
                    label={
                      low
                        ? "Low Stock"
                        : "In Stock"
                    }
                    color={
                      low
                        ? "warning"
                        : "success"
                    }
                  />
                </Box>

                <Typography color="text.secondary">
                  {item.category} · {item.unit}
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight={700}
                  color="#1b5e20"
                  sx={{ my: 2 }}
                >
                  {item.quantity}{" "}

                  <Typography
                    component="span"
                    variant="body2"
                  >
                    {item.unit}
                  </Typography>
                </Typography>

                <Typography variant="body2">
                  Alert when stock ≤ {item.minQty}{" "}
                  {item.unit}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ my: 2 }}
                >
                  Usage entries:{" "}
                  {item.history.length}
                </Typography>

                {/* ACTION BUTTONS */}

                {isAdmin && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap"
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={saving}
                      onClick={() => edit(item)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      disabled={saving}
                      onClick={() => {
                        setUsage(item);
                        setError("");
                        setUseAmount("");
                        setUseNote("");
                      }}
                    >
                      Use Stock
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      disabled={saving}
                      onClick={() => remove(item.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                )}

                {/* USAGE HISTORY */}

                {item.history
                  .slice(-3)
                  .map((record, index) => (
                    <Typography
                      key={index}
                      variant="caption"
                      display="block"
                      sx={{
                        mt: 1,
                        color: "text.secondary"
                      }}
                    >
                      Used {record.amount}{" "}
                      {item.unit} on{" "}
                      {record.usedAt
                        ? new Date(
                            record.usedAt
                          ).toLocaleDateString()
                        : "Unknown date"}

                      {record.note
                        ? ` · ${record.note}`
                        : ""}
                    </Typography>
                  ))}
              </Paper>
            );
          })}
        </Box>

        {!loading &&
          !error &&
          shown.length === 0 && (
            <Typography
              sx={{ py: 4 }}
              color="text.secondary"
            >
              No matching inventory records.
            </Typography>
          )}

        {/* USE STOCK DIALOG */}

        <Dialog
          open={Boolean(usage)}
          onClose={() => {
            if (!saving) {
              setUsage(null);
              setError("");
            }
          }}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>
            Record Stock Usage
          </DialogTitle>

          <DialogContent
            sx={{
              display: "grid",
              gap: 2,
              pt: 2
            }}
          >
            <Typography color="text.secondary">
              {usage?.name}:{" "}
              {usage?.quantity}{" "}
              {usage?.unit} available
            </Typography>

            <TextField
              label="Quantity Used"
              type="number"
              value={useAmount}
              onChange={(event) =>
                setUseAmount(event.target.value)
              }
              slotProps={{
                htmlInput: {
                  min: 0.01,
                  step: "0.01"
                }
              }}
            />

            <TextField
              label="Purpose / Notes"
              value={useNote}
              onChange={(event) =>
                setUseNote(event.target.value)
              }
            />

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}
          </DialogContent>

          <DialogActions>
            <Button
              disabled={saving}
              onClick={() => {
                setUsage(null);
                setError("");
              }}
            >
              Cancel
            </Button>

            <Button
              disabled={saving}
              variant="contained"
              onClick={consume}
            >
              {saving
                ? "Saving..."
                : "Save Usage"}
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );
}
