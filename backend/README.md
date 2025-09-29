# Backend - Social Media App

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies.
3. Run dev server.

## Environment Variables

- `PORT` - API server port (default 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for signing JWT

## Scripts

- `npm run dev` - Start server with nodemon
- `npm start` - Start server with node

## API

- `GET /` - Health check
- `POST /auth/signup` - Register user
- `POST /auth/login` - Login, returns JWT

## Notes

- Passwords are hashed using bcrypt at signup.
- Use the `Authorization: Bearer <token>` header to access protected routes (see `src/middleware/authMiddleware.js`).
