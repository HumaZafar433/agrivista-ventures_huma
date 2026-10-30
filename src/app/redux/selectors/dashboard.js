import { createSelector } from "@reduxjs/toolkit";
import { selectMonthlyWages } from "./attendance";

const empty = [];

const getWorkers = (state) =>
  state.workers?.workers || empty;

const getAttendance = (state) =>
  state.attendance?.records || empty;

const getExpenses = (state) =>
  Array.isArray(state.expenses) ? state.expenses : empty;

export const selectWorkforceToday = createSelector(
  [
    getWorkers,
    getAttendance,
    (state, date) => date
  ],
  (workers, records, date) => {
    const activeWorkers = workers.filter(
      (worker) => worker.status === "Active"
    );

    const todayRecords = records.filter(
      (record) =>
        record.date === date &&
        activeWorkers.some(
          (worker) =>
            String(worker.id) === String(record.workerId)
        )
    );

    const present = todayRecords.filter(
      (record) => record.status === "Present"
    ).length;

    const absent = todayRecords.filter(
      (record) => record.status === "Absent"
    ).length;

    return {
      total: workers.length,
      active: activeWorkers.length,
      present,
      absent,
      unmarked: activeWorkers.length - todayRecords.length,
      highAbsence:
        activeWorkers.length > 0 &&
        absent / activeWorkers.length > 0.3
    };
  }
);

export const selectUnpaidWages = createSelector(
  [
    selectMonthlyWages,
    getExpenses,
    (state, month) => month
  ],
  (wages, expenses, month) => {
    return wages.reduce((total, worker) => {
      const paid = expenses.some(
        (expense) =>
          String(expense.id) ===
          `wage-${worker.id}-${month}`
      );

      return total + (paid ? 0 : worker.payable);
    }, 0);
  }
);

export const selectAttendanceTrend = createSelector(
  [
    getAttendance,
    (state, today) => today
  ],
  (records, today) => {
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(`${today}T12:00:00`);
      date.setDate(date.getDate() - i);

      const iso = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
      ].join("-");

      const dayRecords = records.filter(
        (record) => record.date === iso
      );

      result.push({
        date: iso,
        label: `${date.getDate()}/${date.getMonth() + 1}`,
        present: dayRecords.filter(
          (record) => record.status === "Present"
        ).length,
        absent: dayRecords.filter(
          (record) => record.status === "Absent"
        ).length
      });
    }

    return result;
  }
);