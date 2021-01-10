import {App} from "./app.js";

const app = new App(document.getElementById('viewport'));

window.addEventListener('load', () => {

  window.onresize = () => {
    app.resize();
  }

  app.initialize();
});
