import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Paper,
  Typography,
  Chip,
  Alert,
  Button
} from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faUsers,
  faUserCheck,
  faUserXmark,
  faMoneyBillWave,
  faTractor,
  faExclamationTriangle,
  faWrench,
  faCalendarDays,
  faClock,
  faArrowRight,
  faChartBar
} from "@fortawesome/free-solid-svg-icons";

import {
  selectWorkforceToday,
  selectUnpaidWages,
  selectAttendanceTrend
} from "../app/redux/selectors/dashboard";

import {
  selectEquipmentStats,
  selectServiceDue
} from "../app/redux/selectors/equipment";

import { GETWORKERS } from "../app/redux/actions/workers";
import { GETATTENDANCE } from "../app/redux/actions/attendance";
import { GETEQUIPMENT } from "../app/redux/actions/equipment";
import { GETMAINTENANCE } from "../app/redux/actions/maintenance";


// CURRENT DATE

const getToday = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
};


// WEEKDAY

const getWeekday = (date) => {
  return new Date(`${date}T12:00:00`).toLocaleDateString(
    "en-US",
    { weekday: "short" }
  );
};


// COMMON STYLING

const sectionStyle = {
  p: { xs: 2, md: 3 },
  borderRadius: 3,
  bgcolor: "#ffffff",
  border: "1px solid #e3ebe4",
  boxShadow: "0 5px 20px rgba(0,0,0,0.035)"
};


// PROFESSIONAL SECTION HEADING

function SectionHeader({
  icon,
  title,
  subtitle,
  rightContent
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        mb: 3
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            bgcolor: "#e8f5e9",
            color: "#1b5e20",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0
          }}
        >
          <FontAwesomeIcon icon={icon} />
        </Box>

        <Box>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              color: "#183b29",
              fontSize: { xs: 19, md: 22 }
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {subtitle}
          </Typography>
        </Box>
      </Box>

      {rightContent}
    </Box>
  );
}


// MAIN COMPONENT

