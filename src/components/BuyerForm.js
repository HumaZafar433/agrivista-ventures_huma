import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Avatar,
  MenuItem
} from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faUserPlus,
  faUpload
} from "@fortawesome/free-solid-svg-icons";

import { addOrder } from "../store/reducers/ordersReducer";

const todayIso = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
};

function BuyerForm({ buyers = [], onSaveBuyer }) {
  const dispatch = useDispatch();

  const crops = useSelector((state) => state.crops || []);
  const orders = useSelector((state) => state.orders || []);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [cnic, setCnic] = useState("");
  const [photo, setPhoto] = useState("");

  const [cropId, setCropId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saleDate, setSaleDate] = useState(todayIso());

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedCrop = crops.find(
    (crop) => String(crop.id) === String(cropId)
  );

  const bookedQuantity = selectedCrop
    ? orders
        .filter(
          (order) =>
            String(order.cropId) === String(selectedCrop.id)
        )
        .reduce(
          (total, order) =>
            total + Number(order.quantity || 0),
          0
        )
    : 0;

  const availableStock = selectedCrop
    ? Math.max(
        0,
        Number(selectedCrop.harvestQty || 0) - bookedQuantity
      )
    : 0;

  const formatCnic = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 13);

    if (digits.length > 12) {
      return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
    }

    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }

    return digits;
  };

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPG and PNG images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      setError("Photo must be 1 MB or less.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPhoto(String(reader.result));
      setError("");
    };

    reader.onerror = () => {
      setError("Unable to load photo.");
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const saleQty = Number(quantity);

    if (!/^[A-Za-z ]{3,}$/.test(cleanName)) {
      setError("Enter a valid name with at least 3 letters.");
      return;
    }

    if (!/^03\d{9}$/.test(phone)) {
      setError("Enter a valid 11-digit phone number.");
      return;
    }

    if (!/^\d{5}-\d{7}-\d$/.test(cnic)) {
      setError("Enter a valid 13-digit CNIC.");
      return;
    }

    const duplicate = buyers.some(
      (buyer) =>
        String(buyer.cnic || "").replace(/\D/g, "") ===
        cnic.replace(/\D/g, "")
    );

    if (duplicate) {
      setError("This CNIC is already registered.");
      return;
    }

    if (!photo) {
      setError("Please upload buyer photo.");
      return;
    }

    if (!selectedCrop) {
      setError("Please select a crop.");
      return;
    }

    if (
      !Number.isInteger(saleQty) ||
      saleQty <= 0 ||
      saleQty > availableStock
    ) {
      setError(
        `Invalid quantity. Available stock: ${availableStock} kg.`
      );
      return;
    }

    if (!saleDate) {
      setError("Please select a date.");
      return;
    }

    if (typeof onSaveBuyer !== "function") {
      setError("Unable to save buyer.");
      return;
    }

    const buyerId = Date.now().toString();

    const newBuyer = {
      id: buyerId,
      name: cleanName,
      phone,
      businessName: businessName.trim(),
      cnic,
      imageBase64: photo,
      cropId: selectedCrop.id,
      crop: selectedCrop.name,
      field: selectedCrop.field,
      quantity: saleQty,
      date: saleDate
    };

    onSaveBuyer(newBuyer);

    dispatch(
      addOrder({
        id: `buyer-order-${buyerId}`,
        buyerId,
        name: cleanName,
        cropId: selectedCrop.id,
        crop: selectedCrop.name,
        field: selectedCrop.field,
        quantity: saleQty,
        orderDate: saleDate,
        status: "Pending",
        pricePerKg: null,
        totalAmount: null
      })
    );

    setName("");
    setPhone("");
    setBusinessName("");
    setCnic("");
    setPhoto("");
    setCropId("");
    setQuantity("");
    setSaleDate(todayIso());

    event.currentTarget.reset();

    setSuccess("Buyer registered and order created successfully.");
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid #e3ebe4",
        boxShadow: "0 5px 24px rgba(20,60,30,0.06)"
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: "#183b29", mb: 1 }}
        >
          <FontAwesomeIcon
            icon={faUserPlus}
            style={{ marginRight: 12, color: "#2e7d32" }}
          />
          Register New Buyer
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Enter buyer information and crop sale details.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)"
              },
              gap: 2,
              mb: 3
            }}
          >
            <TextField
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Contact Number"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value.replace(/\D/g, "").slice(0, 11)
                )
              }
              required
              fullWidth
            />

            <TextField
              label="Business / Mill Name (Optional)"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              fullWidth
            />

            <TextField
              label="CNIC Number"
              placeholder="12345-1234567-1"
              value={cnic}
              onChange={(e) =>
                setCnic(formatCnic(e.target.value))
              }
              required
              fullWidth
            />

            <TextField
              select
              label="Select Crop"
              value={cropId}
              onChange={(e) => {
                setCropId(e.target.value);
                setQuantity("");
              }}
              required
              fullWidth
            >
              {crops.map((crop) => (
                <MenuItem
                  key={crop.id}
                  value={String(crop.id)}
                >
                  {crop.name} — {crop.field}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Quantity (kg)"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: availableStock,
                  step: 1
                }
              }}
              required
              fullWidth
            />

            <TextField
              label="Sale Date"
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true }
              }}
              required
              fullWidth
            />
          </Box>

          {selectedCrop && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Available Stock: {availableStock} kg
            </Alert>
          )}

          <Box
            sx={{
              border: "1px dashed #b5d2bc",
              borderRadius: 2,
              p: 3,
              mb: 3
            }}
          >
            <Typography fontWeight={600} sx={{ mb: 2 }}>
              Buyer Photo
            </Typography>

            <Button
              component="label"
              variant="outlined"
              startIcon={
                <FontAwesomeIcon icon={faUpload} />
              }
            >
              Select Photo

              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                hidden
                onChange={handlePhoto}
              />
            </Button>

            <Typography
              variant="caption"
              sx={{ display: "block", mt: 1 }}
            >
              JPG or PNG — Maximum 1 MB
            </Typography>

            {photo && (
              <Avatar
                src={photo}
                variant="rounded"
                sx={{ width: 90, height: 90, mt: 2 }}
              />
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              bgcolor: "#1b5e20",
              textTransform: "none",
              "&:hover": {
                bgcolor: "#12451a"
              }
            }}
          >
            Register Buyer
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default BuyerForm;