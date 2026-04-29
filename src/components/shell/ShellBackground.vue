<script setup>
import { computed } from 'vue'
import StarfieldBackground from '@/components/StarfieldBackground.vue'
import TalentBg from '@/components/TalentBg.vue'
import { shellConfig } from '@/config/shell'

const backgrounds = {
  none: null,
  starfield: StarfieldBackground,
  stars: StarfieldBackground,
  talent: TalentBg,
}

const activeBackground = computed(() => backgrounds[shellConfig.background] ?? null)
</script>

<template>
  <component :is="activeBackground" v-if="activeBackground" />
</template>
