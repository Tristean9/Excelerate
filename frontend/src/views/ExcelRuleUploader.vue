<script setup>

import { ref } from 'vue';
import { useStore } from "vuex";
import http from "@/api/http.js";
import router from "@/router/index.js";

const store = useStore();
const excelFile = ref(null);
const ruleFile = ref(null);

const handledExcelFileSelection = (event) => {
    excelFile.value = event.target.files[0];
    console.log("excelFile:", excelFile.value);
};

const handledRuleFileSelection = (event) => {
    ruleFile.value = event.target.files[0];
    console.log("ruleFile:", ruleFile.value);
};

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
            // 将Base64编码文件转换成Blob对象
            const byteCharacters = atob(base64String);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const fileBlobData = new Blob([byteArray], { type: 'application/vnd.ms-excel' });


            // 更新 Vuex 中的状态
            await store.dispatch('fetchCheckedExcelData', fileBlobData);
            await store.dispatch('fetchErrorPosition', errorPosition);
            // await store.dispatch('fetchCheckedExcelData', excelFile.value);
            await router.push({ name: 'ExcelDataChecker' });

        } catch (error) {
            console.error("Error uploading file: ", error);
        }
    } else {
        console.error("请同时上传Excel文件和规则json文件!");
    }
};
</script>


<template>
    <div>
        <div id="title">文件上传页面</div>
        <h2>请同时上传Excel文件和规则json文件</h2>
        <input class="fileLoader" type="file" accept=".xlsx,.xls" @change="handledExcelFileSelection" />
        <input class="fileLoader" type="file" accept=".json" @change="handledRuleFileSelection" />
        <button @click="uploadAndLoadExcelFile">Open</button>
    </div>

</template>


<style scoped></style>