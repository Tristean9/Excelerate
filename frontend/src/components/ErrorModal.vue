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