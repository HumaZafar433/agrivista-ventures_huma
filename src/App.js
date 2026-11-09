
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Container } from "@mui/material";

import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from "react-router-dom";

import SidebarLayout from "./components/SidebarLayout";

import Dashboard from "./components/Dashboard";
import DashboardExtras from "./components/DashboardExtras";
import Crops from "./components/Crops";
import Buyers from "./components/Buyers";
import OrderForm from "./components/OrderForm";
import HarvestSummary from "./components/HarvestSummary";
import CuttingSchedule from "./components/CuttingSchedule";
import SupplierOrders from "./components/SupplierOrders";
import Tasks from "./components/Tasks";
import Expenses from "./components/Expenses";
import Inventory from "./components/Inventory";
import Workers from "./components/Workers";
import Equipment from "./components/Equipment";
import ProfitLoss from "./components/ProfitLoss";
import Reports from "./components/Reports";

import LoginForm from "./components/auth/LoginForm";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import {
  setCrops as saveCropsToRedux
} from "./store/reducers/cropsReducer";

import {
  setBuyers as saveBuyersToRedux,
  addBuyer as addBuyerToRedux
} from "./store/reducers/buyersReducer";

import {
  addOrder as addOrderToRedux,
  markDelivered as markDeliveredInRedux,
  setOrders as setOrdersFromDatabase
} from "./store/reducers/ordersReducer";

import {
  setExpensesFromDatabase
} from "./store/reducers/expensesReducer";

import {
  setActivityFromDatabase
} from "./store/reducers/activityReducer";

import { logout } from "./store/reducers/authReducer";

const API = "http://localhost:5000";

function getSession() {
  try {
    return JSON.parse(
      localStorage.getItem("agri_session") || "{}"
    );
  } catch {
    return {};
  }
}

