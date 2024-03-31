// store/index.js
import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      excelFileName: "",
      checkedExcelFileName: "",
      processedExcelBlob: null,
      excelAndRuleData: {}, 
      checkedExcelBlob: null,
      rulesData: {},  // 返回的规则数据
      errorPosition: [], //数据错误位置
      positionRule: {}, // 数据错误的规则
      preSelectedDropDowns: {}, // 预选过的选项
      preSelectedField: {}, // 预选过的字段

      contactedData: null,  // 合并后的总表
      exampleExcelBlob:null, // 合并钱前选择的样表
      recheckExcelInfo: {},  // 合并阶段，检验信息
      summaryExcelBlob: null
    };
  },

  mutations: {
    setExcelFileName(state, name) {
      state.excelFileName = name;
    },
    setCheckedExcelFileName(state, name) {
      state.checkedExcelFileName = name;
    },
    setRulesData(state, data) {
      state.rulesData = data;
    },
    setProcessedExcelBlob(state, data) {
      state.processedExcelBlob = data;
    },
    setExcelAndRuleData(state, data) {
      state.excelAndRuleData = data;
    },
    setCheckedExcelBlob(state, data) {
      state.checkedExcelBlob = data;
    },
    setPreSelectedDropDowns(state, data) {
      state.preSelectedDropDowns = data;
    },
    setPreSelectedField(state, data) {
      state.preSelectedField = data;
    },
    DELETE_RULE(state, position) {
      delete state.rulesData[position]
    },
    setErrorPosition(state, data) {
      state.errorPosition = data
    },
    setPositionRule(state, data){
      state.positionRule = data
    },
    setExampleExcelBlob(state, data){
      state.exampleExcelBlob = data
    },
    setRecheckExcelInfo(state, data){
      state.recheckExcelInfo = data
    },
    setSummaryExcelBlob(state, data){
      state.summaryExcelBlob = data
    }

  },
  actions: {
    saveExcelFileName({ commit }, name ){
      commit('setExcelFileName', name)
    },
    saveCheckedExcelFileName({ commit }, name ){
      commit('setCheckedExcelFileName', name)
    },
    fetchRulesData({ commit }, payload) {
      // 模拟从服务器获取数据
      commit('setRulesData', payload);
    },
    fetchProcessedExcelData({ commit }, payload) {
      commit('setProcessedExcelBlob', payload);
    },
    fetchExcelAndRuleData({ commit }, payload) {
      commit('setExcelAndRuleData', payload);
    },
    fetchCheckedExcelData({ commit }, payload) {
      commit('setCheckedExcelBlob', payload);
    },
    savePreSelectedDropDowns({ commit }, payload) {
      commit('setPreSelectedDropDowns', payload);
    },
    savePreSelectedField({ commit }, payload) {
      commit('setPreSelectedField', payload);
    },
    deleteRule({ commit }, position) {
      commit('DELETE_RULE', position)
    },
    fetchErrorPosition({ commit }, payload){
      commit('setErrorPosition', payload)
    },
    fetchPositionRule({ commit }, payload){
      commit('setPositionRule', payload)
    },
    saveExampleExcelBlob({ commit }, data){
      commit('setExampleExcelBlob', data)
    },
    fetchRecheckExcelInfo({ commit }, payload){
      // console.log("fetchRecheckExcelInfo", payload);
      commit('setRecheckExcelInfo', payload)
    },
    saveSummaryExcelBlob({ commit }, data){
      commit('setSummaryExcelBlob', data)
    }
  }
});

export default store;


