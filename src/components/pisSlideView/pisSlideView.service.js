import Vue from 'vue';


/**
 * @class
 */
class PisSlideViewService {

  getImageInfo(fileName) {
    return Vue.http.get(`/slice/info`, {params: {file: fileName}});
  }


  labelList(params) {
    return  Vue.http.get(`/image_annotation`, {params});
  }

  saveLabel(content,fileName) {
    return  Vue.http.post(`/image_annotation`,  content, {params: {path: fileName}});
  }

  deleteLabel(id,fileName) {
    return  Vue.http.delete(`/image_annotation`, {params: {path: fileName}, body: {id: id}});
  }

  modifyLabel(id, content,fileName) {
    return  Vue.http.patch(`/image_annotation`, content, {params: {path: fileName}});
  }

  navigatorPointList(fileName) {
    return  Vue.http.get(`/image_annotation/above`, {params: {path: fileName}});
  }

  navigatorPoint(content, fileName) {
    return  Vue.http.post(`/image_annotation/above`, content, {params: {path: fileName}});
  }

  labelImageList(params) {
    return  Vue.http.get(`/slice/labels`, {params});
  }

  labelCount(fileName) {
    return  Vue.http.get(`/image_annotation/count`, {params: {path: fileName}});
  }

  labelAverageInfo(fileName) {
    return  Vue.http.get(`/image_annotation/mean`, {params: {path: fileName}});
  }

}

const pisSlideViewService = new PisSlideViewService();

export {pisSlideViewService};
