const { CONST = {} } = window;

export const APP = CONST.APP || "app";
export const APP_CONTEXT = { app: `/pushapp` || `` }[APP];
export const REMOTE_SERVER_URL = CONST.remoteServerUrl;
export const REMOTE_JS_URL = CONST.remoteJsUrl;
