import admin from "./admin";
import appAndPages from "./app-and-pages";
import charts from "./charts";
import dashboard from "./dashboard";
import forms from "./forms";
import others from "./others";
import uiElements from "./ui-elements";

export default [
  ...dashboard,
  ...admin,
  ...appAndPages,
  ...uiElements,
  ...forms,
  ...charts,
  ...others,
];
