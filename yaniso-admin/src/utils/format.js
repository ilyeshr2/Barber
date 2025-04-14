//src/utils/format.js
export const formatDate = (dateString) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  export const formatTime = (dateString) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  export const formatDateTime = (dateString) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    return `${formatDate(date)} à ${formatTime(date)}`
  }
  
  export const formatPrice = (price) => {
    return `${price} DA`
  }
  
  export const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (remainingMinutes === 0) {
      return `${hours}h`
    }
    
    return `${hours}h ${remainingMinutes}min`
  }
  
  export const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return ''
    
    // Remove non-digit characters
    const digits = phoneNumber.replace(/\D/g, '')
    
    // Format as +1 XXX XXX XXXX
    if (digits.length >= 10) {
      const countryCode = digits.startsWith('1') ? '+1' : '+1'
      const areaCode = digits.slice(-10, -7)
      const middle = digits.slice(-7, -4)
      const last = digits.slice(-4)
      
      return `${countryCode} ${areaCode} ${middle} ${last}`
    }
    
    return phoneNumber
  }