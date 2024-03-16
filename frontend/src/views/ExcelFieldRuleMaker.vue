<script setup>
import { useStore } from "vuex";
import { computed, reactive, ref, onBeforeUnmount, onMounted } from "vue";
import http from "@/api/http.js";
import router from "@/router/index.js";

import RuleDropDown from "@/components/RuleDropDown.vue";

const store = useStore();
const rulesData = computed(() => store.state.rulesData);
// console.log("rulesData: ", rulesData)

const finalRules = ref({});
const preSelectedDropDowns = computed(() => store.state.preSelectedDropDowns);
// 保存其中的选项
const selectedDropdowns = reactive({});

const goBack = () => {
  store.dispatch('savePreSelectedDropDowns', selectedDropdowns)
  router.back();
}

onMounted(() => {
  console.log('rulesData', rulesData.value);

  // 在页面加载时检查是否有之前保存的选项
  if (preSelectedDropDowns.value) {
    Object.keys(rulesData.value).forEach(position => {
      if (preSelectedDropDowns.value[position]) {
        console.log('preSelectedDropDowns.value[position]', preSelectedDropDowns.value[position]);
        selectedDropdowns[position] = preSelectedDropDowns.value[position];
        console.log("Mounted - Initial selectedDropdowns:", selectedDropdowns[position]);
      }
    });
  }
  
});

onBeforeUnmount(() => {
  console.log(111);
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

  const fileStreamResponse = await http.post('create_final_rules_and_examples', formData);

  // 处理包含Base64编码数据的响应
  const response = fileStreamResponse.data
  //将Base64编码文件转换成Blob对象
  const fileBlobData = {};
  for (const [mode, base64String] of Object.entries(response)) {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    fileBlobData[mode] = new Blob([byteArray], { type: 'application/vnd.ms-excel' });
  }
  // console.log('dataResponse: ', dataResponse.data);
  // console.log('fileStreamResponse: ', fileBlobData);

  await store.dispatch('fetchFinalExcelData', fileBlobData);
  // console.log(computed(() => store.state.finalExcelBlob).value);

  await router.push({ name: 'ExcelFieldRuleShower' });
}

const handleSave = ({ position, entry }) => {
  // 保存选中的下拉菜单规则
  // console.log("Received save from child component for position:", position, " with entry:", entry);
  selectedDropdowns[position] = entry;
  // console.log("Updated selectedDropdowns:", selectedDropdowns);
};

const handleDelete = (position) => {
  delete selectedDropdowns[position]
  // console.log("selectedDropdowns:", selectedDropdowns);
  store.dispatch('deleteRule', position)
}
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
      <h1>{{ selectedDropdowns }}</h1>
      <ul>
        <li v-for="(entry, position) in selectedDropdowns" :key="position">
          {{ position }} - {{ entry.category }}
          <span>{{ entry.resultArray.join(', ') }}</span>
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
  justify-content: space-between;
  /* 让子元素靠近两端 */
  padding: 0 50px;
  /* 设置内边距为20像素，可以调整这个数值来控制边距大小 */
}

#rule-maker {
  height: 500px;
  display: flex;
  flex-direction: column;
  overflow: auto;
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