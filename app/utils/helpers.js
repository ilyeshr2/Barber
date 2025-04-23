// app/utils/helpers.js

// Format a date to ISO string (YYYY-MM-DD)
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Format a date for display (DD/MM/YYYY)
export const formatDisplayDate = (date) => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

// Format time for display (e.g., "09:30")
export const formatDisplayTime = (date) => {
  // Prevent any automatic timezone conversion
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Generate an array of available dates for the next 7 days
export const generateAvailableDates = () => {
  const dates = [];
  // English and French day names for localization
  const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysFr = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  // Using English month names as that's what the UI shows
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    date.setHours(0, 0, 0, 0); // Reset time to start of day
    
    dates.push({
      id: i + 1,
      date: date, // Full date object
      jour: daysEn[date.getDay()], // Using English days for UI
      numero: date.getDate().toString(),
      mois: months[date.getMonth()],
      selected: i === 0 // Select today by default
    });
  }
  
  return dates;
};

// Generate available time slots from 9:00 to 18:00 with 30-minute intervals
export const generateTimeSlots = () => {
  const slots = [];
  const startHour = 9;
  const endHour = 18;
  
  for (let hour = startHour; hour <= endHour; hour++) {
    // Add full hour slot
    slots.push({
      id: slots.length + 1,
      heure: `${hour.toString().padStart(2, '0')}:00`,
      selected: false
    });
    
    // Add half hour slot except for the last hour
    if (hour < endHour) {
      slots.push({
        id: slots.length + 1,
        heure: `${hour.toString().padStart(2, '0')}:30`,
        selected: false
      });
    }
  }
  
  return slots;
};

// Format date for appointment card display
export const formatAppointmentDate = (dateString) => {
  // Create date object without timezone conversion
  const date = new Date(dateString);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} - ${formatDisplayTime(date)}`;
};

export default {
  formatDate,
  formatDisplayDate,
  formatDisplayTime,
  generateAvailableDates,
  generateTimeSlots,
  formatAppointmentDate
};