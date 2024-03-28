<script setup>

import Dropdown from 'primevue/dropdown';
import 'primevue/resources/themes/saga-blue/theme.css' // 主题
import 'primevue/resources/primevue.min.css' // 核心样式
import 'primeicons/primeicons.css' // 图标

import { ref, computed, reactive, defineProps, defineEmits, watchEffect } from 'vue';

// 定义props接收entries
const props = defineProps({
    position: String,
    category: String,
    entries: Object,
    defaultSelections: Object
});


// console.log("props.defaultSelections ", props.defaultSelections);
console.log("props.entries['对应列下拉列表规则'] ", props.entries['对应列下拉列表规则']);
console.log("props.entries['程序预定义规则'] ", props.entries['程序预定义规则']);

// 使用emit发送事件
const emit = defineEmits(['save', 'delete']);

// 初始化状态
const state = reactive({
    selectedRule1: null,
    selectedRule2: null,
});

const dropdown1Options = computed(() => {
    return props.entries['对应列下拉列表规则'].map(option => ({
        label: option.join('，'),
        value: option.join('，')
    }));
});

const dropdown2Options = computed(() => {
    
    return props.entries['程序预定义规则'].map(option => ({
        label: option.join('，'),
        value: option.join('，')
    }));
})

// 如果存在默认选择，设置下拉框的值
watchEffect(() => {
    // console.log("watchEffect - defaultSelections changed:", props.defaultSelections);
    if (props.defaultSelections) {
        // console.log("props.defaultSelections");
        // 如果存在默认选择，并且确实有为 selectedRule1 的值，则更新它
        if (props.defaultSelections.whereDropdown == 0) {
            state.selectedRule1 = props.defaultSelections.resultArray;
            // console.log("props.defaultSelections.rule1", state.selectedRule1);
        }
        // 对 selectedRule2 做同样的处理
        if (props.defaultSelections.whereDropdown == 1) {
            state.selectedRule2 = props.defaultSelections.resultArray;
            // console.log("props.defaultSelections.rule2",state.selectedRule2);
        }
    } else {
        // console.log("props.defaultSelections:", props.defaultSelections);
    }
});

const deleteSelection = () => {

    state.selectedRule1 = null;

    state.selectedRule2 = null;

    // 触发保存操作以更新父组件和store的状态
    saveRule();

    emit('delete', props.position)
};

// 保存规则
const saveRule = () => {
    // console.log("state.selectedRule1", state.selectedRule1)
    // console.log("state.selectedRule2", state.selectedRule2)
    // 检查每个下拉框的选中状态，并确保只有一个包含合法的内容
    const isRule1Chosen = state.selectedRule1 && state.selectedRule1.label !== '不使用';
    const isRule2Chosen = state.selectedRule2 && state.selectedRule2.label !== '不使用';

    // 如果两个框都为空或者两个框都包含内容，则弹出提示并返回
    if (isRule1Chosen && isRule2Chosen) {
        alert('请选择一种类型的规则进行保存，不能同时保存两种规则。');
        return;
    }

    let whereDropdown = null;
    let resultArray = [];

    // 如果第一个框选中了合法内容，处理第一个框的内容
    if (isRule1Chosen) {
        if (state.selectedRule1.value) {
            resultArray = state.selectedRule1.value.split('，').map(item => item.trim());
        } else {
            resultArray = state.selectedRule1.split('，').map(item => item.trim());
        }
        whereDropdown = 0;
    }

    // 如果第二个框选中了合法内容，处理第二个框的内容
    if (isRule2Chosen) {
        if (state.selectedRule2.value) {
            resultArray = state.selectedRule2.value.split('，').map(item => item.trim());
        } else {
            resultArray = state.selectedRule2.split('，').map(item => item.trim());
        }
        whereDropdown = 1;
    }
    // 确认选中的状态
    // console.log("Before save, selectedRule1:", state.selectedRule1);
    // console.log("Before save, selectedRule2:", state.selectedRule2);
    // console.log('resultArray ', resultArray);
    // console.log("whereDropdown", whereDropdown);
    // 将结果数组传递给父组件
    emit('save', { position: props.position, entry: { category: props.category, resultArray, whereDropdown } });
    // 确认传递给父组件的结果
    // console.log("Emitted save event with:", { position: props.position, entry: { category: props.category, resultArray } });
};
</script>



<template>
    <div id="dropdowns">
        <div v-if="dropdown1Options.length">
            <label>对应下拉列表规则:</label>
            <Dropdown v-model="state.selectedRule1" :options="dropdown1Options" optionLabel="label"
                placeholder="选择或输入规则" :editable="true" />
        </div>
        <div>
            <label>程序预定义规则:</label>
            <Dropdown v-model="state.selectedRule2" :options="dropdown2Options" optionLabel="label"
                placeholder="选择或输入规则" :editable="true" />
        </div>
        <div id="button-container">
            <button @click="saveRule">保存</button>
            <button @click="deleteSelection">删除</button>
        </div>

    </div>
</template>


<style scoped>
#dropdowns {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
}

#button-container {
    display: flex;
    margin: 10px;
}
</style>