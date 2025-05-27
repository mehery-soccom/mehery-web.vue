<template>
  <div v-if="items.length > 0" class="mb-6">
    <v-card>
      <v-card-title class="text-h6">
        {{ title || `Preview (${items.length} items)` }}
      </v-card-title>

      <v-card-text class="pa-0">
        <div :style="{ maxHeight: maxHeight, overflowY: 'auto' }">
          <VDataTable
            :headers="headers"
            :items="items"
            :items-per-page="itemsPerPage"
            :hide-default-footer="hideFooter"
            :density="density"
          >
            <!-- Question column slot -->
            <template v-slot:item.que="{ item }" v-if="hasQuestionColumn">
              <span class="text-body-2">{{ item.que }}</span>
            </template>

            <!-- Answer column slot -->
            <template v-slot:item.ans="{ item }" v-if="hasAnswerColumn">
              <span class="text-body-2">{{ item.ans }}</span>
            </template>

            <!-- Dynamic slots for custom columns -->
            <template v-for="slot in customSlots" :key="slot" v-slot:[`item.${slot}`]="{ item }">
              <slot :name="`item.${slot}`" :item="item">
                <span class="text-body-2">{{ item[slot] }}</span>
              </slot>
            </template>
          </VDataTable>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { VDataTable } from "vuetify/labs/VDataTable";

// Props
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  headers: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  maxHeight: {
    type: String,
    default: '240px'
  },
  itemsPerPage: {
    type: Number,
    default: -1
  },
  hideFooter: {
    type: Boolean,
    default: true
  },
  density: {
    type: String,
    default: 'compact'
  },
  customSlots: {
    type: Array,
    default: () => []
  }
})

// Computed properties
const hasQuestionColumn = computed(() => {
  return props.headers.some(header => header.key === 'que' || header.value === 'que')
})

const hasAnswerColumn = computed(() => {
  return props.headers.some(header => header.key === 'ans' || header.value === 'ans')
})
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>