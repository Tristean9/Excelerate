// src/api/http.js

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  // 这里可以添加其他全局设置，如headers
});

export default axiosInstance;
