export const KEYS = {
  crops: "agri_crops",
  orders: "agri_orders",
  buyers: "agri_buyers",
  tasks: "agri_tasks",
  expenses: "agri_expenses",
  inventory: "agri_inventory",

  workers: "agri_workers",
  attendance: "agri_attendance",
  equipment: "agri_equipment",
  maintenance: "agri_maintenance",

  activity: "agri_activity",
  session: "agri_session"
};

export const ok = (data, message = "Success") => ({
  data: {
    succeeded: true,
    message,
    data
  }
});

export const bad = (message) => ({
  data: {
    succeeded: false,
    message,
    data: null
  }
});


export const uid = () =>
  Date.now().toString(36) +
  Math.random().toString(36).slice(2, 7);


export const storageApi = {

  async getList(key) {
    try {
      const saved = localStorage.getItem(key);

      if (saved === null) {
        return ok([]);
      }

      const records = JSON.parse(saved);

      if (!Array.isArray(records)) {
        return bad("Stored data is invalid.");
      }

      return ok(records);

    } catch (error) {
      return bad("Unable to load records.");
    }
  },


  async saveList(key, records) {
    try {
      if (!Array.isArray(records)) {
        return bad("Invalid records.");
      }

      localStorage.setItem(
        key,
        JSON.stringify(records)
      );

      return ok(records, "Records saved successfully.");

    } catch (error) {
      return bad("Unable to save records.");
    }
  }

};