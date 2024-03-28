<script setup>
import { useStore } from "vuex";
import { computed, reactive, ref, onBeforeUnmount, onMounted } from "vue";
import http from "@/api/http.js";
import router from "@/router/index.js";
import { onBeforeRouteLeave } from 'vue-router';

import RuleDropDown from "@/components/RuleDropDown.vue";

const store = useStore();
const rulesData = computed(() => store.state.rulesData); // 保存从规则字段选择页面的返回的规则数据
console.log("rulesData: ", rulesData.value)

// const finalRules = ref({});
const preSelectedDropDowns = computed(() => store.state.preSelectedDropDowns); //  保存之前选过的选项
// 保存其中的选项
const selectedDropdowns = reactive({});

const goBack = () => {
  store.dispatch('savePreSelectedDropDowns', selectedDropdowns)
  router.push({ name: 'ExcelFieldSelector' });
}

onMounted(() => {
  // console.log('rulesData', rulesData.value);

  // 在页面加载时检查是否有之前保存的选项
  if (preSelectedDropDowns.value) {
    Object.keys(rulesData.value).forEach(position => {
      if (preSelectedDropDowns.value[position]) {
        // console.log('preSelectedDropDowns.value[position]', preSelectedDropDowns.value[position]);
        selectedDropdowns[position] = preSelectedDropDowns.value[position];
        // console.log("Mounted - Initial selectedDropdowns:", selectedDropdowns[position]);
      }
    });
  }

});

onBeforeUnmount(() => {
  // console.log(111);
  // 页面卸载前保存当前选择
  store.dispatch('savePreSelectedDropDowns', selectedDropdowns);
  // console.log("Before unmount - Current selectedDropdowns:", selectedDropdowns);
});

// 发送最终制定好的规则给服务器
const sendFinalFormattedRules = async () => {

  const transformedDropdowns = Object.entries(selectedDropdowns).reduce((acc, [key, value]) => {
    acc[key] = [value.category, [...value.resultArray]];
    return acc;
  }, {});

  const formData = new FormData();
  // console.log('transformedDropdowns:',transformedDropdowns);
  const rulesString = JSON.stringify(transformedDropdowns);

  formData.append('finalRules', rulesString);

  const response = await http.post('create_final_rules_and_examples', formData);

  // 处理包含Base64编码数据的响应
  // 将Base64编码文件转换成Blob对象
  // console.log('dataResponse: ', dataResponse.data);
  // console.log('fileStreamResponse: ', fileBlobData);
  const excelAndRuleData = {};
  for (const [mode, entry] of Object.entries(response.data)) {
    const base64String = entry[0]
    const ruleDict = entry[1]
    console.log("base64String",base64String);
    console.log("ruleDict", ruleDict);
    excelAndRuleData[mode] = [base64ToBlob(base64String, 'application/vnd.ms-excel'), ruleDict];
  }

  await store.dispatch('fetchExcelAndRuleData', excelAndRuleData);
  // console.log(computed(() => store.state.finalExcelBlob).value);

  await router.push({ name: 'ExcelFieldRuleShower' });
}

const base64ToBlob = (base64, mimeType) => {
  // 解码 Base64 字符串
  const byteCharacters = atob(base64);
  // 每个字符的编码存入一个数组
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  // 转换为类型化数组
  const byteArray = new Uint8Array(byteNumbers);
  // 使用类型化数组创建 Blob 对象
  return new Blob([byteArray], { type: mimeType });
}

const handleSave = ({ position, entry }) => {
  // 保存选中的下拉菜单规则
  // console.log("Received save from child component for position:", position, " with entry:", entry);
  selectedDropdowns[position] = entry;
  // console.log("Updated selectedDropdowns:", selectedDropdowns);
};

const handleDelete = (position) => {
  delete selectedDropdowns[position]
  delete rulesData[position];
  // console.log("selectedDropdowns:", selectedDropdowns);
  store.dispatch('deleteRule', position)
}

// 监听路由离开事件
onBeforeRouteLeave((to, from, next) => {
  if (to.name === 'ExcelFieldSelector') {
    // 存储已经制定好的规则字段
    // console.log("rulesData", rulesData);
    store.dispatch('savePreSelectedField', rulesData);
  }
  // 继续路由跳转
  next();
});

</script>

<template>

  <div class="title-container">
    <div class="title-text">规则制定页面</div>
  </div>
  <div id="rule-maker-container">
    <!-- <h1>{{ rulesData }}</h1> -->
    <div id="rule-maker">
      <div v-for="(entry, position) in rulesData" :key="position">
        <h2>{{ position }} - {{ entry[0] }}</h2>
        <RuleDropDown :position="position" :category="entry[0]" :entries="entry[1]"
          :defaultSelections="selectedDropdowns[position]" @save="handleSave" @delete="handleDelete" />
      </div>
    </div>
    <div id="final-rules">
      <h1>最终规则</h1>
      <!-- <h1>{{ selectedDropdowns }}</h1> -->
      <ul>
        <li v-for="(entry, position) in selectedDropdowns" :key="position">
          {{ position }} - {{ entry.category }}
          <span class="final-rule">{{ entry.resultArray.join(', ') }}</span>
        </li>
      </ul>
      <button @click="sendFinalFormattedRules">保存并发送</button>
    </div>


  </div>
  <button @click="goBack">return</button>
</template>

<style scoped>
#rule-maker-container {
  display: flex;
  min-width: 1200px; /* 根据需要调整 */
  /* justify-content: space-between; */
  /* 让子元素靠近两端 */
  padding: 0 50px;
  /* 设置内边距为20像素，可以调整这个数值来控制边距大小 */
}


#rule-maker {
  height: 500px;
  min-width: 500px;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
#rule-maker,
#final-rules {
  flex: 1; /* 每个子元素都将尝试占据相同的空间 */
  min-width: 0; /* 防止缩小到小于内容宽度 */
  overflow: auto; /* 如果内容超出，隐藏超出的部分 */
}


.final-rule {
  max-width: 150px;
  overflow: auto;
  white-space: nowrap;
}

.dropdowns {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.dropdowns>div {
  margin: 0.5rem 0;
}


li {
  list-style: none;
}
</style>