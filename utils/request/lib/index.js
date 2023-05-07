"use strict";

const axios = require("axios");

const BASE_URL = process.env.WWEI_CLI_BASE_URL
  ? process.env.WWEI_CLI_BASE_URL
  : "http://127.0.0.1:7001";
//   : "http://wwei-cli-server.com:7001/";

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// 添加请求拦截器
request.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
request.interceptors.response.use(
  function (response) {
    if (response.status === 200) {
      return response.data;
    } else {
      Promise.reject(response);
    }
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

module.exports = request;
