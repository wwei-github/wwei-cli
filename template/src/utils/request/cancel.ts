import axios, { CancelToken, Method, Canceler } from "axios";
const pending = new Map<string, Canceler>();

type Config = {
  method?: Method;
  url?: string;
  params?: any;
  data?: any;
  cancelToken?: CancelToken;
};
export const addPending = (config: Config) => {
  const url = [
    config.method,
    config.url,
    JSON.stringify(config.params),
    JSON.stringify(config.data),
  ].join("&");
  config.cancelToken =
    config.cancelToken ||
    new axios.CancelToken((cancel) => {
      if (!pending.has(url)) {
        pending.set(url, cancel);
      }
    });
};
export const removePending = (config: Config) => {
  const url = [
    config.method,
    config.url,
    JSON.stringify(config.params),
    JSON.stringify(config.data),
  ].join("&");
  if (pending.has(url)) {
    const cancel = pending.get(url);
    cancel(url);
    pending.delete(url);
  }
};
export const clearPending = () => {
  pending.forEach((cancel, url) => {
    cancel(url);
  });
  pending.clear();
};
