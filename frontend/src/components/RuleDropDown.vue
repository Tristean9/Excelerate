<script setup>

import Dropdown from 'primevue/dropdown';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import 'primevue/resources/themes/saga-blue/theme.css' // 主题
import 'primevue/resources/primevue.min.css' // 核心样式
import 'primeicons/primeicons.css' // 图标

import { ref, computed, reactive,  watch, onMounted } from 'vue';

// 定义props接收entries
const props = defineProps({
    position: String,
    category: String,
    entries: Object,
    defaultSelections: Object
});

// if (props.defaultSelections.resultArray) {
//     console.log("props.defaultSelections.resultArray ", props.defaultSelections.resultArray);
// }
// console.log("props.entries['对应列下拉列表规则'] ", props.entries['对应列下拉列表规则']);
// console.log("props.entries['程序预定义规则'] ", props.entries['程序预定义规则']);

const dropdownRef1 = ref(null);
const dropdownRef2 = ref(null);

// 使用emit发送事件
const emit = defineEmits(['save', 'delete']);

// 在选项数组中添加一个表示“不使用”的选项
const noUseOption = '不使用';

// 初始化状态
const state = reactive({
    selectedRule1: props.defaultSelections && props.defaultSelections.whereDropdown === 0
        ? props.defaultSelections.resultArray.join(', ')
        : noUseOption,
    selectedRule2: props.defaultSelections && props.defaultSelections.whereDropdown === 1
        ? props.defaultSelections.resultArray.join(', ')
        : noUseOption,

    isEditingRule1: false,
    isEditingRule2: false,
    editableContentRule1: '',
    editableContentRule2: ''
});



// 修改计算属性来添加这个选项
const dropdown1Options = computed(() => {
    return [{ label: noUseOption, value: noUseOption }, ...props.entries['对应列下拉列表规则'].map(option => ({
        label: option.join('，'),
        value: option.join('，')
    }))];
});

const dropdown2Options = computed(() => {
    return [{ label: noUseOption, value: noUseOption }, ...props.entries['程序预定义规则'].map(option => ({
        label: option.join('，'),
        value: option.join('，')
    }))];
})

let isInitialLoad = true;

onMounted(() => {
    isInitialLoad = false; // 组件挂载完毕后，将标志设置为 false
});
watch(
    () => props.defaultSelections,
    (newVal, oldVal) => {
        if (isInitialLoad || newVal !== oldVal) { // 只有在首次加载或者实际发生变化时才运行
            // 你的赋值逻辑
            if (props.defaultSelections) {
                console.log("props.defaultSelections.resultArray", props.defaultSelections.resultArray);
                if (props.defaultSelections.whereDropdown === 0) {
                    // state.selectedRule1.label = props.defaultSelections.resultArray.join(', ')
                    state.selectedRule1 = props.defaultSelections.resultArray.join(', ')
                    // console.log(111);
                    console.log(state.selectedRule1);
                } else if (props.defaultSelections.whereDropdown === 1) {
                    // state.selectedRule2.label = props.defaultSelections.resultArray.join(', ')
                    state.selectedRule2 = props.defaultSelections.resultArray.join(', ')
                }
            }
        }
    },
    { immediate: true, deep: true }
);



const deleteSelection = () => {

    state.selectedRule1 = null;
    state.selectedRule2 = null;
    // 触发保存操作以更新父组件和store的状态
    saveRule();
    emit('delete', props.position)
};

// 保存规则
const saveRule = () => {
    console.log("state.selectedRule1", state.selectedRule1)
    console.log("state.selectedRule2", state.selectedRule2)
    // 检查每个下拉框的选中状态，并确保只有一个包含合法的内容
    const isRule1Chosen = state.selectedRule1 && state.selectedRule1 !== '不使用';
    const isRule2Chosen = state.selectedRule2 && state.selectedRule2 !== '不使用';

    // 如果两个框都为空或者两个框都包含内容，则弹出提示并返回
    if (isRule1Chosen && isRule2Chosen) {
        alert('请选择一种类型的规则进行保存，不能同时保存两种规则。');
        return;
    }

    let whereDropdown = null;
    let resultArray = [];

    // 如果第一个框选中了合法内容，处理第一个框的内容
    if (isRule1Chosen) {
        console.log();
        resultArray = state.selectedRule1.split('，').map(item => item.trim());
        whereDropdown = 0;
    }

    // 如果第二个框选中了合法内容，处理第二个框的内容
    if (isRule2Chosen) {
        resultArray = state.selectedRule2.split('，').map(item => item.trim());
        whereDropdown = 1;
    }
    // 确认选中的状态
    // console.log("Before save, selectedRule1:", state.selectedRule1);
    // console.log("Before save, selectedRule2:", state.selectedRule2);
    console.log('resultArray ', resultArray);
    // console.log("whereDropdown", whereDropdown);
    // 将结果数组传递给父组件
    emit('save', { position: props.position, entry: { category: props.category, resultArray, whereDropdown } });
    // 确认传递给父组件的结果
    // console.log("Emitted save event with:", { position: props.position, entry: { category: props.category, resultArray } });
};

// 更新saveEdit以保存编辑值
const saveEdit = (ruleIndex) => {
    if (ruleIndex === 0) {
        // state.selectedRule1 = { label: state.editableContentRule1, value: state.editableContentRule1 }
        state.selectedRule1 = state.editableContentRule1
        // state.selectedRule1.value = state.editableContentRule1
        state.isEditingRule1 = false;
    } else {
        // state.selectedRule2 = { label: state.editableContentRule2, value: state.editableContentRule2 }
        state.selectedRule2 = state.editableContentRule2
        // state.selectedRule2.value = state.editableContentRule2
        state.isEditingRule2 = false;
    }
};


