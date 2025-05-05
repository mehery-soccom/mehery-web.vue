const { CONST = {} } = window;

export const APP = CONST.APP || "pushapp";
export const APP_CONTEXT =
  (CONST.APP_CONTEXT == "/www" ? undefined : CONST.APP_CONTEXT) ||
  {
    pushapp: `/pushapp` || ``,
    // pushapp: `/__dynamic_base__` || ``,
    insights360: `/nexus/insights360` || ``,
    notebook: `/nexus/notebook` || ``,
  }[APP];
export const REMOTE_SERVER_URL =
  CONST.remoteServerUrl || window.location.origin;
export const REMOTE_JS_URL = CONST.remoteJsUrl;
