<script setup>

import http from "@/api/http.js";
import router from "@/router/index.js";
import { saveAs } from 'file-saver';


const sendContact = async () => {

    try {
        const response = await http.post('/contact',{}, { responseType: "blob" });
        console.log('response.data', response.data);
        
        const contactedExcel = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }); // 使用返回的 blob 数据创建一个 Blob 对象
        // const contactedExcel = response.data
        saveAs(contactedExcel, "Contacted.xlsx"); // 使用 saveAs 保存文件
    } catch (error) {
        console.error('Failed to send data', error);
    }
};

const goBack = () => {
    router.push({ name: 'ExampleDataSelector' });
}
const goHome = () => {
    router.push({ name: 'Home' });
}

</script>



<template>
    <div class="nav-button">
        <button @click="goBack">返回</button>
        <button @click="goHome">主页</button>
    </div>
    <div class="title-container">
        <div class="title-text">文件上传</div>
    </div>

    <button @click="sendContact">合并文件</button>

</template>



<style scoped></style>