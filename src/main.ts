import { createApp } from 'vue'
import './reset.css'
import './style.sass'
import App from './App.vue'
import VueApexCharts from "vue3-apexcharts";
import ElementPlus from "element-plus";
import { createPinia } from 'pinia';
const app = createApp(App);

const pinia = createPinia();

app.use(VueApexCharts);
app.use(ElementPlus);
app.use(pinia);

(window as any).aidalaCalculator = app;

(window as any).injectAidalaCalculator = (id) => {
    app.mount(id);
};

(window as any).unmountAidalaCalculator = () => {
    app.unmount();
};
