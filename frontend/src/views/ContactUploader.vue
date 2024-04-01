<script setup>

import { ref } from 'vue';
import { useStore } from "vuex";
import http from "@/api/http.js";
import router from "@/router/index.js";
import UploadStatusModal from '@/components/UploadStatusModal.vue';

const isModalVisible = ref(false); // 控制模态框是否显示
const modalMessage = ref(''); // 模态框消息

const store = useStore();
const excelFiles = ref([]);
const exampleFile = ref(null);
const allIsExcelFile = ref(true);
const isExcelFile = ref(true);

const handledExcelFileSelection = (event) => {
    const files = Array.from(event.target.files);
    allIsExcelFile.value = files.every(file => checkIfExcelFile(file));
    excelFiles.value = allIsExcelFile.value ? files : [];
    console.log("excelFiles:", excelFiles.value);
};

const handledExampleFileSelection = (event) => {
    const file = event.target.files[0];
    isExcelFile.value = checkIfExcelFile(file);
    exampleFile.value = isExcelFile.value ? file : null;
    console.log("exampleFile:", exampleFile.value);
};

const checkIfExcelFile = (file) => {
    const fileExtension = file.name.split('.').pop();
    return ['xls', 'xlsx'].includes(fileExtension);
}


const goBack = () => {
    router.push({ name: 'Home' });
}
const goHome = () => {
    router.push({ name: 'Home' });
}

// 发送需要合并的Excel文件数组
const uploadExcelFiles = async () => {
    if (!isExcelFile.value || !allIsExcelFile.value) {
        // 可以添加一个用户提示，表明文件格式不正确
        console.error("文件格式不正确，请上传有效的Excel文件。");
        return;
    }
    isModalVisible.value = true; // 显示模态框
    modalMessage.value = '正在上传并处理中，请稍后';
    try {
        // 构建一个FormData对象来发送文件
        const formData = new FormData();
        excelFiles.value.forEach(file => {
            formData.append('excelFiles', file);
        });
        formData.append('exampleFile', exampleFile.value);

        const response = await http.post('/load-excelFiles-example', formData,
            { responseType: "blob" }
        );
        console.log("response.data", response.data);

        const exampleExcelBlob = response.data;

        await store.dispatch('saveExampleExcelBlob', exampleExcelBlob)
        await router.push({ name: 'ExampleDataSelector' });
    } catch (error) {
        console.error("Error uploading file: ", error);
        isModalVisible.value = true; // 显示模态框
        modalMessage.value = '正在上传并处理中，请稍候';
    }

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
            <div>请分别在左右两个文件上传框里上传待合并Excel文件和样表Excel文件</div>
            <div class="uploader">
                <input class="fileLoader" type="file" accept=".xlsx,.xls" @change="handledExcelFileSelection"
                    multiple />
                <input class="fileLoader" type="file" accept=".xlsx, .xls" @change="handledExampleFileSelection" />
                <button @click="uploadExcelFiles">打开</button>
            </div>
            <p v-if="!allIsExcelFile" class="error-message">请上传若干个有效的Excel文件(.xls 或 .xlsx)</p>
            <p v-if="!isExcelFile" class="error-message">请上传一个有效的样表Excel文件(.xlsx 或 .xlsx)</p>
        </div>
    </div>
    <UploadStatusModal :isVisible="isModalVisible" :message="modalMessage" />


</template>



<style scoped></style>