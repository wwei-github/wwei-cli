import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { addPending, removePending } from "./cancel";
import qs from "qs";

const rq = axios.create({
  baseURL: "http://vip-api.yidengxuetang.cn",
  // baseURL: "http://localhost:8000/2016-08-15/proxy/YD_VIP/app",
  timeout: 30000,
  // headers: {
  //   "content-type": "application/json;charset=utf-8",
  // },
  // withCredentials: true,
});
rq.interceptors.request.use((config: AxiosRequestConfig) => {
  // 请求拦截部分
  addPending(config);
  return config;
});
rq.interceptors.response.use(
  (res: AxiosResponse) => {
    // 请求响应部分
    removePending(res);
    return res.data as any;
  },
  (err) => {
    if (!axios.isCancel(err)) {
      console.error(err);
    }
  }
);
const http = {
  get(url: string) {
    return rq({
      url: url,
      method: "GET",
    });
  },
  post(url: string, params = {}) {
    return rq({
      url: url,
      method: "POST",
      // 将对象序列化成URL的形式，以&进行拼接
      data: qs.stringify(params),
    });
  },
};
export { http };