function MainWebsite() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const role = useSelector((state) => state.auth.role);
  const crops = useSelector((state) => state.crops);
  const buyers = useSelector((state) => state.buyers);
  const orders = useSelector((state) => state.orders);

  const page =
    location.pathname.split("/")[1] || "dashboard";


  useEffect(() => {
    const session = getSession();

    if (!session.token) return;

    let mounted = true;

    const loadData = async (
      endpoint,
      reduxAction,
      format = (rows) => rows
    ) => {
      try {
        const response = await fetch(
          `${API}/api/${endpoint}`,
          {
            headers: {
              Authorization: `Bearer ${session.token}`
            }
          }
        );

        const result = await response.json();

        if (!response.ok || !result.succeeded) {
          throw new Error(
            result.message ||
            `Failed to load ${endpoint}`
          );
        }

        const records = Array.isArray(result.data)
          ? result.data
          : [];

        if (mounted) {
          dispatch(reduxAction(format(records)));
        }
      } catch (error) {
        console.error(
          `${endpoint} API error:`,
          error.message
        );
      }
    };

    loadData("crops", saveCropsToRedux);
    loadData("buyers", saveBuyersToRedux);

    loadData(
      "orders",
      setOrdersFromDatabase,
      (records) =>
        records.map((order) => ({
          ...order,
          name: order.Buyer?.name || "",
          crop: order.Crop?.name || "",
          field: order.Crop?.field || "",
          pricePerKg: Number(order.pricePerKg || 0),
          totalAmount: Number(order.totalAmount || 0),
          quantity: Number(order.quantity || 0)
        }))
    );

    loadData(
      "expenses",
      setExpensesFromDatabase,
      (records) =>
        records.map((expense) => ({
          ...expense,
          amount: Number(expense.amount || 0)
        }))
    );

    loadData(
      "activities",
      setActivityFromDatabase
    );

    return () => {
      mounted = false;
    };
  }, [dispatch]);


  const setCrops = async (updatedCrops) => {
    const nextCrops =
      typeof updatedCrops === "function"
        ? updatedCrops(crops)
        : updatedCrops;

    if (!Array.isArray(nextCrops)) return;

    const added = nextCrops.find(
      (item) => !crops.some(
        (old) => String(old.id) === String(item.id)
      )
    );

    const removed = crops.find(
      (item) => !nextCrops.some(
        (current) => String(current.id) === String(item.id)
      )
    );

    const edited = nextCrops.find((item) => {
      const old = crops.find(
        (c) => String(c.id) === String(item.id)
      );

      return old && [
        "name", "field", "cuttingDate",
        "healthScore", "harvestQty"
      ].some(
        (key) => String(old[key] ?? "") !==
                 String(item[key] ?? "")
      );
    });

    if (!added && !removed && !edited) return;

    try {
      const session = JSON.parse(
        localStorage.getItem("agri_session") || "{}"
      );

      if (!session.token) {
        throw new Error("Login session missing.");
      }

      const base = "http://localhost:5000/api/crops";

      const method = added
        ? "POST"
        : removed
          ? "DELETE"
          : "PUT";

      const url = added
        ? base
        : `${base}/${removed ? removed.id : edited.id}`;

      let payload = added || edited;

      if (added) {
        const {
          id,
          createdAt,
          updatedAt,
          createdBy,
          ...clean
        } = added;

        payload = clean;
      }

      if (payload) {
        const score = Number(payload.healthScore);

        payload = {
          ...payload,
          healthScore: score,
          harvestQty: Number(payload.harvestQty),
          status: score >= 80
            ? "Healthy"
            : score >= 50
              ? "Needs Attention"
              : "Critical"
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/json"
        },
        ...(method !== "DELETE"
          ? { body: JSON.stringify(payload) }
          : {})
      });

      const result = await response.json();

      if (
        !response.ok ||
        !result.succeeded ||
        (method !== "DELETE" && !result.data?.id)
      ) {
        throw new Error(
          result.message || "Request failed."
        );
      }

      const savedCrops = added
        ? [...crops, result.data]
        : removed
          ? crops.filter(
              (c) => String(c.id) !== String(removed.id)
            )
          : crops.map(
              (c) => String(c.id) === String(edited.id)
                ? result.data
                : c
            );

      dispatch(saveCropsToRedux(savedCrops));

    } catch (error) {
      window.alert(
        "Crop database save failed: " + error.message
      );
    }
  };

  const setBuyers = (updatedBuyers) => {
    const newBuyers =
      typeof updatedBuyers === "function"
        ? updatedBuyers(buyers)
        : updatedBuyers;

    dispatch(saveBuyersToRedux(newBuyers));
  };

  const addOrder = (newOrder) => {
    dispatch(addOrderToRedux(newOrder));
  };

  const markDelivered = async (id) => {
    if (role !== "Admin") return;

    try {
      const session = getSession();

      const response = await fetch(
        `${API}/api/orders/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`
          },
          body: JSON.stringify({
            status: "Delivered"
          })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.succeeded) {
        throw new Error(
          result.message || "Update failed"
        );
      }

      dispatch(markDeliveredInRedux(id));
    } catch (error) {
      alert(
        "Order update failed: " + error.message
      );
    }
  };

  const saveBuyer = async (newBuyer) => {
    const session = getSession();

    const response = await fetch(
      `${API}/api/buyers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({
          ...newBuyer,
          id: undefined
        })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.succeeded) {
      throw new Error(
        result.message || "Buyer save failed"
      );
    }

    dispatch(addBuyerToRedux(result.data));

    return result.data;
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  // -----------------------------------------
  // ORIGINAL PAGE CONTENT INSIDE NEW LAYOUT
  // -----------------------------------------

  return (
    <SidebarLayout
      role={role}
      onLogout={handleLogout}
    >
      {page === "dashboard" && (
        <>
          <Dashboard
            crops={crops}
            orders={orders}
          />

          <DashboardExtras
            onOpenEquipment={() =>
              navigate("/equipment")
            }
          />
        </>
      )}

      {page === "crops" && (
        <Crops
          crops={crops}
          setCrops={setCrops}
        />
      )}

      {page === "buyers" && (
        <Buyers
          buyers={buyers}
          onSaveBuyer={saveBuyer}
          setBuyers={setBuyers}
        />
      )}

      {page === "place-order" && (
        <OrderForm
          buyers={buyers}
          crops={crops}
          orders={orders}
          onAddOrder={addOrder}
        />
      )}

      {page === "tasks" && <Tasks />}

      {page === "expenses" && <Expenses />}

      {page === "inventory" && <Inventory />}

      {page === "workers" && <Workers />}

      {page === "equipment" && <Equipment />}

      {page === "profit-loss" && <ProfitLoss />}

      {page === "reports" && <Reports />}

      {page === "orders" && (
        <Container
          maxWidth="xl"
          sx={{
            py: 4,
            px: { xs: 2, md: 4 }
          }}
        >
          <HarvestSummary
            crops={crops}
            buyers={buyers}
            orders={orders}
          />

          <CuttingSchedule crops={crops} />

          <Box sx={{ mt: 3 }}>
            <SupplierOrders
              orders={orders}
              onMarkDelivered={markDelivered}
            />
          </Box>
        </Container>
      )}
    </SidebarLayout>
  );
}


export default function App() {
  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <LoginForm />
          )
        }
      />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainWebsite />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
