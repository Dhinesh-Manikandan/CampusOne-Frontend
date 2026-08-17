export const formatTime12Hour = (timeStr) => {
  if (!timeStr) return 'N/A';
  if (timeStr.includes('AM') || timeStr.includes('PM') || timeStr.includes('am') || timeStr.includes('pm')) {
    return timeStr;
  }

  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  const formattedHours = hours < 10 ? `0${hours}` : hours;
  return `${formattedHours}:${minutes} ${ampm}`;
};
