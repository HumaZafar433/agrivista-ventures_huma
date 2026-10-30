import { KEYS, ok, bad, uid, storageApi } from "../index";

const isDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(String(d || "")) &&
  !Number.isNaN(new Date(d + "T00:00:00").getTime());

export const getMaintenance = () => storageApi.getList(KEYS.maintenance);

async function persistServiceList(nextServices) {
  const equipments = await storageApi.getList(KEYS.equipment);
  if (!equipments.data.succeeded) return equipments;
  const currentServices = await getMaintenance();
  if (!currentServices.data.succeeded) return currentServices;

  const nextEquipment = equipments.data.data.map(item => {
    const relatedDates = nextServices
      .filter(service => String(service.equipmentId) === String(item.id))
      .map(service => service.date).filter(Boolean);
    const baseline = item.baselineLastServiceDate || item.lastServiceDate;
    const lastServiceDate = [baseline, ...relatedDates].sort().at(-1) || baseline;
    return { ...item, lastServiceDate };
  });

  const savedServices = await storageApi.saveList(KEYS.maintenance, nextServices);
  if (!savedServices.data.succeeded) return savedServices;
  const savedEquipment = await storageApi.saveList(KEYS.equipment, nextEquipment);
  if (!savedEquipment.data.succeeded) {
    await storageApi.saveList(KEYS.maintenance, currentServices.data.data);
    return savedEquipment;
  }
  return ok(nextEquipment);
}

function validateService(data) {
  if (!data.equipmentId) return "Select equipment.";
  if (!isDate(data.date)) return "Choose a valid service date.";
  if (String(data.description || "").trim().length < 3) return "Service details must contain at least 3 characters.";
  if (!Number.isFinite(Number(data.cost)) || Number(data.cost) < 0) return "Cost cannot be negative.";
  if (!String(data.performedBy || "").trim()) return "Enter the service provider.";
  return null;
}

export async function createService(input) {
  const record = {
    ...input, description: String(input.description || "").trim(),
    performedBy: String(input.performedBy || "").trim(),
    cost: Number(input.cost), id: uid()
  };
  const error = validateService(record);
  if (error) return bad(error);
  const equipments = await storageApi.getList(KEYS.equipment);
  if (!equipments.data.succeeded) return equipments;
  if (!equipments.data.data.some(e => String(e.id) === String(record.equipmentId))) return bad("Machine not found.");
  const data = await getMaintenance();
  if (!data.data.succeeded) return data;
  const saved = await persistServiceList([...data.data.data, record]);
  return saved.data.succeeded ? ok(record, "Maintenance saved.") : saved;
}

export async function updateService(input) {
  const data = await getMaintenance();
  if (!data.data.succeeded) return data;
  const previous = data.data.data.find(s => String(s.id) === String(input.id));
  if (!previous) return bad("Service not found.");
  const record = {
    ...previous, ...input, id: previous.id,
    cost: Number(input.cost ?? previous.cost),
    description: String(input.description ?? previous.description).trim(),
    performedBy: String(input.performedBy ?? previous.performedBy).trim()
  };
  const error = validateService(record);
  if (error) return bad(error);
  const saved = await persistServiceList(data.data.data.map(s => String(s.id) === String(record.id) ? record : s));
  return saved.data.succeeded ? ok(record, "Maintenance updated.") : saved;
}

export async function removeService(id) {
  const data = await getMaintenance();
  if (!data.data.succeeded) return data;
  if (!data.data.data.some(s => String(s.id) === String(id))) return bad("Service not found.");
  const saved = await persistServiceList(data.data.data.filter(s => String(s.id) !== String(id)));
  return saved.data.succeeded ? ok({ id }, "Maintenance deleted.") : saved;
}
