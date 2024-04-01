<script setup>

import { ref, computed } from 'vue';

import http from "@/api/http.js";
import router from "@/router/index.js";
import store from "@/store/index.js";
import { saveAs } from 'file-saver';
import UploadStatusModal from '@/components/UploadStatusModal.vue';

import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css';
import { GcSpreadSheets, GcWorksheet } from '@grapecity/spread-sheets-vue';
import '@grapecity/spread-sheets-io';
import * as GC from '@grapecity/spread-sheets'

const isModalVisible = ref(false);
const spread = ref(null);
const modalMessage = ref('')
const spreadStyles = computed(() => {
    return { width: '100%', height: '600px' };
});

const recheckExcelInfo = computed(() => store.state.recheckExcelInfo);
// console.log("recheckExcelInfo", recheckExcelInfo.value);
const currentRecheckExcelInfo = ref(recheckExcelInfo.value); // 储存当前的再检验信息
// console.log("currentRecheckExcelInfo", currentRecheckExcelInfo.value);
// console.log("currentRecheckExcelInfo.recheck_excel_fileName", currentRecheckExcelInfo.value.recheck_excel_fileName);
// console.log("currentRecheckExcelInfo.recheck_excel", currentRecheckExcelInfo.value.recheck_excel);

const initSpread = (s) => {
    const base64String = currentRecheckExcelInfo.value.recheck_excel
    if (base64String) {
        spread.value = s;
        const currentExcelBlob = base64ToBlob(base64String, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        console.log("currentExcelBlob", currentExcelBlob);
        // saveAs(currentExcelBlob, "ddd.xlsx");
        loadAndDisplayExcelContent(currentExcelBlob)
        spread.value.bind(GC.Spread.Sheets.Events.CellClick, handleCellClick);
    } else {
        spread.value = s;
    }
}

const selectedCellText = ref(''); // 用于存储选中单元格的文本内容

const handleCellClick = (event, cellInfo) => {
    if (spread.value && cellInfo.sheetArea === GC.Spread.Sheets.SheetArea.viewport) {
        const sheet = spread.value.getActiveSheet();
        const text = sheet.getText(cellInfo.row, cellInfo.col);
        selectedCellText.value = text;
    }
};

const loadAndDisplayExcelContent = async (checkedExcelBlob) => {

    const options = {
        includeStyles: true,
        includeUnusedStyles: false
    }
    if (checkedExcelBlob) {
        spread.value.import(checkedExcelBlob, () => {

            // spread.value.setActiveSheet(0);

            const sheet = spread.value.getActiveSheet();

            const minRowCount = 50;
            const minColumnCount = 50;

            if (sheet.getRowCount() < minRowCount) {
                sheet.setRowCount(minRowCount)
            }

            if (sheet.getColumnCount() < minColumnCount) {
                sheet.setColumnCount(minColumnCount)
            }
            spread.value.resumePaint();
        }, (error) => {
            console.error("Import failed: ", error)
        }, options);
    }
}

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

const recheckExcelData = async () => {
    const options = {
        includeStyles: true,
        includeUnusedNames: false
    }

    spread.value.export(async (blob) => {
        const recheckExcelBlob = blob
        // saveAs(blob, 'ddd.xlsx')
        console.log("recheckExcelBlob", recheckExcelBlob);

        const formData = new FormData();
        // 将数据添加到 formData 对象中
        formData.append('recheckExcelBlob', recheckExcelBlob);
        formData.append('recheck_fileName', currentRecheckExcelInfo.value.recheck_excel_fileName);

        try {
            const response = await http.post('/recheck', formData);

            console.log("response.data", response.data);
            currentRecheckExcelInfo.value = response.data;
            if (currentRecheckExcelInfo.value.recheck_excel_fileName !== "") {
                console.log("currentRecheckExcelInfo.value.recheck_excel_fileName", currentRecheckExcelInfo.value.recheck_excel_fileName);
                const base64String = currentRecheckExcelInfo.value.recheck_excel
                const currentExcelBlob = base64ToBlob(base64String, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                // console.log("currentExcelBlob", currentExcelBlob);
                // saveAs(currentExcelBlob, "ddd.xlsx");
                loadAndDisplayExcelContent(currentExcelBlob)
            }
            // store.dispatch('fetchRecheckExcelInfo', response.data)
            // const recheckExcelInfo = response.data;
            // console.log("checkedCount", checkedCount);

            // router.push({ name: "ContactChecker" })

        } catch (error) {
            console.error('Failed to send data', error);
        }
    }, (error) => {
        console.error("error: ", error);
    }, options);


}


const sendContact = async () => {

    try {
        isModalVisible.value = true
        modalMessage.value = '正在上传并处理中，请稍候';
        const response = await http.post('/contact', {}, { responseType: "blob" });
        console.log('response.data', response.data);

        const contactedExcelBlob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }); // 使用返回的 blob 数据创建一个 Blob 对象
        saveAs(contactedExcelBlob, "总表.xlsx"); // 使用 saveAs 保存文件
        isModalVisible.value = false;
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
        <div class="title-text">数据检验</div>
    </div>
    <div class="excel-container">
        <div class="excel-area"><!--  v-if="currentRecheckExcelInfo.recheck_excel_fileName !== ''" -->
            <div class="excel-tools">

                <div class="detail-box" v-if="selectedCellText">
                    <!-- 这里显示选中单元格的文本内容 -->
                    <div class="cell-details">{{ selectedCellText }}</div>
                </div>
            </div>
            <gc-spread-sheets :hostStyle="spreadStyles" @workbookInitialized="initSpread">
                <gc-worksheet></gc-worksheet>
            </gc-spread-sheets>
        </div>

        <div class="tip-container">
            <div id="button-check" v-if="currentRecheckExcelInfo.check_info.length > 0">
                <div class="tip-texts">请点击检查按钮进行数据检验</div>
                <button @click="recheckExcelData">检查</button>
            </div>

            <div id="error-position">
                <template v-if="currentRecheckExcelInfo.check_info.length > 0">
                    <h2>以下是可能存在问题的数据的位置和原因</h2>
                    <p>{{ currentRecheckExcelInfo.check_info }}</p>
                </template>
                <template v-else>
                    <div style="margin-top: 20px;">
                        <h2>请点击合并文件</h2>
                        <button v-if="currentRecheckExcelInfo.recheck_excel_fileName === ''"
                            @click="sendContact" style="margin-top: 20px;">合并文件</button>
                    </div>
                </template>
            </div>

        </div>
    </div>
    <UploadStatusModal :isVisible="isModalVisible" :message="modalMessage" />





</template>



<style scoped></style>