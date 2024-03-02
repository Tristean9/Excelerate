<script setup>
import { useRouter } from "vue-router";
import {ref} from "vue";

const router = useRouter();
const someData = ref('dataExample');

</script>

<template>
  <router-link :to="{ name: 'fieldMaker', params: { data: someData } }">发送</router-link>
</template>
