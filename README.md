# TourFlow 🌍✨
A full-stack Tour Management System built with **.NET 10 Web API**, **Entity Framework Core (PostgreSQL)**, and **Next.js (TypeScript, Tailwind CSS)**.

---

## 🏗️ Architecture

```
TourFlow/
├── backend/                       # .NET 10 Solution (TourFlow.slnx)
│   ├── TourFlow.Domain/           # Core Entities, Enums, BaseEntity
│   │   ├── Entities/              # TourPackage, ItineraryDay, TourSchedule, Booking, Traveler, Review
│   │   ├── Enums/                 # TourCategory, DifficultyLevel, BookingStatus, PaymentStatus, ScheduleStatus
│   │   └── Common/                # BaseEntity
│   ├── TourFlow.Application/      # DTOs, Business Logic, Interfaces, CQRS
│   ├── TourFlow.Infrastructure/   # TourFlowDbContext (Npgsql/PostgreSQL), Repositories
│   └── TourFlow.Api/              # Controllers, OpenAPI / Scalar Documentation, CORS
│
└── frontend/                      # Next.js App Router (TypeScript)
    ├── src/app/                   # App routes & layouts
    ├── src/components/            # UI components
    └── src/lib/                   # Utilities & API client
```

---

## 🚀 Getting Started

### 1. Database Configuration
Update the PostgreSQL connection string in `backend/TourFlow.Api/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=tourflow_db;Username=postgres;Password=your_password"
}
```

To create and apply the initial EF Core migration:
```bash
cd backend
dotnet ef migrations add InitialCreate --project TourFlow.Infrastructure --startup-project TourFlow.Api
dotnet ef database update --project TourFlow.Infrastructure --startup-project TourFlow.Api
```

### 2. Run Backend (.NET 10 API)
```bash
cd backend/TourFlow.Api
dotnet run
```
* **API Endpoints**: `http://localhost:5000` / `https://localhost:5001`
* **Interactive Scalar Docs**: `http://localhost:5000/scalar/v1`

### 3. Run Frontend (Next.js)
```bash
cd frontend
npm run dev
```
* **Web UI**: `http://localhost:3000`
