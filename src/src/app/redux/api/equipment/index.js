import { KEYS, ok, bad, uid, storageApi } from "../index";

const types = ["Tractor", "Water Pump", "Sprayer", "Harvester", "Other"];
const statuses = ["Active", "Under Repair", "Idle"];

const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) &&
  !Number.isNaN(new Date(value + "T00:00:00").getTime());

function validateEquipment(item) {
  if (String(item.name || "").trim().length < 2) return "Enter equipment name (at least 2 characters).";
  if (!types.includes(item.type)) return "Choose a valid equipment type.";
  if (!statuses.includes(item.status)) return "Choose a valid status.";
  if (!validDate(item.purchaseDate)) return "Choose a valid purchase date.";
  if (!validDate(item.lastServiceDate)) return "Choose a valid last service date.";
  if (!Number.isInteger(Number(item.serviceIntervalDays)) || Number(item.serviceIntervalDays) < 1)
    return "Service interval must be at least 1 day.";
  return null;
}

export const getEquipment = () => storageApi.getList(KEYS.equipment);

export async function createEquipment(input) {
  const result = await getEquipment();
  if (!result.data.succeeded) return result;
  const item = {
    ...input,
    name: String(input.name || "").trim(),
    serviceIntervalDays: Number(input.serviceIntervalDays),
    baselineLastServiceDate: input.lastServiceDate,
    id: uid()
  };
  const error = validateEquipment(item);
  if (error) return bad(error);
  const list = result.data.data;
  const saved = await storageApi.saveList(KEYS.equipment, [...list, item]);
  return saved.data.succeeded ? ok(item, "Equipment added.") : saved;
}

export async function updateEquipment(input) {
  const result = await getEquipment();
  if (!result.data.succeeded) return result;
  const list = result.data.data;
  const old = list.find(item => String(item.id) === String(input.id));
  if (!old) return bad("Equipment not found.");
  const item = {
    ...old,
    ...input,
    id: old.id,
    name: String(input.name ?? old.name).trim(),
    serviceIntervalDays: Number(input.serviceIntervalDays ?? old.serviceIntervalDays),
    baselineLastServiceDate: input.lastServiceDate ?? old.baselineLastServiceDate ?? old.lastServiceDate
  };
  const error = validateEquipment(item);
  if (error) return bad(error);
  const saved = await storageApi.saveList(KEYS.equipment,
    list.map(existing => String(existing.id) === String(item.id) ? item : existing));
  return saved.data.succeeded ? ok(item, "Equipment updated.") : saved;
}

export async function removeEquipment(id) {
  const equipResult = await getEquipment();
  if (!equipResult.data.succeeded) return equipResult;
  const list = equipResult.data.data;
  if (!list.some(item => String(item.id) === String(id))) return bad("Equipment not found.");
  const servicesResult = await storageApi.getList(KEYS.maintenance);
  if (!servicesResult.data.succeeded) return servicesResult;
  if (servicesResult.data.data.some(s => String(s.equipmentId) === String(id))) {
    return bad("Delete this machine's maintenance records first to preserve the service history.");
  }
  const saved = await storageApi.saveList(KEYS.equipment,
    list.filter(item => String(item.id) !== String(id)));
  return saved.data.succeeded ? ok({ id }, "Equipment deleted.") : saved;
}
