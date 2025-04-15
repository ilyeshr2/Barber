<!--src/components/barbiers/BarbierCard.vue -->
<template>
    <div class="card h-100">
      <div class="card-img-container">
        <img :src="barbierImageUrl" class="card-img-top" alt="Barber photo">
        <div class="barbier-rating">
          <span>{{ formattedRating }}</span>
          <i class="bi bi-star-fill text-warning"></i>
        </div>
      </div>
      <div class="card-body">
        <h5 class="card-title">{{ barbier.nom }}</h5>
        <p class="card-text text-muted">{{ barbier.nombreAvis }} avis</p>
      </div>
      <div class="card-footer bg-white border-top-0">
        <div class="d-flex justify-content-between">
          <button class="btn btn-sm btn-outline-primary" @click="$emit('view-services', barbier.id)">
            <i class="bi bi-scissors me-1"></i> Services
          </button>
          <div>
            <button class="btn btn-sm btn-outline-secondary me-1" @click="$emit('edit', barbier)">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="$emit('delete', barbier)">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { formatBarberImageUrl } from '@/utils/imageHelpers';
  
  export default {
    name: 'BarbierCard',
    props: {
      barbier: {
        type: Object,
        required: true
      }
    },
    computed: {
      barbierImageUrl() {
        return formatBarberImageUrl(this.barbier, this.barbier.id);
      },
      formattedRating() {
        const rating = parseFloat(this.barbier.note || this.barbier.rating);
        return isNaN(rating) ? '0.0' : rating.toFixed(1);
      }
    }
  }
  </script>
  
  <style scoped>
  .card-img-container {
    position: relative;
    height: 200px;
    overflow: hidden;
  }
  
  .card-img-top {
    object-fit: cover;
    height: 100%;
    width: 100%;
  }
  
  .barbier-rating {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  </style>