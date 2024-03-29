<script setup>

import { ref } from 'vue';
import { useStore } from "vuex";
import http from "@/api/http.js";
import router from "@/router/index.js";

const store = useStore();
const excelFile = ref(null);
const ruleFile = ref(null);
const isExcelFile = ref(true);
const isJsonFile = ref(true);

const checkIfExcelFile = (file) => {
    const fileExtension = file.name.split('.').pop();
    return ['xls', 'xlsx'].includes(fileExtension);
}
const checkIfJsonFile = (file) => {
    const fileExtension = file.name.split('.').pop();
    return ['json'].includes(fileExtension);
}

const handledExcelFileSelection = (event) => {
    excelFile.value = event.target.files[0];
    // console.log("excelFile:", excelFile.value);
    isExcelFile.value = checkIfExcelFile(excelFile.value);
};

const handledRuleFileSelection = (event) => {
    ruleFile.value = event.target.files[0];
    // console.log("ruleFile:", ruleFile.value);
    isJsonFile.value = checkIfJsonFile(ruleFile.value);
};

const base64ToBlob = (base64, mimeType) => {
    // 解码 Base64 字符串
    const byteCharacters = atob(base64);
    // 每个字符的编码存入一个数组
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    // 转换为类型化数组
    const byteArray = new Uint8Array(byteNumbers);
    // 使用类型化数组创建 Blob 对象
    return new Blob([byteArray], { type: mimeType });
}


const uploadAndLoadExcelFile = async () => {
    // if (excelFile.value && ruleFile.value) {
    if (excelFile.value) {
        try {
            const formData = new FormData();
            formData.append('excelFile', excelFile.value);
            formData.append('ruleFile', ruleFile.value);

            // 向服务器发送上传的文件，并获得转换后的文件
            const response = await http.post('/load_and_check_data', formData);

            // console.log('response', response.data.checked_excel
            const base64String = response.data.checked_excel
            const errorPosition = response.data.error_index_col
            const positionRule = response.data.range_and_rule

            // 将Base64编码文件转换成Blob对象
            const fileBlobData = base64ToBlob(base64String, 'application/vnd.ms-excel');


            // 更新 Vuex 中的状态
            await store.dispatch('fetchCheckedExcelData', fileBlobData);
            await store.dispatch('fetchErrorPosition', errorPosition);
            await store.dispatch('fetchPositionRule', positionRule);


            await router.push({ name: 'ExcelDataChecker' });

        } catch (error) {
            console.error("Error uploading file: ", error);
        }
    } else {
        console.error("请同时上传Excel文件和规则json文件!");
    }
};

const goBack = () => {
    router.push({ name: 'Home' });
}
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
            <div>请分别在左右两个文件上传框里上传Excel文件和对应的规则json文件</div>
            <div class="uploader">
                <input class="fileLoader" type="file" accept=".xlsx,.xls" @change="handledExcelFileSelection" />
                <input class="fileLoader" type="file" accept=".json" @change="handledRuleFileSelection" />
                <button @click="uploadAndLoadExcelFile">Open</button>
            </div>
            <p v-if="!isExcelFile" class="error-message">请上传一个有效的Excel文件(.xls 或 .xlsx)</p>
            <p v-if="!isJsonFile" class="error-message">请上传一个有效的Json文件(.json)</p>
        </div>
    </div>

</template>


<style scoped></style>