<script setup>
import avatar1 from '@app/assets/images/avatars/avatar-1.png'
import avatar2 from '@app/assets/images/avatars/avatar-2.png'
import avatar3 from '@app/assets/images/avatars/avatar-3.png'
import avatar4 from '@app/assets/images/avatars/avatar-4.png'
</script>

<template>
  <div class="demo-space-x">
    <VChip pill>
      <VAvatar
        start
        :image="avatar1"
      />
      <span>John Doe</span>
    </VChip>

    <VChip pill>
      <VAvatar
        start
        :image="avatar2"
      />
      <span>Darcy Nooser</span>
    </VChip>

    <VChip pill>
      <VAvatar
        start
        :image="avatar3"
      />
      <span>Felicia Risker</span>
    </VChip>

    <VChip pill>
      <VAvatar
        start
        :image="avatar4"
      />
      <span>Minnie Mostly</span>
    </VChip>
  </div>
</template>
