// store/index.js
import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      BASE_URL: '/', // 替换为你的实际 URL
      isAdmin: false, // 或者你的逻辑来决定管理员状态
      processedExcelBlob: null
    };
  },

  mutations: {
    setRulesData(state, data){
      state.rulesData = data;
    },
    setProcessedExcelBlob(state, data){
      state.processedExcelBlob = data;
    }
  },
  actions: {
    fetchRulesData( { commit }, payload){
      // 模拟从服务器获取数据
      commit('setRulesData', payload);
    },
    fetchExcelFileData( { commit }, payload){
      commit('setProcessedExcelBlob', payload);
    }
  }

});

export default store;
