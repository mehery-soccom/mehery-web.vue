<script setup>
import { VDataTable } from 'vuetify/labs/VDataTable'
import { paginationMeta } from '@fake-db/utils'
import figma from '@app/assets/images/icons/project-icons/figma.png'
import html5 from '@app/assets/images/icons/project-icons/html5.png'
import python from '@app/assets/images/icons/project-icons/python.png'
import react from '@app/assets/images/icons/project-icons/react.png'
import sketch from '@app/assets/images/icons/project-icons/sketch.png'
import vue from '@app/assets/images/icons/project-icons/vue.png'
import xamarin from '@app/assets/images/icons/project-icons/xamarin.png'

const projectTableHeaders = [
  {
    title: 'PROJECT',
    key: 'name',
  },
  {
    title: 'LEADER',
    key: 'leader',
  },
  {
    title: 'PROGRESS',
    key: 'progress',
  },
  {
    title: 'Action',
    key: 'Action',
    sortable: false,
  },
]

const projects = [
  {
    logo: react,
    name: 'BGC eCommerce App',
    project: 'React Project',
    leader: 'Eileen',
    progress: 78,
    hours: '18:42',
  },
  {
    logo: figma,
    name: 'Falcon Logo Design',
    project: 'Figma Project',
    leader: 'Owen',
    progress: 25,
    hours: '20:42',
  },
  {
    logo: vue,
    name: 'Dashboard Design',
    project: 'Vuejs Project',
    leader: 'Keith',
    progress: 62,
    hours: '120:87',
  },
  {
    logo: xamarin,
    name: 'Foodista mobile app',
    project: 'Xamarin Project',
    leader: 'Merline',
    progress: 8,
    hours: '120:87',
  },
  {
    logo: python,
    name: 'Dojo Email App',
    project: 'Python Project',
    leader: 'Harmonia',
    progress: 51,
    hours: '230:10',
  },
  {
    logo: sketch,
    name: 'Blockchain Website',
    project: 'Sketch Project',
    leader: 'Allyson',
    progress: 92,
    hours: '342:41',
  },
  {
    logo: html5,
    name: 'Hoffman Website',
    project: 'HTML Project',
    leader: 'Georgie',
    progress: 80,
    hours: '12:45',
  },
]

const resolveUserProgressVariant = progress => {
  if (progress <= 25)
    return 'error'
  if (progress > 25 && progress <= 50)
    return 'warning'
  if (progress > 50 && progress <= 75)
    return 'primary'
  if (progress > 75 && progress <= 100)
    return 'success'
  
  return 'secondary'
}

const search = ref('')

const options = ref({
  page: 1,
  itemsPerPage: 5,
})

const moreList = [
  {
    title: 'Download',
    value: 'Download',
  },
  {
    title: 'Delete',
    value: 'Delete',
  },
  {
    title: 'View',
    value: 'View',
  },
]
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle> Project List</VCardTitle>
      <VSpacer />
      <template #append>
        <div style="inline-size: 272px;">
          <AppTextField
            v-model="search"
            placeholder="Search"
          />
        </div>
      </template>
    </VCardItem>

    <VDivider />
    <!-- 👉 User Project List Table -->

    <!-- SECTION Datatable -->
    <VDataTable
      v-model:page="options.page"
      :headers="projectTableHeaders"
      :items-per-page="options.itemsPerPage"
      :items="projects"
      hide-default-footer
      :search="search"
      @update:options="options = $event"
    >
      <!-- projects -->
      <template #item.name="{ item }">
        <div class="d-flex">
          <VAvatar
            :size="34"
            class="me-3"
            :image="item.raw.logo"
          />
          <div>
            <p class="font-weight-medium mb-0">
              {{ item.raw.name }}
            </p>
            <p class="text-xs text-medium-emphasis mb-0">
              {{ item.raw.project }}
            </p>
          </div>
        </div>
      </template>

      <!-- Progress -->
      <template #item.progress="{ item }">
        <div class="d-flex align-center gap-3">
          <div class="flex-grow-1">
            <VProgressLinear
              :height="6"
              :model-value="item.raw.progress"
              rounded
              :color="resolveUserProgressVariant(item.raw.progress)"
            />
          </div>
          <span>{{ item.raw.progress }}%</span>
        </div>
      </template>

      <!-- Action -->
      <template #item.Action>
        <MoreBtn
          :color="undefined"
          :menu-list="moreList"
        />
      </template>

      <!-- TODO Refactor this after vuetify provides proper solution for removing default footer -->
      <template #bottom>
        <VDivider />

        <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
          <p class="text-sm text-disabled mb-0">
            {{ paginationMeta(options, projects.length) }}
          </p>

          <VPagination
            v-model="options.page"
            :total-visible="Math.ceil(projects.length / 5)"
            :length="Math.ceil(projects.length / 5)"
          >
            <template #next="slotProps">
              <VBtn
                v-bind="slotProps"
                :icon="false"
                variant="tonal"
                color="default"
              >
                Next
              </VBtn>
            </template>

            <template #prev="slotProps">
              <VBtn
                v-bind="slotProps"
                :icon="false"
                variant="tonal"
                color="default"
              >
                Previous
              </VBtn>
            </template>
          </VPagination>
        </div>
      </template>
      <!--
        <template #bottom>
        <VDivider />

        <div class="d-flex align-center justify-space-between flex-wrap gap-3 pa-5 pt-3">
        <p class="text-sm text-disabled mb-0">
        {{ paginationMeta(options, projects.length) }}
        </p>

        <VPagination
        v-model="options.page"
        :total-visible="Math.ceil(projects.length / 5)"
        :length="Math.ceil(projects.length / 5)"
        >
        <template #next="slotProps">
        <VBtn
        v-bind="slotProps"
        :icon="false"
        variant="tonal"
        color="default"
        >
        Next
        </VBtn>
        </template>

        <template #prev="slotProps">
        <VBtn
        v-bind="slotProps"
        :icon="false"
        variant="tonal"
        color="default"
        >
        Previous
        </VBtn>
        </template>
        </VPagination>
        </div>
        </template>
      -->
    </VDataTable>
    <!-- !SECTION -->
  </VCard>
</template>
