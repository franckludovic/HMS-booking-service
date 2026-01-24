# Booking Service

A microservice for managing bookings, lifecycle transitions, and scheduling coordination in the Home Services Marketplace.

## Features

- **Booking Management**: Create, update, and query bookings between clients and workers
- **Lifecycle Transitions**: Controlled status changes (requested → accepted → in_progress → completed)
- **Availability Validation**: Check worker availability before booking creation
- **Cancellation Support**: Handle cancellations by clients or workers
- **Event Publishing**: Publish booking events for inter-service communication
- **Role-based Access**: Separate permissions for clients and workers

## API Documentation

See [docs/booking-service.yaml](docs/booking-service.yaml) for the OpenAPI specification.

## Tech Stack

- **Node.js** with Express.js
- **Prisma** ORM with PostgreSQL
- **Redis** for event publishing
- **JWT** for authentication
- **Joi** for validation

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (create `.env` file):
   ```
   DATABASE_URL="postgresql://username:password@localhost:5433/booking_db"
   JWT_PUBLIC_KEY_PATH="./keys/jwt-public.pem"
   REDIS_URL="redis://localhost:6380"
   PORT=3004
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Start the service:
   ```bash
   npm run dev
   ```

## Docker

To run with Docker Compose:

```bash
docker-compose up -d
```

## Project Structure

```
booking-service/
├── docs/
│   └── booking-service.yaml
├── keys/
│   └── jwt-public.pem
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── validators/
├── docker-compose.yml
├── package.json
├── server.js
└── README.md
```

## License

ISC
