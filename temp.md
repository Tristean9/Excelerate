这是我的代码，我想在id=column这个div中实现类似于一个表格，第一列包含（位置，字段名），其中字段名指的是用户点击的左侧SpreadJS表格的值，位置指的是其对于的Excel表格的位置，如A1，B2；然后每当用户点击之后，表格中自动增加选择的内容，同时每列（除第一列是表头）下方也存在一个删除键，可以删除添加进来的字段内容。在组件的下方设计一个按钮，点击后，发送上面表格的数据给后端：
<template>
  <div>
    <input id="fileLoader" type="file" accept=".xlsx,.sjs,.ssjson,.csv" @change="loadExcelFile" />
    <div class="excel-tip">
      <div id="excel-area">
        <div id="excel-tools">
          <button @click="toggleFontColor" > 切换字体颜色</button>
          <button @click="toggleHighlightCells">切换背景高亮</button>
        </div>
        <gc-spread-sheets :hostStyle="spreadStyles" @workbookInitialized="initSpread">
          <gc-worksheet></gc-worksheet>
        </gc-spread-sheets>
      </div>
      <div id="tip-container">
        <div class="tip-texts">{{tipTexts}}</div>
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
      </div>
      <button @click="sendFiledNames">发送规则字段</button>
    </div>
    <button @click="checkFieldNames">检查规则字段名</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css';
import { GcSpreadSheets, GcWorksheet } from '@grapecity/spread-sheets-vue';
import '@grapecity/spread-sheets-io';
import http from '@/api/http';

const spread = ref(null);
const spreadStyles = { width: "1000px", height: "600px" };
const highlightColor = "yellow";
const blackColor = "black";
const redColor = "red";

const router = useRouter();

const initSpread = (s) => {
  spread.value = s;
}

const loadExcelFile = (event) => {
  let file = event.target.files[0];
  if (file) {
    spread.value.file = file;
    spread.value.clearSheets();
    spread.value.suspendPaint();
    spread.value.import(file, () =>{
      const sheet = spread.value.getActiveSheet();
      const minRowCount = 50;
      const minColumnCount = 50;

      if (sheet.getRowCount() < minRowCount){
        sheet.setRowCount(minRowCount)
      }

      if (sheet.getColumnCount() < minColumnCount){
        sheet.setColumnCount(minColumnCount)
      }
      spread.value.resumePaint();


    }, (error) => {
      console.error("Import failed: ", error)
    });
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

const tipTexts = "请点击左侧表格中的单元格，确认字段信息。（一个小？符号，点击/鼠标悬浮后会弹出小框:若字段来自不同主体，字段名可重复）"

const selectedFields = ref([]);

const addField = (position, filedName) => {
  selectedFields.value.push({ position, filedName});
}
const removeFiled = (index) => {
  selectedFields.value.splice(index, 1);
}

const handleCellClick = (position, fieldName) => {
  addField(position, fieldName);
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

}
</style>
