# 🌍 TourFlow (Traveller's Bangladesh)

> **A modern, full-stack tour booking, expedition management, and travel community platform tailored for Bangladesh tourism.** Built with **.NET 10 Web API**, **Entity Framework Core 10 (PostgreSQL)**, **Next.js 16 (Turbopack, TypeScript)**, and **Tailwind CSS v4**.

[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 🌟 Overview & Key Highlights

**TourFlow** (branded as **Traveller's**) is a production-grade travel platform designed specifically for the unique tourism landscape of Bangladesh—from the misty hill tracts of **Sajek Valley** and the tranquil waters of **Tanguar Haor**, to the rolling tea estates of **Sreemangal** and the untamed mangroves of the **Sundarbans**.

### ✨ Core Capabilities

- **🌄 Curated Expeditions & Real-time Schedules**: Multi-day itineraries with guaranteed batch departures, seat availability counters, and deposit-based bookings.
- **🔍 Live Autocomplete Omnibar Search**: Instant quick-circuit chips, real-time query suggestions with thumbnail previews, and instant price tags.
- **📱 App-like Mobile Bottom Navigation**: Floating bottom navigation bar with active tab indicators for seamless on-the-go browsing on mobile devices.
- **⚡ Zero-CLS Shimmering Skeletons**: Handcrafted loading skeleton placeholders eliminating layout shifts on high-latency mobile networks.
- **🎫 Official Travel Passes & Boarding Vouchers**: High-fidelity boarding vouchers with barcode simulation, QR verification badges, military convoy escort notices, and one-click `window.print()` PDF generation.
- **🎒 Interactive Packing Checklist**: Custom checklist tailored for Bangladesh expeditions (NID photocopies, 20,000mAh power banks, leech socks) with live progress tracking and persistent state.
- **🇧🇩 Bangladesh Payment Integration**: Multi-channel checkout simulation supporting **bKash**, **Nagad**, **Bank Transfer**, and credit cards with instant transaction verification.
- **✍️ Community Journal & Stories Feed**: Authentic travel blogs, discussion comments, community upvotes, and live tour review submission.
- **🛡️ Comprehensive Admin & Traveler Dashboards**: Dynamic tabs for managing bookings, issuing vouchers, updating user roles, and monitoring expedition rosters.
- **☁️ Cloudinary CDN Integration**: Direct image uploads with automated optimization and fallbacks.

---

## 🏗️ Architecture & Tech Stack

```
                          ┌───────────────────────────┐
                          │   Next.js 16 Frontend     │
                          │   (TypeScript, Tailwind)   │
                          └─────────────┬─────────────┘
                                        │ HTTP / JSON
                                        ▼
                          ┌───────────────────────────┐
                          │    .NET 10 Web API        │
                          │   (C# 13, ASP.NET Core)   │
                          └──────┬──────────┬─────────┘
                                 │          │
         ┌───────────────────────┴──┐       └───────────────────────┐
         ▼                          ▼                               ▼
┌──────────────────┐      ┌──────────────────┐            ┌──────────────────┐
│  PostgreSQL 16   │      │  Redis / Memory  │            │  Cloudinary CDN  │
│  (EF Core 10)    │      │  Output Cache    │            │  (Media Storage) │
└──────────────────┘      └──────────────────┘            └──────────────────┘
```

### 🖥️ Frontend
- **Framework**: Next.js 16.3 (Turbopack, App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with custom editorial earth/serene palette (`#FAF8F5`, `#EBE6DC`)
- **Icons**: Lucide React
- **Client State & Context**: Auth Context (JWT + Refresh Tokens), Toast Notification Provider

### ⚙️ Backend
- **Framework**: .NET 10.0 (C# 13)
- **Architecture**: **Clean Architecture** (Domain, Application, Infrastructure, Api)
- **Database**: PostgreSQL 16 with Entity Framework Core 10 & Npgsql
- **Patterns**: **CQRS** with MediatR & Pipeline Behaviors (Validation, Logging)
- **Caching**: Hybrid Output Caching (In-Memory + Redis) with dynamic cache invalidation
- **Security**: JWT Authentication with Refresh Token rotation, BCrypt password hashing, and Role-Based Authorization
- **API Documentation**: Scalar OpenAPI 3.0 Interactive Docs (`/scalar/v1`)
- **Resilience**: Global Exception Handling Middleware & Health Checks probe (`/api/health`)

---

## 📁 Repository Structure

```
TourFlow/
├── backend/
│   ├── TourFlow.Domain/             # Core Entities (TourPackage, Booking, Review, BlogPost, etc.)
│   ├── TourFlow.Application/        # CQRS Handlers, DTOs, FluentValidation, Business Rules
│   ├── TourFlow.Infrastructure/     # EF Core DbContext, PostgreSQL Migrations, DbInitializer
│   ├── TourFlow.Api/                # Controllers, Middlewares, Auth, OpenAPI / Scalar Docs
│   └── TourFlow.Tests/              # Unit & Integration Tests
│
├── frontend/
│   ├── src/app/                     # Next.js App Router (17 production routes)
│   │   ├── destinations/            # Full tour catalog with dynamic division filters
│   │   ├── tours/[slug]/            # Rich tour detail, itinerary timeline, booking modal
│   │   ├── hotels/                  # Resort & cottage directory with honest pros/cons
│   │   ├── community/               # Traveler stories journal with comments & upvotes
│   │   ├── tips/                    # Bangladesh survival guidelines & security handbook
│   │   ├── profile/ & admin/        # Role-gated dashboards & booking management
│   │   └── manage/                  # Public voucher and reservation verification
│   ├── src/components/              # Reusable UI widgets
│   │   ├── LiveOmnibarSearch.tsx    # Autocomplete search with quick circuit chips
│   │   ├── MobileBottomNav.tsx      # Fixed app-like bottom navigation for mobile
│   │   ├── ui/TravelVoucherModal.tsx# Verified boarding pass & voucher with print support
│   │   ├── ui/Skeletons.tsx         # Pulsethrough shimmer skeleton loaders
│   │   └── tours/PackingChecklist.tsx# Interactive expedition packing checklist
│   └── src/lib/                     # API client, auth context, toast provider
│
├── docker-compose.yml               # Multi-container orchestration (Postgres, API, Frontend)
└── README.md                        # Documentation
```

---

## ⚡ Quick Start

### Option A: Run with Docker Compose (Recommended)

Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/TourFlow.git
cd TourFlow

# 2. Launch all services (PostgreSQL, Backend API, Frontend)
docker compose up --build
```

- **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Scalar API Interactive Documentation**: [http://localhost:5000/scalar/v1](http://localhost:5000/scalar/v1)

---

### Option B: Local Development Setup

#### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 20+](https://nodejs.org/) & npm
- [PostgreSQL 15+](https://www.postgresql.org/)

#### 1. Configure & Run Backend (.NET 10)
```bash
# Navigate to the API directory
cd backend/TourFlow.Api

# Verify or update connection string in appsettings.json:
# "ConnectionStrings": {
#   "DefaultConnection": "Host=localhost;Port=5432;Database=tourflow_db;Username=postgres;Password=postgres"
# }

# Run EF Core migrations and apply schema
dotnet ef database update --project ../TourFlow.Infrastructure

# Start the API server
dotnet run --urls "http://localhost:5000"
```

> **Note**: On initial startup, `DbInitializer` will automatically seed the database with verified tour packages, authentic guides, travel tips, resort reviews, and demo users.

#### 2. Run Frontend (Next.js 16)
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start development server with Turbopack
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Accounts & Credentials

The seed data provides pre-configured accounts for testing different user roles:

| Role | Email Address | Password | Permissions & Features |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `super.admin@traveller.com` | `Traveller@2026` | Full platform access, user management, system metrics |
| **Admin** | `admin@traveller.com` | `Admin@2026` | Tour CRUD, booking status updates, booking vouchers |
| **Traveler (Primary)**| `traveler@tourflow.com.bd` | `Traveler@123456` | Book tours, view boarding passes, write reviews |
| **Traveler (Demo)** | `tanvir.ahmed@gmail.com` | `Traveler@123456` | Pre-seeded confirmed bookings in Sajek & Tanguar Haor |

---

## 📡 REST API Reference

The .NET 10 API exposes comprehensive endpoints with OpenAPI 3.0 specification:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check | No |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT + Refresh Token | No |
| `POST` | `/api/auth/refresh-token` | Rotate and refresh expired JWT token | Yes |
| `GET` | `/api/tourpackages` | List all tours with optional division/difficulty filters | No |
| `GET` | `/api/tourpackages/{slug}` | Get tour package details, itinerary & departures | No |
| `POST` | `/api/tourpackages` | Create new tour package | Admin |
| `POST` | `/api/bookings` | Create new booking reservation | No / User |
| `GET` | `/api/bookings/reference/{ref}`| Retrieve official booking & voucher by reference | No |
| `POST` | `/api/payments/initiate` | Initiate bKash / Nagad payment transaction | User |
| `POST` | `/api/payments/verify` | Verify payment and confirm reservation | User |
| `GET` | `/api/blogposts` | Get traveler stories & community articles | No |
| `POST` | `/api/reviews` | Submit verified review for an expedition | User |

Interactive testing is available at **`http://localhost:5000/scalar/v1`**.

---

## 🧪 Testing & Verification

Run the automated test suite covering CQRS commands, validation logic, and authentication handlers:

```bash
# Run unit & integration tests
cd backend
dotnet test
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free to use for personal, academic, and commercial purposes.

---

<p align="center">
  Crafted with passion for <strong>Bangladesh Tourism</strong> 🇧🇩✨<br/>
  <em>"Explore with serenity, travel with purpose."</em>
</p>
