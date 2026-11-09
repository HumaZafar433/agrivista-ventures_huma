
const API_URL = "http://localhost:5000/api/maintenance";

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
async function apiRequest(path = "", options = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...options.headers
    }
  });

  let result;

  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok || result.succeeded === false) {
    return {
      data: {
        succeeded: false,
        message:
          result.message ||
          `Maintenance request failed (${response.status})`
      }
    };
  }

  return {
    data: {
      succeeded: true,
      data: result.data,
      message: result.message || "Success"
    }
  };
}

// GET - Fetch maintenance from PostgreSQL
export async function getMaintenance() {
  return apiRequest();
}

// POST - Save maintenance record
export async function createService(input) {
  const { id, ...serviceData } = input;

  return apiRequest("", {
    method: "POST",
    body: JSON.stringify({
      ...serviceData,
      cost: Number(serviceData.cost || 0)
    })
  });
}

// PUT - Update maintenance record
export async function updateService(input) {
  if (!input.id) {
    return {
      data: {
        succeeded: false,
        message: "Maintenance record ID is missing."
      }
    };
  }

  return apiRequest(`/${input.id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...input,
      cost: Number(input.cost || 0)
    })
  });
}

// DELETE - Delete maintenance record
export async function removeService(id) {
  if (!id) {
    return {
      data: {
        succeeded: false,
        message: "Maintenance record ID is missing."
      }
    };
  }

  const result = await apiRequest(`/${id}`, {
    method: "DELETE"
  });

  if (result.data.succeeded && !result.data.data) {
    result.data.data = { id };
  }

  return result;
}
