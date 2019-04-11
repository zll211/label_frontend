import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        MenuState: true
    },
    mutations: {
        MenuStateTaggle (state) {
            state.MenuState = !state.MenuState;
        },
        HiddenStateTaggle (state) {
            state.MenuState = false;
        },
        ShowStateTaggle (state) {
            state.MenuState = true;
        }
    }
});