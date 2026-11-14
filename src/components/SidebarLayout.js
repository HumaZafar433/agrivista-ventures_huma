
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, Drawer, Tooltip } from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faChevronLeft,
  faChevronRight,
  faWheatAwn,
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
  faFileLines,
  faRightFromBracket,
  faCalendarDays
} from "@fortawesome/free-solid-svg-icons";

import "./SidebarLayout.css";

const GROUPS = [
  {
    title: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        path: "dashboard",
        icon: faChartPie,
        subtitle: "Farm operations overview"
      }
    ]
  },
  {
    title: "FARM MANAGEMENT",
    items: [
      { label: "Crops", path: "crops", icon: faSeedling },
      { label: "Buyers", path: "buyers", icon: faUsers },
      { label: "Place Order", path: "place-order", icon: faCartShopping },
      { label: "Harvest & Orders", path: "orders", icon: faWheatAwn },
      { label: "Farm Tasks", path: "tasks", icon: faClipboardList }
    ]
  },
  {
    title: "OPERATIONS",
    items: [
      { label: "Expenses", path: "expenses", icon: faWallet },
      { label: "Inventory", path: "inventory", icon: faBoxesStacked },
      { label: "Workers", path: "workers", icon: faUserGroup },
      { label: "Equipment", path: "equipment", icon: faTractor }
    ]
  },
  {
    title: "ADMINISTRATION",
    items: [
      { label: "User Registration", path: "users", icon: faUserGroup, adminOnly: true }
    ]
  },
  {
    title: "ANALYTICS",
    items: [
      { label: "Profit & Loss", path: "profit-loss", icon: faChartLine },
      { label: "Reports", path: "reports", icon: faFileLines }
    ]
  }
];

const ALL_ITEMS = GROUPS.flatMap((group) => group.items);
const STORAGE_KEY = "agrivista_sidebar_collapsed";

function SidebarContent({
  compact,
  mobile,
  currentPage,
  role,
  onNavigate,
  onToggle,
  onClose,
  onLogout
}) {
  return (
    <aside
      className={
        "av-sidebar" +
        (compact ? " av-sidebar--compact" : "")
      }
    >
      <div className="av-sidebar__brand-row">
        <button
          type="button"
          className="av-sidebar__brand"
          onClick={() => onNavigate("dashboard")}
          aria-label="AgriVista Dashboard"
        >
          <span className="av-sidebar__logo">
            <FontAwesomeIcon icon={faWheatAwn} />
          </span>

          {!compact && (
            <span className="av-sidebar__brand-copy">
              <strong>AgriVista</strong>
              <small>VENTURES</small>
            </span>
          )}
        </button>

        {mobile ? (
          <button
            type="button"
            className="av-sidebar__icon-button"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        ) : !compact ? (
          <Tooltip title="Collapse sidebar" arrow>
            <button
              type="button"
              className="av-sidebar__icon-button"
              onClick={onToggle}
              aria-label="Collapse sidebar"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          </Tooltip>
        ) : null}
      </div>

      {compact && !mobile && (
        <Tooltip title="Expand sidebar" placement="right" arrow>
          <button
            type="button"
            className="av-sidebar__expand"
            onClick={onToggle}
            aria-label="Expand sidebar"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </Tooltip>
      )}

      <nav className="av-sidebar__nav" aria-label="Main navigation">
        {GROUPS.map((group) => ({
          ...group,
          items: group.items.filter((item) => !item.adminOnly || role === "Admin")
        })).filter((group) => group.items.length > 0).map((group) => (
          <section className="av-sidebar__group" key={group.title}>
            {compact ? (
              <div className="av-sidebar__group-divider" />
            ) : (
              <h2 className="av-sidebar__group-title">
                {group.title}
              </h2>
            )}

            {group.items.map((item) => {
              const active = item.path === currentPage;

              const link = (
                <button
                  type="button"
                  key={item.path}
                  className={
                    "av-sidebar__link" +
                    (active ? " av-sidebar__link--active" : "")
                  }
                  aria-current={active ? "page" : undefined}
                  aria-label={item.label}
                  onClick={() => onNavigate(item.path)}
                >
                  <span className="av-sidebar__link-icon">
                    <FontAwesomeIcon icon={item.icon} />
                  </span>

                  {!compact && (
                    <span className="av-sidebar__link-label">
                      {item.label}
                    </span>
                  )}
                </button>
              );

              return compact ? (
                <Tooltip
                  key={item.path}
                  title={item.label}
                  placement="right"
                  arrow
                >
                  {link}
                </Tooltip>
              ) : (
                link
              );
            })}
          </section>
        ))}
      </nav>

      <div className="av-sidebar__footer">
        <div className="av-sidebar__account">
          <Avatar
            sx={{
              width: 34,
              height: 34,
              fontSize: 13,
              bgcolor: "#e8f3ea",
              color: "#176347",
              fontWeight: 800
            }}
          >
            {(role || "U").charAt(0).toUpperCase()}
          </Avatar>

          {!compact && (
            <div className="av-sidebar__account-copy">
              <strong>{role || "User"}</strong>
              <small>AgriVista Account</small>
            </div>
          )}
        </div>

        {compact ? (
          <Tooltip title="Log out" placement="right" arrow>
            <button
              type="button"
              className="av-sidebar__logout av-sidebar__logout--compact"
              onClick={onLogout}
              aria-label="Log out"
            >
              <FontAwesomeIcon icon={faRightFromBracket} />
            </button>
          </Tooltip>
        ) : (
          <button
            type="button"
            className="av-sidebar__logout"
            onClick={onLogout}
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>Log out</span>
          </button>
        )}
      </div>
    </aside>
  );
}

