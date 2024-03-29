<script setup>

import { ref } from 'vue';
import { useStore } from "vuex";
import http from "@/api/http.js";
import router from "@/router/index.js";

const store = useStore();
const excelFile = ref(null);
const isExcelFile = ref(true);

const goBack = () => {
  router.push({ name: 'Home' });
}

const checkIfExcelFile = (file) => {
  const fileExtension = file.name.split('.').pop();
  return ['xls', 'xlsx'].includes(fileExtension);
}

const handledFileSelection = event => {
  const files = event.target.files;
  if (files.length > 0) {
    excelFile.value = files[0];
    isExcelFile.value = checkIfExcelFile(files[0]);  // 检查是否为Excel文件
  } else {
    isExcelFile.value = true; //  如果没有文件被选择，重置为true
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

const goHome = () => {
    router.push({ name: 'Home' });
}
</script>

<template>
  <div>
    <div class="nav-button">
        <button @click="goBack">返回</button>
        <button @click="goHome">主页</button>
    </div>
    <div class="title-container">
      <div class="title-text">文件上传</div>
    </div>
    
    <div class="uploader-container">
      <div class="uploader">
        <input id="fileLoader" type="file" accept=".xlsx,.xls" @change="handledFileSelection" />
        <button :disabled="!isExcelFile" @click="uploadAndLoadExcelFile">打开</button>
      </div>
      <p v-if="!isExcelFile" class="error-message">请上传一个有效的Excel文件(.xls 或 .xlsx)</p>
    </div>
    
  </div>
</template>

<style>
.uploader-container {
  display: flex;
  flex-direction: column;
}
.uploader {
  display: flex;
}
.error-message {
  color: red;
}
</style>
