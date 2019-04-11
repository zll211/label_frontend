import Vue from 'vue'

export default class Api {
    //获取表格
    static getlist = (url,params)=>{
        return Vue.http.get(url,{params: params})
    };
    //一键分配
    // static allotList = (url,params)=>{
    //     return Vue.http.get(url,{params: params})
    // }
}