export default function SidebarLayout({
  role = "User",
  onLogout,
  children
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage =
    location.pathname.split("/")[1] || "dashboard";

  const pageInfo =
    ALL_ITEMS.find((item) => item.path === currentPage) ||
    ALL_ITEMS[0];

  const sidebarWidth = collapsed ? 72 : 242;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // Layout still works when storage is unavailable.
    }
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const goToPage = (path) => {
    setMobileOpen(false);
    navigate(`/${path}`);
  };

  const dateLabel = new Intl.DateTimeFormat("en-PK", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date());

  const sidebarProps = {
    role,
    currentPage,
    onNavigate: goToPage,
    onToggle: () => setCollapsed((value) => !value),
    onClose: () => setMobileOpen(false),
    onLogout
  };

  return (
    <div className="av-app-shell">
      {/* DESKTOP SIDEBAR */}
      <Drawer
        variant="permanent"
        open
        className="av-desktop-drawer"
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          transition: "width 180ms ease",
          "& .MuiDrawer-paper": {
            width: sidebarWidth,
            boxSizing: "border-box",
            borderRight: "1px solid #e5ebe7",
            overflowX: "hidden",
            transition: "width 180ms ease"
          }
        }}
      >
        <SidebarContent
          {...sidebarProps}
          compact={collapsed}
          mobile={false}
        />
      </Drawer>

      {/* MOBILE DRAWER */}
      <Drawer
        variant="temporary"
        anchor="left"
        className="av-mobile-drawer"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 280,
            maxWidth: "86vw",
            borderRight: "none"
          }
        }}
      >
        <SidebarContent
          {...sidebarProps}
          compact={false}
          mobile
        />
      </Drawer>

      <div className="av-app-shell__right">
        {/* TOPBAR */}
        <header className="av-topbar">
          <div className="av-topbar__left">
            <button
              type="button"
              className="av-topbar__hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>

            <div className="av-topbar__heading">
              <h1>{pageInfo.label}</h1>
              <p>
                {pageInfo.subtitle || "Farm Management System"}
              </p>
            </div>
          </div>

          <div className="av-topbar__date">
            <FontAwesomeIcon icon={faCalendarDays} />
            <span>{dateLabel}</span>
          </div>
        </header>

        {/* ORIGINAL PAGE CONTENT */}
        <main className="av-app-main">
          {children}
        </main>

        <footer className="av-app-footer">
          <span>© 2026 AgriVista Ventures</span>
          <span>Smart Farming & Crop Management</span>
        </footer>
      </div>
    </div>
  );
}
