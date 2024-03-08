<template>
  <Dropdown
    v-model="selectedRule"
    :options="presetRules"
    optionLabel="name"
    placeholder="选择或输入规则"
    :editable="true"
  />
</template>

<script setup>
import { ref } from 'vue';
import Dropdown from 'primevue/dropdown';
import 'primevue/resources/themes/saga-blue/theme.css'; // 主题样式
import 'primevue/resources/primevue.min.css'; // 核心样式
import 'primeicons/primeicons.css'; // 图标样式

const presetRules = ref([
  { value: 'rule1', name: '预设规则1' },
  { value: 'rule2', name: '预设规则2' },
  { value: 'rule3', name: '预设规则3' }
]);

const selectedRule = ref(null);
</script>

<style>
/* 自定义样式 */
</style>
