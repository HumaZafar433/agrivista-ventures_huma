
const API_URL = "http://localhost:5000/api/equipment";

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
          `Equipment request failed (${response.status})`
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

export async function getEquipment() {
  return apiRequest();
}

export async function createEquipment(input) {
  const { id, ...equipmentData } = input;

  return apiRequest("", {
    method: "POST",
    body: JSON.stringify(equipmentData)
  });
}

export async function updateEquipment(input) {
  if (!input.id) {
    return {
      data: {
        succeeded: false,
        message: "Equipment ID is missing."
      }
    };
  }

  return apiRequest(`/${input.id}`, {
    method: "PUT",
    body: JSON.stringify(input)
  });
}

export async function removeEquipment(id) {
  if (!id) {
    return {
      data: {
        succeeded: false,
        message: "Equipment ID is missing."
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
