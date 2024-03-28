// store/index.js
import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      processedExcelBlob: null,
      excelAndRuleData: {},
      checkedExcelBlob: null,
      rulesData: {},
      errorPosition: [],
      positionRule: {},
      preSelectedDropDowns: {},
      preSelectedField: {},

    };
  },

  mutations: {
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

  },
  actions: {
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
    }
  }
});

export default store;


