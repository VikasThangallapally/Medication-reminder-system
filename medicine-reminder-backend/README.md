# Medicine Reminder Backend

Backend API for Medicine Reminder Web Application using Node.js, Express, and MongoDB.

## Features

- Add, edit, delete medicines
- Multiple time slots per medicine
- Mark dose status as taken or missed
- Reminder logs and daily reminders endpoints
- Validation and centralized error handling

## Folder Structure

medicine-reminder-backend/
- src/
  - config/
  - controllers/
  - models/
  - routes/
  - middleware/
  - utils/
  - validators/
  - app.js
  - server.js
- .env
- package.json
- README.md

## Setup

1. Install dependencies:
   npm install

2. Configure environment variables in .env:
   - PORT=5000
   - MONGO_URI=mongodb://127.0.0.1:27017/medicine_reminder
   - CLIENT_URL=http://localhost:5173

3. Start backend:
   npm run dev

## API Endpoints

- Medicines
  - GET /api/medicines
  - GET /api/medicines/:id
  - POST /api/medicines
  - PUT /api/medicines/:id
  - DELETE /api/medicines/:id
  - PATCH /api/medicines/:id/status

- Reminders
  - GET /api/reminders/today
  - GET /api/reminders/logs

- Health
  - GET /api/health
