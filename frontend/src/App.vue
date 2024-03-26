<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive include="">
      <component :is="Component" />
    </keep-alive>
  </router-view>

</template>


<script setup>


</script>

<style>
.title-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;

}

.title-text {
  font-size: 32px;
  font-weight: bold;
}

.uploader-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.uploader {
  display: flex;
  justify-content: center;
  align-items: center;
}

.detail-box {
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  color: #000;
}
.excel-container {
  display: flex;
  margin: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

</style>