<script setup>
import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css';
import { GcSpreadSheets, GcWorksheet } from '@grapecity/spread-sheets-vue';
import '@grapecity/spread-sheets-io';
import * as GC from '@grapecity/spread-sheets'

import router from "@/router/index.js";
import { computed, ref } from "vue";
import store from "@/store/index.js";
import { saveAs } from 'file-saver';


const currentMode = ref('2-2');
const spread = ref(null);
const spreadStyles = { width: '1200px', height: '600px' };

const excelAndRuleData = computed(() => store.state.excelAndRuleData)

// 存储当前的excelBlob;
const currentExcelAndRule = ref(excelAndRuleData.value[currentMode.value])
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
  if (currentExcelAndRule.value) {
    console.log("currentExcelAndRule.value[0]",currentExcelAndRule.value[0]);
    loadAndDisplayExcelContent(currentExcelAndRule.value[0])
  }
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
    spread.value.import(blob, () => {
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
  currentExcelAndRule.value = excelAndRuleData.value[currentMode.value];
  loadAndDisplayExcelContent(currentExcelAndRule.value[0])
}


const saveCurrentExcelAndJsonFile = () => {
  saveRuleFile();
  saveExcelFile();
}

const saveRuleFile = () => {
  const jsonString = JSON.stringify(currentExcelAndRule.value[1], null, 2);
    // 创建一个Blob对象，指定内容类型为JSON
    const blob = new Blob([jsonString], { type: "application/json" });
      // 使用saveAs函数保存文件，文件名为example.json
    saveAs(blob, "rule.json");
}

const saveExcelFile = () => {
  spread.value.export((blob) => {
    saveAs(blob, 'processed.xlsx');
  }, (error) => {
    console.error("error: ", error);
  }, {});
}


const goBack = () => {
  router.push({ name: 'ExcelFieldRuleMaker' });
}

</script>

<template>
  <div class="title-container">
    <div class="title-text">规则样例展示页面</div>
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
    <div id="tip-mode">
        <div class="tip-text-container">
          <h2>请选择你需要展示的表格的模式</h2>
        </div>
        <button v-for="mode in Object.keys(store.state.excelAndRuleData)" :key="mode" @click="switchMode(mode)"> {{
          modeText[mode]
        }}</button>
        <button @click="saveCurrentExcelAndJsonFile">save</button>
      </div>
  </div>

  <button @click="goBack">return</button>

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