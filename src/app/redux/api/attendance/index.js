
const API = "http://localhost:5000/api/attendance";

function getToken() {
  try {
    const session = JSON.parse(
      localStorage.getItem("agri_session") || "{}"
    );

    return session.token || "";
  } catch {
    return "";
  }
}
async function attendanceRequest(
  path = "",
  method = "GET",
  data = undefined
) {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Login session missing. Please login again."
    );
  }

  let response;

  try {
    response = await fetch(`${API}${path}`, {
      method,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      ...(data !== undefined
        ? { body: JSON.stringify(data) }
        : {})
    });
  } catch {
    throw new Error(
      "Cannot connect to backend on port 5000."
    );
  }

  const result = await response
    .json()
    .catch(() => null);

  if (!response.ok || !result) {
    throw new Error(
      result?.message ||
      `Attendance request failed (${response.status})`
    );
  }

  // Redux actions expect response.data
  return {
    data: result
  };
}

export async function getAttendance() {
  return attendanceRequest();
}


export async function markAttendance(data) {
  const validStatuses = [
    "Present",
    "Absent",
    "Half-day",
    "Leave"
  ];

  if (!data.workerId || !data.date) {
    throw new Error(
      "Please select a worker and date."
    );
  }

  if (!validStatuses.includes(data.status)) {
    throw new Error(
      "Please select a valid attendance status."
    );
  }

  const payload = {
    workerId: data.workerId,
    date: data.date,
    status: data.status,
    note: data.note || ""
  };

  return attendanceRequest(
    "",
    "POST",
    payload
  );
}


export async function updateAttendance(data) {
  if (!data.id) {
    throw new Error(
      "Attendance record ID is missing."
    );
  }

  const { id, ...payload } = data;

  return attendanceRequest(
    `/${encodeURIComponent(id)}`,
    "PUT",
    payload
  );
}

export async function removeAttendance(id) {
  if (!id) {
    throw new Error(
      "Attendance record ID is missing."
    );
  }

  return attendanceRequest(
    `/${encodeURIComponent(id)}`,
    "DELETE"
  );
}
