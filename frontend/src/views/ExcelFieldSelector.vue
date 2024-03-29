<script setup>
import { ref, watch, computed } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

import router from "@/router/index.js";
import store from "@/store/index.js";
import http from '@/api/http';

import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css';
import { GcSpreadSheets, GcWorksheet } from '@grapecity/spread-sheets-vue';
import '@grapecity/spread-sheets-io';
import * as GC from '@grapecity/spread-sheets'


const spread = ref(null);
const spreadStyles = { width: "1200px", height: "600px" };


const preSelectedField2 = computed(() => {
  let fields = [];
  if (store.state.preSelectedField){
    for (const [position, entry] of Object.entries(store.state.preSelectedField)){
      fields.push({"position":position, "fieldName":entry[0]});
    }
  }
  // console.log("fields", fields);
  return fields
  });
// console.log("preSelectedField", preSelectedField.value);
const selectedFields = ref(preSelectedField2.value);
// console.log("selectedFields", selectedFields.value);

const processedExcelBlob = computed(() => store.state.processedExcelBlob)

const initSpread = (s) => {
  spread.value = s;

  if (spread.value) {
    loadAndDisplayExcelContent(processedExcelBlob)
  }
  bindCellClickForActiveSheet(); // 绑定事件到初始工作表
  spread.value.bind(GC.Spread.Sheets.Events.CellClick, handleCellClick);

};

const selectedCellText = ref(''); // 用于存储选中单元格的文本内容

// 获取当前选中的单元格的内容
const handleCellClick = (event, cellInfo) => {
  if (spread.value && cellInfo.sheetArea === GC.Spread.Sheets.SheetArea.viewport) {
    const sheet = spread.value.getActiveSheet();
    const text = sheet.getText(cellInfo.row, cellInfo.col);
    selectedCellText.value = text;
  }
};

// 加载并展示Excel内容
const loadAndDisplayExcelContent = async (processedExcelBlob) => {
  const options = {
    includeStyles: true,
    includeFormulas: true,
  }
  if (processedExcelBlob.value) {
    if (spread.value) {
      spread.value.import(processedExcelBlob.value, () => {
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


        bindCellClickForActiveSheet(); // 绑定事件到初始工作表

      }, (error) => {
        console.error("Import failed: ", error)
      }, options);
    }
  }
}

const removeField = (index) => {
  selectedFields.value.splice(index, 1);
}

const bindCellClickForActiveSheet = () => {
  const sheet = spread.value.getActiveSheet();
  // 先解绑可能已经存在的事件绑定
  sheet.unbind(GC.Spread.Sheets.Events.SelectionChanged);

  // 绑定SelectionChanged事件到当前工作表
  sheet.bind(GC.Spread.Sheets.Events.SelectionChanged, (sender, args) => {
    const selections = sheet.getSelections();
    let isInvalidSelection = false;

    selections.forEach((range) => {
      for (let r = range.row; r < range.row + range.rowCount; r++) {
        if (isInvalidSelection){
          break
        }
        for (let c = range.col; c < range.col + range.colCount; c++) {
          // 检查单元格是否是合并单元格的一部分
          const span = sheet.getSpan(r, c);
          if (span && (span.row === r && span.col === c)) {
            alert('不可以选中合并的单元格');
            isInvalidSelection = true;
            break;
          }
          // 检查单元格是否为空
          const cellValue = sheet.getValue(r, c);
          if (cellValue === null || cellValue === '') {
            alert('不可以选中空单元格');
            isInvalidSelection = true;
            break;
          }
          if (isInvalidSelection) {
            break;
          }

          const position = GC.Spread.Sheets.CalcEngine.rangeToFormula(sheet.getRange(r, c, 1, 1), r, c, GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allRelative);
          const fieldName = sheet.getValue(r, c);

          const isPositionExist = selectedFields.value.some(item => item.position === position);

          if (!isPositionExist) {
            selectedFields.value.push({ 'position':position, "fieldName":fieldName });
          } else {
            // 如果不希望在选择时弹出警告，可以注释掉下面的alert
            alert(`位置 ${position} 已经被选中`);
            break
          }

        }
      }

    });

  })
}

const sendFiledNames = async () => {
  try {
    const formData = new FormData();
    formData.append('fields', JSON.stringify(selectedFields.value));

    const response = await http.post('/generate_user_rule_dict', formData);

    // 分发action 更新store中的状态
    await store.dispatch('fetchRulesData', response.data);
    // console.log("服务器响应：", response.data);

    const rulesData = computed(() => store.state.rulesData);
    if (rulesData.value) {
      // 跳转到规则指定模块
      // console.log(rulesData.value)
      await router.push({ name: 'ExcelFieldRuleMaker' });
    }
    // 处理响应，例如：显示成功消息或处理错误
  } catch (error) {
    console.error('发送数据失败:', error);
  }
};

// 检测state变化
watch(processedExcelBlob, (newVal, oldVal) => {
  if (newVal) {
    loadAndDisplayExcelContent(processedExcelBlob);
  }
}, { immediate: true }); // immediate: true 确保了该侦听器被创建后立即执行


// 监听路由离开事件
onBeforeRouteLeave((to, from, next) => {
  if (to.name === 'ExcelFileUploader') {

    // 调用重置数据的方法
    store.dispatch('savePreSelectedField', computed(() => {}));
    store.dispatch('savePreSelectedDropDowns',{});
  }
  // 继续路由跳转
  next();
});


const goBack = () => {
  router.push({ name: 'ExcelFileUploader'});
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
  <div>
    <div class="excel-container">
      <div class="excel-area">
        <div id="excel-tools">
          <!--<button @click="toggleFontColor" > 切换字体颜色</button>
          <button @click="toggleHighlightCells">切换背景高亮</button>-->
          <div class="detail-box" v-if="selectedCellText">
            <!-- 这里显示选中单元格的文本内容 -->
            <div class="cell-details">{{ selectedCellText }}</div>
          </div>
        </div>

        <gc-spread-sheets :hostStyle="spreadStyles" @workbookInitialized="initSpread">
          <gc-worksheet></gc-worksheet>
        </gc-spread-sheets>
      </div>
      <div id="tip-container">
        <div class="tip-texts">请在左侧表格中点击需为其设立规则的表头（字段），选中的字段会显示在右侧</div>
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
                <td>{{ item.position }}</td>
                <td>{{ item.fieldName }}</td>
                <td><button @click="removeField(index)">删除</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <button v-if="Object.keys(selectedFields).length > 0 " @click="sendFiledNames">发送规则字段</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
#excel-area {
  margin-bottom: 20px;
}



#tip-container {

  display: flex;
  flex-direction: column;

}



table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  text-align: left;
  padding: 8px;
}

th {
  background-color: #f7f7f7;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}


#tip-container button {
  margin-top: auto;
}
</style>
