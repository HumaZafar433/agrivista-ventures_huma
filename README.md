# AgriVista Ventures

### Smart Agriculture Management System

AgriVista Ventures is a React-based agriculture management application designed to organize and manage everyday farming operations through a single dashboard.

The system provides tools for crop monitoring, buyer registration, order management, farm scheduling, expense tracking, inventory control, financial reporting, and weather monitoring.

## Project Features

### 1. Dashboard

* Overview of farming operations and crop information.
* Live weather information for Lahore.
* Temperature, humidity, wind speed, and rainfall probability.
* Three-day weather forecast using the Open-Meteo API.

### 2. Crop Management

* Add, view, edit, and delete crop records.
* Track crop health scores and field information.
* Manage harvest quantities and cutting dates.
* Search crops by name or field.

### 3. Buyer Management

* Register buyers with contact and business details.
* Store buyer photos and identification information.
* Display registered buyers in a responsive layout.
* Prevent duplicate registrations using CNIC validation.

### 4. Order Management

* Place orders for registered buyers.
* Select crops and enter required quantities.
* Check available crop stock before confirming an order.
* Calculate order totals using quantity and selling price per kilogram.
* Track Pending and Delivered orders.

### 5. Farm Task Scheduler

* Create farming tasks for irrigation, fertilizer, spraying, and labour.
* Assign tasks to crops and set due dates.
* Track Pending, Completed, and Overdue tasks.
* Search and filter task records.

### 6. Expense Management

* Record farming expenses by crop and category.
* Track costs for seeds, fertilizer, labour, fuel, spraying, and other activities.
* View total expenses and category-wise breakdowns.
* Search and filter expense records.

### 7. Inventory Management

* Maintain records of agricultural supplies.
* Track current stock quantities and units.
* Record stock usage.
* Display low-stock alerts when quantities reach minimum levels.

### 8. Profit and Loss

* Calculate revenue from delivered orders with recorded selling prices.
* Compare recorded revenue against farming expenses.
* Display net profit or loss.
* Show crop-wise financial summaries.

### 9. Reports and Activity Log

* View monthly farming reports.
* Export report data to CSV.
* Print reports or save them as PDF using the browser.
* Track application activities and record changes.

### 10. Authentication and User Roles

The application includes two demonstration user roles:

**Admin**

* View and add records.
* Edit and delete permitted records.
* Manage delivery status and farm operations.

**Manager**

* View existing records.
* Add new records.
* Restricted from administrative edit and delete actions.

## Technologies Used

* React.js
* JavaScript (ES6+)
* Redux Toolkit
* React Redux
* React Router DOM
* Material UI
* Bootstrap
* Font Awesome
* HTML and CSS
* Browser localStorage
* Open-Meteo Weather API

## Installation and Setup

### Requirements

Install Node.js and npm before running the application.

### 1. Clone the Repository

```bash
git clone https://github.com/HumaZafar433/agrivista-ventures_huma.git
```

### 2. Open the Project

```bash
cd agrivista-ventures_huma
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Application

```bash
npm start
```

The application will normally open at:

`http://localhost:3000`

If port 3000 is occupied, React may offer another available port.

## Demo Login Credentials

For testing purposes:

| Role    | Username | Password   |
| ------- | -------- | ---------- |
| Admin   | admin    | admin123   |
| Manager | manager  | manager123 |

These credentials are intended only for demonstrating the frontend authentication workflow.

## Data Management

Redux Toolkit manages application state, including crops, buyers, orders, tasks, expenses, and inventory.

Browser localStorage is used to preserve application records between page refreshes.

The weather module retrieves information from the Open-Meteo API.

**Note:** This project is a frontend demonstration. It does not use a production backend or database. Authentication and role restrictions are implemented on the client side and are not intended for production security.

Data saved in one browser is not automatically shared with other users or included in the GitHub repository.

## Project Structure

```text
src/
├── components/
│   ├── auth/
│   ├── Dashboard.js
│   ├── Crops.js
│   ├── Buyers.js
│   ├── OrderForm.js
│   ├── SupplierOrders.js
│   ├── Tasks.js
│   ├── Expenses.js
│   ├── Inventory.js
│   ├── ProfitLoss.js
│   ├── Reports.js
│   └── WeatherCard.js
├── store/
│   ├── reducers/
│   ├── middleware/
│   └── selectors/
├── hooks/
├── data/
├── App.js
└── index.js
```

## Financial Calculation

The application uses the following formula:

**Revenue = Order Quantity × Selling Price per kg**

**Net Profit/Loss = Recorded Revenue − Recorded Expenses**

Revenue is calculated from delivered orders that have recorded selling prices. Older orders without selling prices are excluded from confirmed revenue calculations.

## Project Purpose

The purpose of AgriVista Ventures is to demonstrate React development concepts through a practical agriculture management application.

The project uses reusable components, React hooks, Redux Toolkit, conditional rendering, forms, routing, API integration, and responsive user interfaces.

---

**Project:** AgriVista Ventures
**Repository:** https://github.com/HumaZafar433/agrivista-ventures_huma
