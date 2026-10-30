import { createSelector } from "@reduxjs/toolkit";

const emptyList = [];

const getWorkers = (state) =>
  state.workers?.workers || emptyList;

const getAttendance = (state) =>
  state.attendance?.records || emptyList;

// Daily attendance summary

export const selectDailyAttendance = createSelector(
  [
    getAttendance,
    (state, date) => date
  ],
  (records, date) => {
    const todayRecords = records.filter(
      (record) => record.date === date
    );

    return {
      present: todayRecords.filter(
        (record) => record.status === "Present"
      ).length,

      absent: todayRecords.filter(
        (record) => record.status === "Absent"
      ).length,

      halfDay: todayRecords.filter(
        (record) => record.status === "Half-day"
      ).length,

      leave: todayRecords.filter(
        (record) => record.status === "Leave"
      ).length
    };
  }
);

// Monthly salary calculation

export const selectMonthlyWages = createSelector(
  [
    getWorkers,
    getAttendance,
    (state, month) => month
  ],
  (workers, records, month) =>
    workers.map((worker) => {
      const workerRecords = records.filter(
        (record) =>
          String(record.workerId) === String(worker.id) &&
          record.date.startsWith(month)
      );

      const presentDays = workerRecords.filter(
        (record) => record.status === "Present"
      ).length;

      const halfDays = workerRecords.filter(
        (record) => record.status === "Half-day"
      ).length;

      const absentDays = workerRecords.filter(
        (record) => record.status === "Absent"
      ).length;

      const payable =
        (presentDays + halfDays * 0.5) *
        Number(worker.dailyWage || 0);

      return {
        ...worker,
        presentDays,
        halfDays,
        absentDays,
        payable
      };
    })
);