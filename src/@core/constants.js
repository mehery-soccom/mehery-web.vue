const { CONST = {} } = window;

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
export const CDN_CONTEXT = CONST.CDN_CONTEXT || APP_CONTEXT;

export const API_CONTEXT = CONST.API_CONTEXT || APP_CONTEXT;
export const REMOTE_SERVER_URL = window.location.origin + CONST.API_CONTEXT;
