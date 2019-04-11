import Vue from 'vue'

export default class Api {
    static  loginOut = (url,params)=>{
        return Vue.http.post(url,params)
    }
}