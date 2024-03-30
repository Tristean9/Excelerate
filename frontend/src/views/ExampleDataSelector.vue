<script setup>

import { ref, computed } from 'vue';

import http from "@/api/http.js";
import router from "@/router/index.js";
import store from "@/store/index.js";

import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css';
import { GcSpreadSheets, GcWorksheet } from '@grapecity/spread-sheets-vue';
import '@grapecity/spread-sheets-io';
import * as GC from '@grapecity/spread-sheets'

const exampleExcelBlob = computed(() => store.state.exampleExcelBlob)
const spread = ref(null);
const spreadStyles = computed(() => {
    return { width: '100%', height: '600px' };
});
const selectedCellText = ref(''); // 用于存储选中单元格的文本内容
const selectedRanges = ref(''); // 储存选区
const startRow = ref(''); // 用于存储用户输入的起始行数
const startRowError = ref(''); // 新增一个响应式引用，用于存储错误消息

const initSpread = (s) => {
    spread.value = s;

    if (spread.value) {
        loadAndDisplayExcelContent(exampleExcelBlob)
        spread.value.bind(GC.Spread.Sheets.Events.CellClick, handleCellClick);
        // 绑定 SelectionChanged 事件来处理选区变更
        spread.value.bind(GC.Spread.Sheets.Events.SelectionChanged, handleSelectionChanged);
    }
};

// 加载并展示Excel内容
const loadAndDisplayExcelContent = async (exampleExcelBlob) => {
    const options = {
        includeStyles: true,
        includeFormulas: true,
    }
    if (exampleExcelBlob.value) {
        if (spread.value) {
            spread.value.import(exampleExcelBlob.value, () => {
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


                // bindCellClickForActiveSheet(); // 绑定事件到初始工作表

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

// 处理选取变更事件
const handleSelectionChanged = (event, args) => {
    const sheet = args.sheet;
    const selections = sheet.getSelections(); // 获取所有选中区域
    console.log("selections:", selections);

    // 遍历所有选区并转换为字符串表示
    const selRanges = selections.map((selection) => {
        // 将选区对象转换为字符串形式，如 "A1:D3"
        return GC.Spread.Sheets.CalcEngine.rangeToFormula(
            selection,
            0,
            0,
            GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allRelative
        );
    });
    selectedRanges.value = selRanges.join(',')
    // console.log("selRange:", selRanges);
}
const validateInput = (event) => {
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

const sendData = async () => {
    if (exampleExcelBlob.value && selectedRanges.value && startRow.value && !startRowError.value) {
        // 这里用你的 http 实例发送数据到服务器
        const formData = new FormData();
        // 将数据添加到 formData 对象中
        formData.append('excelBlob', exampleExcelBlob.value);
        formData.append('ranges', selectedRanges.value); // 假设这是一个数组或对象，需要将其转换为字符串
        formData.append('startRow', startRow.value);

        try {
            const response = await http.post('/extract_example_info', formData);
            console.log('Data sent successfully', response);

            router.push({name: "ContactChecker"})
            
        } catch (error) {
            console.error('Failed to send data', error);
        }
    } else {
        console.error('Not all required data are present or valid');
    }
};

const goBack = () => {
    router.push({ name: 'ContactUploader' });
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
            <div class="tip-texts">请在左侧表格中选中的表头（字段），选中的字段会显示在右侧</div>
            <div>{{ selectedRanges }}</div>
            <div class="input-container">
                <label for="startRowInput" class="input-label">请输入数据开始行：</label>
                <input type="text" id="startRowInput" class="input-field" :value="startRow" @input="validateInput"
                    min="1" />

            </div>
            <div class="error-message" v-if="startRowError">{{ startRowError }}</div>
            <button v-if="exampleExcelBlob && selectedRanges && startRow && !startRowError"
                @click="sendData">上传数据</button>
        </div>


    </div>
    <!-- <error-modal :text="errorModalText" :is-visible="isErrorModalVisible"
        @update:isVisible="isErrorModalVisible = $event" /> -->


</template>



<style scoped>
.input-container {
    display: flex;
    align-items: center;
    margin-top: 10px;
}

.input-label {
    margin-right: 10px;
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