import Vue from 'vue'

export default class Api {
    /*获取医院列表*/
    static  hospitalList = (url,params)=>{
        return Vue.http.get(url,{params: params})
    }
    //用户信息展示
    static userDetail = (url,params) =>{
        return Vue.http.get(url,{params: params})
    }
    static userGroup = (url,params) =>{
        return Vue.http.get(url,{params: params})
    }
    //新建用户
    static createUser = (url,data) => {
        return Vue.http.post(url,data);
    }
    //新建工作组
    static createGroup = (url,params) =>{
        return Vue.http.get(url,{params: params});
    }
    //保存工作组
    static saveGroup = (url,data) =>{
        return Vue.http.post(url,data);
    }
    //修改用户
    static patchUser = (url,data) => {
        return Vue.http.put(url,data);
    }
    //修改工作组
    static patchGroup = (url,data) => {
        return Vue.http.put(url,data);
    }
    //删除用户
    static deleteUser = (url) => {
        return Vue.http.delete(url);
    }
    //删除用户组
    static deleteGroup = (url) => {
        return Vue.http.delete(url);
    }


}
