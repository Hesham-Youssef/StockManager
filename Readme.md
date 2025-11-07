# Stock Exchange Management System

A full-stack application for managing stock exchanges, stocks, and real-time market updates. Built with **Spring Boot (Java)** for the backend and **React** for the frontend.

---

## Overview

The Stock Exchange Management System provides an integrated environment to manage stock exchanges, monitor stock performance, and simulate live trading updates using WebSockets.

### **Key Features**

* **User Authentication:** Secure JWT-based login and registration.
* **Stock Management:** Create, update, and delete stocks with real-time price tracking.
* **Exchange Management:** Manage exchanges and associate stocks dynamically.
* **WebSocket Live Updates:** Real-time stock and exchange updates pushed to connected clients.
* **In-memory H2 Database:** Fast startup and simplified local testing.
* **RESTful API:** For integration with other services or automation scripts.
* **Stocks History:** Show the historical data of each stock.
---

## Directory Structure

```
stockmanager/
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── stockmanager.jar (prebuilt)
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── .env (to be created)
│   └── dist/ (prebuilt build)
└── README.rst
```

---

## Getting Started

### **Prerequisites**

* **Java 17+**
* **Maven 3.8+**
* **Node.js 18+** and **npm**

Check your installations:

```
java -version
mvn -version
node -v
npm -v
```

---

## Option 1: Run the Prebuilt Version

If you only need to test or preview the system, use the provided prebuilt artifacts.

### **Steps**

1. **Run the backend JAR:**

   ```bash
   java -jar backend/stockmanager.jar
   ```

2. **Run the frontend:**

   Navigate to the `frontend/` directory and create a `.env` file:

   ```bash
   REACT_APP_API_URL=http://localhost:8080/api
   REACT_APP_WS_URL=http://localhost:8080/ws
   ```

   Then start the frontend:

   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Access the app:**

   Open your browser at:

   ```
   http://localhost:3000
   ```

The frontend will communicate with the backend at port `8080`.

---

## Option 2: Build from Source

If you prefer to compile both backend and frontend yourself:

### **1. Backend**

```bash
cd backend
mvn clean package -DskipTests
```

The built JAR will be located in:

```
target/stockmanager.jar
```

Run it with:

```bash
java -jar target/stockmanager.jar
```

### **2. Frontend**

```bash
cd frontend
npm install
npm run build
```

This generates a production-ready build under `frontend/dist`.

---

## Configuration

The backend supports environment-based configuration using environment variables or a `.env` file (if using Docker or deployment scripts).

### **Backend Variables:**

| Variable            | Default               | Description                    |
| ------------------- | --------------------- | ------------------------------ |
| `SERVER_PORT`       | 8080                  | Port for the backend API       |
| `DB_URL`            | `jdbc:h2:mem:stockdb` | Database URL                   |
| `DB_USERNAME`       | `sa`                  | Database username              |
| `DB_PASSWORD`       |                       | Database password              |
| `JWT_SECRET`        | (required)            | Secret key for JWT signing     |
| `JWT_EXPIRATION_MS` | 3600000               | Token validity in milliseconds |

### **Frontend Variables (.env file):**

```bash
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_WS_URL=http://localhost:8080/ws
```

---

## Testing

Run backend unit tests using Maven:

```bash
cd backend
mvn test
```

---

## Release Notes

The latest release provides prebuilt JAR and frontend build for quick setup:

* **Version:** v1.0.0 - Initial Prebuilt Release
* **Includes:**

  * Backend JAR (`stockmanager.jar`)
  * Frontend static build (`frontend/dist/`)
* **Usage:** Run the backend, configure the `.env` file, and start the frontend.

---
