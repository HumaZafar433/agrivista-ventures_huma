import {
  KEYS,
  ok,
  bad,
  uid,
  storageApi
} from "../index";

export async function getWorkers() {
  return storageApi.getList(KEYS.workers);
}

export async function createWorker(workerData) {
  const response = await getWorkers();

  if (!response.data.succeeded) {
    return response;
  }

  const workers = response.data.data;

  const name = workerData.fullName?.trim() || "";
  const cnic = workerData.cnic?.replace(/\D/g, "") || "";
  const phone = workerData.phone?.trim() || "";
  const wage = Number(workerData.dailyWage);

  if (
    name.length < 3 ||
    !/^[A-Za-z ]+$/.test(name)
  ) {
    return bad("Enter a valid worker name.");
  }

  if (!/^\d{13}$/.test(cnic)) {
    return bad("CNIC must contain 13 digits.");
  }

  if (!/^\d{11}$/.test(phone)) {
    return bad("Phone number must contain 11 digits.");
  }

  if (!Number.isFinite(wage) || wage <= 0) {
    return bad("Daily wage must be greater than zero.");
  }

  const alreadyExists = workers.some(
    (worker) =>
      String(worker.cnic).replace(/\D/g, "") === cnic
  );

  if (alreadyExists) {
    return bad("Worker with this CNIC already exists.");
  }

  const newWorker = {
    ...workerData,
    id: uid(),
    fullName: name,
    dailyWage: wage,
    status: workerData.status || "Active"
  };

  const saved = await storageApi.saveList(
    KEYS.workers,
    [...workers, newWorker]
  );

  return saved.data.succeeded
    ? ok(newWorker, "Worker added successfully.")
    : saved;
}

export async function updateWorker(updatedWorker) {
  const response = await getWorkers();

  if (!response.data.succeeded) {
    return response;
  }

  const workers = response.data.data;

  const existing = workers.find(
    (worker) => worker.id === updatedWorker.id
  );

  if (!existing) {
    return bad("Worker not found.");
  }

  const mergedWorker = {
    ...existing,
    ...updatedWorker
  };

  const name = String(mergedWorker.fullName || "").trim();
  const cnic = String(mergedWorker.cnic || "").replace(/\D/g, "");
  const phone = String(mergedWorker.phone || "").trim();
  const wage = Number(mergedWorker.dailyWage);

  if (name.length < 3 || !/^[A-Za-z ]+$/.test(name)) {
    return bad("Enter a valid worker name.");
  }

  if (!/^\d{13}$/.test(cnic)) {
    return bad("CNIC must contain 13 digits.");
  }

  if (!/^\d{11}$/.test(phone)) {
    return bad("Phone number must contain 11 digits.");
  }

  if (!Number.isFinite(wage) || wage <= 0) {
    return bad("Daily wage must be greater than zero.");
  }

  if (
    workers.some(
      (worker) =>
        worker.id !== updatedWorker.id &&
        String(worker.cnic).replace(/\D/g, "") === cnic
    )
  ) {
    return bad("Worker with this CNIC already exists.");
  }

  const updatedList = workers.map((worker) =>
    worker.id === updatedWorker.id
      ? { ...mergedWorker, fullName: name, dailyWage: wage }
      : worker
  );

  const saved = await storageApi.saveList(
    KEYS.workers,
    updatedList
  );

  return saved.data.succeeded
    ? ok(
        { ...mergedWorker, fullName: name, dailyWage: wage },
        "Worker updated successfully."
      )
    : saved;
}

export async function removeWorker(id) {
  const response = await getWorkers();

  if (!response.data.succeeded) {
    return response;
  }

  const workers = response.data.data;

  if (!workers.some((worker) => worker.id === id)) {
    return bad("Worker not found.");
  }

  const updatedList = workers.filter(
    (worker) => worker.id !== id
  );

  const saved = await storageApi.saveList(
    KEYS.workers,
    updatedList
  );

  return saved.data.succeeded
    ? ok({ id }, "Worker deleted successfully.")
    : saved;
}