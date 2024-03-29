<template>
    <div v-if="isVisible" class="modal">
        <div class="modal-content">
            <!-- <span class="close" @click="closeModal">&times;</span> -->
            <div class="modal-content-text">{{ text }}</div>
            <!-- 添加确认按钮 -->
            <div class="confirm-btn-container">
                <button @click="closeModal" class="confirm-btn">确定</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    text: String,
    isVisible: Boolean
});

const emits = defineEmits(['update:isVisible']);

const closeModal = () => {
    emits('update:isVisible', false);
};
</script>

<style scoped>
.modal {
    display: flex;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    justify-content: center;
    align-items: center;
}

.modal-content {
    height: 8rem;
    width: 19rem;
    background: white;
    padding: 20px;
    border-radius: 5px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 20px;
    justify-content: space-between;
    /* 新增：使内容分散对齐 */
}

.modal-content-text {
    text-align: left;
    flex-grow: 1;
    /* 文本区域占据大部分空间 */
}

.close {
    position: absolute;
    top: 10px;
    right: 20px;
    cursor: pointer;
}

.confirm-btn-container {
    /* margin-left: 40px; */
    /* width: 20%; */
    display: flex;
    justify-content: flex-end;
    /* 新增：使按钮靠左对齐 */
}

.confirm-btn {
    padding: 5px 15px; /* 根据需要调整 */
}

</style>