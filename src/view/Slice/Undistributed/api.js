import Vue from 'vue'

export default class Api {
    // 获取列表
    static  getlist = (params)=>{
        return Vue.http.get('/slices',{params: params})
    }
    // 查找级联选择器分类
    static  searchType = (params)=>{
        return Vue.http.get('/cate',{params: params})
    }
    //获取标注专家
    static  getLabelUserName = ()=>{
        return Vue.http.post('/label_users')
    }
    //多例分配
    static  assignLabel = (params)=>{
        return Vue.http.post('/assign_label',{...params})
    }
    //一键分配
    static  assignAllLabel = ()=>{
        return Vue.http.post('/assign_all_label')
    }
    //扫描切片
  static  scanSlice = (params)=>{
    return Vue.http.get('/slices/scan',{params: params})
  }


}

