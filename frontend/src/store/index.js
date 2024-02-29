import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      BASE_URL: '/', // 替换为你的实际 URL
      isAdmin: false // 或者你的逻辑来决定管理员状态
    };
  },
  // 你的 getters、mutations 和 actions
});

export default store;
