在ExcelFieldRuleMaker和ExcelFieldRuleMaker这两个组件中，我希望在他们互相goBack之后，之前的数据都还在，比如说从ExcelFieldRuleMaker回到ExcelFieldSelector，之前的表格和选择的单元格还在；从ExcelFieldSelector点击发送规则给服务器之后，ExcelFieldRuleMaker页面如果是原来页面就已经包含了新页面需要填写的内容，那就还在，用户不用再填写一次。

ExcelFieldSelector代码：
<script setup>
import { ref, reactive, watch, nextTick, computed } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

import router from "@/router/index.js";
import store from "@/store/index.js";
import http from '@/api/http';

import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css';
import { GcSpreadSheets, GcWorksheet } from '@grapecity/spread-sheets-vue';
import '@grapecity/spread-sheets-io';
import * as GC from '@grapecity/spread-sheets'


const spread = ref(null);
const spreadStyles = { width: "1000px", height: "600px" };

const selectedFields = ref([]);
const rulesData = computed(() => store.state.rulesData);
const processedExcelBlob = computed(() => store.state.processedExcelBlob)

const initSpread = (s) => {
  spread.value = s;

  loadAndDisplayExcelContent(processedExcelBlob)

  bindCellClickForActiveSheet(); // 绑定事件到初始工作表

  // 监听工作表切换事件
  spread.value.bind(GC.Spread.Sheets.Events.SheetChanged, (sender, args) => {
    bindCellClickForActiveSheet(); // 重新绑定事件到新的工作表
  });

};

const loadAndDisplayExcelContent = async (processedExcelBlob) => {
  const options = {
    includeStyles: true,
  }
  if (processedExcelBlob.value) {
    spread.value.clearSheets();
    spread.value.suspendPaint();
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
      spread.value.resumePaint();

      bindCellClickForActiveSheet(); // 绑定事件到初始工作表
      spread.value.bind(GC.Spread.Sheets.Events.SheetChanged, (sender, args) => {
        //console.log("changed")
        const sheet = spread.value.getActiveSheet();

        if (sheet.getRowCount() < minRowCount) {
          sheet.setRowCount(minRowCount)
        }

        if (sheet.getColumnCount() < minColumnCount) {
          sheet.setColumnCount(minColumnCount)
        }
        bindCellClickForActiveSheet(); // 重新绑定事件到新的工作表
      })
    }, (error) => {
      console.error("Import failed: ", error)
    }, options);
  }
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

      const isPositionExist = selectedFields.value.some(item => item.position === position);

      if (!isPositionExist) {
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
    formData.append('fields', JSON.stringify(selectedFields.value));

    const response = await http.post('/generate_user_rule_dict', formData);

    // 分发action 更新store中的状态
    await store.dispatch('fetchRulesData', response.data);
    // console.log("服务器响应：", response.data);

    if (rulesData.value) {
      // 跳转到规则指定模块
      // console.log(rulesData.value)
      await router.push({ name: 'excelFieldRuleMaker' });
    }
    // 处理响应，例如：显示成功消息或处理错误
  } catch (error) {
    console.error('发送数据失败:', error);
  }
};

const goBack = () => {
  router.back();
}

// 检测state变化
watch(processedExcelBlob, (newVal, oldVal) => {
  if (newVal) {
    loadAndDisplayExcelContent(processedExcelBlob);
  }
}, { immediate: true }); // immediate: true 确保了该侦听器被创建后立即执行


// 监听路由离开事件
onBeforeRouteLeave((to, from, next) => {
  if (to.name === 'excelFiledUploader') {
    // 调用重置数据的方法
    selectedFields.value = [];
  }
  // 继续路由跳转
  next();
});

</script>

<template>
  <div>
    <h1>规则字段选择页面</h1>
    <div class="excel-tip">
      <div id="excel-area">
        <div id="excel-tools">
          <!--<button @click="toggleFontColor" > 切换字体颜色</button>
          <button @click="toggleHighlightCells">切换背景高亮</button>-->
        </div>
        <gc-spread-sheets :hostStyle="spreadStyles" @workbookInitialized="initSpread">
          <gc-worksheet></gc-worksheet>
        </gc-spread-sheets>
      </div>
      <div id="tip-container">
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
                <td>{{ item.position }}</td>
                <td>{{ item.fieldName }}</td>
                <td><button @click="removeField(index)">删除</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <button @click="sendFiledNames">发送规则字段</button>
      </div>

    </div>
  </div>
  <button @click="goBack">return</button>
</template>

<style scoped>
.excel-tip {
  display: flex;
  margin: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#excel-area {
  margin-bottom: 20px;
}

#tip-container {
  margin-top: 20px;
}

input[type="file"] {
  border: 1px solid #ccc;
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  margin-right: 10px;
}

