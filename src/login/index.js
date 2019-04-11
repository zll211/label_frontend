import Vue from 'vue';
import Login from './login';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import '../assets/lib/font-awesome/css/font-awesome.min.css';
import VueResource from 'vue-resource';
Vue.use(VueResource);
Vue.use(ElementUI);

new Vue({
  el: '#app',
  template: '<Login/>',
  components: { Login },
})
