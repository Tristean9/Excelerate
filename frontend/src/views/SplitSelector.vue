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

const summaryExcelBlob = computed(() => store.state.summaryExcelBlob)
const spread = ref(null);
const spreadStyles = computed(() => {
    return { width: '100%', height: '600px' };
});
const selectedCellText = ref(''); // 用于存储选中单元格的文本内容
const startRow = ref(''); // 用于存储用户输入的起始行数
const referenceColumn = ref('') // 储存需要拆分的列
const startRowError = ref(''); // 新增一个响应式引用，用于存储错误消息
const referenceColumnError = ref(''); // 新增一个响应式引用，用于存储错误消息

const isModalVisible = ref(false);
const modalMessage = ref('');

const initSpread = (s) => {
    spread.value = s;

    if (spread.value) {
        loadAndDisplayExcelContent(summaryExcelBlob)
        spread.value.bind(GC.Spread.Sheets.Events.CellClick, handleCellClick);
    }
};

// 加载并展示Excel内容
const loadAndDisplayExcelContent = async (summaryExcelBlob) => {
    const options = {
        includeStyles: true,
        includeFormulas: true,
    }
    if (summaryExcelBlob.value) {
        if (spread.value) {
            spread.value.import(summaryExcelBlob.value, () => {
                for (let i = 0; i < spread.value.getSheetCount(); i++) {
                    let sheet = spread.value.getSheet(i);
                    sheet.options.isProtected = true; // 设置每个工作表为保护状态
                }
                const sheet = spread.value.getActiveSheet();
                const minRowCount = 50;
                const minColumnCount = 50;

                if (sheet.getRowCount() < minRowCount) {
                    sheet.setRowCount(minRowCount)
                }

                if (sheet.getColumnCount() < minColumnCount) {
                    sheet.setColumnCount(minColumnCount)
                }
            }, (error) => {
                console.error("Import failed: ", error)
            }, options);
        }
    }
}


// 获取当前选中的单元格的内容
const handleCellClick = (event, cellInfo) => {
    if (spread.value && cellInfo.sheetArea === GC.Spread.Sheets.SheetArea.viewport) {
        const sheet = spread.value.getActiveSheet();
        const text = sheet.getText(cellInfo.row, cellInfo.col);
        selectedCellText.value = text;
    }
};


const validateRowInput = (event) => {
    const value = event.target.value;
    const numberPattern = /^\d*$/; // 正则表达式，用于检测是否仅包含数字
    if (numberPattern.test(value)) {
        startRow.value = value;
        startRowError.value = '';
    } else {
        startRowError.value = '请输入一个合法数字';
        console.log(startRowError.value);
    }
};

const validateColumnInput = (event) => {
    const value = event.target.value;
    const columnPattern = /^[A-Za-z]{1,3}$/;; // 正则表达式，用于检测是否仅包含数字
    if (columnPattern.test(value)) {
        referenceColumn.value = value;
        referenceColumnError.value = '';
    } else {
        referenceColumnError.value = '请输入一个合法列字母';
        console.log(referenceColumnError.value);
    }
};

const sendData = async () => {
    if (startRow.value && !startRowError.value) {
        // 这里用你的 http 实例发送数据到服务器
        const formData = new FormData();
        // 将数据添加到 formData 对象中
        formData.append('summaryExcelBlob', summaryExcelBlob.value);
        formData.append('referenceColumn', referenceColumn.value);
        formData.append('startRow', startRow.value);

        try {
            isModalVisible.value = true;
            modalMessage.value = '正在上传并处理中，请稍候';
            const response = await http.post('/load_split_parameters', formData, { responseType: "blob" });

            saveAs(response.data, '拆分后的数据.zip')
            isModalVisible.value = false;
            // console.log("response.data", response.data);
            // store.dispatch('fetchRecheckExcelInfo', response.data)
            // const recheckExcelInfo = response.data;
            // console.log("checkedCount", checkedCount);

            // router.push({ name: "ContactChecker" })

        } catch (error) {
            console.error('Failed to send data', error);
        }
    } else {
        console.error('Not all required data are present or valid');
    }
};

const goBack = () => {
    router.push({ name: 'SplitUploader' });
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
        <div class="title-text">字段选择</div>
    </div>
    <div class="excel-container">
        <div class="excel-area">
            <div class="excel-tools">
                <div class="detail-box" v-if="selectedCellText">
                    <div class="cell-details">{{ selectedCellText }}</div>
                </div>
            </div>
            <gc-spread-sheets :hostStyle="spreadStyles" @workbookInitialized="initSpread">
                <gc-worksheet></gc-worksheet>
            </gc-spread-sheets>
        </div>
        <div class="tip-container">
            <div class="tip-texts">请在下方输入相关信息</div>
            <div class="input-container">
                <label for="startRowInput" class="input-label">请输入数据开始行：</label>
                <input type="text" id="startRowInput" class="input-field" :value="startRow" @input="validateRowInput"
                    min="1" />
            </div>
            <div class="input-container">
                <label for="referenceColumnInput" class="input-label">请输入拆分所依据的列号：</label>
                <input type="text" id="referenceColumnInput" class="input-field" :value="referenceColumn"
                    @input="validateColumnInput" min="1" />
            </div>
            <div class="error-message" v-if="startRowError">{{ startRowError }}</div>
            <div class="error-message" v-if="referenceColumnError">{{ referenceColumnError }}</div>
            <button v-if="summaryExcelBlob && startRow && !startRowError && referenceColumn && !referenceColumnError"
                @click="sendData" style="margin-top: 20px;">上传数据</button>
        </div>


    </div>
    <UploadStatusModal :isVisible="isModalVisible" :message="modalMessage" />


</template>



<style scoped>
.input-container {
    display: flex;
    align-items: center;
    margin-top: 10px;
}

.input-label {
    white-space: nowrap;
    /* 确保标签文本不会换行 */
    flex-grow: 0;
    /* 阻止标签伸展 */
    flex-shrink: 0;
    /* 阻止标签缩短 */
    margin-right: 10px;
    /* 保持标签和输入框之间的间距 */
    flex-grow: 1;
    /* 允许输入框伸展填满剩余空间 */
}

.input-field {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: auto;
}

.error-message {
    color: red;
    margin-left: 10px;
}
</style>