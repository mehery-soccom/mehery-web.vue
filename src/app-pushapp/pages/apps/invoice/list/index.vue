<script setup>
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { paginationMeta } from '@fake-db/utils'
import { useInvoiceStore } from '@app/views/apps/invoice/useInvoiceStore'
import { avatarText } from '@core/utils/formatters'

const invoiceListStore = useInvoiceStore()
const searchQuery = ref('')
const dateRange = ref('')
const selectedStatus = ref()
const totalInvoices = ref(0)
const invoices = ref([])
const selectedRows = ref([])

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  groupBy: [],
  search: undefined,
})

const isLoading = ref(false)
const currentPage = ref(1)

currentPage.value = options.value.page

// 👉 headers
const headers = [
  {
    title: '#ID',
    key: 'id',
  },
  {
    title: 'Trending',
    key: 'trending',
    sortable: false,
  },
  {
    title: 'Client',
    key: 'client',
  },
  {
    title: 'Total',
    key: 'total',
  },
  {
    title: 'Issued Date',
    key: 'date',
  },
  {
    title: 'Balance',
    key: 'balance',
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
  },
]

// 👉 Fetch Invoices
const fetchInvoices = (query, currentStatus, firstDate, lastDate, option) => {
  isLoading.value = true
  invoiceListStore.fetchInvoices({
    q: query,
    status: currentStatus,
    startDate: firstDate,
    endDate: lastDate,
    options: option,
  }).then(response => {
    invoices.value = response.data.invoices
    totalInvoices.value = response.data.totalInvoices
    options.value.page = response.data.page
  }).catch(error => {
    console.log(error)
  })
  isLoading.value = false
}

// 👉 Invoice balance variant resolver
const resolveInvoiceBalanceVariant = (balance, total) => {
  if (balance === total)
    return {
      status: 'Unpaid',
      chip: { color: 'error' },
    }
  if (balance === 0)
    return {
      status: 'Paid',
      chip: { color: 'success' },
    }
  
  return {
    status: balance,
    chip: { variant: 'text' },
  }
}

const resolveInvoiceStatusVariantAndIcon = status => {
  if (status === 'Partial Payment')
    return {
      variant: 'success',
      icon: 'tabler-circle-half-2',
    }
  if (status === 'Paid')
    return {
      variant: 'warning',
      icon: 'tabler-chart-pie',
    }
  if (status === 'Downloaded')
    return {
      variant: 'info',
      icon: 'tabler-arrow-down-circle',
    }
  if (status === 'Draft')
    return {
      variant: 'primary',
      icon: 'tabler-device-floppy',
    }
  if (status === 'Sent')
    return {
      variant: 'secondary',
      icon: 'tabler-circle-check',
    }
  if (status === 'Past Due')
    return {
      variant: 'error',
      icon: 'tabler-alert-circle',
    }
  
  return {
    variant: 'secondary',
    icon: 'tabler-x',
  }
}

const computedMoreList = computed(() => {
  return paramId => [
    {
      title: 'Download',
      value: 'download',
      prependIcon: 'tabler-download',
    },
    {
      title: 'Edit',
      value: 'edit',
      prependIcon: 'tabler-pencil',
      to: {
        name: 'apps-invoice-edit-id',
        params: { id: paramId },
      },
    },
    {
      title: 'Duplicate',
      value: 'duplicate',
      prependIcon: 'tabler-layers-intersect',
    },
  ]
})

const deleteInvoice = id => {
  invoiceListStore.deleteInvoice(id).then(() => {
    fetchInvoices(searchQuery.value, selectedStatus.value, dateRange.value?.split('to')[0], dateRange.value?.split('to')[1], options.value)
  }).catch(error => {
    console.log(error)
  })
}

// 👉 watch for data table options like itemsPerPage,page,searchQuery,sortBy etc...
watchEffect(() => {
  const [start, end] = dateRange.value ? dateRange.value.split('to') : ''

  fetchInvoices(searchQuery.value, selectedStatus.value, start, end, options.value)
})
</script>

