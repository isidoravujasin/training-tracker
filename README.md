# Training Tracker

A simple full-stack application for tracking workouts.  

---

## Features

- User registration and login (JWT authentication)
- Create, edit and delete workouts
- Workout fields:
  - Type (Strength, Cardio, Flexibility, Other)
  - Date and optional time
  - Duration (minutes)
  - Calories burned (optional)
  - Intensity (1–10)
  - Fatigue (1–10)
  - Notes (optional)
- Weekly progress overview within selected month
- Clean and responsive UI

---

## Tech Stack

Backend:
- .NET 8 (ASP.NET Core Web API)
- Entity Framework Core
- PostgreSQL
- JWT Authentication
- Swagger

Frontend:
- Angular (standalone components)
- TailwindCSS

---

## How to Run the Project

### Prerequisites

Make sure you have installed:

- .NET 8 SDK
- Node.js (v18+ recommended)
- PostgreSQL

---

## Database Setup

Create a PostgreSQL database:

workout_tracker

Make sure PostgreSQL is running locally on:

Host=localhost  
Port=5432  
Username=postgres  
Password=postgres  

(Adjust values)

---

## Backend Configuration (User Secrets)

This project uses .NET User Secrets for local development.

Navigate to the API project folder and run:

dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=trainingtracker;Username=postgres;Password=postgres"

dotnet user-secrets set "Jwt:Key" "THIS_IS_A_DEVELOPMENT_SECRET_KEY_123456"

To verify secrets:

dotnet user-secrets list

(Adjust values)

---

## Run Backend

From the API project folder:

dotnet run

Backend will run on:

http://localhost:5273

Swagger available at:

http://localhost:5273/swagger

---

## Run Frontend

From the Angular project folder:

npm install  
npm start

Frontend runs on:

http://localhost:4200

The Angular proxy is configured to communicate with the backend.

---

## Demo Video

A short demo of the application can be found here:

https://drive.google.com/file/d/12wrvnl2kpFSlPIE4Afhg5tiIFCUvrxQv/view?usp=share_link

---

## Notes

- HTTPS redirection is enabled only in non-development environments.
- Sensitive configuration values are stored using User Secrets.
- The project is structured using a layered architecture (API, Application, Infrastructure).
