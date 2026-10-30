import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Paper
} from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faCloudSun,
  faSeedling,
  faCalendarCheck,
  faWheatAwn,
  faClipboardList,
  faExclamationTriangle,
  faCalendarDays,
  faClock
} from "@fortawesome/free-solid-svg-icons";

import WeatherCard from "./WeatherCard";


const cardStyle = {
  borderRadius: 3,
  border: "1px solid #e2ebe4",
  boxShadow: "0 5px 20px rgba(20,50,30,0.05)",
  backgroundColor: "#ffffff"
};


function SectionHeading({ icon, title, subtitle }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        mb: 3
      }}
    >
      <Box
        sx={{
          width: 50,
          height: 50,
          backgroundColor: "#e8f5e9",
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
          sx={{ mt: 0.4 }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
}


const getHealthStatus = (crop) => {
  const score = Number(crop.healthScore || 0);

  if (score >= 70) return "Healthy";

  if (score >= 40) return "Needs Attention";

  return "Critical";
};


function Dashboard({ crops = [], orders = [] }) {

  const totalCrops = crops.length;

  const healthyCrops = crops.filter(
    (crop) => getHealthStatus(crop) === "Healthy"
  ).length;

  const attentionCrops = crops.filter(
    (crop) => getHealthStatus(crop) === "Needs Attention"
  ).length;

  const criticalCrops = crops.filter(
    (crop) => getHealthStatus(crop) === "Critical"
  ).length;


  const stats = [
    {
      title: "Crops Monitored",
      value: totalCrops,
      detail: "Total crops in the system",
      icon: faSeedling,
      color: "#1b5e20",
      background: "#e8f5e9"
    },
    {
      title: "Crops to Review",
      value: attentionCrops + criticalCrops,
      detail: "Crops requiring attention",
      icon: faExclamationTriangle,
      color: "#e65100",
      background: "#fff3e0"
    },
    {
      title: "Orders Received",
      value: orders.length,
      detail: "Total customer orders",
      icon: faClipboardList,
      color: "#1565c0",
      background: "#e3f2fd"
    }
  ];


  const healthGroups = [
    {
      label: "Healthy",
      count: healthyCrops,
      color: "#2e7d32"
    },
    {
      label: "Needs Attention",
      count: attentionCrops,
      color: "#ef6c00"
    },
    {
      label: "Critical",
      count: criticalCrops,
      color: "#d32f2f"
    }
  ];


  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const harvests = crops
    .map((crop) => {

      const date = crop.cuttingDate || crop.harvestDate;

      if (!date) return null;

      const cuttingDate = new Date(
        `${date}T00:00:00`
      );

      if (Number.isNaN(cuttingDate.getTime())) {
        return null;
      }

      const daysLeft = Math.round(
        (cuttingDate - today) / 86400000
      );

      return {
        ...crop,
        cuttingDate: date,
        daysLeft
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 2);



  const getHarvestStatus = (days) => {

    if (days < 0) {
      return {
        label: "Overdue",
        color: "error"
      };
    }

    if (days <= 3) {
      return {
        label: "Due Soon",
        color: "warning"
      };
    }

    return {
      label: "Scheduled",
      color: "success"
    };
  };


  return (
    <Box
      sx={{
        backgroundColor: "#f5f8f5",
        minHeight: "100vh"
      }}
    >

      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 2, md: 4 },
          py: 4
        }}
      >


        <Box
          sx={{
            background:
              "linear-gradient(110deg, #153c2b 0%, #256c45 100%)",
            color: "#ffffff",
            borderRadius: 3,
            px: { xs: 3, md: 4 },
            py: { xs: 3, md: 4 },
            mb: 3
          }}
        >

          <Chip
            label="FARM MONITORING"
            size="small"
            sx={{
              color: "white",
              bgcolor: "rgba(255,255,255,0.15)",
              mb: 2,
              fontWeight: 600
            }}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 1
            }}
          >
            <FontAwesomeIcon
              icon={faWheatAwn}
              style={{ fontSize: 29 }}
            />

            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                fontSize: { xs: 25, md: 34 }
              }}
            >
              Farm Overview
            </Typography>
          </Box>

          <Typography
            sx={{
              color: "#d7eadc",
              maxWidth: 650,
              lineHeight: 1.7
            }}
          >
            Monitor crop conditions, weather updates and
            important farm activities from one dashboard.
          </Typography>

        </Box>


        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, minmax(0, 1fr))"
            },
            gap: 2.5,
            mb: 3
          }}
        >

          {stats.map((item) => (

            <Card
              key={item.title}
              sx={cardStyle}
            >
              <CardContent
                sx={{
                  p: 3,
                  "&:last-child": { pb: 3 }
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
                      color="text.secondary"
                      variant="body2"
                      fontWeight={500}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      variant="h4"
                      fontWeight={800}
                      sx={{
                        color: item.color,
                        my: 1
                      }}
                    >
                      {item.value}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ color: "#66736a" }}
                    >
                      {item.detail}
                    </Typography>

                  </Box>


                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: item.background,
                      color: item.color,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 21,
                      flexShrink: 0
                    }}
                  >
                    <FontAwesomeIcon icon={item.icon} />
                  </Box>

                </Box>

              </CardContent>
            </Card>

          ))}

        </Box>


        <Paper
          elevation={0}
          sx={{
            ...cardStyle,
            p: { xs: 2, md: 3 },
            mb: 3
          }}
        >

          <SectionHeading
            icon={faCloudSun}
            title="Live Weather"
            subtitle="Current weather conditions and upcoming forecast for Lahore"
          />

          <Box
            sx={{
              "& .card": {
                border: "none !important",
                boxShadow: "none !important",
                backgroundColor: "transparent"
              },
              "& .card-body": {
                padding: "0 !important"
              },
              "& .card-body > h5": {
                display: "none"
              }
            }}
          >
            <WeatherCard />
          </Box>

        </Paper>


        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))"
            },
            gap: 3,
            mb: 2
          }}
        >


          <Card sx={cardStyle}>

            <CardContent
              sx={{
                p: 3,
                height: "100%",
                "&:last-child": { pb: 3 }
              }}
            >

              <SectionHeading
                icon={faSeedling}
                title="Crop Health Overview"
                subtitle="Health distribution of monitored crops"
              />


              {healthGroups.map((group) => {

                const percentage =
                  totalCrops > 0
                    ? (group.count / totalCrops) * 100
                    : 0;

                return (
                  <Box
                    key={group.label}
                    sx={{ mb: 3 }}
                  >

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1,
                        mb: 1
                      }}
                    >

                      <Typography
                        fontWeight={600}
                        sx={{ color: "#183b29" }}
                      >
                        {group.label}
                      </Typography>

                      <Typography
                        fontWeight={700}
                        sx={{ color: group.color }}
                      >
                        {group.count}{" "}
                        {group.count === 1
                          ? "Crop"
                          : "Crops"}
                      </Typography>

                    </Box>


                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: "#e9efea",

                        "& .MuiLinearProgress-bar": {
                          backgroundColor: group.color,
                          borderRadius: 5
                        }
                      }}
                    />

                  </Box>
                );
              })}


              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: "#f7faf7",
                  borderRadius: 2,
                  border: "1px solid #e8efe8"
                }}
              >

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Total monitored crops:{" "}
                  <strong>{totalCrops}</strong>
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Detailed crop records are available
                  in the Crops section.
                </Typography>

              </Box>

            </CardContent>
          </Card>


          <Card sx={cardStyle}>

            <CardContent
              sx={{
                p: 3,
                "&:last-child": { pb: 3 }
              }}
            >

              <SectionHeading
                icon={faCalendarCheck}
                title="Harvest Priorities"
                subtitle="Cutting dates that need attention first"
              />


              {harvests.length === 0 && (

                <Box
                  sx={{
                    p: 3,
                    textAlign: "center",
                    bgcolor: "#f7faf7",
                    borderRadius: 2
                  }}
                >
                  <Typography color="text.secondary">
                    No harvest dates recorded yet.
                  </Typography>
                </Box>

              )}


              {harvests.map((crop) => {

                const status = getHarvestStatus(
                  crop.daysLeft
                );

                return (
                  <Box
                    key={crop.id}
                    sx={{
                      backgroundColor: "#f7faf7",
                      border: "1px solid #e2ebe4",
                      borderRadius: 2,
                      p: 2.5,
                      mb: 2
                    }}
                  >

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1,
                        mb: 1
                      }}
                    >

                      <Typography
                        fontWeight={700}
                        sx={{ color: "#183b29" }}
                      >
                        {crop.name}
                      </Typography>

                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                      />

                    </Box>


                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {crop.field}
                    </Typography>


                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 2
                      }}
                    >

                      <FontAwesomeIcon
                        icon={faCalendarDays}
                        color="#607d8b"
                      />

                      <Typography
                        variant="body2"
                        fontWeight={600}
                      >
                        Cutting Date: {crop.cuttingDate}
                      </Typography>

                    </Box>


                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1
                      }}
                    >

                      <FontAwesomeIcon
                        icon={faClock}
                        color={
                          crop.daysLeft < 0
                            ? "#c62828"
                            : "#2e7d32"
                        }
                      />

                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          color:
                            crop.daysLeft < 0
                              ? "#c62828"
                              : "#2e7d32"
                        }}
                      >

                        {crop.daysLeft < 0
                          ? `${Math.abs(
                              crop.daysLeft
                            )} days overdue`
                          : crop.daysLeft === 0
                          ? "Scheduled for today"
                          : `${crop.daysLeft} days remaining`}

                      </Typography>

                    </Box>

                  </Box>
                );
              })}


              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                View the complete cutting schedule
                in Harvest & Orders.
              </Typography>

            </CardContent>
          </Card>

        </Box>

      </Container>

    </Box>
  );
}

export default Dashboard;