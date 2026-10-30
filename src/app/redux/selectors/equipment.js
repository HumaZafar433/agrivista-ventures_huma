import { createSelector } from "@reduxjs/toolkit";
const empty = [];
const equipment = state => state.equipment?.items || empty;
const services = state => state.maintenance?.services || empty;

export const selectEquipmentWithService = createSelector([equipment, services], (items, maintenance) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return items.map(item => {
    const recent = maintenance.filter(s => String(s.equipmentId) === String(item.id))
      .map(s => s.date).sort().at(-1);
    const last = [item.baselineLastServiceDate || item.lastServiceDate, recent].filter(Boolean).sort().at(-1);
    const due = new Date(`${last}T00:00:00`);
    due.setDate(due.getDate() + Number(item.serviceIntervalDays || 1));
    const daysLeft = Math.round((due - today) / 86400000);
    return {
      ...item, lastServiceDate: last,
      nextServiceDate: `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-${String(due.getDate()).padStart(2, "0")}`,
      daysLeft, serviceStatus: daysLeft < 0 ? "Overdue" : daysLeft <= 7 ? "Due Soon" : "OK"
    };
  });
});

export const selectEquipmentStats = createSelector([selectEquipmentWithService], items => ({
  total: items.length,
  active: items.filter(e => e.status === "Active").length,
  repair: items.filter(e => e.status === "Under Repair").length,
  idle: items.filter(e => e.status === "Idle").length,
  due: items.filter(e => e.serviceStatus !== "OK").length
}));

export const selectServiceDue = createSelector([selectEquipmentWithService], items =>
  [...items].sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5));
