
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  Chip,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  IconButton,
  Tooltip,
  Drawer,
  Divider,
  Alert,
  Snackbar,
  Skeleton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faTractor,
  faPlus,
  faMagnifyingGlass,
  faPen,
  faTrashCan,
  faXmark,
  faCalendarDays,
  faScrewdriverWrench,
  faGear,
  faClock,
  faArrowRight,
  faCircleInfo,
  faFilterCircleXmark
} from "@fortawesome/free-solid-svg-icons";

import {
  GETEQUIPMENT,
  ADDEQUIPMENT,
  UPDATEEQUIPMENT,
  REMOVEEQUIPMENT
} from "../app/redux/actions/equipment";

import {
  GETMAINTENANCE,
  ADDSERVICE,
  UPDATESERVICE,
  REMOVESERVICE
} from "../app/redux/actions/maintenance";

import {
  selectEquipmentWithService,
  selectEquipmentStats
} from "../app/redux/selectors/equipment";

import EquipmentForm from "./EquipmentForm";
import MaintenanceForm from "./MaintenanceForm";


const theme = {
  bg: "#f4f8f5",
  white: "#ffffff",
  green: "#166347",
  greenDark: "#104b35",
  greenSoft: "#eaf5ee",
  heading: "#183d2c",
  text: "#2b3a32",
  muted: "#75867b",
  border: "#dee7e0",
  red: "#c54343",
  orange: "#b97922"
};

const panelStyle = {
  bgcolor: theme.white,
  border: `1px solid ${theme.border}`,
  borderRadius: "13px",
  boxShadow: "0 1px 2px rgba(24,56,40,0.08)",
  overflow: "hidden"
};

const primaryButton = {
  minHeight: 42,
  px: 2.3,
  borderRadius: "9px",
  bgcolor: theme.green,
  color: "#fff",
  textTransform: "none",
  fontSize: 13,
  fontWeight: 600,
  boxShadow: "none",
  "&:hover": {
    bgcolor: theme.greenDark,
    boxShadow: "none"
  }
};

const secondaryButton = {
  minHeight: 42,
  px: 2,
  borderRadius: "9px",
  borderColor: "#cddcd2",
  color: theme.green,
  bgcolor: "#fff",
  textTransform: "none",
  fontSize: 13,
  fontWeight: 600,
  "&:hover": {
    bgcolor: theme.greenSoft,
    borderColor: theme.green
  }
};

const tableHeaderStyle = {
  fontSize: 13,
  fontWeight: 500,
  color: theme.text,
  bgcolor: "#f6faf7",
  borderBottom: `1px solid ${theme.border}`,
  py: 1.8,
  whiteSpace: "nowrap"
};


const DAY_MS = 24 * 60 * 60 * 1000;

function calendarTime(value) {
  if (!value) return null;

  const raw = String(value);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null;
    }

    return date.getTime();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function formatDate(value) {
  const time = calendarTime(value);

  if (time === null) return "Not set";

  return new Date(time).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  });
}

function daysUntil(value) {
  const target = calendarTime(value);
  if (target === null) return null;

  const now = new Date();

  const today = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  return Math.round((target - today) / DAY_MS);
}

function calculateServiceHealth(nextServiceDate) {
  const days = daysUntil(nextServiceDate);

  if (days === null) {
    return {
      label: "Not Scheduled",
      detail: "No service date",
      daysLeft: null
    };
  }

  if (days < 0) {
    const overdue = Math.abs(days);

    return {
      label: "Overdue",
      detail: `Overdue by ${overdue} ${
        overdue === 1 ? "day" : "days"
      }`,
      daysLeft: days
    };
  }

  if (days <= 14) {
    return {
      label: "Due Soon",
      detail:
        days === 0
          ? "Due today"
          : `Due in ${days} ${days === 1 ? "day" : "days"}`,
      daysLeft: days
    };
  }

  return {
    label: "OK",
    detail: `Due in ${days} days`,
    daysLeft: days
  };
}

function needsAttention(item) {
  const status = String(item.status || "")
    .trim()
    .toLowerCase();

  return (
    [
      "under maintenance",
      "under repair",
      "out of service"
    ].includes(status) ||
    item.health.label === "Due Soon" ||
    item.health.label === "Overdue"
  );
}

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;
}