<template>
  <VCard
    v-if="invoices"
    id="invoice-list"
  >
    <VCardText class="d-flex align-center flex-wrap gap-4">
      <div class="me-3 d-flex gap-3">
        <AppSelect
          :model-value="options.itemsPerPage"
          :items="[
            { value: 10, title: '10' },
            { value: 25, title: '25' },
            { value: 50, title: '50' },
            { value: 100, title: '100' },
            { value: -1, title: 'All' },
          ]"
          style="width: 6.25rem;"
          @update:model-value="options.itemsPerPage = parseInt($event, 10)"
        />
        <!-- 👉 Create invoice -->
        <VBtn
          prepend-icon="tabler-plus"
          :to="{ name: 'apps-invoice-add' }"
        >
          Create invoice
        </VBtn>
      </div>

      <VSpacer />

      <div class="d-flex align-center flex-wrap gap-4">
        <!-- 👉 Search  -->
        <div class="invoice-list-filter">
          <AppTextField
            v-model="searchQuery"
            placeholder="Search Invoice"
            density="compact"
          />
        </div>

        <!-- 👉 Select status -->
        <div class="invoice-list-filter">
          <AppSelect
            v-model="selectedStatus"
            placeholder="Select Status"
            clearable
            clear-icon="tabler-x"
            single-line
            :items="['Downloaded', 'Draft', 'Sent', 'Paid', 'Partial Payment', 'Past Due']"
          />
        </div>
      </div>
    </VCardText>

    <VDivider />

    <!-- SECTION Datatable -->
    <VDataTableServer
      v-model="selectedRows"
      v-model:items-per-page="options.itemsPerPage"
      v-model:page="options.page"
      :loading="isLoading"
      :items-length="totalInvoices"
      :headers="headers"
      :items="invoices"
      class="text-no-wrap"
      @update:options="options = $event"
    >
      <!-- Trending Header -->
      <template #column.trending>
        <VIcon
          size="22"
          icon="tabler-trending-up"
        />
      </template>

      <!-- id -->
      <template #item.id="{ item }">
        <RouterLink :to="{ name: 'apps-invoice-preview-id', params: { id: item.value } }">
          #{{ item.raw.id }}
        </RouterLink>
      </template>

      <!-- trending -->
      <template #item.trending="{ item }">
        <VTooltip>
          <template #activator="{ props }">
            <VAvatar
              :size="30"
              v-bind="props"
              :color="resolveInvoiceStatusVariantAndIcon(item.raw.invoiceStatus).variant"
              variant="tonal"
            >
              <VIcon
                :size="20"
                :icon="resolveInvoiceStatusVariantAndIcon(item.raw.invoiceStatus).icon"
              />
            </VAvatar>
          </template>
          <p class="mb-0">
            {{ item.raw.invoiceStatus }}
          </p>
          <p class="mb-0">
            Balance: {{ item.raw.balance }}
          </p>
          <p class="mb-0">
            Due date: {{ item.raw.dueDate }}
          </p>
        </VTooltip>
      </template>

      <!-- client -->
      <template #item.client="{ item }">
        <div class="d-flex align-center">
          <VAvatar
            size="38"
            :color="!item.raw.avatar.length ? resolveInvoiceStatusVariantAndIcon(item.raw.invoiceStatus).variant : undefined"
            :variant="!item.raw.avatar.length ? 'tonal' : undefined"
            class="me-3"
          >
            <VImg
              v-if="item.raw.avatar.length"
              :src="item.raw.avatar"
            />
            <span v-else>{{ avatarText(item.raw.client.name) }}</span>
          </VAvatar>
          <div class="d-flex flex-column">
            <h6 class="text-body-1 font-weight-medium mb-0">
              {{ item.raw.client.name }}
            </h6>
            <span class="text-sm text-disabled">{{ item.raw.client.companyEmail }}</span>
          </div>
        </div>
      </template>

      <!-- Total -->
      <template #item.total="{ item }">
        ${{ item.raw.total }}
      </template>

      <!-- Date -->
      <template #item.date="{ item }">
        {{ item.raw.issuedDate }}
      </template>

      <!-- Balance -->
      <template #item.balance="{ item }">
        <VChip
          v-if="typeof ((resolveInvoiceBalanceVariant(item.raw.balance, item.raw.total)).status) === 'string'"
          :color="resolveInvoiceBalanceVariant(item.raw.balance, item.raw.total).chip.color"
          label
        >
          {{ (resolveInvoiceBalanceVariant(item.raw.balance, item.raw.total)).status }}
        </VChip>

        <template v-else>
          <span class="text-base">
            {{ Number((resolveInvoiceBalanceVariant(item.raw.balance, item.raw.total)).status) > 0 ? `$${(resolveInvoiceBalanceVariant(item.raw.balance, item.raw.total)).status}` : `-$${Math.abs(Number((resolveInvoiceBalanceVariant(item.raw.balance, item.raw.total)).status))}` }}
          </span>
        </template>
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <IconBtn @click="deleteInvoice(item.raw.id)">
          <VIcon icon="tabler-trash" />
        </IconBtn>

        <IconBtn :to="{ name: 'apps-invoice-preview-id', params: { id: item.raw.id } }">
          <VIcon icon="tabler-eye" />
        </IconBtn>

        <MoreBtn
          :menu-list="computedMoreList(item.raw.id)"
          item-props
          color="undefined"
        />
      </template>

      <!-- pagination -->

      <template #bottom>
        <VDivider />
        <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
          <p class="text-sm text-disabled mb-0">
            {{ paginationMeta(options, totalInvoices) }}
          </p>

          <VPagination
            v-model="options.page"
            :length="Math.ceil(totalInvoices / options.itemsPerPage)"
            :total-visible="$vuetify.display.xs ? 1 : Math.ceil(totalInvoices / options.itemsPerPage)"
          >
            <template #prev="slotProps">
              <VBtn
                variant="tonal"
                color="default"
                v-bind="slotProps"
                :icon="false"
              >
                Previous
              </VBtn>
            </template>

            <template #next="slotProps">
              <VBtn
                variant="tonal"
                color="default"
                v-bind="slotProps"
                :icon="false"
              >
                Next
              </VBtn>
            </template>
          </VPagination>
        </div>
      </template>
    </VDataTableServer>
    <!-- !SECTION -->
  </VCard>
</template>

<style lang="scss">
#invoice-list {
  .invoice-list-actions {
    inline-size: 8rem;
  }

  .invoice-list-filter {
    inline-size: 12rem;
  }
}
</style>
