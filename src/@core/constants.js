const { CONST = {} } = window;

window.__dynamic_base__ = CONST.CDN_URL;
export const APP = CONST.APP;
export const WEBAPP = CONST.WEBAPP?.split("/").pop() || APP;
export const APP_CONTEXT =
  (CONST.APP_CONTEXT == "/www" ? undefined : CONST.APP_CONTEXT) ||
  {
    pushapp: `/pushapp` || ``,
    // pushapp: `/__dynamic_base__` || ``,
    insights360: `/nexus/insights360` || ``,
    notebook: `/nexus/notebook` || ``,
  }[APP];
console.log(`APP_CONTEXT : `,APP_CONTEXT);
export const CDN_CONTEXT = CONST.CDN_CONTEXT || APP_CONTEXT;
export const API_CONTEXT = CONST.API_CONTEXT || APP_CONTEXT;
console.log(`API_CONTEXT : `,API_CONTEXT);
export const REMOTE_SERVER_URL = `${window.location.origin}${API_CONTEXT}`;
console.log(`REMOTE_SERVER_URL : `,REMOTE_SERVER_URL);
export const REMOTE_JS_URL = CONST.CDN_URL;
console.log(`REMOTE_JS_URL : `,REMOTE_JS_URL);