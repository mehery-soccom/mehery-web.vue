const { CONST = {} } = window;

export const APP = CONST.APP || "pushapp";
export const APP_CONTEXT = {
  pushapp: `/pushapp` || ``,
  // pushapp: `/__dynamic_base__` || ``,
  insights360: `/insights360` || ``,
  notebook: `/notebook` || ``,
}[APP];
export const REMOTE_SERVER_URL =
  CONST.remoteServerUrl || "https://demo.mehery.xyz";
export const REMOTE_JS_URL = CONST.remoteJsUrl;