// 模态框取消编辑
const cancelEdit = (ruleIndex) => {
    if (ruleIndex === 0) {
        state.isEditingRule1 = false;
    } else {
        state.isEditingRule2 = false;
    }
};


// 更新updateSelectedRule以使用单独的编辑状态
const updateSelectedRule = (newValue, ruleIndex) => {
    console.log("newValue", newValue);
    console.log("typeof", typeof newValue);
    if (ruleIndex === 0) {
        if (typeof newValue === 'object' && newValue !== null) {
            console.log("Object");
            if (newValue.value === noUseOption) {
                state.selectedRule1 = noUseOption;
                // state.selectedRule1.value = noUseOption.value;
                console.log("state.selectedRule1", state.selectedRule1);
            } else {
                state.editableContentRule1 = newValue.value;
                console.log("state.editableContentRule1", state.editableContentRule1);
                // state.selectedRule1 = { label: newValue.label, value: newValue.value };
                state.isEditingRule1 = true;
            }
        } else if (typeof newValue === 'string') {
            console.log("string");
            if (newValue === noUseOption) {
                state.selectedRule1 = noUseOption;
                // state.selectedRule1.value = noUseOption.value;
                console.log("state.selectedRule1", state.selectedRule1);
            } else {
                state.editableContentRule1 = newValue;
                console.log("state.editableContentRule1", state.editableContentRule1);
                // state.selectedRule1 = { label: newValue.label, value: newValue.value };
                state.isEditingRule1 = true;
            }
        }

    } else {
        if (newValue.value === noUseOption) {
            state.selectedRule2 = noUseOption;
            // state.selectedRule2.value = noUseOption.value;
        } else {
            state.editableContentRule2 = newValue.value;
            // state.selectedRule2 = { label: newValue.label, value: newValue.value };
            state.isEditingRule2 = true;
        }

    }
};
const openEditDialog = (ruleIndex) => {
    if (ruleIndex === 0 && state.selectedRule1 !== noUseOption) {
        state.editableContentRule1 = state.selectedRule1;
        state.isEditingRule1 = true;
    } else if (ruleIndex === 1 && state.selectedRule2 !== noUseOption) {
        state.editableContentRule2 = state.selectedRule2;
        state.isEditingRule2 = true;
    }
};

const handleDropdownClick = (event, ruleIndex) => {
    // 确定是否点击了下拉箭头
    const isArrowClicked = event.target.classList.contains('p-dropdown-trigger') ||
        event.target.closest('.p-dropdown-trigger');

    if (!isArrowClicked) {
        // 如果没有点击下拉箭头，则打开模态框
        openEditDialog(ruleIndex);
    }
    // 如果点击了下拉箭头，Dropdown将正常工作，显示下拉列表
};

</script>



<template>
    <div id="dropdowns">
        <div class="dropdown-row" v-if="dropdown1Options.length > 1">
            <label class="dropdown-label">对应下拉列表规则:</label>
            <Dropdown ref="dropdownRef1" v-model="state.selectedRule1" :options="dropdown1Options" optionLabel="label"
                placeholder="选择或输入规则" :editable="true" @update:modelValue="(value) => updateSelectedRule(value, 0)"
                @click="event => handleDropdownClick(event, 0)" />
        </div>
        <div class="dropdown-row">
            <label class="dropdown-label">程序预定义规则:</label>
            <Dropdown ref="dropdownRef2" v-model="state.selectedRule2" :options="dropdown2Options" optionLabel="label"
                placeholder="选择或输入规则" :editable="true" @update:modelValue="(value) => updateSelectedRule(value, 1)"
                @click="event => handleDropdownClick(event, 1)" />
        </div>
        <div class="button-container">
            <button @click="saveRule">保存</button>
            <button @click="deleteSelection">删除</button>
        </div>
        <!-- 对应下拉列表规则的编辑模态框 -->
        <Dialog :visible="state.isEditingRule1" @hide="() => cancelEdit(0)" header="编辑规则（请以中文句号作为分割）"
            style="width: 50vw;">
            <Textarea v-model="state.editableContentRule1" style="width: 100%; height: 20vw;" rows="5" cols="30"
                autoResize />
            <div class="button-container">
                <Button label="保存" @click="() => saveEdit(0)" />
                <Button label="取消" class="p-button-text" @click="() => cancelEdit(0)" />
            </div>
        </Dialog>

        <!-- 程序预定义规则的编辑模态框 -->
        <Dialog :visible="state.isEditingRule2" @hide="() => cancelEdit(1)" header="编辑规则（请以中文句号作为分割）"
            style="width: 50vw;">
            <Textarea v-model="state.editableContentRule2" style="width: 100%; height: 20vw;" rows="5" cols="30"
                autoResize />
            <div class="button-container">
                <Button label="保存" @click="() => saveEdit(1)" />
                <Button label="取消" class="p-button-text" @click="() => cancelEdit(1)" />
            </div>
        </Dialog>
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

.dropdown-row {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
}

.dropdown-label {
    min-width: 150px;
    /* 假设150px为您希望的最小宽度 */
    margin-right: 1rem;
    /* 标签右边的间隔 */
    white-space: nowrap;
    /* 确保标签文本不换行 */
    flex: 0 0 auto;
    /* 不允许标签伸缩，保持原有宽度 */
}

.dropdown {
    flex: 1 1 auto;
    /* 下拉框填充剩余空间 */
}
</style>