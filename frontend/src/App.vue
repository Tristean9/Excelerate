<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive include="ExcelFieldSelector">
      <component :is="Component" />
    </keep-alive>
  </router-view>

</template>

<script setup>

</script>

<style>

</style>