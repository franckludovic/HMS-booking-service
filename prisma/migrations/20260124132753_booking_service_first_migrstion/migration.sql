-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('requested', 'pending_approval', 'accepted', 'in_progress', 'completed', 'cancelled_by_client', 'cancelled_by_worker');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('BookingRequested', 'BookingPendingApproval', 'BookingAccepted', 'BookingInProgress', 'BookingCompleted', 'BookingCancelledByClient', 'BookingCancelledByWorker');

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "serviceCategory" TEXT,
    "serviceType" TEXT,
    "location" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'requested',
    "notes" TEXT,
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_events" (
    "id" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "bookingId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bookings_clientId_idx" ON "bookings"("clientId");

-- CreateIndex
CREATE INDEX "bookings_workerId_idx" ON "bookings"("workerId");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_scheduledAt_idx" ON "bookings"("scheduledAt");

-- CreateIndex
CREATE INDEX "booking_events_bookingId_idx" ON "booking_events"("bookingId");

-- CreateIndex
CREATE INDEX "booking_events_timestamp_idx" ON "booking_events"("timestamp");

-- AddForeignKey
ALTER TABLE "booking_events" ADD CONSTRAINT "booking_events_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
