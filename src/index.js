// import 'babel-polyfill';
import Vue from 'vue';
import App from './view/App';
import router from './router';
import store from './store';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/lib/font-awesome/css/font-awesome.min.css';
import './util/httpInteceptor'

Vue.use(ElementUI);


if(localStorage.Token){
    new Vue({
      el: '#app',
      store,
      router,
      template: '<App/>',
      components: { App },
    })
}else{
    window.location.href='./login.html';
}
