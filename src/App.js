import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWheatAwn } from "@fortawesome/free-solid-svg-icons";

import Dashboard from "./components/Dashboard";
import Crops from "./components/Crops";
import Buyers from "./components/Buyers";
import OrderForm from "./components/OrderForm";
import HarvestSummary from "./components/HarvestSummary";
import CuttingSchedule from "./components/CuttingSchedule";
import SupplierOrders from "./components/SupplierOrders";
import Tasks from "./components/Tasks";
import Expenses from "./components/Expenses";
import Inventory from "./components/Inventory";

import {
  setCrops as saveCropsToRedux
} from "./store/reducers/cropsReducer";

import {
  setBuyers as saveBuyersToRedux,
  addBuyer as addBuyerToRedux
} from "./store/reducers/buyersReducer";

import {
  addOrder as addOrderToRedux,
  markDelivered as markDeliveredInRedux
} from "./store/reducers/ordersReducer";

import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from "react-router-dom";

import {
  useSelector,
  useDispatch
} from "react-redux";

import LoginForm from "./components/auth/LoginForm";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { logout } from "./store/reducers/authReducer";
import ProfitLoss from "./components/ProfitLoss";
import Reports from "./components/Reports";


function MainWebsite() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const role = useSelector(
    (state) => state.auth.role
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };



  const location = useLocation();

const page =
  location.pathname.split("/")[1] || "dashboard";


  const crops = useSelector(
    (state) => state.crops
  );

  const setCrops = (updatedCrops) => {

    const newCrops =
      typeof updatedCrops === "function"
        ? updatedCrops(crops)
        : updatedCrops;

    dispatch(saveCropsToRedux(newCrops));
  };


  // Buyers Data - Redux

  const buyers = useSelector(
    (state) => state.buyers
  );

  const setBuyers = (updatedBuyers) => {

    const newBuyers =
      typeof updatedBuyers === "function"
        ? updatedBuyers(buyers)
        : updatedBuyers;

    dispatch(saveBuyersToRedux(newBuyers));
  };


  // Orders Data - Redux

  const orders = useSelector(
    (state) => state.orders
  );


  // Add New Order

  const addOrder = (newOrder) => {
    dispatch(addOrderToRedux(newOrder));
  };


  const markDelivered = (id) => {

    if (role !== "Admin") {
      return;
    }

    dispatch(markDeliveredInRedux(id));
  };



  const saveBuyer = (newBuyer) => {
    dispatch(addBuyerToRedux(newBuyer));
  };



  const navItems = [
    { label: "Dashboard", value: "dashboard" },
    { label: "Crops", value: "crops" },
    { label: "Buyers", value: "buyers" },
    { label: "Place Order", value: "place-order" },
    { label: "Harvest & Orders", value: "orders" },
    { label: "Farm Tasks", value: "tasks" },
    { label: "Expenses", value: "expenses" },
    { label: "Inventory", value: "inventory" },
    { label: "Profit & Loss", value: "profit-loss" },
    { label: "Reports", value: "reports" }
  ];


  return (

    <Box
      sx={{
        backgroundColor: "#f4f8f4",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
      }}
    >

      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#1b5e20",
          borderBottom: "1px solid rgba(255,255,255,0.12)"
        }}
      >

        <Toolbar
          sx={{
            minHeight: 72,
            px: { xs: 2, md: 3 },
            py: 1,
            gap: 2,
            flexWrap: "wrap"
          }}
        >

      

          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              fontSize: 21,
              minWidth: 210,
              letterSpacing: "-0.3px",
              display: "flex",
              alignItems: "center"
            }}
          >

            <FontAwesomeIcon
              icon={faWheatAwn}
              style={{
                marginRight: 12,
                fontSize: 23
              }}
            />

            AgriVista Ventures

          </Typography>


          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 0.5
            }}
          >

            {navItems.map((item) => (

              <Button
                key={item.value}
                color="inherit"
                onClick={() => navigate(`/${item.value}`)}
                sx={{
                  textTransform: "none",
                  fontSize: 14,

                  fontWeight:
                    page === item.value ? 700 : 500,

                  backgroundColor:
                    page === item.value
                      ? "rgba(255,255,255,0.14)"
                      : "transparent",

                  borderRadius: 2,
                  px: 1.8,
                  py: 1,

                  "&:hover": {
                    backgroundColor:
                      "rgba(255,255,255,0.12)"
                  }
                }}
              >
                {item.label}
              </Button>

            ))}


            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                ml: { xs: 0, md: 1.5 },
                pl: { xs: 1, md: 2 },
                borderLeft:
                  "1px solid rgba(255,255,255,0.25)"
              }}
            >

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >

                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#a5d6a7"
                  }}
                />

                <Typography
                  sx={{
                    color: "#e8f5e9",
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  {role || "User"}
                </Typography>

              </Box>


              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  textTransform: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  px: 2,
                  py: 0.8,
                  minWidth: "auto",
                  borderRadius: 2,

                  border:
                    "1px solid rgba(255,255,255,0.35)",

                  "&:hover": {
                    backgroundColor:
                      "rgba(255,255,255,0.12)"
                  }
                }}
              >
                Log out
              </Button>

            </Box>

          </Box>

        </Toolbar>

      </AppBar>



      <Box sx={{ flexGrow: 1 }}>


        {page === "dashboard" && (
          <Dashboard
            crops={crops}
            orders={orders}
          />
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


        {page === "tasks" && (
          <Tasks />
        )}


        {page === "expenses" && (
          <Expenses />
        )}


        {page === "inventory" && (
          <Inventory />
        )}
       {page === "profit-loss" && (
        <ProfitLoss />
        )}

       {page === "reports" && (
         <Reports />
        )}


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

            <Box
              sx={{
                width: "100%",
                mt: 3
              }}
            >
              <SupplierOrders
                orders={orders}
                onMarkDelivered={markDelivered}
              />
            </Box>

          </Container>

        )}

      </Box>


      <Box
        component="footer"
        sx={{
          backgroundColor: "#1b5e20",
          color: "white",
          textAlign: "center",
          py: 3,
          mt: 4
        }}
      >

        <Typography variant="body2">
          © 2026 AgriVista Ventures
        </Typography>

        <Typography variant="caption">
          Smart Farming & Crop Management
        </Typography>

      </Box>

    </Box>
  );
}


function App() {

  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );

  return (

    <Routes>

      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <LoginForm />
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

export default App;