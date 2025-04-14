<!--src/components/common/confirmModal.vue -->
<template>
    <div class="modal fade" tabindex="-1" ref="modal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>{{ message }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              {{ cancelButtonText }}
            </button>
            <button 
              type="button" 
              :class="`btn btn-${confirmButtonVariant}`"
              @click="onConfirm"
            >
              {{ confirmButtonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  import { Modal } from 'bootstrap'
  
  export default {
    name: 'ConfirmModal',
    props: {
      title: {
        type: String,
        default: 'Confirmation'
      },
      message: {
        type: String,
        default: 'Are you sure you want to proceed?'
      },
      confirmButtonText: {
        type: String,
        default: 'Confirm'
      },
      cancelButtonText: {
        type: String,
        default: 'Cancel'
      },
      confirmButtonVariant: {
        type: String,
        default: 'primary'
      }
    },
    emits: ['confirm'],
    setup(props, { emit }) {
      const modal = ref(null)
      let bsModal = null
      
      const onConfirm = () => {
        emit('confirm')
        hide()
      }
      
      const show = () => {
        if (!bsModal) {
          bsModal = new Modal(modal.value)
        }
        bsModal.show()
      }
      
      const hide = () => {
        if (bsModal) {
          bsModal.hide()
        }
      }
      
      return {
        modal,
        onConfirm,
        show,
        hide
      }
    }
  }
  </script>