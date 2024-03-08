<script setup>
import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css';
import { GcSpreadSheets, GcWorksheet } from '@grapecity/spread-sheets-vue';
import '@grapecity/spread-sheets-io';
import * as GC from '@grapecity/spread-sheets'
import * as ExcelIO from "@grapecity/spread-excelio";

import {ref} from "vue";

const spread = ref(null);
const spreadStyles = { width: '1000px', height: '600px'};
const finalExcelBlob = '';

const initSpread = (s) => {
  spread.value = s;

}

const loadAndDisplayExcelContent = async (finalExcelBlob) => {
  const arrayBuffer = await finalExcelBlob.value.arrayBuffer();
  const options = {
    includeStyles: true
  }
  if (arrayBuffer) {
    spread.value.clearSheets();
    spread.value.suspendPaint();
    const excelIO = new ExcelIO.IO();
    excelIO.open(arrayBuffer, (json) => {
      spread.value.fromJSON(json);
      spread.value.resumePaint();
    },(error) => {
      console.error('Import failed: ', error)
    }, options);
  }
}
</script>

<template>
  <gc-spread-sheets :hostStyle="spreadStyles" @workbookInitialized="initSpread">
    <gc-worksheet></gc-worksheet>
  </gc-spread-sheets>
</template>

<style scoped>

</style>