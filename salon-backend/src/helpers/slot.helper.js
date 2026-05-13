const moment = require('moment');

/**
 * Convert "HH:mm" string to minutes since midnight
 */
const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Convert minutes since midnight to "HH:mm"
 */
const toTimeStr = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * Generate available time slots for a salon on a given date.
 * @param {Object} salon - Salon document
 * @param {Date} date - The date to generate slots for
 * @param {Array} existingAppointments - Confirmed/pending appointments on that date
 * @param {number} totalDuration - Total service duration in minutes
 * @param {string|null} staffId - Optional staff filter
 */
const generateSlots = (salon, date, existingAppointments, totalDuration, staffId = null) => {
  const dayName = moment(date).format('dddd').toLowerCase();
  const hours = salon.businessHours.find((h) => h.day === dayName);

  if (!hours || hours.isClosed) return [];

  const isHoliday = salon.holidays.some((h) => moment(h).isSame(date, 'day'));
  if (isHoliday) return [];

  const slotDuration = salon.slotDuration || 30;
  const bufferTime = salon.bufferTime || 0;
  const step = slotDuration;

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
  for (let start = openMin; start + totalDuration <= closeMin; start += step) {
    const end = start + totalDuration;
    const conflict = bookedRanges.some((r) => start < r.end && end > r.start);
    if (!conflict) {
      slots.push({ startTime: toTimeStr(start), endTime: toTimeStr(end) });
    }
  }

  return slots;
};

module.exports = { generateSlots, toMinutes, toTimeStr };
