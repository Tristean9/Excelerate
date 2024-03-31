<script setup>

import { ref } from 'vue';
import { useStore } from "vuex";
import http from "@/api/http.js";
import router from "@/router/index.js";
import UploadStatusModal from '@/components/UploadStatusModal.vue';

const isModalVisible = ref(false); // 控制模态框是否显示
const modalMessage = ref(''); // 模态框消息

const store = useStore();

const summaryExcelFile = ref(null);

const isExcelFile = ref(true);


const handledExcelSelection = (event) => {
    const file = event.target.files[0];
    isExcelFile.value = checkIfExcelFile(file);
    if (isExcelFile.value) {
        summaryExcelFile.value = file; // 仅存储文件对象
        console.log("Excel file selected:", summaryExcelFile.value);
    } else {
        console.error("文件格式不正确，请上传有效的Excel文件。");
    }
};

const checkIfExcelFile = (file) => {
    const fileExtension = file.name.split('.').pop();
    return ['xls', 'xlsx'].includes(fileExtension);
}




// 发送需要合并的Excel文件数组
const uploadSummaryExcelFileFile = async () => {
    if (!summaryExcelFile.value || !isExcelFile.value) {
        console.error("文件格式不正确，请上传有效的Excel文件。");
        isModalVisible.value = true; // 显示模态框
        modalMessage.value = '文件格式不正确，请上传有效的Excel文件。';
        return;
    }

    isModalVisible.value = true; // 显示模态框
    modalMessage.value = '正在上传并处理中，请稍后';

    const reader = new FileReader();
    reader.onload = async (e) => {
        const blob = new Blob([e.target.result], { type: summaryExcelFile.value.type });
        try {
            await store.dispatch('saveSummaryExcelBlob', blob); // 将Blob对象存储到store中
            console.log("Excel file converted to Blob and stored in Vuex store.");
            await router.push({ name: 'SplitSelector' });
        } catch (error) {
            console.error("Error dispatching Blob to store: ", error);
            isModalVisible.value = true; // 显示模态框
            modalMessage.value = '上传失败，请稍后再试';
        }
    };
    reader.onerror = (e) => {
        console.error("Error reading file: ", e);
        isModalVisible.value = true; // 显示模态框
        modalMessage.value = '读取文件出错，请尝试重新上传';
    };
    reader.readAsArrayBuffer(summaryExcelFile.value); // 读取文件作为ArrayBuffer
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
            <div>请在文件上传框里上传待拆分的Excel文件</div>
            <div class="uploader">
                <input class="fileLoader" type="file" accept=".xlsx, .xls" @change="handledExcelSelection" />
                <button @click="uploadSummaryExcelFileFile">上传</button>
            </div>
            <p v-if="!isExcelFile" class="error-message">请上传一个有效的样表Excel文件(.xlsx 或 .xlsx)</p>
        </div>
    </div>
    <UploadStatusModal :isVisible="isModalVisible" :message="modalMessage" />


</template>



<style scoped></style>