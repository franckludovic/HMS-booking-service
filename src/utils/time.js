const calculateEndTime = (startTime, durationMinutes) => {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return end.toISOString();
};

const checkOverlap = (newSlot, existingSlots) => {
  const newStart = new Date(newSlot.start);
  const newEnd = new Date(newSlot.end);

  for (const slot of existingSlots) {
    const existingStart = new Date(slot.startTime);
    const existingEnd = new Date(slot.endTime);

    if (newStart < existingEnd && newEnd > existingStart) {
      return true; // Overlap detected
    }
  }

  return false;
};

const isWithinRange = (date, start, end) => {
  const checkDate = new Date(date);
  const rangeStart = new Date(start);
  const rangeEnd = new Date(end);

  return checkDate >= rangeStart && checkDate <= rangeEnd;
};

module.exports = {
  calculateEndTime,
  checkOverlap,
  isWithinRange
};
