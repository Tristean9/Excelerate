<template>
  <div>
    <input id="fileLoader" type="file" accept=".xlsx,.xls,.sjs,.ssjson,.csv" @change="loadExcelFile" />
    <button @click="openFile">Open</button>
    <div class="excel-tip">
      <div id="excel-area">
        <div id="excel-tools">
          <button @click="toggleFontColor" > 切换字体颜色</button>
          <button @click="toggleHighlightCells">切换背景高亮</button>
        </div>
        <gc-spread-sheets v-if="showSpreadsheet" :hostStyle="spreadStyles" @workbookInitialized="initSpread">
          <gc-worksheet></gc-worksheet>
        </gc-spread-sheets>
      </div>
      <div id="tip-container" v-show="showSpreadsheet">
        <div class="tip-texts">请点击左侧表格中的单元格，确认字段信息。（一个小？符号，点击/鼠标悬浮后会弹出小框:若字段来自不同主体，字段名可重复）</div>
        <div id="column">
          <table>
            <thead>
            <tr>
              <th>位置</th>
              <th>字段名</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in selectedFields" :key="index">
              <td>{{item.position}}</td>
              <td>{{item.fieldName}}</td>
              <td><button @click="removeField(index)">删除</button></td>
            </tr>
            </tbody>
          </table>
        </div>
        <button @click="sendFiledNames">发送规则字段</button>
      </div>

    </div>
    <!--<button @click="checkFieldNames">检查规则字段名</button>-->
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css';
import { GcSpreadSheets, GcWorksheet } from '@grapecity/spread-sheets-vue';
import '@grapecity/spread-sheets-io';
import * as GC from '@grapecity/spread-sheets'
import http from '@/api/http';
import * as ExcelIO from "@grapecity/spread-excelio";
import * as XLSX from "xlsx";

const router = useRouter();
const spread = ref(null);
const spreadStyles = { width: "1000px", height: "600px" };
const highlightColor = "yellow";
const blackColor = "black";
const redColor = "red";
const selectedFields = ref([]);
const showSpreadsheet = ref(false);
const loadedFile = reactive({blob: null, extension: null});
const minRowCount = 50;
const minColumnCount = 50;

const initSpread = (s) => {
  spread.value = s;

  bindCellClickForActiveSheet(); // 绑定事件到初始工作表

  // 监听工作表切换事件
  spread.value.bind(GC.Spread.Sheets.Events.SheetChanged, (sender, args) => {
    console.log("changed")
    bindCellClickForActiveSheet(); // 重新绑定事件到新的工作表
  });

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

const checkFieldNames = () => {
  if (spread.value.file){
    const formData = new FormData();
    formData.append('file', spread.value.file);

    http.post('/extract_fields_from_excel', formData, {responseType: "blob"})
        .then(response => {
          const reader = new FileReader();
          reader.onload = (e) => {
            spread.value.import(response.data, () => {
              const sheet = spread.value.getActiveSheet();
              const minRowCount = 50;
              const minColumnCount = 50;

              if (sheet.getRowCount() < minColumnCount) {
                sheet.setRowCount(minRowCount)
              }

              if (sheet.getColumnCount() < minColumnCount) {
                sheet.setColumnCount(minColumnCount)
              }
              onImportCompleted();
            }, (error) => {
              console.error("Import failed: ", error)
            });
          }
          reader.readAsArrayBuffer(response.data);
        })
        .catch(error => console.error('Error:', error))
      }else {
    alert('请先上传一个Excel文件。')
  }
};


const toggleFontColor = () => {
  if (!spread.value) return;
  const sheet = spread.value.getActiveSheet();
  const selections = sheet.getSelections();
  selections.forEach((range) => {
    for (let r = range.row; r < range.row + range.rowCount; r++) {
      for (let c = range.col; c < range.col + range.colCount; c++) {
        let cell = sheet.getCell(r, c);
        if (cell.foreColor() === redColor){
          cell.foreColor(blackColor);
        } else {
          cell.foreColor(redColor);
        }
      }
    }
  });
};

const toggleHighlightCells = () => {
  if (!spread.value) return;
  const sheet = spread.value.getActiveSheet();
  const selections = sheet.getSelections();

  selections.forEach((range) => {
    for (let r = range.row; r < range.row + range.rowCount; r++) {
      for (let c = range.col; c < range.col + range.colCount; c++) {
        let cell = sheet.getCell(r, c);
        if (cell.backColor() === highlightColor) {
          cell.backColor('transparent'); // 取消高亮，设置为透明或默认颜色
        } else {
          cell.backColor(highlightColor); // 应用高亮
        }
      }
    }
  });

}


const removeField = (index) => {
  selectedFields.value.splice(index, 1);
}

const bindCellClickForActiveSheet = () => {
  const sheet = spread.value.getActiveSheet();
  // 先解绑可能已经存在的事件绑定
  sheet.unbind(GC.Spread.Sheets.Events.CellClick);
  // 绑定CellClick事件到当前工作表
  sheet.bind(GC.Spread.Sheets.Events.CellClick, (e, info) => {
    if (info.sheetArea === GC.Spread.Sheets.SheetArea.viewport) {
      const position = GC.Spread.Sheets.CalcEngine.rangeToFormula(info.sheet.getRange(info.row, info.col, 1, 1), info.row, info.col, GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allRelative);
      const fieldName = info.sheet.getValue(info.row, info.col);

      const  isPositionExist = selectedFields.value.some(item => item.position === position);

      if (!isPositionExist){
        selectedFields.value.push({ position, fieldName });
      } else {
        alert(`位置 ${position} 已经被选中`)
      }
    }
  });
}

const sendFiledNames = async () => {
  try {
    const formData = new FormData();
    formData.append('file', spread.value.file, spread.value.file.name);
    formData.append('fileName', spread.value.file.name);
    formData.append('fields', JSON.stringify(selectedFields.value));


    const response = await http.post('/generate_user_rule_dict', formData);
    console.log("服务器响应：", response.data);
    // 处理响应，例如：显示成功消息或处理错误
  } catch (error) {
    console.error('发送数据失败:', error);
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
      const sheet = spread.value.getActiveSheet();

      if (sheet.getRowCount() < minRowCount){
        sheet.setRowCount(minRowCount)
      }

      if (sheet.getColumnCount() < minColumnCount){
        sheet.setColumnCount(minColumnCount)
      }
      spread.value.resumePaint();
      bindCellClickForActiveSheet(); // 绑定事件到初始工作表
      spread.value.bind(GC.Spread.Sheets.Events.SheetChanged, (sender, args) => {
        //console.log("changed")
        const sheet = spread.value.getActiveSheet();

        if (sheet.getRowCount() < minRowCount){
          sheet.setRowCount(minRowCount)
        }

        if (sheet.getColumnCount() < minColumnCount){
          sheet.setColumnCount(minColumnCount)
        }
        bindCellClickForActiveSheet(); // 重新绑定事件到新的工作表
      })
    }, (error) => {
      console.error("Import failed: ", error)
    }, options);
  }
}
</script>

<style scoped>

.excel-tip {
  display: flex;
}

#excel-area {
  display: flex;
  flex-direction: column;
}

#excel-tools {
  display: flex;
}

#tip-container {
  width: 200px;
  display: flex;
  flex-direction: column;

}
</style>