function validateEquipment(data) {
  if (!String(data.name || data.equipmentName || "").trim()) {
    return "Equipment name is required.";
  }

  if (!String(data.type || "").trim()) {
    return "Please select an equipment type.";
  }

  const interval =
    data.serviceInterval ?? data.serviceIntervalDays;

  if (
    interval !== undefined &&
    interval !== null &&
    interval !== "" &&
    (
      !Number.isInteger(Number(interval)) ||
      Number(interval) <= 0
    )
  ) {
    return "Service interval must be a positive whole number.";
  }

  for (const field of ["purchaseDate", "lastServiceDate"]) {
    if (data[field] && calendarTime(data[field]) === null) {
      return "Please enter valid equipment dates.";
    }
  }

  if (
    data.purchaseDate &&
    data.lastServiceDate &&
    calendarTime(data.lastServiceDate) <
      calendarTime(data.purchaseDate)
  ) {
    return "Last service date cannot be before purchase date.";
  }

  return "";
}

function validateMaintenance(data) {
  if (!data.equipmentId) {
    return "Please select equipment.";
  }

  if (!String(data.description || "").trim()) {
    return "Service description is required.";
  }

  const cost = data.cost ?? data.serviceCost;

  if (
    cost === undefined ||
    cost === null ||
    cost === "" ||
    !Number.isFinite(Number(cost)) ||
    Number(cost) < 0
  ) {
    return "Service cost must be zero or greater.";
  }

  const date = data.date || data.serviceDate;

  if (!date || calendarTime(date) === null) {
    return "Please enter a valid service date.";
  }

  if (!String(data.performedBy || "").trim()) {
    return "Performed By is required.";
  }

  return "";
}


function StatusBadge({ value }) {
  let bgcolor = "#eff2f0";
  let color = "#64766b";

  if (["Active", "OK", "On Schedule"].includes(value)) {
    bgcolor = "#eaf6ee";
    color = "#187348";
  }

  if (
    ["Under Maintenance", "Under Repair", "Due Soon"]
      .includes(value)
  ) {
    bgcolor = "#fff1df";
    color = "#a76717";
  }

  if (["Overdue", "Out of Service"].includes(value)) {
    bgcolor = "#fdecec";
    color = "#bf3737";
  }

  return (
    <Chip
      size="small"
      label={value || "Unknown"}
      sx={{
        bgcolor,
        color,
        height: 26,
        fontSize: 11,
        fontWeight: 600,
        borderRadius: "7px"
      }}
    />
  );
}


function SummaryCard({
  title,
  value,
  valueColor = theme.green,
  onClick,
  selected
}) {
  return (
    <Paper
      component={onClick ? "button" : "div"}
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-pressed={onClick ? Boolean(selected) : undefined}
      sx={{
        ...panelStyle,
        width: "100%",
        minHeight: 134,
        p: { xs: 2.5, md: 3 },
        textAlign: "left",
        fontFamily: "inherit",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        cursor: onClick ? "pointer" : "default",
        borderColor: selected ? theme.green : theme.border,
        "&:hover": onClick
          ? { boxShadow: "0 3px 8px rgba(24,56,40,0.09)" }
          : {},
        "&:focus-visible": {
          outline: `3px solid ${theme.green}`,
          outlineOffset: 3
        }
      }}
    >
      <Typography
        sx={{
          color: "#17241c",
          fontSize: { xs: 16, md: 17 },
          fontWeight: 400,
          mb: 1.2
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: valueColor,
          fontSize: { xs: 32, md: 37 },
          fontWeight: 400,
          lineHeight: 1.15
        }}
      >
        {value}
      </Typography>

      {onClick && (
        <Typography
          sx={{
            fontSize: 11,
            color: theme.muted,
            mt: 0.7
          }}
        >
          {selected
            ? "Click to clear filter"
            : "Click to view records"}
        </Typography>
      )}
    </Paper>
  );
}


