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
const spreadStyles = computed(() => {
    return { width: '100%', height: '600px' };
});

const checkedExcelFileName = computed(() => store.state.checkedExcelFileName);
const checkedExcelBlob = computed(() => store.state.checkedExcelBlob); // 从上个上传页面计算得来
const currentExcelBlob = ref(checkedExcelBlob.value); // 储存当前的Excel的Blob

console.log("currentExcelBlob:", currentExcelBlob);

const errorPosition = computed(() => store.state.errorPosition); // 从上个上传页面计算得来
const currentErrorPosition = ref(errorPosition.value);
console.log('currentErrorPosition: ', currentErrorPosition.value); // 储存当前的error位置

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
        const newErrorPosition = response.data.error_cell_info

        console.log("response.data.error_cell_info", response.data.error_cell_info);
        // 将Base64编码文件转换成Blob对象
        const fileBlobData = base64ToBlob(base64String, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

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

const showErrorModal = (position) => {
    selectedErrorPosition.value = position;
    isModalVisible.value = true;  // 显示模态框
};

const selectedErrorPosition = ref(''); // 存储选中的错误位置
const isModalVisible = ref(false); // 控制模态框是否显示

// 假设每行显示5个错误位置
const errorTable = computed(() => {
    const errors = Object.keys(currentErrorPosition.value);
    const rows = [];

    for (let i = 0; i < errors.length; i += 4) {
        rows.push(errors.slice(i, i + 4).map(position => ({ position })));
    }

    return rows;
});

const isModalVisible1 = ref(false)
const isModalVisible2 = ref(false)

const saveExcel = () => {
    console.log("currentErrorPosition", currentErrorPosition.value);
    console.log("Object.keys(currentErrorPosition).length",Object.keys(currentErrorPosition.value).length);
    if (Object.keys(currentErrorPosition.value).length > 0) {
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
        saveAs(blob, `检验后-${checkedExcelFileName.value}.xlsx`)
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
            <div id="button-check">
                <div class="tip-texts">请点击检查按钮进行数据检验</div>
                <button @click="checkExcelData">检查</button>
            </div>
            <div id="error-position">
                <template v-if="Object.keys(currentErrorPosition).length > 0">
                    <h2>以下是可能存在问题的数据的位置,可点击查看解释</h2>
                    <table>
                        <tr v-for="row in errorTable" :key="row[0]">
                            <td v-for="cell in row" :key="cell.position" @click="showErrorModal(cell.position)"
                                class="error-cell">
                                {{ cell.position }}
                            </td>
                        </tr>
                    </table>
                </template>
                <template v-else>
                    <h2>您的数据经检验已无问题</h2>
                </template>
                <div v-if="isModalVisible" class="modal">
                    <div class="modal-content">
                        <div class="modal-content-text">{{ currentErrorPosition[selectedErrorPosition] }}</div>
                        <div><button @click="isModalVisible = false">关闭</button></div>
                    </div>
                    
                </div>
            </div>

            <button @click="saveExcel">保存</button>
        </div>

    </div>
    <div v-if="isModalVisible1" class="modal">
        <div class="modal-content">
            <div class="modal-content-text">您的数据可能依然存在问题，是否继续保存？</div>
            <div class="button-container">
                <button @click="confirmSave">是</button>
                <button @click="cancelSave">否</button>
            </div>
        </div>
    </div>
    <div v-if="isModalVisible2" class="modal">
        <div class="modal-content">
            <div class="modal-content-text">您的数据经检查已无问题，正在为您保存</div>
        </div>
    </div>

</template>


<style scoped>
.tip-container {
    gap: 80px;
    /* 设置子元素之间的间隔 */
}

.table {
    width: 100%;
}

.error-cell {
    cursor: pointer;
    background-color: #f9f9f9;
    /* 轻微背景颜色 */
    padding: 5px;
    border: 1px solid #eee;
    text-align: center;
}

.error-cell:hover {
    background-color: #e1e1e1;
    /* 悬停时的背景颜色 */
}

.table {
    border-collapse: collapse;
    width: 100%;
}

.table td {
    border: 1px solid #ddd;
    padding: 8px;
}

.button-container {
    justify-content: space-between;
    /* 可以改为 space-around 或 space-evenly */
}

#button-check {
    display: flex;
    flex-direction: column;
}

#button-check .tip-texts {
    text-align: center;
}

#error-position .modal-content {
    height: auto;
}

</style>