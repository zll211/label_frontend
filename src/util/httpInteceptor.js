import Vue from 'vue';
import VueResource from 'vue-resource';
import config from '../../config/hzzt';
Vue.use(VueResource);

Vue.http.interceptors.push((request, next) => {
    request.url =config.URL + request.url;
    //登录成功后将后台返回的TOKEN在本地存下来,每次请求从sessionStorage中拿到存储的TOKEN值
    let TOKEN=localStorage.Token;
    if(TOKEN){
        //如果请求时TOKEN存在,就为每次请求的headers中设置好TOKEN,后台根据headers中的TOKEN判断是否放行
        request.headers.set('Authorization',TOKEN);
    }else{
        window.location.href='./login.html';
    }
    // continue to next interceptor
    　　next((response) => {//在响应之后传给then之前对response进行修改和逻辑判断。对于token时候已过期的判断，就添加在此处，页面中任何一次http请求都会先调用此处方法
           if(response.body.ret_code===401){
              const logoutEvent = new CustomEvent('logout' , {
                  bubbles: true,
                  detail: {
                      msg: response.body.ret_msg,
                      code: response.body.ret_code,
                  }
              });
              document.dispatchEvent(logoutEvent);
              //window.location.href='./login.html';
              return false
          }

        return response;


    });
});