function DashboardExtras({ onOpenEquipment }) {
  const dispatch = useDispatch();

  const today = getToday();
  const month = today.slice(0, 7);


  // LOAD REDUX DATA

  useEffect(() => {
    dispatch(GETWORKERS());
    dispatch(GETATTENDANCE());
    dispatch(GETEQUIPMENT());
    dispatch(GETMAINTENANCE());
  }, [dispatch]);


  // REDUX SELECTORS

  const workforce = useSelector((state) =>
    selectWorkforceToday(state, today)
  );

  const unpaidWages = useSelector((state) =>
    selectUnpaidWages(state, month)
  );

  const attendanceTrend = useSelector((state) =>
    selectAttendanceTrend(state, today)
  );

  const equipment = useSelector(selectEquipmentStats);

  const serviceDue = useSelector(selectServiceDue);


  // SUMMARY CARDS

  const summaryCards = [
    {
      title: "Total Workers",
      value: workforce.total,
      icon: faUsers,
      color: "#1b5e20",
      bg: "#e8f5e9"
    },
    {
      title: "Present Today",
      value: workforce.present,
      icon: faUserCheck,
      color: "#2e7d32",
      bg: "#e8f5e9"
    },
    {
      title: "Absent Today",
      value: workforce.absent,
      icon: faUserXmark,
      color: "#d32f2f",
      bg: "#ffebee"
    },
    {
      title: "Unpaid Wages",
      value: `Rs. ${Number(
        unpaidWages || 0
      ).toLocaleString("en-PK")}`,
      icon: faMoneyBillWave,
      color: "#b26a14",
      bg: "#fff3e0"
    },
    {
      title: "Active Equipment",
      value: equipment.active,
      icon: faTractor,
      color: "#1b5e20",
      bg: "#e8f5e9"
    },
    {
      title: "Service Alerts",
      value: equipment.due,
      icon: faExclamationTriangle,
      color: "#c77713",
      bg: "#fff3e0"
    }
  ];


  // CHART SCALE

  const maxAttendance = Math.max(
    1,
    ...attendanceTrend.map((day) =>
      Math.max(day.present, day.absent)
    )
  );


  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        pb: 4,
        bgcolor: "#f4f8f4"
      }}
    >

      {/* WORKFORCE & EQUIPMENT HEADING */}

      <SectionHeader
        icon={faTractor}
        title="Workforce & Equipment Overview"
        subtitle="Workers, attendance, payroll and machinery monitoring"
      />


      {/* PROFESSIONAL SUMMARY CARDS */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))"
          },
          gap: 2,
          mb: 3
        }}
      >
        {summaryCards.map((card) => (
          <Paper
            key={card.title}
            elevation={0}
            sx={{
              ...sectionStyle,
              p: 2.5
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 2
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {card.title}
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{
                    color: "#183b29",
                    mt: 1,
                    fontSize: { xs: 23, md: 27 }
                  }}
                >
                  {card.value}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 46,
                  height: 46,
                  bgcolor: card.bg,
                  color: card.color,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0
                }}
              >
                <FontAwesomeIcon icon={card.icon} />
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>


      {/* DASHBOARD ALERTS */}

      {workforce.highAbsence && (
        <Alert
          severity="warning"
          sx={{ mb: 2, borderRadius: 2 }}
        >
          More than 30% of active workers are absent today.
        </Alert>
      )}

      {equipment.repair > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {equipment.repair} equipment item(s) are under repair.
        </Alert>
      )}

      {workforce.unmarked > 0 && (
        <Alert
          severity="info"
          sx={{ mb: 3, borderRadius: 2 }}
        >
          Attendance is not marked for{" "}
          {workforce.unmarked} active worker(s) today.
        </Alert>
      )}


      {/* WEEKLY ATTENDANCE */}

      <Paper
        elevation={0}
        sx={{
          ...sectionStyle,
          mb: 3
        }}
      >
        <SectionHeader
          icon={faChartBar}
          title="Weekly Attendance"
          subtitle="Worker attendance over the last 7 days"
          rightContent={
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2
              }}
            >
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ color: "#2e7d32" }}
              >
                ● Present
              </Typography>

              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ color: "#d32f2f" }}
              >
                ● Absent
              </Typography>
            </Box>
          }
        />


        {/* COMPACT ATTENDANCE CARDS */}

        <Box sx={{ overflowX: "auto", pb: 1 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "repeat(7, minmax(105px, 1fr))",
              gap: 1.5,
              minWidth: 780
            }}
          >
            {attendanceTrend.map((day) => {
              const isEmpty =
                day.present === 0 &&
                day.absent === 0;

              return (
                <Box
                  key={day.date}
                  sx={{
                    p: 1.5,
                    bgcolor: "#f8fbf8",
                    border: "1px solid #e5eee6",
                    borderRadius: 2,
                    textAlign: "center"
                  }}
                >

                  <Typography
                    fontWeight={700}
                    sx={{
                      color: "#183b29",
                      fontSize: 16
                    }}
                  >
                    {day.label}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {getWeekday(day.date)}
                  </Typography>


                  {/* BARS */}

                  <Box
                    sx={{
                      height: 64,
                      my: 1.5,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-end",
                      gap: 0.8
                    }}
                  >
                    {isEmpty ? (
                      <Box
                        sx={{
                          width: 25,
                          height: 48,
                          bgcolor: "#e3e8e5",
                          borderRadius: 1
                        }}
                      />
                    ) : (
                      <>
                        {day.present > 0 && (
                          <Box
                            title={`${day.present} Present`}
                            sx={{
                              width: 24,
                              height: `${
                                Math.max(
                                  12,
                                  (day.present / maxAttendance) * 55
                                )
                              }px`,
                              bgcolor: "#2e7d32",
                              borderRadius: 1
                            }}
                          />
                        )}

                        {day.absent > 0 && (
                          <Box
                            title={`${day.absent} Absent`}
                            sx={{
                              width: 24,
                              height: `${
                                Math.max(
                                  12,
                                  (day.absent / maxAttendance) * 55
                                )
                              }px`,
                              bgcolor: "#e53935",
                              borderRadius: 1
                            }}
                          />
                        )}
                      </>
                    )}
                  </Box>


                  {/* DAILY COUNT */}

                  <Typography
                    variant="body2"
                    fontWeight={700}
                  >
                    <Box
                      component="span"
                      sx={{ color: "#2e7d32" }}
                    >
                      {day.present} P
                    </Box>

                    {" / "}

                    <Box
                      component="span"
                      sx={{
                        color: day.absent > 0
                          ? "#d32f2f"
                          : "#455a64"
                      }}
                    >
                      {day.absent} A
                    </Box>
                  </Typography>

                </Box>
              );
            })}
          </Box>
        </Box>
      </Paper>


      {/* EQUIPMENT SERVICES */}

      <Paper elevation={0} sx={sectionStyle}>

        <SectionHeader
          icon={faWrench}
          title="Upcoming Equipment Services"
          subtitle="Monitor maintenance schedules and service deadlines"
        />


        <Box sx={{ overflowX: "auto" }}>
          <Box sx={{ minWidth: 760 }}>

            {/* TABLE HEADER */}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns:
                  "2fr 1.3fr 1.3fr 0.9fr 0.7fr",
                gap: 2,
                bgcolor: "#eaf3ec",
                borderRadius: 2,
                px: 2,
                py: 1.5
              }}
            >
              {[
                "Equipment",
                "Next Service Date",
                "Days Remaining",
                "Status",
                "Action"
              ].map((heading) => (
                <Typography
                  key={heading}
                  variant="body2"
                  fontWeight={700}
                  sx={{ color: "#183b29" }}
                >
                  {heading}
                </Typography>
              ))}
            </Box>


            {/* SERVICE RECORDS */}

            {serviceDue.length === 0 ? (
              <Typography
                color="text.secondary"
                textAlign="center"
                sx={{ py: 4 }}
              >
                No equipment registered yet.
              </Typography>
            ) : (
              serviceDue.map((item) => {
                const days = Number(item.daysLeft);

                const daysLabel =
                  !Number.isFinite(days)
                    ? "Not available"
                    : days < 0
                    ? `${Math.abs(days)} days overdue`
                    : days === 0
                    ? "Due today"
                    : `${days} days left`;

                const isOverdue =
                  item.serviceStatus === "Overdue";

                const isSoon =
                  item.serviceStatus === "Due Soon";

                return (
                  <Box
                    key={item.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "2fr 1.3fr 1.3fr 0.9fr 0.7fr",
                      alignItems: "center",
                      gap: 2,
                      px: 2,
                      py: 2,
                      borderBottom: "1px solid #edf1ed"
                    }}
                  >

                    {/* MACHINE NAME */}

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: "#e8f5e9",
                          color: "#1b5e20",
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        <FontAwesomeIcon icon={faTractor} />
                      </Box>

                      <Typography
                        variant="body2"
                        fontWeight={700}
                      >
                        {item.name}
                      </Typography>
                    </Box>


                    {/* SERVICE DATE */}

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faCalendarDays}
                        color="#607d8b"
                      />

                      <Typography variant="body2">
                        {item.nextServiceDate || "Not set"}
                      </Typography>
                    </Box>


                    {/* DAYS LEFT */}

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faClock}
                        color="#607d8b"
                      />

                      <Chip
                        label={daysLabel}
                        size="small"
                        sx={{
                          bgcolor: isOverdue
                            ? "#ffebee"
                            : isSoon
                            ? "#fff3e0"
                            : "#e8f1ff",
                          color: isOverdue
                            ? "#c62828"
                            : isSoon
                            ? "#a66a00"
                            : "#174ea6",
                          fontWeight: 700
                        }}
                      />
                    </Box>


                    {/* STATUS */}

                    <Chip
                      label={item.serviceStatus || "OK"}
                      size="small"
                      color={
                        isOverdue
                          ? "error"
                          : isSoon
                          ? "warning"
                          : "success"
                      }
                      sx={{ fontWeight: 700 }}
                    />


                    {/* VIEW */}

                    <Button
                      size="small"
                      disabled={!onOpenEquipment}
                      onClick={onOpenEquipment}
                      endIcon={
                        <FontAwesomeIcon icon={faArrowRight} />
                      }
                      sx={{
                        color: "#1b5e20",
                        textTransform: "none",
                        fontWeight: 700
                      }}
                    >
                      View
                    </Button>

                  </Box>
                );
              })
            )}

          </Box>
        </Box>
      </Paper>

    </Box>
  );
}

export default DashboardExtras;