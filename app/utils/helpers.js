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
  
  // Format time for display (HH:MM)
  export const formatDisplayTime = (date) => {
    const d = new Date(date);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // Generate an array of available dates for the next 7 days
  export const generateAvailableDates = () => {
    const dates = [];
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      dates.push({
        id: i + 1,
        date: date, // Full date object
        jour: days[date.getDay()],
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
      slots.push({
        id: slots.length + 1,
        heure: `${hour.toString().padStart(2, '0')}:00`,
        selected: false
      });
      
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
  
  export default {
    formatDate,
    formatDisplayDate,
    formatDisplayTime,
    generateAvailableDates,
    generateTimeSlots
  };