<script setup>

import { ref } from 'vue';
import { useStore } from "vuex";
import http from "@/api/http.js";
import router from "@/router/index.js";

import UploadStatusModal from '@/components/UploadStatusModal.vue';

const store = useStore();
const excelFile = ref(null);
const excelFileName = ref('')
const isExcelFile = ref(true);
const isModalVisible = ref(false); // 控制模态框是否显示
const modalMessage = ref(''); // 模态框消息

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
    excelFileName.value = files[0].name;
  } else {
    isExcelFile.value = true; //  如果没有文件被选择，重置为true
  }
};

const uploadAndLoadExcelFile = async () => {
  if (excelFile.value && isExcelFile.value) {
    isModalVisible.value = true; // 显示模态框
    modalMessage.value = '正在上传并处理中，请稍后';
    try {
      const formData = new FormData();
      formData.append('file', excelFile.value);

      // 向服务器发送上传的文件，并获得转换后的文件
      const response = await http.post('/save_rawFile', formData, { responseType: "blob" });
      console.log("response.data", response.data);

      // 更新 Vuex 中的状态
      await store.dispatch('fetchProcessedExcelData', response.data);
      await store.dispatch('saveExcelFileName', excelFileName.value);

      await router.push({ name: 'ExcelFieldSelector' });

    } catch (error) {
      console.error("Error uploading file: ", error);
      isModalVisible.value = true; // 显示模态框
      modalMessage.value = '正在上传并处理中，请稍候';
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
  <UploadStatusModal :isVisible="isModalVisible" :message="modalMessage" />
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
