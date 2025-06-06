<script setup>
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import Prism from 'vue-prism-component'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  code: {
    type: Object,
    required: true,
  },
  codeLanguage: {
    type: String,
    required: false,
    default: 'markup',
  },
  noPadding: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const preferredCodeLanguage = useStorage('preferredCodeLanguage', 'ts')
const isCodeShown = ref(false)
const { copy, copied } = useClipboard({ source: computed(() => props.code[preferredCodeLanguage.value]) })
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle>{{ props.title }}</VCardTitle>
      <template #append>
        <IconBtn
          size="small"
          :color="isCodeShown ? 'primary' : 'default'"
          :class="isCodeShown ? '' : 'text-disabled'"
          @click="isCodeShown = !isCodeShown"
        >
          <VIcon
            size="20"
            icon="tabler-code"
          />
        </IconBtn>
      </template>
    </VCardItem>
    <slot v-if="noPadding" />
    <VCardText v-else>
      <slot />
    </VCardText>
    <VExpandTransition>
      <div v-show="isCodeShown">
        <VDivider />

        <VCardText class="d-flex gap-y-3 flex-column">
          <div class="d-flex justify-end">
            <VBtnToggle
              v-model="preferredCodeLanguage"
              mandatory
              variant="outlined"
              density="compact"
            >
              <VBtn
                size="x-small"
                value="ts"
                :color="preferredCodeLanguage === 'ts' ? 'primary' : 'default'"
              >
                <VIcon
                  size="x-large"
                  icon="custom-typescript"
                  :color="preferredCodeLanguage === 'ts' ? 'primary' : 'secondary'"
                />
              </VBtn>
              <VBtn
                size="x-small"
                value="js"
                :color="preferredCodeLanguage === 'js' ? 'primary' : 'default'"
              >
                <VIcon
                  size="x-large"
                  icon="custom-javascript"
                  :color="preferredCodeLanguage === 'js' ? 'primary' : 'secondary'"
                />
              </VBtn>
            </VBtnToggle>
          </div>

          <div class="position-relative">
            <Prism
              :key="props.code[preferredCodeLanguage]"
              :language="props.codeLanguage"
              :style="$vuetify.locale.isRtl ? 'text-align: right' : 'text-align: left'"
            >
              {{ props.code[preferredCodeLanguage] }}
            </Prism>
            <IconBtn
              class="position-absolute app-card-code-copy-icon"
              color="white"
              @click="() => { copy() }"
            >
              <VIcon
                :icon="copied ? 'tabler-check' : 'tabler-copy'"
                size="20"
              />
            </IconBtn>
          </div>
        </VCardText>
      </div>
    </VExpandTransition>
  </VCard>
</template>

<style lang="scss">
@use "@app/styles/variables/_vuetify.scss";

:not(pre) > code[class*="language-"],
pre[class*="language-"] {
  border-radius: vuetify.$card-border-radius;
}

.app-card-code-copy-icon {
  inset-block-start: 1.2em;
  inset-inline-end: 0.8em;
}
</style>
