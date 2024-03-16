<script setup>


</script>


<template>
    <div class="Home">
        <div class="title-container">
            <div class="title-text">功能选择页面</div>
        </div>
        <div class="menu">
            <router-link :to="{ name: 'ExcelFileUploader' }"><button>前往规则制定模块</button></router-link>
            <router-link :to="{ name: 'ExcelRuleUploader' }"><button>前往规则上传模块</button></router-link>
        </div>
    </div>

</template>


<style scoped>
.menu {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>