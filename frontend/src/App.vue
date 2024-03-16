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
.title-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;

}

.title-text {
  font-size: 32px;
  font-weight: bold;
}

.uploader{
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>