<script setup>

import { ref } from 'vue';
import { useStore } from "vuex";
import http from "@/api/http.js";
import router from "@/router/index.js";

const store = useStore();
const excelFile = ref(null);

const handledFileSelection = event => {
  const files = event.target.files;
  if (files.length > 0) {
    excelFile.value = files[0];
  }
};

const uploadAndLoadExcelFile = async () => {
  if (excelFile.value) {
    try {
      const formData = new FormData();
      formData.append('file', excelFile.value);

      // 向服务器发送上传的文件，并获得转换后的文件
      const response = await http.post('/save_rawFile', formData, { responseType: "blob" });

      // 更新 Vuex 中的状态
      await store.dispatch('fetchProcessedExcelData', response.data);

      await router.push({ name: 'ExcelFieldSelector' });

    } catch (error) {
      console.error("Error uploading file: ", error);
    }
  } else {
    console.log("No file selected!");
  }
};


</script>

<template>
  <div>
    <div class="title-container">
      <div class="title-text">文件上传页面</div>
    </div>
    <div class="uploader">
      <input id="fileLoader" type="file" accept=".xlsx,.xls" @change="handledFileSelection" />
      <button @click="uploadAndLoadExcelFile">Open</button>
    </div>
  </div>
</template>

<style>


</style>