button {
  padding: 10px 15px;
  font-size: 16px;
  color: white;
  background-image: linear-gradient(to right, #667eea, #764ba2);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  margin-right: 10px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
}

button:hover {
  background-image: linear-gradient(to right, #667eea, #764ba2);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.2);
}

button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
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

/* 提示文本样式 */
.tip-texts {
  background-color: #e7e7e7;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  margin-bottom: 20px;
}
</style>


ExcelFieldRuleMaker代码：
<script setup>
import {useStore} from "vuex";
import {computed, reactive, ref} from "vue";
import http from "@/api/http.js";
import router from "@/router/index.js";

const store = useStore();
const rulesData = computed(() => store.state.rulesData);
// console.log(rulesData.value)
const finalRules = ref({});

// 保存其中的选项
const selectedDropdowns = reactive({});

const goBack = () =>{
  router.back();
}

// 初始化被选择的框
for ( const [position, [category, rules]] of Object.entries(rulesData.value)){
    selectedDropdowns[position] = {
      category,
      listRules: '',
      predefineRules: '',
      customRules: ''
  }
  finalRules.value[position] = [category, { ...selectedDropdowns[position] }];
}


const checkAndSaveRules = (position) => {
  let ruleCount;
  // console.log('selectedDropdowns[position]: ', selectedDropdowns[position])
  //const [category, rules] = selectedDropdowns[position];
  const category = selectedDropdowns[position].category;
  const rules = selectedDropdowns[position];

  // console.log('category: ',category)
  // console.log('rules: ', rules)
  ruleCount = ['listRules', 'predefineRules', 'customRules'].reduce((count, ruleType) => {
    if (rules[ruleType] ) count++;
    return count;
  }, 0);

  if (ruleCount > 1) {
    alert(`在${category}中只能选择一种规则。`);
    return;  // 如果规则超过一种，则停止保存并弹出警告
  }

  // 如果用户自定义规则被选中，并且包含'/'，则分割为数组
  if (rules.customRules && rules.customRules.includes('/')){
    rules.customRules = rules.customRules.split('/').map(rule => rule.trim());
  }

  // 使用选择的规则构建最终规则数组
  let finalRule;
  if (rules.listRules ) finalRule = rules.listRules;
  if (rules.predefineRules) finalRule = rules.predefineRules;
  if (rules.customRules?.length) finalRule = finalRule.concat(rules.customRules);
  // console.log(finalRule);
  // 保存到finalRules，位置为键
  finalRules.value[position] = [category, finalRule];
}

// 格式化最终规则
const formattedFinalRules = computed(() => {
  let formatted = {};
  for (const [position, [category, rules]] of Object.entries(finalRules.value)){
    // 确保规则是一个数组
    let rulesArray = Array.isArray(rules) ? rules : [rules];
    // 过滤掉空字符串
    rulesArray = rulesArray.filter(rule => rule && rule.length > 0);
    // 不将空数组加入到formatted中
    if (rulesArray.length > 0){
      // 如果是数组，则展开它并加入到rules中
      formatted[position] = [category, rulesArray];
    }
  }
  return formatted;
});

// 发送最终制定好的规则给服务器
const sendFinaFormattedRules = async () => {
  const formData = new FormData();
  // console.log(formattedFinalRules.value);
  const rulesString = JSON.stringify(formattedFinalRules.value);

  formData.append('finalRules', rulesString);

  // const dataResponse = await http.post('/create_final_rules_and_examples', formData );
  const fileStreamResponse = await http.post('create_final_rules_and_examples_file', formData);

  // 处理包含Base64编码数据的响应
  const response = fileStreamResponse.data
  //将Base64编码文件转换成Blob对象
  const fileBlobData = {};
  for (const [mode, base64String] of Object.entries(response)){
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++){
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    fileBlobData[mode] = new Blob([byteArray], {type: 'application/vnd.ms-excel'});
  }
  // console.log('dataResponse: ', dataResponse.data);
  // console.log('fileStreamResponse: ', fileBlobData);

  await store.dispatch('fetchFinalExcelData', fileBlobData);
  // console.log(computed(() => store.state.finalExcelBlob).value);

  await router.push({name:'excelFieldRuleShower'});
}

</script>

<template>
  <h1>规则制定页面</h1>
  <div id="rule-maker-container">
    <div id="rule-maker">
      <div v-for="(entry, position) in rulesData" :key="position">
      <h2>{{ position }} - {{ entry[0] }}</h2>
      <div class="dropdowns">
        <div>
          <label>对应下拉列表规则:</label>
          <select v-model="selectedDropdowns[position]['listRules']">
            <option v-if="!entry[1]['对应列下拉列表规则'].length" disabled value="">无可用规则</option>
            <option v-for="rule in entry[1]['对应列下拉列表规则']" :key="rule" :value="rule">
              {{ rule }}
            </option>
            <option value="">不使用</option>
          </select>

        </div>
        <div>
          <label>程序预定义规则:</label>
          <select v-model="selectedDropdowns[position]['predefineRules']">
            <option v-if="!entry[1]['程序预定义规则'].length" disabled value="">无可用规则</option>
            <option v-for="rule in entry[1]['程序预定义规则']" :key="rule" :value="rule">
              {{ rule }}
            </option>
            <option value="">不使用</option>

          </select>
        </div>
        <div>
            <label>用户自定义规则:</label>
            <input type="text" placeholder="使用/分隔规则" v-model="selectedDropdowns[position]['customRules']" />
          </div>
      </div>
      <button @click="checkAndSaveRules(position)">保存全部规则</button>
    </div>
    </div>
    <div id="final-rules">
      <h1>最终规则</h1>
      <ul>
        <li v-for="(rules, category) in formattedFinalRules" :key="category">
          <span>{{ category }}:</span>
          <span>{{ rules.join(', ') }}</span>
        </li>
      </ul>
      <button @click="sendFinaFormattedRules">保存并发送</button>
    </div>
  </div>
  <button @click="goBack">return</button>
</template>

<style scoped>

#rule-maker-container {
  display: flex;
  justify-content: space-between; /* 让子元素靠近两端 */
  padding: 0 50px; /* 设置内边距为20像素，可以调整这个数值来控制边距大小 */
}

#rule-maker {
  display: flex;
  flex-direction: column;
}
.dropdowns {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.dropdowns > div {
  margin: 0.5rem 0;
}
</style>