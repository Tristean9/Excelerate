<script setup>

import { ref, watch, computed } from 'vue';

import router from "@/router/index.js";
import store from "@/store/index.js";
import http from '@/api/http';

import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css';
import { GcSpreadSheets, GcWorksheet } from '@grapecity/spread-sheets-vue';
import '@grapecity/spread-sheets-io';
import * as GC from '@grapecity/spread-sheets'

const spread = ref(null);
const spreadStyles = { width: "1000px", height: "600px" };

const checkedExcelBlob = computed(() => store.state.checkedExcelBlob);
console.log("checkedExcelBlob:", checkedExcelBlob);
const errorPosition = computed(() => store.state.errorPosition);
console.log('errorPosition: ', errorPosition);
const initSpread = (s) => {
    spread.value = s;
    loadAndDisplayExcelContent(checkedExcelBlob)
}

const loadAndDisplayExcelContent = async (checkedExcelBlob) => {
    const options = {
        includeStyles: true,
    }
    if (checkedExcelBlob.value) {
        spread.value.import(checkedExcelBlob.value, () => {

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

const newCheckedExcelBlob = ref(null);
const checkExcelData = async () => {
    const options = {
        includeStyles: true,

    }
    spread.value.export((blob) => {
        newCheckedExcelBlob.value = blob;
    }, (error) => {
        console.error("error: ", error)
    }, options);
    const formData = new FormData();
    formData.append('checkedExcelBlob', newCheckedExcelBlob.value);

    const response = await http.post('/check_data', formData, { responseType: "blob" });

    const checkExcelData = response.data;
    loadAndDisplayExcelContent(checkExcelData);

}

const isModalVisible1 = ref(false)
const isModalVisible2 = ref(false)

const saveExcel = () => {

    isModalVisible1.value = true;
}

const confirmSave = () => {
    // 实现保存逻辑

    isModalVisible1.value = false;
    console.log('保存成功');
}

const cancelSave = () => {
    isModalVisible1.value = false;
    console.log('取消保存');
}
</script>


<template>
    <div id="excel-shower-container">
        <gc-spread-sheets :hostStyle="spreadStyles" @workbookInitialized="initSpread">
            <gc-worksheet></gc-worksheet>
        </gc-spread-sheets>
        <div id="tip-button">
            <h2>请点击检查按钮进行数据检验</h2>
            <button @click="checkExcelData">检查</button>
            <h2>以下是可能存在问题的数据的位置</h2>
            <h3>{{ errorPosition }}</h3>
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
            <p>您的数据经检查已无问题，已为您保存</p>
        </div>
    </div>

</template>


<style scoped>
#excel-shower-container {
    display: flex;
}

#tip-button {
    display: flex;
    flex-direction: column;
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