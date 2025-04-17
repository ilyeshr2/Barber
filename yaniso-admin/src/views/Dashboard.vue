<!--src/views/Dashboard.vue -->
<template>
    <div class="dashboard">
      <h1 class="mb-4">Dashboard</h1>
      
      <div class="row">
        <div class="col-md-3">
          <div class="card bg-primary text-white mb-4">
            <div class="card-body">
              <h5 class="card-title">{{ barbiersCount || 0 }}</h5>
              <p class="card-text">Barbiers</p>
            </div>
            <div class="card-footer d-flex align-items-center justify-content-between">
              <router-link to="/barbiers" class="small text-white stretched-link">View Details</router-link>
              <div class="small text-white"><i class="bi bi-chevron-right"></i></div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="card bg-success text-white mb-4">
            <div class="card-body">
              <h5 class="card-title">{{ servicesCount || 0 }}</h5>
              <p class="card-text">Services</p>
            </div>
            <div class="card-footer d-flex align-items-center justify-content-between">
              <router-link to="/services" class="small text-white stretched-link">View Details</router-link>
              <div class="small text-white"><i class="bi bi-chevron-right"></i></div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="card bg-warning text-white mb-4">
            <div class="card-body">
              <h5 class="card-title">{{ appointmentsCount || 0 }}</h5>
              <p class="card-text">Confirmed Appointments Today</p>
            </div>
            <div class="card-footer d-flex align-items-center justify-content-between">
              <router-link to="/appointments" class="small text-white stretched-link">View Details</router-link>
              <div class="small text-white"><i class="bi bi-chevron-right"></i></div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="card bg-info text-white mb-4">
            <div class="card-body">
              <h5 class="card-title">{{ clientsCount || 0 }}</h5>
              <p class="card-text">Clients</p>
            </div>
            <div class="card-footer d-flex align-items-center justify-content-between">
              <router-link to="/clients" class="small text-white stretched-link">View Details</router-link>
              <div class="small text-white"><i class="bi bi-chevron-right"></i></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-xl-6">
          <div class="card mb-4">
            <div class="card-header">
              <i class="bi bi-calendar me-1"></i>
              Upcoming Appointments <span class="text-muted small">(Confirmed only)</span>
            </div>
            <div class="card-body">
              <div v-if="upcomingAppointmentsLoading" class="text-center py-3">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div v-else-if="upcomingAppointmentsError" class="alert alert-warning">
                {{ upcomingAppointmentsError }}
              </div>
              <div v-else-if="upcomingAppointments.length === 0" class="text-center py-3">
                <p class="text-muted mb-0">No upcoming appointments</p>
              </div>
              <div v-else>
                <table class="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Client</th>
                      <th>Barbier</th>
                      <th>Service</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="appointment in upcomingAppointments" :key="appointment.id">
                      <td>{{ formatDate(appointment.date) }}</td>
                      <td>
                        {{ getClientName(appointment) }}
                      </td>
                      <td>{{ getBarbierName(appointment.BarbierId) }}</td>
                      <td>{{ getServiceName(appointment.ServiceId) }}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div class="text-end mt-3">
                  <router-link to="/appointments" class="btn btn-sm btn-outline-primary">
                    View All Appointments
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-6">
          <div class="card mb-4">
            <div class="card-header">
              <i class="bi bi-graph-up me-1"></i>
              Recent Activity
            </div>
            <div class="card-body">
              <div v-if="recentActivityLoading" class="text-center py-3">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div v-else-if="recentActivityError" class="alert alert-warning">
                {{ recentActivityError }}
              </div>
              <div v-else-if="recentActivity.length === 0" class="text-center py-3">
                <p class="text-muted mb-0">No recent activity</p>
              </div>
              <div v-else class="activity-list">
                <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
                  <div class="activity-icon">
                    <i :class="activity.icon"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">{{ activity.title }}</div>
                    <div class="activity-time">{{ activity.timeDisplay }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-xl-12">
          <div class="card mb-4">
            <div class="card-header">
              <i class="bi bi-scissors me-1"></i>
              Services Overview
            </div>
            <div class="card-body">
              <div v-if="servicesLoading" class="text-center py-3">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div v-else-if="servicesError" class="alert alert-warning">
                {{ servicesError }}
              </div>
              <div v-else>
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Duration</th>
                        <th>Price</th>
                        <th>Barber</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="service in services.slice(0, 5)" :key="service.id">
                        <td>{{ service.nom }}</td>
                        <td>{{ service.duree }} min</td>
                        <td>{{ service.prix }} CAD</td>
                        <td>{{ getBarbierName(service.BarberId) }}</td>
                      </tr>
                      <tr v-if="services.length === 0">
                        <td colspan="4" class="text-center">No services available</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div class="text-end mt-3">
                    <router-link to="/services" class="btn btn-sm btn-outline-primary">
                      View All Services
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import { formatDate, formatTime } from '@/utils/format'
  
  export default {
    name: 'DashboardView',
    setup() {
      const store = useStore()
      
      // Stats
      const barbiersCount = ref(0)
      const servicesCount = ref(0)
      const appointmentsCount = ref(0)
      const clientsCount = ref(0)
      
      // Appointments
      const upcomingAppointments = ref([])
      const upcomingAppointmentsLoading = ref(false)
      const upcomingAppointmentsError = ref(null)
      
      // Activity
      const recentActivity = ref([])
      const recentActivityLoading = ref(false)
      const recentActivityError = ref(null)
      
      // Services
      const services = ref([])
      const servicesLoading = ref(false)
      const servicesError = ref(null)
      
      onMounted(async () => {
        // Load each section independently to prevent one failure from affecting others
        loadStats()
        loadUpcomingAppointments()
        loadRecentActivity()
        loadServices()
      })
      
      const loadStats = async () => {
        try {
          await loadBarbiersCount()
        } catch (error) {
          console.error('Error loading barbers count:', error)
        }
        
        try {
          await loadServicesCount()
        } catch (error) {
          console.error('Error loading services count:', error)
        }
        
        try {
          await loadAppointmentsCount()
        } catch (error) {
          console.error('Error loading appointments count:', error)
        }
        
        try {
          await loadClientsCount()
        } catch (error) {
          console.error('Error loading clients count:', error)
        }
      }
      
      const loadBarbiersCount = async () => {
        try {
          await store.dispatch('barbiers/fetchBarbiers')
          barbiersCount.value = store.getters['barbiers/barbiers'].length
        } catch (error) {
          console.error('Error loading barbiers count:', error)
          barbiersCount.value = 0 // Set a fallback value
        }
      }
      
      const loadServicesCount = async () => {
        try {
          await store.dispatch('services/fetchAllServices')
          servicesCount.value = store.getters['services/allServices'].length
        } catch (error) {
          console.error('Error loading services count:', error)
          servicesCount.value = 0 // Set a fallback value
        }
      }
      
      const loadAppointmentsCount = async () => {
        try {
          await store.dispatch('appointments/fetchTodayAppointments')
          const todayAppointments = store.getters['appointments/todayAppointments']
          // Filter out canceled and completed appointments
          const activeAppointments = todayAppointments.filter(
            appointment => appointment.statut === 'confirmé'
          )
          appointmentsCount.value = activeAppointments.length
        } catch (error) {
          console.error('Error loading appointments count:', error)
          appointmentsCount.value = 0 // Set a fallback value
        }
      }
      
      const loadClientsCount = async () => {
        try {
          await store.dispatch('clients/fetchClients')
          clientsCount.value = store.getters['clients/clients'].length
        } catch (error) {
          console.error('Error loading clients count:', error)
          clientsCount.value = 0 // Set a fallback value
        }
      }
      
      const loadUpcomingAppointments = async () => {
        upcomingAppointmentsLoading.value = true
        upcomingAppointmentsError.value = null
        
        try {
          await store.dispatch('appointments/fetchUpcomingAppointments')
          const allUpcoming = store.getters['appointments/upcomingAppointments']
          
          // Filter out canceled and completed appointments
          const activeAppointments = allUpcoming.filter(
            appointment => appointment.statut === 'confirmé'
          )
          
          // Get all appointments if we don't have enough upcoming ones
          if (activeAppointments.length === 0) {
            await store.dispatch('appointments/fetchAppointments')
            const allAppointments = store.getters['appointments/appointments']
            
            // Filter future appointments that are confirmed (not canceled or completed)
            const now = new Date()
            const futureAppointments = allAppointments.filter(a => 
              new Date(a.date) > now && a.statut === 'confirmé'
            )
            
            // Sort by date
            futureAppointments.sort((a, b) => new Date(a.date) - new Date(b.date))
            upcomingAppointments.value = futureAppointments
          } else {
            // Display active upcoming appointments
            upcomingAppointments.value = activeAppointments
          }
        } catch (error) {
          console.error('Error loading upcoming appointments:', error)
          upcomingAppointmentsError.value = 'Unable to load upcoming appointments'
          upcomingAppointments.value = [] // Set default empty array
        } finally {
          upcomingAppointmentsLoading.value = false
        }
      }
      
      const loadRecentActivity = async () => {
        recentActivityLoading.value = true
        recentActivityError.value = null
        
        try {
          // Get activities from the store
          await store.dispatch('activity/fetchRecentActivities', 5)
          recentActivity.value = store.getters['activity/activities']
          
          // If no activities were found, provide some default/fallback data
          if (recentActivity.value.length === 0) {
            console.warn('No activities found in API, using fallback data')
            // Keep this as fallback, only if the API returns nothing
            recentActivity.value = [
              { 
                id: 'fallback-1',
                icon: 'bi bi-calendar-plus', 
                title: 'New appointment with Yaniso Rekik', 
                timeDisplay: '15 minutes ago' 
              },
              { 
                id: 'fallback-2',
                icon: 'bi bi-person-plus', 
                title: 'New client registered', 
                timeDisplay: '2 hours ago' 
              }
            ]
          }
        } catch (error) {
          console.error('Error loading recent activity:', error)
          recentActivityError.value = 'Unable to load recent activity'
          recentActivity.value = [] // Set default empty array
        } finally {
          recentActivityLoading.value = false
        }
      }
      
      const loadServices = async () => {
        servicesLoading.value = true
        servicesError.value = null
        
        try {
          await store.dispatch('services/fetchAllServices')
          services.value = store.getters['services/allServices']
        } catch (error) {
          console.error('Error loading services:', error)
          servicesError.value = 'Unable to load services'
          services.value = [] // Set default empty array
        } finally {
          servicesLoading.value = false
        }
      }
      
      const getBarbierName = (barbierId) => {
        const barbiers = store.getters['barbiers/barbiers']
        const barbier = barbiers.find(b => b.id === barbierId)
        return barbier ? barbier.nom : 'Unknown'
      }
      
      const getClientName = (appointment) => {
        // Check for various field patterns that might contain client info
        if (appointment.Utilisateur) {
          return `${appointment.Utilisateur.prenom} ${appointment.Utilisateur.nom}`
        } else if (appointment.User) {
          return `${appointment.User.first_name} ${appointment.User.last_name}`
        } else if (appointment.user_id) {
          const client = store.getters['clients/clients'].find(c => c.id === appointment.user_id)
          return client ? `${client.prenom} ${client.nom}` : 'Unknown Client'
        } else if (appointment.UtilisateurId) {
          const client = store.getters['clients/clients'].find(c => c.id === appointment.UtilisateurId)
          return client ? `${client.prenom} ${client.nom}` : 'Unknown Client'
        } else {
          return 'Unknown Client'
        }
      }
      
      const getServiceName = (serviceId) => {
        const services = store.getters['services/allServices']
        const service = services.find(s => s.id === serviceId)
        return service ? service.nom : 'Unknown Service'
      }
      
      return {
        barbiersCount,
        servicesCount,
        appointmentsCount,
        clientsCount,
        upcomingAppointments,
        upcomingAppointmentsLoading,
        upcomingAppointmentsError,
        recentActivity,
        recentActivityLoading,
        recentActivityError,
        services,
        servicesLoading,
        servicesError,
        formatDate,
        formatTime,
        getBarbierName,
        getClientName,
        getServiceName
      }
    }
  }
  </script>
  
  <style scoped>
  .dashboard {
    h1 {
      color: #333;
      margin-bottom: 20px;
    }
    
    .activity-list {
      .activity-item {
        display: flex;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
        
        &:last-child {
          border-bottom: none;
        }
        
        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          
          i {
            font-size: 18px;
            color: #007bff;
          }
        }
        
        .activity-content {
          flex: 1;
          
          .activity-title {
            font-weight: 500;
          }
          
          .activity-time {
            font-size: 12px;
            color: #6c757d;
          }
        }
      }
    }
  }
  </style>