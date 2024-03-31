<script setup>
import { ref, defineProps } from 'vue';

// 定义Props
const props = defineProps({
    isVisible: Boolean,
    message: String
});
</script>

<template>
    <div v-if="props.isVisible" class="modal">
        <div class="modal-content">
            <p>{{ props.message }}</p>
        </div>
    </div>
</template>

<style scoped>
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 5px;
    text-align: center;
}
</style>
