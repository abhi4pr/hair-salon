import moment from 'moment';

export const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

export const toTimeStr = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

export const generateSlots = (salon, date, existingAppointments, totalDuration, staffId = null) => {
  const dayName = moment(date).format('dddd').toLowerCase();
  const hours = salon.businessHours.find((h) => h.day === dayName);

  if (!hours || hours.isClosed) return [];

  const isHoliday = salon.holidays.some((h) => moment(h).isSame(date, 'day'));
  if (isHoliday) return [];

  const slotDuration = salon.slotDuration || 30;
  const bufferTime = salon.bufferTime || 0;

  const openMin = toMinutes(hours.open);
  const closeMin = toMinutes(hours.close);

  const bookedRanges = existingAppointments
    .filter((a) => ['pending', 'confirmed', 'in_progress'].includes(a.status))
    .filter((a) => !staffId || String(a.staff) === String(staffId))
    .map((a) => ({
      start: toMinutes(a.startTime),
      end: toMinutes(a.endTime) + bufferTime,
    }));

  const slots = [];
  for (let start = openMin; start + totalDuration <= closeMin; start += slotDuration) {
    const end = start + totalDuration;
    const conflict = bookedRanges.some((r) => start < r.end && end > r.start);
    if (!conflict) {
      slots.push({ startTime: toTimeStr(start), endTime: toTimeStr(end) });
    }
  }

  return slots;
};
