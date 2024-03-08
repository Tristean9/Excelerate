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