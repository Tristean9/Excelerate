<script setup>

import { ref } from 'vue';
import { useStore } from "vuex";
import http from "@/api/http.js";
import router from "@/router/index.js";

const store = useStore();
const excelFiles = ref([]);
const exampleFile = ref(null);
const isExcelFile = ref(true);
const isJsonFile = ref(true);

const handledExcelFileSelection = (event) => {
    excelFile.value = Array.from(event.target.files);
    console.log("excelFile:", excelFiles.value);
    // isExcelFile.value = checkIfExcelFile(excelFile.value);
};

const handledExampleFileSelection = (event) => {
    exampleFile.value = event.target.files[0];
    // console.log("ruleFile:", ruleFile.value);
    // isJsonFile.value = checkIfJsonFile(ruleFile.value);
};

const goBack = () => {
    router.push({ name: 'Home' });
}

// 发送需要合并的Excel文件数组
const uploadExcelFile = () => {

}
</script>



<template>
    <div>
        <div class="title-container">
            <div class="title-text">文件上传页面</div>
        </div>

        <div class="uploader-container">
            <div>请分别在左右两个文件上传框里上传待合并Excel文件和样表Excel文件</div>
            <div class="uploader">
                <input class="fileLoader" type="file" accept=".xlsx,.xls" @change="handledExcelFileSelection"
                    multiple />
                <input class="fileLoader" type="file" accept=".xlsx, .xls" @change="handledExampleFileSelection" />
                <button @click="uploadAndLoadExcelFile">Open</button>
            </div>
            <p v-if="!isExcelFile" class="error-message">请上传若干个有效的Excel文件(.xls 或 .xlsx)</p>
            <p v-if="!isJsonFile" class="error-message">请上传一个有效的样表Excel文件(.xlsx 或 .xlsx)</p>
        </div>
    </div>
    <button @click="goBack">return</button>


</template>



<style scoped></style>