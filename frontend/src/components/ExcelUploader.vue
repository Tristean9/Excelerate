<template>
  <div>
    <input id="fileLoader" type="file" accept=".xlsx,.xls,.sjs,.ssjson,.csv" @change="loadExcelFile" />
    <button @click="openFile">Open</button>
    <gc-spread-sheets v-if="showSpreadsheet" :hostStyle="spreadStyles" @workbookInitialized="initSpread">
      <gc-worksheet></gc-worksheet>
    </gc-spread-sheets>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue';
import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css';
import '@grapecity/spread-sheets-io';
import { GcSpreadSheets, GcWorksheet,} from '@grapecity/spread-sheets-vue';
import * as ExcelIO from "@grapecity/spread-excelio";
import * as GC from '@grapecity/spread-sheets';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


const spread = ref(null);
const showSpreadsheet = ref(false);
const loadedFile = reactive({blob: null, extension: null});
const spreadStyles = { width: "100%", height: "600px" };

const initSpread = (s) => {
  spread.value = s;
}

const loadExcelFile = (event) => {
  const file = event.target.files[0];
  if (file){
    showSpreadsheet.value = false;
    loadedFile.blob = null;
    loadedFile.extension = null;
    // 检查文件类型
    if (file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        let blob;
        if (file.name.endsWith(".xls")) {
          // 处理.xls文件
          const workbook = XLSX.read(data, { type: "array", cellStyles: true });
          const xlsxData = XLSX.write(workbook, { bookType: "xlsx", type: "binary", cellStyles: true });
          blob = new Blob([s2ab(xlsxData)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          saveAs(blob, 'converted.xlsx');
        } else {
          // 对于.xlsx文件，直接使用原始数据
          blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        }
        loadedFile.blob = blob;
        loadedFile.extension = ".xlsx";
      };
      if (file.name.endsWith(".xls")) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsArrayBuffer(file); // 或使用readAsArrayBuffer，如果需要
      }
    }
  }
};

watch(showSpreadsheet, (newVal) => {
  if (newVal === true){
    nextTick(() => {
      if (loadedFile.blob){
        const reader = new FileReader();
        reader.onloadend = (e) => {
          const arrayBuffer = e.target.result;
          openExcelFile(arrayBuffer, loadedFile.extension);
        };
        reader.readAsArrayBuffer(loadedFile.blob);
      }
    });
  }
});

const openFile = () => {
    showSpreadsheet.value = true;
}

const openExcelFile = (arrayBuffer, extension) => {
  const options = {
    includeStyles: true,
    excelFileExtension: extension
  }
  if (arrayBuffer) {
    spread.value.clearSheets();
    spread.value.suspendPaint();
    const excelIO = new ExcelIO.IO();
    excelIO.open(arrayBuffer, (json) =>{
      spread.value.fromJSON(json);
      for (let i = 0; i < spread.value.getSheetCount(); i++) {
          let sheet = spread.value.getSheet(i);
          sheet.options.isProtected = true; // 设置每个工作表为保护状态
        }
      spread.value.resumePaint();
    }, (error) => {
      console.error("Import failed: ", error)
    }, options);
  }
}

// 将二进制字符转换为字符数组缓冲区
const s2ab = (s) => {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

</script>

<style scoped>
/* 样式可以根据需要添加 */

</style>