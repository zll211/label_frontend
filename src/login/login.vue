<template>
    <div id="container" style="windth:100%">
        <div class="loginWrap">

            <div class="loginBox">
              <p class="b-download"><a href="../browser/" target="_blank">浏览器下载</a></p>
                <div class="picture">
                    <img src="./img/login.png" alt="">
                </div>
                <div class="loginMessage">
                    <p>在线标注平台</p>
                    <el-form ref="loginForm" :model="loginForm"  class="loginForm" >
                        <el-form-item prop="userName">
                            <el-input v-model="loginForm.name"  placeholder="请输入用户名" >
                                <i slot="prefix" class="fa fa-user-o"></i>
                            </el-input>
                        </el-form-item>
                        <el-form-item prop="userPassword">
                            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码">
                                <i slot="prefix" class="fa fa-unlock-alt"></i>
                            </el-input>
                        </el-form-item>
                        <el-form-item  class="remember" prop="type">
                            <el-checkbox-group v-model="loginForm.type">
                                <el-checkbox label="记住用户名" :checked="loginForm.rememberState"  name="type" @change="checkRemember" ></el-checkbox>

                            </el-checkbox-group>
                        </el-form-item>
                        <el-form-item class="errorInfo" v-show="errorInfoShow">
                            用户名或密码错误
                        </el-form-item>
                        <el-form-item >
                            <el-button type="primary" class="loginBtn"  @click="login()">登录</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
        </div>


    </div>

</template>

<script>
    import Vue from 'vue';
    import config from '../../config/hzzt';
    export default {
        name: 'Login',
        data() {
            return{
                loginForm: {
                    name: localStorage.username,
                    password: localStorage.pw,
                    type:[],
                    rememberState:false
                },
                /*name:'',
                password:'',*/
                errorInfoShow:false
            }
        },
        created(){
            if(localStorage.username){
                this.loginForm.rememberState=true
            }else {
                this.loginForm.rememberState=false
            }
            this.testChrome();
        },
        methods:{
          testChrome(){
            let userAgent = navigator.userAgent;
            // console.log(userAgent);
            if(userAgent.indexOf("Chrome")===-1){
              this.$message.warning('为了更好的浏览效果，请下载谷歌浏览器进行浏览')
            }
          },
            login() {
                let params = {
                    username: this.loginForm.name,
                    password: this.loginForm.password
                }
                this.$http.post(config.URL+'/auth/login', params).then(
                    (response) => {
                        if(response.body.hasOwnProperty('data')&&response.body.ret_code === 0){
                            localStorage.Token = response.body.data.token;
                            localStorage.userInfo = JSON.stringify(response.body.data.user);
                            window.location.href='./';
                            this.errorInfoShow=false

                            if(this.loginForm.rememberState === true){
                                localStorage.username=this.loginForm.name;
                                localStorage.pw=this.loginForm.password;
                            }else{
                                localStorage.username = '';
                                localStorage.pw = '';
                            }
                        }else{
                            //alert(response.body.ret_msg)
                            this.errorInfoShow=true
                        }

                    }, (error) => {
                        // 响应错误回调
                    });

            },
            checkRemember(state){
                this.loginForm.rememberState=state

            }
        }
    }
</script>

<style lang="scss">
    html,
    body {
        width: 100%;
        height: 100%;
        margin: 0 !important;
        background: #ffffff;
        font-family: hzztFont;
    }
    #container {
        height: 100%;
        width: 100%;
        flex-flow: column;
        /*background: #ffffff;*/
        display: flex;
        justify-content: center;
        align-items: center;
        background: url(./img/bg.png);
    }
    .loginWrap{

        .loginBox{
            width:785px;
            height:280px;
            background:rgba(255,255,255,1);
            border-radius:15px;
            position:absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            margin: auto;
            padding: 124px 108px 112px 40px;
            box-shadow: 0px 16px 24px 0px rgba(11, 34, 70, 0.44);
            display: flex;
          .b-download{
            position:absolute;
            top:-50px;
            right:3px;
            a{
              text-decoration: none;
              color:#4b4848;
              font-size:17px;
            }
          }
            .picture{
                flex: 2;
                margin-right:40px;
                padding: 16px;
                img{
                    width:auto;
                    height: auto;
                    width:100%;
                    height:100%;
                }

            }
            .loginMessage{
                flex: 1.3;
                p{
                    text-align: center;
                    height:59px;
                    font-size:36px;
                    font-family:PingFangSC-Regular;
                    color:rgba(34,34,34,1);
                    line-height:59px;
                    margin-top: -56px;
                }
                .loginForm{
                    .el-input__inner{
                        border: 0;
                        border-bottom: 2px solid rgba(236,236,236,1);
                    }
                    i{
                        color: #4F93FE;
                    }
                    .remember{
                        .el-form-item__content{
                            margin-left: 4px;
                            margin-top: -8px;
                            .el-checkbox__inner{
                                border:1px solid #4F93FE;
                            }
                        }

                    }
                    .el-button--primary{
                        width: 100%;
                        border-radius:30px;
                    }
                    .errorInfo{
                        margin: 0;
                        color: red;
                        .el-form-item__content{
                            margin-top: -20px;
                            line-height: 0;
                        }
                    }
                }

            }
        }
    }
    @media screen and (max-width: 1366px){
        .loginWrap{
            .loginBox{
                display: flex;
                width:600px;
                height: 200px;
                .loginMessage{
                    p{
                        margin-top:-85px;
                        margin-bottom:4px;
                        font-size: 24px;
                    }
                    .reset{
                        margin-top: -10px;
                    }
                    .el-button{
                        line-height: 0.5;
                    }

                }
            }
        }

    }

</style>
