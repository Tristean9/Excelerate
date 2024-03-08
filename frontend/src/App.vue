<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive include="ExcelFieldSelector">
      <component :is="Component" />
    </keep-alive>
  </router-view>

  

</template>


<script setup>

import inputselect from '@/components/inputselect.vue'

</script>

<style>

</style>