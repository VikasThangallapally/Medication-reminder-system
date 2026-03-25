# Medicine Reminder Frontend

React.js frontend for a Medicine Reminder Web Application with medicine scheduling, calendar view, and browser notifications.

## Features

- Dashboard with:
  - Today's medicines
  - Upcoming doses
  - Missed doses
- Add/Edit/Delete medicines
- Medicine fields:
  - name, dosage, frequency (once/twice/thrice daily)
  - multiple time slots
  - start date and end date
- Calendar view for scheduled medicines
- Mark medicine as Taken or Missed
- Browser Notification API reminders
- Responsive layout with Tailwind CSS and sidebar navigation

## Folder Structure

```text
medicine-reminder-frontend/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── context/
│   ├── hooks/
│   ├── utils/
│   ├── routes/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── package.json
└── README.md
```

## API Configuration

The base URL is set through Vite env variables:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Install and Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Expected Backend Endpoints

- `GET /medicines`
- `GET /medicines/:id`
- `POST /medicines`
- `PUT /medicines/:id`
- `DELETE /medicines/:id`
- `PATCH /medicines/:id/status`
