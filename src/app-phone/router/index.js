import { CDN_CONTEXT, WEBAPP } from "@core/constants";
import { canNavigate } from "@layouts/plugins/casl";
import { createRouter, createWebHistory } from "vue-router";

import routes from "~pages";
// import { setupLayouts } from "virtual:generated-layouts";
function setupLayouts(routes) {
  return routes.map((route) => {
    return {
      path: route.path,
      meta: route.meta,
      component: () =>
        import(`../layouts/${route.meta?.layout || "default"}.vue`),
      children: route.path === "/" ? [route] : [{ ...route, path: "" }],
    };
  });
}

import { isUserLoggedIn } from "./utils";

const _routes = routes
  .map((r) => {
    let nameArr = r.name.split("-");
    let pathArr = r.path.slice(1).split("/");
    let _r = { ...r };
    _r.appName = nameArr[0];
    nameArr.shift();
    pathArr.shift();
    _r.name = nameArr.join("-");
    _r.path = `/${pathArr.join("/")}`;

    return _r;
  })
  .filter((r) => {
    return r.appName === `app_${WEBAPP}`;
  });
/*
console.log(_routes);
{
    "name": "apps-invoice-list",
    "path": "/apps/invoice/list",
    "component": () => import("path-to-component")
}
*/

const routesWithLayout = setupLayouts(_routes);
/*
console.log(routesWithLayout);
{
    "path": "/apps/invoice/list",
    "component": () => import("path-to-layout"),
    "children": [
        {
            // `component` will be rendered inside `layout's` <router-view>, when /apps/invoice/list is matched
            "name": "apps-invoice-list",
            "path": "",
            "component": () => import("path-to-component"),
            "props": true, // route.params are passed as props to component
            "meta": {}
        }
    ]
}
*/

const router = createRouter({
  history: createWebHistory(CDN_CONTEXT),
  routes: [
    // ℹ️ We are redirecting to different pages based on role.
    // NOTE: Role is just for UI purposes. ACL is based on abilities.
    {
      path: "/",
      redirect: (to) => {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const userRole = userData && userData.role ? userData.role : null;
        if (userRole === "admin") return { name: "dashboards-analytics" };
        if (userRole === "client") return { name: "access-control" };

        return { name: "login", query: to.query };
      },
    },
    {
      path: "/pages/user-profile",
      redirect: () => ({
        name: "pages-user-profile-tab",
        params: { tab: "profile" },
      }),
    },
    {
      path: "/pages/account-settings",
      redirect: () => ({
        name: "pages-account-settings-tab",
        params: { tab: "account" },
      }),
    },
    ...routesWithLayout,
  ],
});

// Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
router.beforeEach((to) => {
  const isLoggedIn = isUserLoggedIn();

  /*
  
    ℹ️ Commented code is legacy code
  
    if (!canNavigate(to)) {
      // Redirect to login if not logged in
      // ℹ️ Only add `to` query param if `to` route is not index route
      if (!isLoggedIn)
        return next({ name: 'login', query: { to: to.name !== 'index' ? to.fullPath : undefined } })
  
      // If logged in => not authorized
      return next({ name: 'not-authorized' })
    }
  
    // Redirect if logged in
    if (to.meta.redirectIfLoggedIn && isLoggedIn)
      next('/')
  
    return next()
  
    */
  if (canNavigate(to)) {
    if (to.meta.redirectIfLoggedIn && isLoggedIn) return "/";
  } else {
    if (isLoggedIn) return { name: "not-authorized" };
    else
      return {
        name: "login",
        query: { to: to.name !== "index" ? to.fullPath : undefined },
      };
  }
});
export default router;
