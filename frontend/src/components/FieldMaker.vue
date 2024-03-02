<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
const data = route.params.data;

</script>

<template>
  <h1>{{ data }}</h1>
</template>

<style scoped>

</style>