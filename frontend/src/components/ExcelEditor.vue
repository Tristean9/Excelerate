<template>
<div>
  <gc-spread-sheets
    :hostClass='hostClass'
  >
    <gc-worksheet
      :dataSource="dataTable"
      :autoGenerateColumns = 'autoGenerateColumns'
    >
      <gc-column
        :width="width"
        :dataField="'price'"
        :visible = 'visible'
        :formatter = 'formatter'
        :resizable = 'resizable'
      ></gc-column>
        </gc-worksheet>
      </gc-spread-sheets>
  </div>
</template>

<script>
import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css'
import '@grapecity/spread-sheets-vue'


export default {
data(){
  return {
    hostClass:'spread-host',
    autoGenerateColumns:true,
    width:300,
    visible:true,
    resizable:true,
    formatter:"$ #.00"
  }
},
computed:{
  dataTable(){
    let dataTable = [];
    for (let i = 0; i < 42; i++) {
      dataTable.push({price: i + 0.56})
    }
    return dataTable
  }
}
}
</script>
<style scoped>
.spread-host {
width: 500px;
height: 600px;
}
</style>
