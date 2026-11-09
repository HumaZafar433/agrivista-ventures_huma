
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

// PostgreSQL API request
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

  if (
    !response.ok ||
    !result ||
    result.succeeded === false
  ) {
    throw new Error(
      result?.message ||
      `Worker request failed (${response.status})`
    );
  }

  // Redux actions expect response.data
  return {
    data: result
  };
}

// Get workers from PostgreSQL
export async function getWorkers() {
  return workerRequest();
}

// Add worker to PostgreSQL
export async function createWorker(workerData) {
  return workerRequest("", "POST", workerData);
}

// Update worker in PostgreSQL
export async function updateWorker(updatedWorker) {
  const { id, ...workerData } = updatedWorker;

  return workerRequest(
    `/${encodeURIComponent(id)}`,
    "PUT",
    workerData
  );
}

// Delete worker from PostgreSQL
export async function removeWorker(id) {
  return workerRequest(
    `/${encodeURIComponent(id)}`,
    "DELETE"
  );
}
