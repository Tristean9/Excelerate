<script setup>
import { useStore } from "vuex";
import { onMounted, computed } from 'vue';

const store = useStore();
onMounted(() => {
    // 调用重置数据的方法
    store.dispatch('savePreSelectedField', computed(() => { }));
    store.dispatch('savePreSelectedDropDowns', {});
});

</script>


<template>
    <div class="Home">
        <div class="title-container">
            <div class="title-text">功能选择</div>
        </div>
        <div class="menu">
            <router-link :to="{ name: 'ExcelFileUploader' }"><button>规则制定</button></router-link>
            <router-link :to="{ name: 'ExcelRuleUploader' }"><button>数据检验</button></router-link>
            <router-link :to="{ name: 'ContactUploader' }"><button>合并文件</button></router-link>
            <router-link :to="{ name: 'SplitUploader' }"><button>拆分文件</button></router-link>
        </div>

        <div id="background"></div>
    </div>

</template>


<style scoped>
.menu {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
}

#home-top {
    background-image: url('@/assets/logo.png');
    height: 10rem;
    width: 10%;

}

#background {
    background-image: url('@/assets/background.png');
    background-size: cover;
    /* 覆盖整个区域 */
    background-position: center;
    /* 图片居中显示 */
    height: 40rem;
    /* 或者您想要的高度 */
    width: 100%;
    margin-top: 6rem;
    margin-left: 2rem;
}
</style>