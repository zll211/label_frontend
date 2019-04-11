import Vue from 'vue'
import Router from 'vue-router'
import RouterConfig from '../util/router.config';

Vue.use(Router);
let routes = RouterConfig;

export default new Router({
    mode: 'hash',
    routes
})
