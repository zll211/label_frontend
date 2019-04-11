<template>
    <div class="headerBox">
        <div :class="{ 'leftOne': MenuState, 'leftTwo': !MenuState }">
            <div class="logo"></div>
            <div class="title">标注软件系统</div>
        </div>
        <div class="right">
            <div class="menu-icon" v-on:click = "menuShowTaggle()">
                <i class="fa fa-bars" aria-hidden="true"></i>
            </div>
            <div class="menu-info">
                <el-dropdown @command = "command" >
                    <el-button type="primary">
                       {{nickname}}
                       <i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="loginOut">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
        <el-dialog
                title="提示"
                :visible.sync="centerDialogVisible"
                width="30%"
                @close="cancel"
                center>
            <span>登录信息已过期，请重新登录！</span>
            <span slot="footer" class="dialog-footer">
                <!--<el-button @click="centerDialogVisible = false">取 消</el-button>-->
                <el-button type="primary" @click="dialogTrue">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import {mapState} from 'vuex';
    import Api from '../../api';
    export default {
        data() {
            return {
                centerDialogVisible: false,
                nickname:JSON.parse(localStorage.userInfo).nickname
            };
        },
        mounted(){
          document.addEventListener('logout', (e) => {
              this.centerDialogVisible=true
          })
        },
        computed: mapState(['MenuState']),
        methods: {
            dialogTrue(){
                this.centerDialogVisible = false;
                window.location.href='./login.html';
            },
            cancel(){
                window.location.href='./login.html';
            },
            menuShowTaggle: function(){
                this.$store.commit('MenuStateTaggle');
                //这里一定要延迟执行，不然切片得到的宽高还是上一次的
                setTimeout(() => {
                    this.$root.$emit('size-change');
                }, 350);
            },
            command(type) {
                this[`${type}`]();
            },
            async loginOut(){
                const result =  await Api.loginOut('/auth/logout', {user_id:localStorage.userInfo !== undefined? JSON.parse(localStorage.userInfo).id: undefined});
                localStorage.clear();
                window.location.href='./login.html';
            },
            open() {
               this.$message({
                    message: '退出失败，请重试！',
                    type: 'warning'
                });
            }

        }

    }
</script>

<style scope lang="scss">
    .headerBox{
    flex: 1;
    display: flex;
    color: #fff;
    .leftOne{
        width: 220px;
        height: 40px;
        line-height: 40px;
        background-color: #263238;
        transition: width 0.35s;
        -moz-transition: width 0.35s; /* Firefox 4 */
        -webkit-transition: width 0.35s; /* Safari 和 Chrome */
        -o-transition: width 0.35s; /* Opera */
    }
    .leftTwo{
        width: 50px;
        height: 40px;
        transition: width 0.35s;
        -moz-transition: width 0.35s; /* Firefox 4 */
        -webkit-transition: width 0.35s; /* Safari 和 Chrome */
        -o-transition: width 0.35s; /* Opera */
        line-height: 40px;
        background-color: #263238
    }
    .logo{
        float: left;
        width: 50px;
        height: 100%;
        background-size: 25px;
        background-position: center center;
        background-repeat: no-repeat;
        background-image: url(./img/logo.png);
    }
    .title{
        height: 100%;
        line-height: 40px;
        transition: color 0.35s;
        font-size: 18px;
        //border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
    .right{
        flex: 1;
        display: flex;
        justify-content: space-between;
        .menu-icon{
            width: 38px;
            border-right: 1px solid rgba(0, 0, 0, 0.05);
            display: flex;
            cursor: pointer;
            justify-content: center;
            font-size: 18px;
            align-items: center;
            .fa{
                color: #fff;
            }
            // background-size: 23px;
            // background-position: center center;
            // background-repeat: no-repeat;
            // background-image: url(./img/menu-logo.png);
        }
        .menu-icon:hover{
            background-color: #313f47;
            color: #f7f7f7;
            cursor: pointer;
        }
        .menu-info{
            display: flex;
            padding: 0;
            font-size: 14px;
            align-items: center;
            border-left: 1px solid rgba(0, 0, 0, 0.05);
            color: white;
            cursor: pointer;
            .user-img{
                display: inline-block;
                width: 30px;
                height: 100%;
                background-size: 16px;
                background-position: center center;
                background-repeat: no-repeat;
                background-image: url(./img/user-icon.png);
            }
        }
        .el-dropdown{
            display: flex;
            position: relative;
            color: #606266;
            font-size: 14px;
            justify-content: center;
            align-items: center;
            height: 100%;
            background: pink;
        }
        .el-button{
            color: #fff;
            background-color: #3b4d56;
            border-color: #3b4d56;
            padding: 0 24px;
            height: 100%;
            border-radius: 0;
        }
        .el-button:hover{
            background-color: #313f47;
            color: #f7f7f7;
            cursor: pointer;
        }

    }
}
</style>
