import Vue from 'vue';

export default class slideViewService {

  //获取图片信息接口
  static  getImageInfo = (url, params) => {
    return Vue.http.get(url, {params: params})
  }

  //获取标注列表
  static labelList = (url, params) => {
    return Vue.http.get(url, {params: params})
  }

  //保存标注
  static saveLabel = (url, content, filename) => {
    return Vue.http.post(url, [content], {params: {path: filename}})
  }

  //删除标注
  static deleteLabel = (url, id, fileName) => {
    return Vue.http.delete(url, {params: {path: fileName}, body: {id}});
  }

  //编辑标注
  static modifyLabel = (url, id, content, fileName) => {
    return Vue.http.patch(url, [Object.assign({id:id},content)], {params: {path: fileName}});
  }

  //导航器的点的获取
  static navigatorPointList = (url, params) => {
    return Vue.http.get(url, {params: params});
  }

  //存储导航器的点
  static navigatorPoint = (url, content, fileName) => {
    return Vue.http.post(url, content, {params: {path: fileName}});
  }


}