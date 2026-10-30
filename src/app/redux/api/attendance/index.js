import {
  KEYS,
  ok,
  bad,
  uid,
  storageApi
} from "../index";

const validStatuses = [
  "Present",
  "Absent",
  "Half-day",
  "Leave"
];

export async function getAttendance() {
  return storageApi.getList(KEYS.attendance);
}

export async function markAttendance(data) {
  const response = await getAttendance();

  if (!response.data.succeeded) {
    return response;
  }

  const records = response.data.data;

  if (!data.workerId || !data.date) {
    return bad("Select worker and date.");
  }

  if (!validStatuses.includes(data.status)) {
    return bad("Select a valid attendance status.");
  }

  const duplicate = records.some(
    (record) =>
      String(record.workerId) === String(data.workerId) &&
      record.date === data.date
  );

  if (duplicate) {
    return bad("Attendance already marked for this date.");
  }

  const newRecord = {
    id: uid(),
    workerId: data.workerId,
    date: data.date,
    status: data.status,
    note: data.note || ""
  };

  const saved = await storageApi.saveList(
    KEYS.attendance,
    [...records, newRecord]
  );

  return saved.data.succeeded
    ? ok(newRecord, "Attendance marked successfully.")
    : saved;
}

export async function updateAttendance(data) {
  const response = await getAttendance();

  if (!response.data.succeeded) {
    return response;
  }

  const records = response.data.data;

  if (!validStatuses.includes(data.status)) {
    return bad("Invalid attendance status.");
  }

  const existing = records.find(
    (record) => record.id === data.id
  );

  if (!existing) {
    return bad("Attendance record not found.");
  }

  const updated = {
    ...existing,
    ...data
  };

  const duplicate = records.some(
    (record) =>
      record.id !== data.id &&
      String(record.workerId) === String(updated.workerId) &&
      record.date === updated.date
  );

  if (duplicate) {
    return bad("Attendance already exists for this worker and date.");
  }

  const updatedRecords = records.map((record) =>
    record.id === data.id ? updated : record
  );

  const saved = await storageApi.saveList(
    KEYS.attendance,
    updatedRecords
  );

  return saved.data.succeeded
    ? ok(updated, "Attendance updated successfully.")
    : saved;
}

export async function removeAttendance(id) {
  const response = await getAttendance();

  if (!response.data.succeeded) {
    return response;
  }

  const records = response.data.data;

  if (!records.some((record) => record.id === id)) {
    return bad("Attendance record not found.");
  }

  const updatedRecords = records.filter(
    (record) => record.id !== id
  );

  const saved = await storageApi.saveList(
    KEYS.attendance,
    updatedRecords
  );

  return saved.data.succeeded
    ? ok({ id }, "Attendance deleted successfully.")
    : saved;
}