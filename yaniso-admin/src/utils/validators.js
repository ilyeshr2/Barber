// src/utils/validators.js
export const validateRequired = (value) => {
    return !!value || 'Ce champ est requis'
  }
  
  export const validateEmail = (value) => {
    if (!value) return true
    
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return regex.test(value) || 'Veuillez entrer une adresse e-mail valide'
  }
  
  export const validatePhone = (value) => {
    if (!value) return true
    
    const regex = /^\+?[1-9]\d{9,14}$/
    return regex.test(value.replace(/\D/g, '')) || 'Veuillez entrer un numéro de téléphone valide'
  }
  
  export const validateMinLength = (min) => (value) => {
    if (!value) return true
    
    return value.length >= min || `Ce champ doit contenir au moins ${min} caractères`
  }
  
  export const validateMaxLength = (max) => (value) => {
    if (!value) return true
    
    return value.length <= max || `Ce champ ne peut pas dépasser ${max} caractères`
  }
  
  export const validateNumber = (value) => {
    if (!value) return true
    
    return !isNaN(Number(value)) || 'Veuillez entrer un nombre valide'
  }
  
  export const validatePositiveNumber = (value) => {
    if (!value) return true
    
    const number = Number(value)
    return !isNaN(number) && number > 0 || 'Veuillez entrer un nombre positif'
  }
  
  export const validateUrl = (value) => {
    if (!value) return true
    
    try {
      new URL(value)
      return true
    } catch (_) {
      return 'Veuillez entrer une URL valide'
    }
  }