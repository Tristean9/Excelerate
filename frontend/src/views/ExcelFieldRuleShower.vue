<script setup>
import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css';
import { GcSpreadSheets, GcWorksheet } from '@grapecity/spread-sheets-vue';
import '@grapecity/spread-sheets-io';
import * as GC from '@grapecity/spread-sheets'

import { computed, ref } from "vue";
import store from "@/store/index.js";
import { saveAs } from 'file-saver';


const currentMode = ref('2-2');
const spread = ref(null);
const spreadStyles = { width: '1000px', height: '600px' };
// 存储所有的excelBlob;
const finalExcelBlob = computed(() => store.state.finalExcelBlob);
// 存储当前的excelBlob;
const currentExcelBlob = ref(finalExcelBlob.value[currentMode.value])
// console.log(currentExcelBlob.value)

const modeText = {
  "0-0": "不对文件内容做修改",
  "1-1": "在文件的字段下一行添加规则&样例行",
  "1-2": "在文件除了表头的位置，均根据规则添加下拉列表",
  "2-2": "同时添加规则&样例行和下拉列表",
}

const initSpread = (s) => {
  spread.value = s;
  // console.log(currentMode.value)
  // console.log(currentExcelBlob.value)
  if (currentExcelBlob.value) {
    loadAndDisplayExcelContent(currentExcelBlob)
  }
}

const loadAndDisplayExcelContent = async (blob) => {
  if (!blob) return;
  // console.log(blob.value)
  // const arrayBuffer = await blob.value.arrayBuffer();
  const options = {
    includeStyles: true
  }
  if (blob) {
    spread.value.clearSheets();
    spread.value.suspendPaint();
    // const excelIO = new ExcelIO.IO();
    spread.value.import(blob.value, () => {
      // spread.value.fromJSON(json);

      // 设置表格显示大小
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
      console.error('Import failed: ', error)
    }, options);
  }
}


const switchMode = (newMode) => {
  currentMode.value = newMode;
  currentExcelBlob.value = finalExcelBlob.value[currentMode.value];
  loadAndDisplayExcelContent(currentExcelBlob)
}


const saveCurrentExcelFile = () => {
  const options = {
    // includeStyles: true,

  }
  spread.value.export((blob) => {
    saveAs(blob, 'ddd.xlsx')
  }, (error) => {
    console.error("error: ", error)
  }, options)

}


</script>

<template>
  <div class="title-container">
    <div class="title-text">规则样例展示页面</div>
  </div>
  <div id="excel-shower-container">
    <gc-spread-sheets :hostStyle="spreadStyles" @workbookInitialized="initSpread">
      <gc-worksheet></gc-worksheet>
    </gc-spread-sheets>
    <div id="tip-mode">
      <div class="tip-text-container">
        <h2>请选择你需要展示的表格的模式</h2>
      </div>
      <button v-for="mode in Object.keys(store.state.finalExcelBlob)" :key="mode" @click="switchMode(mode)"> {{
      modeText[mode]
    }}</button>
      <button @click="saveCurrentExcelFile">save</button>
    </div>

  </div>

</template>

<style scoped>
#excel-shower-container {
  display: flex;
}

#tip-mode {
  display: flex;
  flex-direction: column;
  gap: 50px;
}

.tip-text-container {
  justify-content: center;
  align-items: center;
}
</style>