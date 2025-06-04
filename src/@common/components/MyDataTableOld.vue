<script setup>
import { VDataTable } from "vuetify/labs/VDataTable";

const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    required: false,
  },
});

const emit = defineEmits([]);

/**
 * useAttrs() -  To forward unknown props and listeners
 * usage : v-bind="attrs"
 * Does Not Include :
 * 1. Props declared via defineProps() (you access those directly).
 * 2. Emits declared via defineEmits() (those are meant to be handled with emit()).
 */
const attrs = useAttrs();

/**
 * usage : v-bind="tableProps"
 */
const tableProps = computed(() => {
  const { headers, items, ...rest } = props;
  const _props = { headers, items };
  // console.log("_props", _props);
  return _props;
});

/**
 * usage : v-on="tableListeners"
 */
const tableListeners = computed(() => {
  const _listeners = Object.fromEntries(
    Object.entries(attrs).filter(([key]) => key.startsWith("on"))
  );
  // console.log("_listeners", _listeners);
  return _listeners;
});

const slots = useSlots();

const hasSlot = (name) => Object.prototype.hasOwnProperty.call(slots, name);

const itemScopedSlots = computed(() => {
  let r = Object.entries(slots).filter(
    ([slotName, fn]) => slotName.startsWith("item.") && typeof fn === "function"
  );
  return r;
});
</script>

<template>
  <VDataTable
    class="text-no-wrap mb-3 my-data-table"
    v-bind="tableProps"
    v-on="tableListeners"
  >
    <!-- Forward default slot -->
    <template v-if="hasSlot('default')" #default="slotProps">
      <slot v-bind="slotProps" />
    </template>

    <!-- Forward item.* scoped slots -->
    <template
      v-for="[slotName, slotFn] in itemScopedSlots"
      :key="'item' + slotName"
      v-slot:[slotName]="slotProps"
    >
      <slot :name="slotName" v-bind="slotProps" />
    </template>

    <!-- Forward no-data slot ( only if provided ) -->
    <template v-if="hasSlot('no-data')" #no-data="slotProps">
      <slot name="no-data" v-bind="slotProps" />
    </template>
    <template v-else #no-data>
      <div
        v-if="props.loading"
        class="d-flex flex-column align-center justify-center pa-6"
        style="min-height: 200px"
      >
        <v-progress-circular indeterminate color="primary" size="32" />
        <div class="mt-2">Loading data, please wait...</div>
      </div>
      <div
        v-else
        class="d-flex flex-column align-center justify-center pa-8"
        style="min-height: 300px"
      >
        <v-icon size="64" color="grey lighten-1">mdi-folder-open</v-icon>
        <div class="text-h6 mt-4 mb-2">No records found</div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Looks like there's nothing here yet. Start by adding a new item.
        </div>
      </div>
    </template>

    <!-- Forward expanded-row slot ( only if provided ) -->
    <template v-if="hasSlot('expanded-row')" #expanded-row="slotProps">
      <slot name="expanded-row" v-bind="slotProps" />
    </template>
  </VDataTable>
</template>

<style lang="scss">
.my-data-table {
  .v-table__wrapper {
    min-height: 100px;
  }
}
</style>
