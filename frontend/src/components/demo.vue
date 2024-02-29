<script setup>
import { ref } from 'vue';
import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css';
import { GcSpreadSheets } from '@grapecity/spread-sheets-vue';
import * as GC from '@grapecity/spread-sheets';

const spread = ref(null);
const spreadStyles = { width: "1000px", height: "600px" };

const initSpread = (s) => {
  spread.value = s;

  // 绑定SheetTabChanged事件监听工作表的切换
  spread.value.bind(GC.Spread.Sheets.Events.SheetChanged, (sender, args) => {
    // 打印当前工作表的名称
    console.log('当前工作表名称：', spread.value.getSheet(args.newSheet).getName());
  });
};
</script>

<template>
  <div>
    <!-- ... 其他代码 ... -->
    <gc-spread-sheets :hostStyle="spreadStyles" @workbookInitialized="initSpread">
      <!-- ... -->
    </gc-spread-sheets>
    <!-- ... 其他代码 ... -->
  </div>
</template>
