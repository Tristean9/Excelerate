<script setup>

import { ref, computed } from 'vue';

import router from "@/router/index.js";
import store from "@/store/index.js";
import http from '@/api/http';
import { saveAs } from 'file-saver';

import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css';
import { GcSpreadSheets, GcWorksheet } from '@grapecity/spread-sheets-vue';
import '@grapecity/spread-sheets-io';
import * as GC from '@grapecity/spread-sheets'

const spread = ref(null);
const spreadStyles = { width: "1200px", height: "600px" };


const checkedExcelBlob = computed(() => store.state.checkedExcelBlob); // 从上个上传页面计算得来
const currentExcelBlob = ref(checkedExcelBlob.value); // 储存当前的Excel的Blob

console.log("currentExcelBlob:", currentExcelBlob);

const errorPosition = computed(() => store.state.errorPosition); // 从上个上传页面计算得来
const currentErrorPosition = ref(errorPosition.value);
console.log('currentErrorPosition: ', currentErrorPosition); // 储存当前的error位置

const positionRule = computed(() => store.state.positionRule);
console.log("positionRule:", positionRule);
// 创建一个计算属性来根据currentErrorPosition获取子集
const currentErrorAndReason = computed(() => {
    let subset = {};
    currentErrorPosition.value.forEach((position) => {
        // console.log("position:", position.toLowerCase());
        // console.log("positionRule:", Object.keys(positionRule.value));
        if (Object.keys(positionRule.value).includes(position.toLowerCase())) {
            // console.log("positionRule.value[position:",positionRule.value[position.toLowerCase()]);
            subset[position.toLowerCase()] = positionRule.value[position.toLowerCase()][1];
        }
    });
    // console.log("subset", subset);
    return subset;
});

console.log("currentErrorAndReason:", currentErrorAndReason.value);
const initSpread = (s) => {
    spread.value = s;
    loadAndDisplayExcelContent(currentExcelBlob)
    spread.value.bind(GC.Spread.Sheets.Events.CellClick, handleCellClick);
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
    }
    if (checkedExcelBlob.value) {
        spread.value.import(checkedExcelBlob.value, () => {

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


const checkExcelData = async () => {
    const options = {
        includeStyles: true,
        includeUnusedNames: false
    }
    spread.value.export(async (blob) => {

        const formData = new FormData();
        formData.append('excelFile', blob);

        // 向服务器发送上传的文件，并获得转换后的文件
        const response = await http.post('/check_data', formData);

        // console.log('response', response.data.checked_excel
        const base64String = response.data.checked_excel
        const newErrorPosition = response.data.error_index_col


        // 将Base64编码文件转换成Blob对象
        const fileBlobData = base64ToBlob(base64String, 'application/vnd.ms-excel');

        // console.log("fileBlobData:", fileBlobData);
        // console.log("newErrorPosition:", newErrorPosition);


        currentExcelBlob.value = fileBlobData;
        currentErrorPosition.value = newErrorPosition;
        console.log("currentErrorPosition.value:", currentErrorPosition.value);

        loadAndDisplayExcelContent(currentExcelBlob);

    }, (error) => {
        console.error("error: ", error)
    }, options);


}

const isModalVisible1 = ref(false)
const isModalVisible2 = ref(false)

const saveExcel = () => {
    console.log("currentErrorPosition", currentErrorPosition.value);

    if (currentErrorPosition.value.length > 0) {
        console.log(111);
        isModalVisible1.value = true;
    } else {
        isModalVisible2.value = true
        confirmSave();

    }
}

const confirmSave = () => {
    // 实现保存逻辑

    isModalVisible1.value = false;
    spread.value.export((blob) => {
        saveAs(blob, 'ddd.xlsx')
        // 设置一个定时器，延时关闭模态框
        setTimeout(() => {
            isModalVisible2.value = false;
        }, 3000); // 这里的3000表示模态框将在3秒后消失
    }, (error) => {
        console.error("error: ", error)
    }, {})
    console.log('保存成功');
}

const cancelSave = () => {
    isModalVisible1.value = false;
    console.log('取消保存');
}
const goBack = () => {
    router.push({ name: 'ExcelRuleUploader' });
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
        <div class="excel-area">
            <div id="excel-tools">

                <div class="detail-box" v-if="selectedCellText">
                    <!-- 这里显示选中单元格的文本内容 -->
                    <div class="cell-details">{{ selectedCellText }}</div>
                </div>
            </div>
            <gc-spread-sheets :hostStyle="spreadStyles" @workbookInitialized="initSpread">
                <gc-worksheet></gc-worksheet>
            </gc-spread-sheets>
        </div>
        <div id="tip-button-container">
            <div id="button-check">
                <h2>请点击检查按钮进行数据检验</h2>
                <button @click="checkExcelData">检查</button>
            </div>
            <div id="error-position">
                <template v-if="currentErrorPosition.length > 0">
                    <h2>以下是可能存在问题的数据的位置及原因</h2>
                    <h3>{{ currentErrorAndReason }}</h3>
                </template>
                <template v-else>
                    <h2>您的数据经检验已无问题</h2>
                </template>
            </div>

            <button @click="saveExcel">保存</button>
        </div>

    </div>
    <div v-if="isModalVisible1" class="modal">
        <div class="modal-content">
            <p>您的数据可能依然存在问题，是否继续保存？</p>
            <button @click="confirmSave">是</button>
            <button @click="cancelSave">否</button>
        </div>
    </div>
    <div v-if="isModalVisible2" class="modal">
        <div class="modal-content">
            <p>您的数据经检查已无问题，正在为您保存</p>
        </div>
    </div>

</template>


<style scoped>


.table {
    width: 100%;
}

#tip-button-container {
    display: flex;
    flex-direction: column;
    /* margin-left: 20px; */
    /* width: 200px; */
    gap: 80px; /* 设置子元素之间的间隔 */
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 5px;
    text-align: center;
}
</style>