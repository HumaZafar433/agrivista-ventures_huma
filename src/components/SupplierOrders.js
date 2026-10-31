import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from "@mui/material";

import { setOrders } from "../store/reducers/ordersReducer";


const formatMoney = (amount) =>
  `Rs. ${Number(amount).toLocaleString("en-PK", {
    maximumFractionDigits: 2
  })}`;

const hasPrice = (order) => {
  const total = Number(order.totalAmount);

  return Number.isFinite(total) && total > 0;
};


const getPricePerKg = (order) => {
  const quantity = Number(order.quantity);

  if (hasPrice(order) && quantity > 0) {
    return Number(order.totalAmount) / quantity;
  }

  return null;
};

function SupplierOrders({ orders = [], onMarkDelivered }) {
  const dispatch = useDispatch();

  const role = useSelector((state) => state.auth.role);

  const isAdmin = role === "Admin";

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleOpenPrice = (order) => {
    if (!isAdmin) return;

    const existingPrice = getPricePerKg(order);

    setSelectedOrder(order);

    setPrice(
      existingPrice === null
        ? ""
        : String(Number(existingPrice.toFixed(2)))
    );

    setError("");
    setMessage("");
  };

  const handleClosePrice = () => {
    setSelectedOrder(null);
    setPrice("");
    setError("");
  };

  const handleSavePrice = () => {
    if (!isAdmin || !selectedOrder) return;

    const sellingPrice = Number(price);
    const quantity = Number(selectedOrder.quantity);

    if (
      price.trim() === "" ||
      !Number.isFinite(sellingPrice) ||
      sellingPrice <= 0
    ) {
      setError("Please enter a valid selling price.");
      return;
    }

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      setError("Order quantity is invalid.");
      return;
    }

   
    const totalAmount = Number(
      (quantity * sellingPrice).toFixed(2)
    );

   
    const updatedOrders = orders.map((order) => {
      if (
        String(order.id) === String(selectedOrder.id)
      ) {
        return {
          ...order,
          pricePerKg: sellingPrice,
          totalAmount
        };
      }

      return order;
    });

    
    dispatch(setOrders(updatedOrders));

    setMessage(
      `Selling price saved successfully. Order total: ${formatMoney(
        totalAmount
      )}`
    );

    handleClosePrice();
  };

  const handleMarkDelivered = (order) => {
    if (!isAdmin) return;

    if (!hasPrice(order)) {
      handleOpenPrice(order);
      setError(
        "Please add the selling price before marking this order as delivered."
      );
      return;
    }

    if (typeof onMarkDelivered === "function") {
      onMarkDelivered(order.id);
    }
  };

  const renderActions = (order, mobile = false) => (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        alignItems: "center",
        justifyContent: mobile ? "flex-start" : "center"
      }}
    >
      {isAdmin && (
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleOpenPrice(order)}
          sx={{
            borderColor: "#1b5e20",
            color: "#1b5e20",
            textTransform: "none",
            fontWeight: 600
          }}
        >
          {hasPrice(order) ? "Edit Price" : "Add Price"}
        </Button>
      )}

      {order.status === "Pending" && isAdmin && (
        <Button
          size="small"
          variant="contained"
          onClick={() => handleMarkDelivered(order)}
          sx={{
            bgcolor: "#1b5e20",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              bgcolor: "#12451a"
            }
          }}
        >
          Mark Delivered
        </Button>
      )}

      {!isAdmin && (
        <Typography
          variant="body2"
          color="text.secondary"
        >
          View Only
        </Typography>
      )}
    </Box>
  );

  const unpricedOrders = orders.filter(
    (order) =>
      order.status === "Delivered" &&
      !hasPrice(order)
  );

  return (
    <Box sx={{ width: "100%" }}>


      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: "#183b29" }}
        >
          Supplier Orders
        </Typography>

        <Typography color="text.secondary">
          Track customer orders, deliveries and selling prices.
        </Typography>
      </Box>

      {message && (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      )}

      {unpricedOrders.length > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {unpricedOrders.length} delivered order(s) have no
          selling price. Add their prices to complete
          Revenue and Profit & Loss calculations.
        </Alert>
      )}

      {orders.length === 0 && (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            border: "1px solid #e3ebe4",
            boxShadow: "none"
          }}
        >
          <Typography color="text.secondary">
            No orders available yet.
          </Typography>
        </Paper>
      )}


      {orders.length > 0 && (
        <Box
          sx={{
            display: {
              xs: "grid",
              md: "none"
            },
            gridTemplateColumns: "1fr",
            gap: 2
          }}
        >
          {orders.map((order) => (
            <Paper
              key={order.id}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid #e3ebe4",
                boxShadow: "0 4px 16px rgba(0,0,0,0.05)"
              }}
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
                  fontWeight={700}
                  sx={{ color: "#183b29" }}
                >
                  {order.name}
                </Typography>

                <Chip
                  label={order.status}
                  color={
                    order.status === "Delivered"
                      ? "success"
                      : "warning"
                  }
                  size="small"
                />
              </Box>

              <Typography sx={{ mb: 1 }}>
                <b>Crop:</b> {order.crop}
              </Typography>

              <Typography sx={{ mb: 1 }}>
                <b>Quantity:</b> {order.quantity} kg
              </Typography>

              <Typography sx={{ mb: 1 }}>
                <b>Order Date:</b>{" "}
                {order.orderDate || "Not recorded"}
              </Typography>

              <Typography sx={{ mb: 1 }}>
                <b>Price per kg:</b>{" "}
                {hasPrice(order)
                  ? formatMoney(getPricePerKg(order))
                  : "Not recorded"}
              </Typography>

              <Typography
                fontWeight={700}
                sx={{
                  color: "#1b5e20",
                  mb: 2,
                  fontSize: 19
                }}
              >
                Order Total:{" "}
                {hasPrice(order)
                  ? formatMoney(order.totalAmount)
                  : "Not available"}
              </Typography>

              {renderActions(order, true)}
            </Paper>
          ))}
        </Box>
      )}


      {orders.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{
            display: {
              xs: "none",
              md: "block"
            },
            borderRadius: 3,
            border: "1px solid #e3ebe4",
            boxShadow: "0 4px 18px rgba(0,0,0,0.05)"
          }}
        >
          <Table sx={{ minWidth: 1050 }}>

            <TableHead sx={{ bgcolor: "#e8f5e9" }}>
              <TableRow>
                <TableCell><b>Buyer</b></TableCell>
                <TableCell><b>Crop</b></TableCell>
                <TableCell><b>Quantity</b></TableCell>
                <TableCell><b>Order Date</b></TableCell>
                <TableCell><b>Price/kg</b></TableCell>
                <TableCell><b>Total Amount</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell align="center">
                  <b>Actions</b>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>

                  <TableCell>
                    {order.name}
                  </TableCell>

                  <TableCell>
                    {order.crop}
                  </TableCell>

                  <TableCell>
                    {order.quantity} kg
                  </TableCell>

                  <TableCell>
                    {order.orderDate || "Not recorded"}
                  </TableCell>

                  <TableCell>
                    {hasPrice(order)
                      ? formatMoney(getPricePerKg(order))
                      : (
                        <Chip
                          label="Missing"
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                  </TableCell>

                  <TableCell>
                    <Typography
                      fontWeight={700}
                      sx={{
                        color: hasPrice(order)
                          ? "#1b5e20"
                          : "#d97706"
                      }}
                    >
                      {hasPrice(order)
                        ? formatMoney(order.totalAmount)
                        : "Not available"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={order.status}
                      color={
                        order.status === "Delivered"
                          ? "success"
                          : "warning"
                      }
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    {renderActions(order)}
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}


      <Dialog
        open={Boolean(selectedOrder)}
        onClose={handleClosePrice}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            color: "#183b29",
            fontWeight: 700
          }}
        >
          {selectedOrder && hasPrice(selectedOrder)
            ? "Edit Selling Price"
            : "Add Selling Price"}
        </DialogTitle>

        <DialogContent>

          {selectedOrder && (
            <Box sx={{ mt: 1 }}>

              <Typography sx={{ mb: 1 }}>
                <b>Crop:</b> {selectedOrder.crop}
              </Typography>

              <Typography sx={{ mb: 2 }}>
                <b>Quantity:</b>{" "}
                {selectedOrder.quantity} kg
              </Typography>

              {error && (
                <Alert
                  severity="warning"
                  sx={{ mb: 2 }}
                >
                  {error}
                </Alert>
              )}

              <TextField
                label="Selling Price per kg (PKR)"
                type="number"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setError("");
                }}
                slotProps={{
                  htmlInput: {
                    min: 0.01,
                    step: 0.01
                  }
                }}
                fullWidth
                required
              />

              {price !== "" &&
                Number(price) > 0 && (
                  <Paper
                    sx={{
                      bgcolor: "#e8f5e9",
                      p: 2,
                      mt: 3,
                      borderRadius: 2
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Calculated Order Total
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={700}
                      sx={{ color: "#1b5e20" }}
                    >
                      {formatMoney(
                        Number(price) *
                        Number(selectedOrder.quantity)
                      )}
                    </Typography>
                  </Paper>
                )}

            </Box>
          )}

        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleClosePrice}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSavePrice}
            variant="contained"
            sx={{
              bgcolor: "#1b5e20",
              textTransform: "none",
              "&:hover": {
                bgcolor: "#12451a"
              }
            }}
          >
            Save Price
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default SupplierOrders;