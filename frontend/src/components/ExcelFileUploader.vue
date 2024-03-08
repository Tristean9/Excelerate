<script setup>
import { ref } from 'vue';
import { useStore } from "vuex";
import http from "@/api/http.js";
import router from "@/router/index.js";

const store = useStore();
const excelFile = ref(null);

const handledFileSelection = event => {
  const files = event.target.files;
  if (files.length > 0){
    excelFile.value = files[0];
  }
};

const uploadAndLoadExcelFile = async () => {
  if (excelFile.value){
    try {
      const formData = new FormData();
      formData.append('file', excelFile.value, excelFile.value.name);

      // 向服务器发送上传的文件，并获得转换后的文件
      const response = await http.post('/save_rawFile', formData, {responseType: "blob"});

      const dataToStore = response.data;

      // 更新 Vuex 中的状态
      await store.dispatch('fetchExcelFileData', dataToStore);

      await router.push({name:'excelFieldSelector'});

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
    <div id="title">文件上传页面</div>
    <input id="fileLoader" type="file" accept=".xlsx,.xls" @change="handledFileSelection"/>
    <button @click="uploadAndLoadExcelFile">Open</button>
  </div>
</template>

<style>

#title {
  display: flex;
  justify-content: center;
}

input[type="file"] {
  border: 1px solid #ccc;
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  margin-right: 10px;
}

button {
  padding: 10px 15px;
  font-size: 16px;
  color: white;
  background-image: linear-gradient(to right, #667eea, #764ba2);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  margin-right: 10px;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.2);
}
</style>
