<script setup>
import { useStore } from "vuex";
import { onMounted, computed } from 'vue';

const store = useStore();
onMounted(() => {
    // 调用重置数据的方法
    store.dispatch('savePreSelectedField', computed(() => {}));
    store.dispatch('savePreSelectedDropDowns',{});
});

</script>


<template>
    <div class="Home">
        <div id="home-top">
        </div>
        <div class="title-container">
            <div class="title-text">功能选择</div>
        </div>
        <div class="menu">
            <router-link :to="{ name: 'ExcelFileUploader' }"><button>规则制定</button></router-link>
            <router-link :to="{ name: 'ExcelRuleUploader' }"><button>数据检验</button></router-link>
            <router-link :to="{ name: 'ContactUploader' }"><button>合并文件</button></router-link>
            <router-link :to="{ name: 'SplitUploader' }"><button>拆分文件</button></router-link>
        </div>
    </div>

</template>


<style scoped>

#home-top {
    height: 40px;
}
.menu {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
}
</style>