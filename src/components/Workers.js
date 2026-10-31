import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Container,
  Typography,
  Paper,
  Alert
} from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faUsers,
  faUserCheck,
  faUserXmark
} from "@fortawesome/free-solid-svg-icons";

import WorkerForm from "./WorkerForm";
import WorkerTable from "./WorkerTable";
import AttendanceRegister from "./AttendanceRegister";
import ConfirmModal from "./ConfirmModal";

import {
  GETWORKERS,
  ADDWORKER,
  UPDATEWORKER,
  REMOVEWORKER
} from "../app/redux/actions/workers";


// EMPTY WORKER FORM

const initialForm = {
  fullName: "",
  cnic: "",
  phone: "",
  role: "Farm Hand",
  dailyWage: "",
  joinDate: "",
  status: "Active"
};


function Workers() {

  const dispatch = useDispatch();

  // WORKERS DATA FROM REDUX

  const {
    workers = [],
    workersLoading,
    addLoading,
    updateLoading,
    removeLoading,
    workersError,
    addError,
    updateError,
    removeError
  } = useSelector((state) => state.workers);


  // USER ROLE

  const role = useSelector(
    (state) => state.auth.role
  );

  const isAdmin = role === "Admin";


  // LOCAL FORM STATE

  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);

  const [workerToDelete, setWorkerToDelete] = useState(null);

  const [message, setMessage] = useState("");

  const [formError, setFormError] = useState("");


  // LOAD WORKERS

  useEffect(() => {
    dispatch(GETWORKERS());
  }, [dispatch]);


  // UPDATE FORM FIELDS

  const updateField = (field, value) => {

    let updatedValue = value;

    // Only allow numbers and dashes in CNIC
    if (field === "cnic") {
      updatedValue = value
        .replace(/[^\d-]/g, "")
        .slice(0, 15);
    }

    // Only allow 11 digits in phone
    if (field === "phone") {
      updatedValue = value
        .replace(/\D/g, "")
        .slice(0, 11);
    }

    setForm((previous) => ({
      ...previous,
      [field]: updatedValue
    }));

    setFormError("");
    setMessage("");
  };


  // RESET FORM

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setFormError("");
  };


  // ADD OR UPDATE WORKER

  const handleSubmit = (event) => {

    event.preventDefault();

    setFormError("");
    setMessage("");

    const name = form.fullName.trim();

    const cnic = form.cnic.replace(/\D/g, "");

    const phone = form.phone.trim();

    const wage = Number(form.dailyWage);


    // FORM VALIDATION

    if (!/^[A-Za-z ]{3,}$/.test(name)) {
      setFormError(
        "Enter a valid worker name with at least 3 letters."
      );
      return;
    }

    if (cnic.length !== 13) {
      setFormError(
        "CNIC must contain exactly 13 digits."
      );
      return;
    }

    if (!/^\d{11}$/.test(phone)) {
      setFormError(
        "Phone number must contain 11 digits."
      );
      return;
    }

    if (
      !Number.isFinite(wage) ||
      wage <= 0
    ) {
      setFormError(
        "Daily wage must be greater than zero."
      );
      return;
    }

    if (!form.joinDate) {
      setFormError(
        "Please select a joining date."
      );
      return;
    }


    const workerData = {
      ...form,
      fullName: name,
      phone,
      dailyWage: wage
    };


    // UPDATE EXISTING WORKER

    if (editingId !== null) {

      if (!isAdmin) return;

      dispatch(
        UPDATEWORKER(
          {
            ...workerData,
            id: editingId
          },

          () => {
            resetForm();

            setMessage(
              "Worker updated successfully!"
            );
          }
        )
      );

    } else {

      // ADD NEW WORKER

      dispatch(
        ADDWORKER(
          workerData,

          () => {
            resetForm();

            setMessage(
              "Worker registered successfully!"
            );
          }
        )
      );

    }
  };


  // EDIT WORKER

  const handleEdit = (worker) => {

    if (!isAdmin) return;

    setEditingId(worker.id);

    setForm({
      fullName: worker.fullName || "",
      cnic: worker.cnic || "",
      phone: worker.phone || "",
      role: worker.role || "Farm Hand",
      dailyWage: String(worker.dailyWage || ""),
      joinDate: worker.joinDate || "",
      status: worker.status || "Active"
    });

    setMessage("");
    setFormError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };


  // OPEN DELETE CONFIRMATION

  const handleDelete = (worker) => {

    if (!isAdmin) return;

    setWorkerToDelete(worker);

  };


  // CONFIRM WORKER DELETE

  const confirmDelete = () => {

    if (!isAdmin || !workerToDelete) return;

    dispatch(
      REMOVEWORKER(
        workerToDelete.id,

        () => {

          setMessage(
            "Worker deleted successfully!"
          );

          setWorkerToDelete(null);
        }
      )
    );
  };


  // WORKER STATISTICS

  const totalWorkers = workers.length;

  const activeWorkers = workers.filter(
    (worker) => worker.status === "Active"
  ).length;

  const inactiveWorkers =
    totalWorkers - activeWorkers;


  const summaryCards = [
    {
      title: "Total Workers",
      value: totalWorkers,
      icon: faUsers,
      color: "#1b5e20",
      background: "#e8f5e9"
    },
    {
      title: "Active Workers",
      value: activeWorkers,
      icon: faUserCheck,
      color: "#2e7d32",
      background: "#e8f5e9"
    },
    {
      title: "Inactive Workers",
      value: inactiveWorkers,
      icon: faUserXmark,
      color: "#c62828",
      background: "#ffebee"
    }
  ];


  // ERROR MESSAGES

  const error =
    formError ||
    workersError ||
    addError ||
    updateError ||
    removeError;


  return (

    <Box
      sx={{
        bgcolor: "#f4f8f4",
        minHeight: "100vh",
        py: 4
      }}
    >

      <Container maxWidth="xl">


        {/* PAGE HEADING */}

        <Box sx={{ mb: 4 }}>

          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: "#183b29" }}
          >
            Workers & Labour Management
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Manage farm workers, employment details,
            attendance and monthly wages.
          </Typography>

        </Box>


        {/* SUMMARY CARDS */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, minmax(0, 1fr))"
            },
            gap: 2,
            mb: 4
          }}
        >

          {summaryCards.map((card) => (

            <Paper
              key={card.title}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e3ebe4",
                boxShadow:
                  "0 4px 16px rgba(0,0,0,0.04)"
              }}
            >

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
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
                    variant="h4"
                    fontWeight={800}
                    sx={{
                      color: "#183b29",
                      mt: 1
                    }}
                  >
                    {card.value}
                  </Typography>

                </Box>


                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    bgcolor: card.background,
                    color: card.color,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 22
                  }}
                >

                  <FontAwesomeIcon icon={card.icon} />

                </Box>

              </Box>

            </Paper>

          ))}

        </Box>


        {/* ERROR MESSAGE */}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}


        {/* SUCCESS MESSAGE */}

        {message && (
          <Alert
            severity="success"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setMessage("")}
          >
            {message}
          </Alert>
        )}


        {/* REUSABLE WORKER FORM */}

        <WorkerForm
          form={form}
          editingId={editingId}
          updateField={updateField}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          loading={addLoading || updateLoading}
        />


        {/* REUSABLE WORKER TABLE */}

        <WorkerTable
          workers={workers}
          loading={workersLoading}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />


        {/* ATTENDANCE AND PAYROLL */}

        <AttendanceRegister />


        {/* DELETE CONFIRMATION */}

        <ConfirmModal
          open={Boolean(workerToDelete)}
          title="Delete Worker"
          description={
            workerToDelete
              ? `Are you sure you want to delete ${workerToDelete.fullName}? This action cannot be undone.`
              : ""
          }
          onCancel={() => setWorkerToDelete(null)}
          onConfirm={confirmDelete}
          busy={removeLoading}
        />


      </Container>

    </Box>
  );
}

export default Workers;