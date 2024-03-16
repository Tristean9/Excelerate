// store/index.js
import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      processedExcelBlob: null,
      finalExcelBlob: {},
      checkedExcelBlob: null,
      rulesData: {},
      errorPosition: {}

    };
  },

  mutations: {
    setRulesData(state, data) {
      state.rulesData = data;
    },
    setProcessedExcelBlob(state, data) {
      state.processedExcelBlob = data;
    },
    setFinalExcelBlob(state, data) {
      state.finalExcelBlob = data;
    },
    setCheckedExcelBlob(state, data) {
      state.checkedExcelBlob = data;
    },
    setPreSelectedDropDowns(state, data) {
      state.preSelectedDropDowns = data;
    },
    DELETE_RULE(state, position) {
      delete state.rulesData[position]
    },
    setErrorPosition(state, data) {
      state.errorPosition = data
    }
  },
  actions: {
    fetchRulesData({ commit }, payload) {
      // 模拟从服务器获取数据
      commit('setRulesData', payload);
    },
    fetchProcessedExcelData({ commit }, payload) {
      commit('setProcessedExcelBlob', payload);
    },
    fetchFinalExcelData({ commit }, payload) {
      commit('setFinalExcelBlob', payload);
    },
    fetchCheckedExcelData({ commit }, payload) {
      commit('setCheckedExcelBlob', payload);
    },
    savePreSelectedDropDowns({ commit }, payload) {
      commit('setPreSelectedDropDowns', payload);
    },
    deleteRule({ commit }, position) {
      commit('DELETE_RULE', position)
    },
    fetchErrorPosition({ commit }, payload){
      commit('setErrorPosition', payload)
    }
  }
});

export default store;
