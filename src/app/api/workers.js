
const API = "http://localhost:5000/api/workers";

// Get login token
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

// Common API request
async function workerRequest(
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

  const result = await response.json().catch(() => null);

  if (!response.ok || !result) {
    throw new Error(
      result?.message ||
      `Worker request failed (${response.status})`
    );
  }

  // Keep the response structure expected by Redux
  return {
    data: result
  };
}

// GET all workers
export const getWorkers = () => {
  return workerRequest();
};

// ADD new worker
export const createWorker = (data) => {
  return workerRequest("", "POST", data);
};

// UPDATE existing worker
export const updateWorker = (data) => {
  const { id, ...workerData } = data;

  return workerRequest(
    `/${encodeURIComponent(id)}`,
    "PUT",
    workerData
  );
};

// DELETE worker
export const removeWorker = (id) => {
  return workerRequest(
    `/${encodeURIComponent(id)}`,
    "DELETE"
  );
};
