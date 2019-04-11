import Vue from 'vue'

export default class Api {
    /*static  getlist = (url,params)=>{
        return Vue.http.get(url,{params: params})
    }*/
    // static  getData = (params)=>{
    //     return Vue.http.get('/dashboard',{...params})
    // }

    // 切片收录量统计查询
    static  getDrawLineData = (params)=>{
        return Vue.http.get('/dashboard/insert',{params: params})
    }
    // 切片种类统计查询
    static  queryDrawPieData = (params)=>{
        return Vue.http.get('/dashboard/cates',{params: params})
    }
    // 根据角色id获取用户
    static  getRoleUsers = (params)=>{
        return Vue.http.get('/dashboard/role_users',{params: params})
    }
    static  queryDrawBarData = (params)=>{
        return Vue.http.get('/dashboard/progress',{params: params})
    }
}