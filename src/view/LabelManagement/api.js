import Vue from 'vue'

export default class Api {
    //获取列表
    static  getlist = (params)=>{
        return Vue.http.get('/labels',{params: params})
    }
    // 删除表格数据
    static  deleteTableRow = (id)=>{
        return Vue.http.delete(`/labels/${id}`)
    }
    /*//新增数据
    static  addTableRow = (params)=>{
        return Vue.http.post(`/labels`,params)
    }
    //修改数据
    static  editTableRow = (id,params)=>{
        return Vue.http.post(`/labels/${id}`,params)
    }*/

}

