
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Avatar,
  Drawer,
  IconButton,
  Tooltip
} from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faBars,
  faXmark,
  faWheatAwn,
  faRightFromBracket,
  faChartPie,
  faSeedling,
  faUsers,
  faCartShopping,
  faClipboardList,
  faWallet,
  faBoxesStacked,
  faUserGroup,
  faTractor,
  faChartLine,
  faFileLines
} from "@fortawesome/free-solid-svg-icons";

import "./Navbar.css";


const NAV_LINKS = [
  {
    label: "Dashboard",
    path: "dashboard",
    icon: faChartPie
  },
  {
    label: "Crops",
    path: "crops",
    icon: faSeedling
  },
  {
    label: "Buyers",
    path: "buyers",
    icon: faUsers
  },
  {
    label: "Place Order",
    path: "place-order",
    icon: faCartShopping
  },
  {
    label: "Harvest & Orders",
    path: "orders",
    icon: faWheatAwn
  },
  {
    label: "Farm Tasks",
    path: "tasks",
    icon: faClipboardList
  },
  {
    label: "Expenses",
    path: "expenses",
    icon: faWallet
  },
  {
    label: "Inventory",
    path: "inventory",
    icon: faBoxesStacked
  },
  {
    label: "Workers",
    path: "workers",
    icon: faUserGroup
  },
  {
    label: "Equipment",
    path: "equipment",
    icon: faTractor
  },
  {
    label: "Profit & Loss",
    path: "profit-loss",
    icon: faChartLine
  },
  {
    label: "Reports",
    path: "reports",
    icon: faFileLines
  }
];

export default function Navbar({
  role = "User",
  onLogout
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage =
    location.pathname.split("/")[1] || "dashboard";

 
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

 
  useEffect(() => {
    if (!mobileOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [mobileOpen]);

  const goTo = (path) => {
    setMobileOpen(false);
    navigate(`/${path}`);
  };

  const logoutUser = () => {
    setMobileOpen(false);

    if (typeof onLogout === "function") {
      onLogout();
    }
  };

  const userRole = role || "User";

  return (
    <>
      <header className="agri-navbar">
        <div className="agri-navbar__inner">

          {/* MOBILE HAMBURGER */}
          <IconButton
            className="agri-navbar__hamburger"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="agri-mobile-navigation"
            onClick={() => setMobileOpen(true)}
          >
            <FontAwesomeIcon icon={faBars} />
          </IconButton>

          {/* BRAND */}
          <button
            type="button"
            className="agri-navbar__brand"
            onClick={() => goTo("dashboard")}
            aria-label="AgriVista Ventures dashboard"
          >
            <span className="agri-navbar__brand-icon">
              <FontAwesomeIcon icon={faWheatAwn} />
            </span>

            <span className="agri-navbar__brand-text">
              <span className="agri-navbar__brand-name">
                AgriVista
              </span>

              <span className="agri-navbar__brand-subtitle">
                VENTURES
              </span>
            </span>
          </button>

          {/* ALL 12 DESKTOP LINKS */}
          <nav
            className="agri-navbar__links"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => {
              const active =
                currentPage === link.path;

              return (
                <button
                  type="button"
                  key={link.path}
                  className={[
                    "agri-navbar__link",
                    active
                      ? "agri-navbar__link--active"
                      : ""
                  ].join(" ")}
                  aria-current={
                    active ? "page" : undefined
                  }
                  onClick={() => goTo(link.path)}
                >
                  <span className="agri-navbar__link-icon">
                    <FontAwesomeIcon icon={link.icon} />
                  </span>

                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* COMPACT ACCOUNT */}
          <div className="agri-navbar__account">
            <div className="agri-navbar__profile">
              <Avatar
                className="agri-navbar__avatar"
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: 13,
                  fontWeight: 800,
                  bgcolor: "#E5F2E9",
                  color: "#176347"
                }}
              >
                {userRole.charAt(0).toUpperCase()}
              </Avatar>

              <div className="agri-navbar__account-text">
                <span className="agri-navbar__role">
                  {userRole}
                </span>

                <span className="agri-navbar__account-subtitle">
                  Account
                </span>
              </div>
            </div>

            <Tooltip title="Log out" arrow>
              <IconButton
                onClick={logoutUser}
                aria-label="Log out"
                className="agri-navbar__logout"
              >
                <FontAwesomeIcon
                  icon={faRightFromBracket}
                />
              </IconButton>
            </Tooltip>
          </div>

        </div>
      </header>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true
        }}
        PaperProps={{
          id: "agri-mobile-navigation",
          className: "agri-mobile-drawer"
        }}
      >
        <div className="agri-mobile">

          {/* DRAWER HEADER */}
          <div className="agri-mobile__header">
            <div className="agri-mobile__brand">
              <span className="agri-navbar__brand-icon">
                <FontAwesomeIcon icon={faWheatAwn} />
              </span>

              <div>
                <div className="agri-mobile__name">
                  AgriVista
                </div>

                <div className="agri-mobile__subtitle">
                  VENTURES
                </div>
              </div>
            </div>

            <IconButton
              aria-label="Close navigation menu"
              onClick={() => setMobileOpen(false)}
              className="agri-mobile__close"
            >
              <FontAwesomeIcon icon={faXmark} />
            </IconButton>
          </div>

        
          <nav
            className="agri-mobile__navigation"
            aria-label="Mobile navigation"
          >
            <p className="agri-mobile__section-title">
              MAIN MENU
            </p>

            {NAV_LINKS.map((link) => {
              const active =
                currentPage === link.path;

              return (
                <button
                  key={link.path}
                  type="button"
                  className={[
                    "agri-mobile__link",
                    active
                      ? "agri-mobile__link--active"
                      : ""
                  ].join(" ")}
                  aria-current={
                    active ? "page" : undefined
                  }
                  onClick={() => goTo(link.path)}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* DRAWER FOOTER */}
          <div className="agri-mobile__footer">
            <div className="agri-mobile__user">
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  fontSize: 13,
                  fontWeight: 800,
                  bgcolor: "#E5F2E9",
                  color: "#176347"
                }}
              >
                {userRole.charAt(0).toUpperCase()}
              </Avatar>

              <div>
                <div className="agri-mobile__user-role">
                  {userRole}
                </div>

                <div className="agri-mobile__user-detail">
                  AgriVista Account
                </div>
              </div>
            </div>

            <button
              type="button"
              className="agri-mobile__logout"
              onClick={logoutUser}
            >
              <FontAwesomeIcon
                icon={faRightFromBracket}
              />

              <span>Log out</span>
            </button>
          </div>

        </div>
      </Drawer>
    </>
  );
}
