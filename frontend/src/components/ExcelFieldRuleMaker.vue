<script setup>
import { useStore } from "vuex";
import {computed, reactive, ref, watchEffect} from "vue";
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

for ( const category in rulesData.value){
    selectedDropdowns[category] = {
      listRules: '',
      predefineRules: '',
      customRules: ''
  }
  finalRules.value[category] = { ...selectedDropdowns[category] };
}

// 格式化最终规则
const formattedFinalRules = computed(() => {
  let formatted = {};
  for (const category in finalRules.value){
    // 过滤掉空字符串
    let rules = Object.values(finalRules.value[category]).filter(rule => rule && rule.length > 0);
    // 不将空数组加入到formatted中
    if (rules.length >0){
      // 如果是数组，则展开它并加入到rules中
      rules = rules.flatMap(rule => Array.isArray(rule) ? rule : [rule]);
      formatted[category] = rules;
    }
  }
  return formatted;
});

const checkAndSaveRules = (category) => {
  let ruleCount;
  const rules = selectedDropdowns[category];
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

    // 如果规则没有超过一种，则将其保存到finalRules中
    finalRules.value[category] = { ...rules };

      // 清除用户没有选择的规则
    ['listRules', 'predefineRules', 'customRules'].forEach(ruleType => {
    if (!rules[ruleType]) {
      finalRules.value[category][ruleType] = '';
    }
  });
}

// 发送最终制定好的规则给服务器
const sendFinaFormattedRules = async () => {
  const formData = new FormData();
  const rulesString = JSON.stringify(formattedFinalRules.value);
  formData.append('finalRules', rulesString);

  const dataResponse = await http.post('/create_final_rules_and_examples', formData );
  const fileStreamResponse = await http.post('create_final_rules_and_examples_file', formData);

  console.log('dataResponse: ', dataResponse.data);
  console.log('fileStreamResponse: ', fileStreamResponse.data);
}

</script>

<template>
  <h1>规则制定页面</h1>
  <div id="rule-maker-container">
    <div id="rule-maker">
      <div v-for="(rules, category) in rulesData" :key="category">
      <h2>{{ category }}</h2>
      <div class="dropdowns">
        <div>
          <label>对应下拉列表规则:</label>
          <select v-model="selectedDropdowns[category]['listRules']">
            <option v-if="!rules['对应列下拉列表规则'].length" disabled value="">无可用规则</option>
            <option v-for="rule in rules['对应列下拉列表规则']" :key="rule" :value="rule">
              {{ rule }}
            </option>
            <option value="">不使用</option>
          </select>

        </div>
        <div>
          <label>程序预定义规则:</label>
          <select v-model="selectedDropdowns[category]['predefineRules']">
            <option v-if="!rules['程序预定义规则'].length" disabled value="">无可用规则</option>
            <option v-for="rule in rules['程序预定义规则']" :key="rule" :value="rule">
              {{ rule }}
            </option>
            <option value="">不使用</option>

          </select>
        </div>
        <div>
            <label>用户自定义规则:</label>
            <input type="text" placeholder="使用/分隔规则" v-model="selectedDropdowns[category]['customRules']" />
          </div>
      </div>
      <button @click="checkAndSaveRules(category)">保存全部规则</button>
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