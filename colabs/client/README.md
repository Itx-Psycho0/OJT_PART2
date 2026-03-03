# Colabs – Frontend

## Overview

Colabs is a real-time collaborative platform that enables users to connect, communicate, and collaborate seamlessly.

This repository contains the frontend application built with Next.js.

---

## Tech Stack

- Next.js
- Tailwind CSS / CSS Modules
- WebSockets (real-time communication)
- REST API integration
- Backend: Node.js, Express, MongoDB

---

## Features

- User Authentication (Login / Signup)
- Real-time messaging
- Dynamic routing
- Responsive UI
- API integration with backend
- Optimized rendering with Next.js

---

## Project Structure
```
src/
├── app/ or pages/
├── components/
├── hooks/
├── lib/
├── services/
├── styles/
```

---

## Environment Variables

Create a `.env.local` file and add:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

## Development

Application runs on:
`http://localhost:3000`


---

## Build
```
npm run build
or
npm start
```

---

## Future Improvements

- File sharing
- Notifications system
- Role-based access control
- Dark mode
- Performance optimizations

---

## License

MIT License
