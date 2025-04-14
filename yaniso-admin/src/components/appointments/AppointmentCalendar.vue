<!--src/components/appointments/AppointmentCalendar.vue -->
<template>
    <div class="calendar-view">
      <div class="calendar-navigation d-flex justify-content-between align-items-center mb-3">
        <button class="btn btn-outline-secondary" @click="prevMonth">
          <i class="bi bi-chevron-left"></i>
        </button>
        <h3 class="m-0">{{ currentMonthName }} {{ currentYear }}</h3>
        <button class="btn btn-outline-secondary" @click="nextMonth">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
      
      <div class="calendar-grid">
        <!-- Days of the week -->
        <div class="day-name" v-for="(day, index) in daysOfWeek" :key="'day-' + index">
          {{ day }}
        </div>
        
        <!-- Calendar days -->
        <div
          v-for="(day, index) in calendarDays"
          :key="'cal-day-' + index"
          :class="['day-cell', 
                   { 'other-month': !day.isCurrentMonth }, 
                   { 'today': isToday(day.date) }]"
        >
          <div class="day-header">
            <span class="day-number">{{ day.date.getDate() }}</span>
          </div>
          
          <div class="appointments-container">
            <div
              v-for="appointment in getAppointmentsForDay(day.date)"
              :key="appointment.id"
              :class="['appointment-item', getAppointmentStatusClass(appointment.statut)]"
              @click="appointmentClick(appointment, $event)"
            >
              <span class="appointment-time">{{ formatTime(appointment.date) }}</span>
              <span class="appointment-title">
                {{ getBarbierName(appointment.BarbierId) }} | {{ getServiceName(appointment.ServiceId) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Appointment context menu -->
      <div ref="contextMenu" class="context-menu" v-if="showContextMenu" :style="contextMenuStyle">
        <div class="list-group">
          <button class="list-group-item list-group-item-action" @click="viewContextAppointment">
            <i class="bi bi-eye me-2"></i> Voir détails
          </button>
          <button class="list-group-item list-group-item-action" @click="editContextAppointment">
            <i class="bi bi-pencil me-2"></i> Modifier
          </button>
          <button class="list-group-item list-group-item-action text-danger" @click="deleteContextAppointment">
            <i class="bi bi-trash me-2"></i> Supprimer
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { formatTime } from '@/utils/format'
  
  export default {
    name: 'AppointmentCalendar',
    props: {
      appointments: {
        type: Array,
        required: true
      },
      barbiers: {
        type: Array,
        required: true
      }
    },
    emits: ['edit', 'view', 'delete'],
    setup(props, { emit }) {
      const currentDate = ref(new Date())
      const contextMenu = ref(null)
      const showContextMenu = ref(false)
      const contextMenuStyle = ref({})
      const contextAppointment = ref(null)
      
      const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      
      const currentMonthName = computed(() => {
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
        return months[currentDate.value.getMonth()]
      })
      
      const currentYear = computed(() => {
        return currentDate.value.getFullYear()
      })
      
      const calendarDays = computed(() => {
        const days = []
        
        // Get the first day of the month
        const firstDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
        
        // Get the last day of the month
        const lastDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
        
        // Get the day of the week for the first day of the month (0 for Sunday, 1 for Monday, etc.)
        const firstDayOfWeek = firstDay.getDay()
        
        // Add days from the previous month to fill the first row
        const prevMonthLastDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 0).getDate()
        
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
          const day = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, prevMonthLastDay - i)
          days.push({
            date: day,
            isCurrentMonth: false
          })
        }
        
        // Add all days of the current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
          const day = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), i)
          days.push({
            date: day,
            isCurrentMonth: true
          })
        }
        
        // Add days from the next month to fill the last row
        const remainingCells = 42 - days.length // 6 rows x 7 days = 42 cells
        
        for (let i = 1; i <= remainingCells; i++) {
          const day = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, i)
          days.push({
            date: day,
            isCurrentMonth: false
          })
        }
        
        return days
      })
      
      const prevMonth = () => {
        currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
      }
      
      const nextMonth = () => {
        currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
      }
      
      const isToday = (date) => {
        const today = new Date()
        return date.getDate() === today.getDate() && 
               date.getMonth() === today.getMonth() && 
               date.getFullYear() === today.getFullYear()
      }
      
      const getAppointmentsForDay = (date) => {
        return props.appointments.filter(appointment => {
          const appointmentDate = new Date(appointment.date)
          return appointmentDate.getDate() === date.getDate() && 
                 appointmentDate.getMonth() === date.getMonth() && 
                 appointmentDate.getFullYear() === date.getFullYear()
        })
      }
      
      const getBarbierName = (barbierId) => {
        const barbier = props.barbiers.find(b => b.id === barbierId)
        return barbier ? barbier.nom : 'Inconnu'
      }
      
      const getServiceName = (serviceId) => {
        // This would need a service prop or store getter
        // For now, just return a placeholder
        return 'Service'
      }
      
      const getAppointmentStatusClass = (status) => {
        switch (status) {
          case 'confirmé': return 'appointment-confirmed'
          case 'annulé': return 'appointment-cancelled'
          case 'terminé': return 'appointment-completed'
          default: return ''
        }
      }
      
      const appointmentClick = (appointment, event) => {
        // Show context menu
        event.preventDefault()
        event.stopPropagation()
        
        contextAppointment.value = appointment
        
        // Position the context menu
        const rect = event.target.getBoundingClientRect()
        contextMenuStyle.value = {
          top: `${rect.bottom + window.scrollY}px`,
          left: `${rect.left + window.scrollX}px`
        }
        
        showContextMenu.value = true
      }
      
      const closeContextMenu = () => {
        showContextMenu.value = false
      }
      
      const viewContextAppointment = () => {
        emit('view', contextAppointment.value)
        closeContextMenu()
      }
      
      const editContextAppointment = () => {
        emit('edit', contextAppointment.value)
        closeContextMenu()
      }
      
      const deleteContextAppointment = () => {
        emit('delete', contextAppointment.value)
        closeContextMenu()
      }
      
      // Close context menu when clicking outside
      const handleDocumentClick = (event) => {
        if (showContextMenu.value && contextMenu.value && !contextMenu.value.contains(event.target)) {
          closeContextMenu()
        }
      }
      
      onMounted(() => {
        document.addEventListener('click', handleDocumentClick)
      })
      
      onBeforeUnmount(() => {
        document.removeEventListener('click', handleDocumentClick)
      })
      
      return {
        currentDate,
        contextMenu,
        showContextMenu,
        contextMenuStyle,
        daysOfWeek,
        currentMonthName,
        currentYear,
        calendarDays,
        prevMonth,
        nextMonth,
        isToday,
        getAppointmentsForDay,
        getBarbierName,
        getServiceName,
        getAppointmentStatusClass,
        appointmentClick,
        viewContextAppointment,
        editContextAppointment,
        deleteContextAppointment,
        formatTime
      }
    }
  }
  </script>
  
  <style scoped>
  .calendar-view {
    position: relative;
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-gap: 1px;
    background-color: #e9e9e9;
    border: 1px solid #e9e9e9;
  }
  
  .day-name {
    background-color: #f8f9fa;
    padding: 10px;
    text-align: center;
    font-weight: bold;
  }
  
  .day-cell {
    min-height: 120px;
    background-color: white;
    padding: 5px;
    position: relative;
  }
  
  .other-month {
    background-color: #f8f9fa;
    color: #adb5bd;
  }
  
  .today {
    background-color: #e6f7ff;
  }
  
  .day-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 5px;
  }
  
  .day-number {
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 50%;
  }
  
  .today .day-number {
    background-color: #007bff;
    color: white;
  }
  
  .appointments-container {
    font-size: 0.8rem;
  }
  
  .appointment-item {
    margin-bottom: 3px;
    padding: 2px 5px;
    border-radius: 3px;
    background-color: #e9ecef;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .appointment-item:hover {
    background-color: #dee2e6;
  }
  
  .appointment-confirmed {
    background-color: #cce5ff;
    border-left: 3px solid #007bff;
  }
  
  .appointment-cancelled {
    background-color: #f8d7da;
    border-left: 3px solid #dc3545;
    text-decoration: line-through;
    color: #6c757d;
  }
  
  .appointment-completed {
    background-color: #d4edda;
    border-left: 3px solid #28a745;
  }
  
  .appointment-time {
    font-weight: bold;
    margin-right: 5px;
  }
  
  .context-menu {
    position: absolute;
    z-index: 1000;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    min-width: 200px;
  }
  
  .context-menu .list-group-item {
    cursor: pointer;
  }
  </style>