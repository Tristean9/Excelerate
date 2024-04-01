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
    console.log("base64String", base64String);
    console.log("ruleDict", ruleDict);
    excelAndRuleData[mode] = [base64ToBlob(base64String, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"), ruleDict];
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

// 最终规则预览模态框
const isModalVisible = ref(false);
const modalContent = ref('');

const showModal = (entry) => {
  modalContent.value = entry.resultArray.join(', ');
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
};
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
    <div class="title-text">规则制定</div>
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
    <div id="final-rules-container">
      <h1 style="font-size: 30px;">最终规则预览</h1>
      <!-- <h1>{{ selectedDropdowns }}</h1> -->
      <ul>
        <li v-for="(entry, position) in selectedDropdowns" :key="position" @click="showModal(entry)">
          {{ position }} - {{ entry.category }}
          <span class="final-rule">{{ entry.resultArray.join(', ') }}</span>
        </li>
      </ul>
      <button v-if="Object.keys(selectedDropdowns).length  > 0" @click="sendFinalFormattedRules" style="width: 180px;">保存并发送</button>
      <div v-if="isModalVisible" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop style="height: auto;width: auto;">
          <span class="close" @click="closeModal">&times;</span>
          <p>{{ modalContent }}</p>
        </div>
      </div>

    </div>


  </div>
</template>

<style scoped>
#rule-maker-container {
  display: flex;
  min-width: 1200px;
  /* 根据需要调整 */
  /* justify-content: space-between; */
  /* 让子元素靠近两端 */
  padding: 0 50px;
  /* 设置内边距为20像素，可以调整这个数值来控制边距大小 */
  gap: 30px;
}


#rule-maker {
  height: 650px;
  min-width: 650px;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

#rule-maker,
#final-rules-container {
  display: flex;
  flex-direction: column;;
  flex: 1;
  /* 每个子元素都将尝试占据相同的空间 */
  min-width: 0;
  /* 防止缩小到小于内容宽度 */
  height: 650px;
  min-width: 650px;
  overflow: auto;


}

#final-rules-container {
  flex: 1;
  /* 每个子元素都将尝试占据相同的空间 */
  min-width: 0;
  /* 防止缩小到小于内容宽度 */
  font-size: 1.45rem;
  /* 或者根据您的设计需求调整字体大小 */
  margin-bottom: 1.5rem;
  /* 为最终规则预览部分添加底部间距 */
}

#final-rules-container ul {
  list-style: none;
  /* 移除列表项目符号 */
  padding-left: 0;
  /* 移除默认的内边距 */
}

#final-rules li {
  display: block;
  /* 或者 display: inline-block; */
  max-width: 800px;
  /* 假设您的 <li> 元素有 20px 的内边距或者外边距 */
  padding-right: 20px;
  /* 调整以适应实际情况 */
  margin-bottom: 0.75rem;
  /* 为每个规则之间添加间距 */
}

.final-rule {
  display: block;
  /* 或者 block 也可以，但是可能会独占一行 */
  max-width: 800px;
  overflow: hidden;
  /* 隐藏超出部分 */
  white-space: nowrap;
  text-overflow: ellipsis;
  /* 显示省略号 */
  cursor: pointer;
  /* 可选，表明这是可点击的 */
}

#final-rules-container button {
  margin-top: auto;
  /* 将按钮推到容器底部 */
  width: 15%
}

.dropdowns {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.dropdowns>div {
  margin: 0.5rem 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  font-size: 1.5rem;
}
</style>