function SectionHeading({ title, subtitle, action }) {
  return (
    <Box
      sx={{
        px: { xs: 2.5, md: 3.5 },
        py: 2.9,
        borderBottom: `1px solid ${theme.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1.5
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: { xs: 20, md: 22 },
            fontWeight: 400,
            color: "#1b2a20"
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 400,
            color: theme.text,
            mt: 0.6
          }}
        >
          {subtitle}
        </Typography>
      </Box>

      {action}
    </Box>
  );
}


export default function Equipment() {
  const dispatch = useDispatch();
  const registryRef = useRef(null);

  const role = useSelector((s) => s.auth?.role);
  const isAdmin = role === "Admin";

  const equipmentData = useSelector(selectEquipmentWithService);
  const stats = useSelector(selectEquipmentStats);

  const maintenanceData = useSelector(
    (s) => s.maintenance?.services || []
  );

  const busy = useSelector((s) =>
    Boolean(
      s.equipment?.loading ||
      s.maintenance?.loading
    )
  );

  const error = useSelector(
    (s) => s.equipment?.error || s.maintenance?.error
  );

  const [initialLoading, setInitialLoading] = useState(true);

  const [drawer, setDrawer] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [editingService, setEditingService] = useState(null);

  const [confirm, setConfirm] = useState(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [attentionOnly, setAttentionOnly] = useState(false);

  const [sortBy, setSortBy] = useState("nextServiceDate");
  const [sortDirection, setSortDirection] = useState("asc");

  const [page, setPage] = useState(0);
  const [showAllServices, setShowAllServices] = useState(false);

  const rowsPerPage = 10;


  useEffect(() => {
    let mounted = true;

    const equipmentRequest = dispatch(GETEQUIPMENT());
    const maintenanceRequest = dispatch(GETMAINTENANCE());

    Promise.allSettled([
      Promise.resolve(equipmentRequest),
      Promise.resolve(maintenanceRequest)
    ]).finally(() => {
      if (mounted) setInitialLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  const showSkeleton =
    initialLoading || (busy && !equipmentData);

  const items = useMemo(() => {
    const records = Array.isArray(equipmentData)
      ? equipmentData
      : [];

    return records.map((item) => {
      const health = calculateServiceHealth(
        item.nextServiceDate
      );

      const record = { ...item, health };

      return {
        ...record,
        needsAttention: needsAttention(record)
      };
    });
  }, [equipmentData]);

  const services = Array.isArray(maintenanceData)
    ? maintenanceData
    : [];

  const notify = (message, severity = "success") => {
    setToast({
      open: true,
      message,
      severity
    });
  };

  const closeDrawer = () => {
    setDrawer(null);
    setEditingEquipment(null);
    setEditingService(null);
  };

  const openEquipment = (record = null) => {
    setEditingEquipment(record);
    setEditingService(null);
    setDrawer("equipment");
  };

  const openMaintenance = (record = null) => {
    setEditingService(record);
    setEditingEquipment(null);
    setDrawer("maintenance");
  };

  const done = (message) => {
    closeDrawer();
    notify(message);
  };

  const saveEquipment = (data) => {
    if (editingEquipment && !isAdmin) {
      notify("Only Admin can edit equipment.", "error");
      return;
    }

    const validationError = validateEquipment(data);

    if (validationError) {
      notify(validationError, "error");
      return;
    }

    dispatch(
      editingEquipment
        ? UPDATEEQUIPMENT(
            data,
            () => done("Equipment updated successfully.")
          )
        : ADDEQUIPMENT(
            data,
            () => done("Equipment added successfully.")
          )
    );
  };

  const saveService = (data) => {
    if (editingService && !isAdmin) {
      notify("Only Admin can edit maintenance.", "error");
      return;
    }

    const validationError = validateMaintenance(data);

    if (validationError) {
      notify(validationError, "error");
      return;
    }

    dispatch(
      editingService
        ? UPDATESERVICE(
            data,
            () => done("Maintenance updated successfully.")
          )
        : ADDSERVICE(
            data,
            () => done("Maintenance saved successfully.")
          )
    );
  };


  const deleteItem = () => {
    if (!isAdmin || !confirm || busy) return;

    const current = confirm;
    setConfirm(null);

    if (current.type === "equipment") {
      dispatch(
        REMOVEEQUIPMENT(
          current.record.id,
          () => done("Equipment deleted successfully.")
        )
      );
    }

    if (current.type === "maintenance") {
      dispatch(
        REMOVESERVICE(
          current.record.id,
          () => done("Maintenance deleted successfully.")
        )
      );
    }
  };

  const total = Number(stats?.total ?? items.length);

  const active = Number(
    stats?.active ??
    items.filter((item) => item.status === "Active").length
  );

  const attentionCount = items.filter(
    (item) => item.needsAttention
  ).length;

  const hasFilters =
    Boolean(search.trim()) ||
    statusFilter !== "All" ||
    attentionOnly;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setAttentionOnly(false);
    setPage(0);
  };

  const handleAttentionFilter = () => {
    setAttentionOnly((previous) => !previous);
    setSearch("");
    setStatusFilter("All");
    setPage(0);

    registryRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(
        sortDirection === "asc" ? "desc" : "asc"
      );
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }

    setPage(0);
  };


  const filteredEquipment = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const records = items.filter((item) => {
      const matchesSearch =
        String(item.name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.type || "")
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      const matchesAttention =
        !attentionOnly || item.needsAttention;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesAttention
      );
    });

    const valueForSort = (item) => {
      switch (sortBy) {
        case "name":
          return String(item.name || "").toLowerCase();

        case "status":
          return String(item.status || "").toLowerCase();

        case "lastServiceDate":
          return calendarTime(item.lastServiceDate);

        case "nextServiceDate":
          return calendarTime(item.nextServiceDate);

        case "serviceHealth":
          return item.health.daysLeft;

        default:
          return String(item.name || "").toLowerCase();
      }
    };

    return [...records].sort((a, b) => {
      const first = valueForSort(a);
      const second = valueForSort(b);

      if (first === null && second === null) return 0;
      if (first === null) return 1;
      if (second === null) return -1;

      let comparison;

      if (
        typeof first === "number" &&
        typeof second === "number"
      ) {
        comparison = first - second;
      } else {
        comparison = String(first).localeCompare(
          String(second)
        );
      }

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });
  }, [
    items,
    search,
    statusFilter,
    attentionOnly,
    sortBy,
    sortDirection
  ]);

  useEffect(() => {
    const maxPage = Math.max(
      0,
      Math.ceil(filteredEquipment.length / rowsPerPage) - 1
    );

    setPage((previous) => Math.min(previous, maxPage));
  }, [filteredEquipment.length]);

  const visibleEquipment = filteredEquipment.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const from = filteredEquipment.length
    ? page * rowsPerPage + 1
    : 0;

  const to = Math.min(
    (page + 1) * rowsPerPage,
    filteredEquipment.length
  );

  const upcomingServices = [...items]
    .filter((item) => item.health.daysLeft !== null)
    .sort(
      (a, b) =>
        a.health.daysLeft - b.health.daysLeft
    );

  const sortedServices = [...services].sort((a, b) =>
    String(
      b.date || b.serviceDate || ""
    ).localeCompare(
      String(a.date || a.serviceDate || "")
    )
  );

  const visibleServices = showAllServices
    ? sortedServices
    : sortedServices.slice(0, 4);

  const getEquipmentName = (equipmentId) => {
    const found = items.find(
      (item) =>
        String(item.id) === String(equipmentId)
    );

    return found?.name || "Unknown Equipment";
  };

  const columns = [
    { key: "name", label: "Equipment" },
    { key: "status", label: "Status" },
    { key: "lastServiceDate", label: "Last Service" },
    { key: "nextServiceDate", label: "Next Service" },
    { key: "serviceHealth", label: "Service Health" }
  ];


  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.bg,
        pb: 6
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          pt: { xs: 3, md: 4 }
        }}
      >
        {/* PAGE HEADER */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2.5,
            flexWrap: "wrap",
            mb: 4
          }}
        >
          <Box sx={{ flex: "1 1 420px" }}>
            <Typography
              component="h1"
              sx={{
                color: theme.heading,
                fontSize: { xs: 31, md: 40 },
                fontWeight: 400,
                letterSpacing: "normal",
                lineHeight: 1.2
              }}
            >
              Equipment Management
            </Typography>

            <Typography
              sx={{
                color: "#17241c",
                fontSize: { xs: 15, md: 18 },
                fontWeight: 400,
                mt: 1.7,
                lineHeight: 1.5
              }}
            >
              Manage machinery, service schedules and
              maintenance records.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1.3}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
          >
            <Button
              variant="outlined"
              startIcon={
                <FontAwesomeIcon
                  icon={faScrewdriverWrench}
                />
              }
              onClick={() => openMaintenance()}
              sx={secondaryButton}
            >
              Record Maintenance
            </Button>

            <Button
              variant="contained"
              startIcon={
                <FontAwesomeIcon icon={faPlus} />
              }
              onClick={() => openEquipment()}
              sx={primaryButton}
            >
              Add Equipment
            </Button>
          </Stack>
        </Box>

        {/* ERRORS AND LOADING */}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}

        {busy && !showSkeleton && (
          <LinearProgress
            sx={{
              mb: 2,
              "& .MuiLinearProgress-bar": {
                bgcolor: theme.green
              }
            }}
          />
        )}

        {/* SUMMARY CARDS */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, minmax(0, 1fr))"
            },
            gap: 2.5,
            mb: 4
          }}
        >
          {showSkeleton ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                height={134}
                sx={{ borderRadius: 3 }}
              />
            ))
          ) : (
            <>
              <SummaryCard
                title="Total Equipment"
                value={total}
                valueColor={theme.green}
              />

              <SummaryCard
                title="Operational Machines"
                value={active}
                valueColor={theme.green}
              />

              <SummaryCard
                title="Needs Attention"
                value={attentionCount}
                valueColor={theme.orange}
                onClick={handleAttentionFilter}
                selected={attentionOnly}
              />
            </>
          )}
        </Box>

        {/* EQUIPMENT REGISTRY */}

        <Paper
          ref={registryRef}
          sx={{
            ...panelStyle,
            mb: 3.5,
            scrollMarginTop: "85px"
          }}
        >
          <SectionHeading
            title={
              attentionOnly
                ? "Equipment Needing Attention"
                : "Equipment Registry"
            }
            subtitle={`${items.length} registered farm assets`}
            action={
              attentionOnly && (
                <Button
                  size="small"
                  onClick={clearFilters}
                  startIcon={
                    <FontAwesomeIcon
                      icon={faFilterCircleXmark}
                    />
                  }
                  sx={{
                    color: theme.green,
                    textTransform: "none"
                  }}
                >
                  Clear Attention Filter
                </Button>
              )
            }
          />

          {/* SEARCH AND STATUS */}

          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              flexWrap: "wrap",
              px: { xs: 2, md: 2.5 },
              py: 2.5
            }}
          >
            <TextField
              size="small"
              placeholder="Search equipment by name or type..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              sx={{
                flex: "1 1 300px",
                minWidth: 0,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "9px"
                }
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <Box
                      sx={{
                        mr: 1.2,
                        color: "#90a197"
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                      />
                    </Box>
                  )
                }
              }}
            />

            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(0);
              }}
              sx={{
                minWidth: 170,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "9px"
                }
              }}
            >
              {[
                "All",
                "Active",
                "Under Repair",
                "Under Maintenance",
                "Out of Service",
                "Idle"
              ].map((status) => (
                <MenuItem key={status} value={status}>
                  {status === "All"
                    ? "All Statuses"
                    : status}
                </MenuItem>
              ))}
            </TextField>

            {hasFilters && !attentionOnly && (
              <Button
                size="small"
                onClick={clearFilters}
                sx={{
                  color: theme.green,
                  textTransform: "none"
                }}
              >
                Clear Filters
              </Button>
            )}
          </Box>

          {/* MOBILE TABLE HINT */}

          <Typography
            sx={{
              display: { xs: "block", md: "none" },
              px: 2,
              pb: 1,
              fontSize: 11,
              color: theme.muted
            }}
          >
            Scroll horizontally to view all columns.
          </Typography>

          {/* SORTABLE TABLE */}

          <TableContainer sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 850 }}>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      sx={tableHeaderStyle}
                      sortDirection={
                        sortBy === column.key
                          ? sortDirection
                          : false
                      }
                    >
                      <TableSortLabel
                        active={sortBy === column.key}
                        direction={
                          sortBy === column.key
                            ? sortDirection
                            : "asc"
                        }
                        onClick={() =>
                          handleSort(column.key)
                        }
                        sx={{
                          "&.Mui-active": {
                            color: theme.green
                          },
                          "&.Mui-active .MuiTableSortLabel-icon": {
                            color: theme.green
                          }
                        }}
                      >
                        {column.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}

                  {isAdmin && (
                    <TableCell
                      align="right"
                      sx={tableHeaderStyle}
                    >
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {showSkeleton ? (
                  Array.from({ length: 5 }).map(
                    (_, index) => (
                      <TableRow key={index}>
                        {Array.from({
                          length: isAdmin ? 6 : 5
                        }).map((__, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton
                              height={28}
                              variant="rounded"
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  )
                ) : (
                  <>
                    {visibleEquipment.map((item) => (
                      <TableRow
                        key={item.id}
                        hover
                        sx={{
                          "& td": {
                            py: 1.8,
                            borderBottom:
                              `1px solid ${theme.border}`
                          }
                        }}
                      >
                        {/* EQUIPMENT NAME */}

                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.4}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 38,
                                height: 38,
                                bgcolor: theme.greenSoft,
                                color: theme.green,
                                borderRadius: "9px",
                                display: "grid",
                                placeItems: "center",
                                flexShrink: 0
                              }}
                            >
                              <FontAwesomeIcon
                                icon={
                                  item.type === "Tractor"
                                    ? faTractor
                                    : faGear
                                }
                              />
                            </Box>

                            <Box>
                              <Typography
                                sx={{
                                  fontSize: 14,
                                  fontWeight: 500,
                                  color: theme.heading
                                }}
                              >
                                {item.name}
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: 11.5,
                                  color: theme.muted
                                }}
                              >
                                {item.type}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* STATUS */}

                        <TableCell>
                          <StatusBadge value={item.status} />
                        </TableCell>

                        {/* LAST SERVICE */}

                        <TableCell>
                          <Typography
                            sx={{
                              fontSize: 12.5,
                              color: theme.text
                            }}
                          >
                            {formatDate(
                              item.lastServiceDate
                            )}
                          </Typography>
                        </TableCell>

                        {/* NEXT SERVICE */}

                        <TableCell>
                          <Typography
                            sx={{
                              fontSize: 12.5,
                              color: theme.text
                            }}
                          >
                            {formatDate(
                              item.nextServiceDate
                            )}
                          </Typography>
                        </TableCell>

                        {/* SERVICE HEALTH */}

                        <TableCell>
                          <Stack
                            spacing={0.55}
                            alignItems="flex-start"
                          >
                            <StatusBadge
                              value={item.health.label}
                            />

                            <Typography
                              sx={{
                                fontSize: 11,
                                color:
                                  item.health.label === "Overdue"
                                    ? theme.red
                                    : item.health.label === "Due Soon"
                                      ? theme.orange
                                      : theme.muted,
                                fontWeight:
                                  item.health.label === "OK"
                                    ? 400
                                    : 600,
                                whiteSpace: "nowrap"
                              }}
                            >
                              {item.health.detail}
                            </Typography>
                          </Stack>
                        </TableCell>

                        {/* ACTIONS */}

                        {isAdmin && (
                          <TableCell align="right">
                            <Stack
                              direction="row"
                              spacing={1.2}
                              alignItems="center"
                              justifyContent="flex-end"
                            >
                              <Tooltip
                                title="Edit equipment"
                                arrow
                              >
                                <IconButton
                                  aria-label={`Edit ${item.name}`}
                                  onClick={() =>
                                    openEquipment(item)
                                  }
                                  sx={{
                                    border:
                                      `1px solid ${theme.border}`,
                                    color: theme.green,
                                    width: 34,
                                    height: 34,
                                    borderRadius: "8px"
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={faPen}
                                    style={{ fontSize: 12 }}
                                  />
                                </IconButton>
                              </Tooltip>

                              <Divider
                                orientation="vertical"
                                flexItem
                              />

                              <Tooltip
                                title="Delete equipment"
                                arrow
                              >
                                <IconButton
                                  aria-label={`Delete ${item.name}`}
                                  onClick={() =>
                                    setConfirm({
                                      type: "equipment",
                                      record: item
                                    })
                                  }
                                  sx={{
                                    border:
                                      "1px solid #f5dcdc",
                                    color: theme.red,
                                    bgcolor: "#fff8f8",
                                    width: 34,
                                    height: 34,
                                    borderRadius: "8px"
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={faTrashCan}
                                    style={{ fontSize: 12 }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}

                    {/* EMPTY STATE */}

                    {visibleEquipment.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={isAdmin ? 6 : 5}
                          align="center"
                          sx={{
                            py: 6,
                            borderBottom: "none"
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faCircleInfo}
                            style={{
                              fontSize: 25,
                              color: "#a4b4aa"
                            }}
                          />

                          <Typography
                            sx={{
                              mt: 1.5,
                              fontSize: 16,
                              fontWeight: 400,
                              color: theme.heading
                            }}
                          >
                            No equipment found
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.6,
                              fontSize: 12,
                              color: theme.muted
                            }}
                          >
                            {hasFilters
                              ? "No machines match your current filters."
                              : "No equipment has been registered yet."}
                          </Typography>

                          {hasFilters ? (
                            <Button
                              variant="outlined"
                              onClick={clearFilters}
                              sx={{
                                ...secondaryButton,
                                mt: 2
                              }}
                            >
                              Clear Filters
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              onClick={() => openEquipment()}
                              sx={{
                                ...primaryButton,
                                mt: 2
                              }}
                            >
                              Add Equipment
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* PAGINATION */}

          {!showSkeleton && (
            <Box
              sx={{
                px: 2.5,
                borderTop:
                  `1px solid ${theme.border}`,
                bgcolor: "#fbfcfb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1
              }}
            >
              <Typography
                sx={{
                  fontSize: 11.5,
                  color: theme.muted,
                  py: 1
                }}
              >
                Showing{" "}
                {filteredEquipment.length
                  ? `${from}-${to}`
                  : "0"}{" "}
                of {filteredEquipment.length} equipment records
                {hasFilters && <> ({items.length} total)</>}
              </Typography>

              <TablePagination
                component="div"
                count={filteredEquipment.length}
                page={page}
                onPageChange={(_, newPage) =>
                  setPage(newPage)
                }
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10]}
                labelRowsPerPage=""
                labelDisplayedRows={() => ""}
                sx={{
                  border: "none",
                  "& .MuiTablePagination-toolbar": {
                    minHeight: 48,
                    px: 0
                  }
                }}
              />
            </Box>
          )}
        </Paper>

        {/* SERVICE SCHEDULE AND MAINTENANCE */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))"
            },
            gap: 3,
            alignItems: "stretch"
          }}
        >
          {/* SERVICE SCHEDULE */}

          <Paper sx={{ ...panelStyle, height: "100%" }}>
            <SectionHeading
              title="Service Schedule"
              subtitle="Sorted by nearest service date"
            />

            {showSkeleton ? (
              <Box sx={{ p: 2.5 }}>
                {[1, 2, 3].map((number) => (
                  <Skeleton
                    key={number}
                    height={58}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            ) : upcomingServices.length === 0 ? (
              <Box
                sx={{
                  py: 5,
                  textAlign: "center"
                }}
              >
                <FontAwesomeIcon
                  icon={faClock}
                  style={{
                    fontSize: 23,
                    color: "#a3b2a7"
                  }}
                />

                <Typography
                  sx={{
                    color: theme.muted,
                    fontSize: 12.5,
                    mt: 1.5
                  }}
                >
                  No service schedules available.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  px: 2.5,
                  py: 0.8,
                  maxHeight: 380,
                  overflowY: "auto"
                }}
              >
                {upcomingServices.map((item, index) => (
                  <Box key={item.id}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={2}
                      sx={{ py: 1.8 }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.3}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: theme.greenSoft,
                            color: theme.green,
                            borderRadius: "9px",
                            display: "grid",
                            placeItems: "center"
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faCalendarDays}
                          />
                        </Box>

                        <Box>
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: theme.heading
                            }}
                          >
                            {item.name}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 11.5,
                              color: theme.muted
                            }}
                          >
                            {formatDate(
                              item.nextServiceDate
                            )}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        alignItems="flex-end"
                        spacing={0.5}
                      >
                        <StatusBadge
                          value={item.health.label}
                        />

                        <Typography
                          sx={{
                            fontSize: 10.5,
                            color: theme.muted
                          }}
                        >
                          {item.health.detail}
                        </Typography>
                      </Stack>
                    </Stack>

                    {index <
                      upcomingServices.length - 1 && (
                      <Divider />
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Paper>

          {/* MAINTENANCE HISTORY */}

          <Paper sx={{ ...panelStyle, height: "100%" }}>
            <SectionHeading
              title="Maintenance History"
              subtitle={`${services.length} recorded services`}
              action={
                <Button
                  size="small"
                  startIcon={
                    <FontAwesomeIcon icon={faPlus} />
                  }
                  onClick={() => openMaintenance()}
                  sx={{
                    color: theme.green,
                    textTransform: "none",
                    fontSize: 12
                  }}
                >
                  Add Service
                </Button>
              }
            />

            {showSkeleton ? (
              <Box sx={{ p: 2.5 }}>
                {[1, 2, 3].map((number) => (
                  <Skeleton
                    key={number}
                    height={58}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            ) : sortedServices.length === 0 ? (
              <Box
                sx={{
                  py: 5,
                  textAlign: "center"
                }}
              >
                <FontAwesomeIcon
                  icon={faScrewdriverWrench}
                  style={{
                    fontSize: 23,
                    color: "#a3b2a7"
                  }}
                />

                <Typography
                  sx={{
                    mt: 1.5,
                    fontSize: 12.5,
                    color: theme.muted
                  }}
                >
                  No maintenance records available.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  px: 2.5,
                  py: 0.8,
                  maxHeight: showAllServices ? 500 : "none",
                  overflowY: "auto"
                }}
              >
                {visibleServices.map((service, index) => (
                  <Box key={service.id}>
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      spacing={2}
                      sx={{ py: 1.8 }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: theme.heading
                          }}
                        >
                          {getEquipmentName(
                            service.equipmentId
                          )}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 12,
                            color: theme.text,
                            mt: 0.4
                          }}
                        >
                          {service.description}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 11.5,
                            color: theme.muted,
                            mt: 0.7
                          }}
                        >
                          {formatDate(
                            service.date ||
                            service.serviceDate
                          )}
                          {" · "}
                          {service.performedBy ||
                            "Not specified"}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          flexShrink: 0,
                          textAlign: "right"
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 12.5,
                            fontWeight: 500,
                            color: theme.green
                          }}
                        >
                          {formatMoney(
                            service.cost ??
                            service.serviceCost
                          )}
                        </Typography>

                        {isAdmin && (
                          <Stack
                            direction="row"
                            justifyContent="flex-end"
                            spacing={1}
                            sx={{ mt: 1 }}
                          >
                            <Tooltip
                              title="Edit maintenance"
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  openMaintenance(service)
                                }
                                aria-label="Edit maintenance"
                              >
                                <FontAwesomeIcon
                                  icon={faPen}
                                  style={{ fontSize: 11 }}
                                />
                              </IconButton>
                            </Tooltip>

                            <Tooltip
                              title="Delete maintenance"
                            >
                              <IconButton
                                size="small"
                                aria-label="Delete maintenance"
                                onClick={() =>
                                  setConfirm({
                                    type: "maintenance",
                                    record: service
                                  })
                                }
                                sx={{ color: theme.red }}
                              >
                                <FontAwesomeIcon
                                  icon={faTrashCan}
                                  style={{ fontSize: 11 }}
                                />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
                      </Box>
                    </Stack>

                    {index < visibleServices.length - 1 && (
                      <Divider />
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {sortedServices.length > 4 && (
              <Box
                sx={{
                  p: 1.5,
                  borderTop: `1px solid ${theme.border}`,
                  textAlign: "center"
                }}
              >
                <Button
                  onClick={() =>
                    setShowAllServices(
                      (previous) => !previous
                    )
                  }
                  endIcon={
                    <FontAwesomeIcon icon={faArrowRight} />
                  }
                  sx={{
                    color: theme.green,
                    textTransform: "none",
                    fontSize: 12
                  }}
                >
                  {showAllServices
                    ? "Show Less"
                    : "View All Maintenance"}
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>

      {/* ADD AND EDIT DRAWER */}

      <Drawer
        anchor="right"
        open={Boolean(drawer)}
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 560 },
            maxWidth: "100%",
            bgcolor: "#f8faf8"
          }
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.5,
            bgcolor: "#fff",
            borderBottom: `1px solid ${theme.border}`
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 21,
                  fontWeight: 400,
                  color: theme.heading
                }}
              >
                {drawer === "equipment"
                  ? editingEquipment
                    ? "Edit Equipment"
                    : "Add Equipment"
                  : editingService
                    ? "Edit Maintenance"
                    : "Record Maintenance"}
              </Typography>

              <Typography
                sx={{
                  fontSize: 12,
                  color: theme.muted,
                  mt: 0.5
                }}
              >
                {drawer === "equipment"
                  ? "Manage farm machinery details"
                  : "Enter maintenance and repair details"}
              </Typography>
            </Box>

            <Tooltip title="Close form">
              <IconButton
                onClick={closeDrawer}
                aria-label="Close form"
                sx={{ bgcolor: "#f1f5f2" }}
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  style={{ fontSize: 16 }}
                />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            overflowY: "auto",
            flex: 1,
            "& > .MuiPaper-root": {
              boxShadow: "none !important",
              border: "none !important",
              padding: "0 !important",
              bgcolor: "transparent"
            },
            "& .MuiOutlinedInput-root": {
              borderRadius: "9px",
              bgcolor: "#fff"
            },
            "& .MuiButton-contained": {
              bgcolor: theme.green,
              borderRadius: "9px",
              boxShadow: "none"
            }
          }}
        >
          {drawer === "equipment" && (
            <EquipmentForm
              editing={editingEquipment}
              onSave={saveEquipment}
              onCancel={closeDrawer}
              saving={busy}
            />
          )}

          {drawer === "maintenance" && (
            <MaintenanceForm
              items={items}
              editing={editingService}
              onSave={saveService}
              onCancel={closeDrawer}
              saving={busy}
            />
          )}
        </Box>
      </Drawer>

      {/* DELETE CONFIRMATION */}

      <Dialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "15px",
            p: 1
          }
        }}
      >
        <DialogTitle
          sx={{
            color: theme.heading,
            fontSize: 22,
            fontWeight: 400
          }}
        >
          Delete{" "}
          {confirm?.type === "equipment"
            ? "Equipment"
            : "Maintenance Record"}
          ?
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            sx={{
              fontSize: 14,
              lineHeight: 1.7
            }}
          >
            Are you sure you want to delete{" "}
            <strong>
              {confirm?.record?.name ||
                confirm?.record?.description ||
                "this record"}
            </strong>
            ? This action cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirm(null)}
            disabled={busy}
            sx={{
              color: theme.text,
              textTransform: "none"
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={deleteItem}
            disabled={busy}
            startIcon={
              <FontAwesomeIcon icon={faTrashCan} />
            }
            sx={{
              borderRadius: "9px",
              boxShadow: "none",
              textTransform: "none"
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUCCESS AND ERROR NOTIFICATION */}

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() =>
          setToast((previous) => ({
            ...previous,
            open: false
          }))
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() =>
            setToast((previous) => ({
              ...previous,
              open: false
            }))
          }
          sx={{
            minWidth: 250,
            borderRadius: "10px"
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
