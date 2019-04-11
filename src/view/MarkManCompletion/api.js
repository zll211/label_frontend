import Vue from 'vue'

export default class Api {
    // 获取工作完成度
    static  getProgress = (params)=>{
        return Vue.http.get('/dashboard/progress',{params: params})
    }

}

