# Fleet Maintenance & Fuel Consumption Monitoring System

A comprehensive full-stack application designed for transportation and logistics management, enabling fleet operators to monitor fuel consumption, track vehicle maintenance schedules, manage costs, and report mechanical issues in real-time. Built for a hackathon with role-based access control to serve administrators, fleet managers, mechanics, and drivers.

---

## Tech Stack

- **Backend**: Java 17, Spring Boot 4.0.6, Spring Data JPA, Spring Security
- **Authentication**: JWT (JJWT 0.12.5)
- **Database**: MySQL 8.0+
- **API Documentation**: Swagger UI / OpenAPI 3.0 (springdoc-openapi)
- **Frontend**: React 19, Vite, Tailwind CSS, Recharts
- **Build Tool**: Maven

---

## Core Features

- **Role-Based Access Control (RBAC)**: Four distinct roles with granular permissions (ADMIN, FLEET_MANAGER, MECHANIC, DRIVER)
- **JWT Authentication**: Secure API endpoints with token-based authentication
- **Fuel Efficiency Tracking**: Log and monitor fuel consumption per vehicle
- **Auto-Scheduled Maintenance**: Automatic maintenance scheduling based on vehicle mileage and time intervals
- **Cost Aggregation**: Track and analyze operational costs by vehicle, type, and time period
- **Issue Management**: Report mechanical issues with severity levels and resolution tracking
- **Vehicle Management**: Register vehicles, track status (active/retired), and view detailed analytics

---

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.8+
- MySQL 8.0+ running locally
- Node.js 18+ (for frontend)

### Backend Setup

1. **Configure Database Connection**
   - Open `server/src/main/resources/application.properties`
   - Update MySQL credentials:
     ```properties
     spring.datasource.url=jdbc:mysql://localhost:3306/fuel_monitor_db?createDatabaseIfNotExist=true
     spring.datasource.username=<your_username>
     spring.datasource.password=<your_password>
     ```

2. **Run the Application**
   ```bash
   cd server
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```
   The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

---

## API Documentation

All API endpoints are documented using **Swagger UI / OpenAPI**.

- **Access Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

### Authentication in Swagger

1. Click the **Authorize** button (lock icon) in the Swagger UI
2. Paste your JWT token in the format: `Bearer <your_token_here>`
3. Click **Authorize** to apply the token to all requests

---

## Role-Based Access Control (RBAC)

The system implements four distinct roles with specific permissions:

| Role | Permissions |
|------|-------------|
| **ADMIN** | View all users and system data; access cost analytics; oversee system operations |
| **FLEET_MANAGER** | Register vehicles; schedule maintenance; manage costs; view fleet analytics; generate reports |
| **MECHANIC** | View assigned maintenance; complete maintenance records; acknowledge and resolve issues |
| **DRIVER** | Log fuel consumption; report mechanical issues; view personal vehicle assignments; track fuel history |

**Note**: All API requests require a valid JWT token passed in the `Authorization` header via the Swagger Authorize button or as: `Authorization: Bearer <token>`

---

## Project Structure

```
fuel_monitor/
├── backend/                          # Spring Boot Application
│   ├── src/main/java/com/fuel_monitor/server/
│   │   ├── controllers/              # REST API Controllers
│   │   ├── services/                 # Business Logic
│   │   ├── repositories/             # Database Access Layer
│   │   ├── models/                   # Entities & Enums
│   │   ├── security/                 # JWT & Security Config
│   │   └── config/                   # Spring Configurations
│   └── pom.xml                       # Maven Dependencies
│
└── frontend/                         # React Application
    ├── src/
    │   ├── components/               # Reusable UI Components
    │   ├── pages/                    # Page Components
    │   ├── routes/                   # Route Protection
    │   └── context/                  # Auth Context
    └── package.json
```

---

## License

This project was developed for a hackathon and is provided as-is for educational and demonstration purposes.
