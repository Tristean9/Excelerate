<script setup>

// 字体高亮
const toggleFontColor = () => {
  if (!spread.value) return;
  const sheet = spread.value.getActiveSheet();
  const selections = sheet.getSelections();
  selections.forEach((range) => {
    for (let r = range.row; r < range.row + range.rowCount; r++) {
      for (let c = range.col; c < range.col + range.colCount; c++) {
        let cell = sheet.getCell(r, c);
        if (cell.foreColor() === redColor){
          cell.foreColor(blackColor);
        } else {
          cell.foreColor(redColor);
        }
      }
    }
  });
};
// 背景高亮
const toggleHighlightCells = () => {
  if (!spread.value) return;
  const sheet = spread.value.getActiveSheet();
  const selections = sheet.getSelections();

  selections.forEach((range) => {
    for (let r = range.row; r < range.row + range.rowCount; r++) {
      for (let c = range.col; c < range.col + range.colCount; c++) {
        let cell = sheet.getCell(r, c);
        if (cell.backColor() === highlightColor) {
          cell.backColor('transparent'); // 取消高亮，设置为透明或默认颜色
        } else {
          cell.backColor(highlightColor); // 应用高亮
        }
      }
    }
  });

}
</script>

<template>

</template>

<style scoped>

</style>