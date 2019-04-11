import Vue from 'vue'

export default class Api {
  // 获取来源列表
  static  sourceList = (url,params)=>{
    return Vue.http.get(url,{params: params})
  }
  //得到文件目录
  static getFileDirectory = (url,params)=>{
    return Vue.http.get(url,{params: params});
  }
  //提交修改目录
  static  postConfig = (url,params)=>{
      return Vue.http.post(url,params)
  }
  // 删除类别
  static  deleteCate = (url,params)=>{
      return Vue.http.delete(url,{body:params})
  }
  //得到医院的所有分类
  static createGroup = (url,params) =>{
    return Vue.http.get(url,{params: params});
  }
  //保存医院
  static saveHospital = (url,params)=>{
    return Vue.http.post(url,params);
  }
  //编辑医院
  static editSource = (url,params)=>{
    return Vue.http.put(url,params);
  }
  //删除医院
  static deleteSource = (url,params)=>{
    return Vue.http.delete(url,{params:params})
  }

}