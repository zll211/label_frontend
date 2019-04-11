import Vue from 'vue'

export default class Api {
    // 获取待审核列表
    static  getlist = (params)=>{
        return Vue.http.get('/slices',{params: params})
    }
    //阅片页面的获取右上角标注列表
    static getMarkList = (url,params)=>{
        return Vue.http.get(url,{params:params})
    }

    //获取每张切片标注的图片（右下角）
    static getMarkedImage = (url,params) =>{
        return Vue.http.get(url,{params:params})
    }
    //获取切片的所有大小类（级联选项）
    static getOptions = (url,params)=>{
        return Vue.http.get(url,{params:params})
    }
    //保存审核或者标注结果的接口
    static saveResult = (url,params) =>{
        return Vue.http.post(url,params);
    }



}

