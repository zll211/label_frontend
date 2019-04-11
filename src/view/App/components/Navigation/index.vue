<template>
    <div :class="{ 'navOne': MenuState, 'navTwo': !MenuState }">
        <div class="profile">
            <div class="avatar">
                <span>{{avatar}}</span>
            </div>
            <div class="describe">
                <p>{{nickname}}</p>
                <span v-if="this.role_id===0||this.role_id==='0'">{{role}}</span>
                <span style="white-space:normal;width: 180px" v-else>{{hospital}} - {{role}}</span>
            </div>
        </div>
        <div class="nav">
            <ul class="listGroup" v-show="MenuState">
                <li class="listHeader">
                    导航
                </li>
                <router-link v-show="MenuState && item.path !== '/'" :to="item.path" tag="li"
                                 v-for="item in RouterConfig" :key="item.name">
                    <span> <i :class="item.icon" aria-hidden="true"></i></span> <a> {{item.name}}</a>
                </router-link>
            </ul>
            <ul class="listGroup" v-show="!MenuState">
                <router-link v-show="!MenuState && item.path !== '/'" :to="item.path" tag="li"
                             v-for="item in RouterConfig" :key="item.name + 1">
                    <span> <i :class="item.icon" aria-hidden="true"></i></span>
                    <p class="showTitle">{{item.name}}</p>
                </router-link>
            </ul>
        </div>
    </div>
</template>

<script>
    import RouterConfig from '../../../../util/router.config';
    import {mapState} from 'vuex';

    export default {
        data: function () {
            return {
                RouterConfig,
                nickname:JSON.parse(localStorage.userInfo).nickname,
                role:'',
                role_id:JSON.parse(localStorage.userInfo).role_id,
                hospital:JSON.parse(localStorage.userInfo).hospital,
                avatar:JSON.parse(localStorage.userInfo).nickname.substr(0,1)
            }
        },
        computed: mapState(['MenuState']),
      watch: {
        MenuState() {
          setTimeout(() => {
            this.$root.$emit('size-change');
          }, 350);
        }
      },
      created(){
          if(this.role_id===1||this.role_id==='1'){
            this.role='标注专家';
          }
          else if(this.role_id===2||this.role_id==='2'){
            this.role='审核专家';
          }

      },
    }
</script>

<style scope lang="scss">
    .navOne {
        min-width: 220px;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        background-color: #263238;
        transition: all 0.35s;
        -moz-transition: all 0.35s; /* Firefox 4 */
        -webkit-transition: all 0.35s; /* Safari 和 Chrome */
        -o-transition: all 0.35s; /* Opera */
        a:link, a:visited {
            text-decoration: none;
        }
        .profile {
            padding: 30px 20px 12px;
            background-image: url(./img/nav-profile.png);
            background-size: cover;
            .avatar {
                padding-bottom: 15px;
                span {
                    width: 60px;
                    height: 60px;
                    line-height: 60px;
                    background-color: #3D99E4;
                    border-radius: 50%;
                    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.1);
                    background-repeat: no-repeat;
                    background-size: cover;
                    background-position: center;
                    text-align: center;
                    display: inline-block;
                    vertical-align: middle;
                    color: #5D360B;
                    font-size: 1.6rem;
                }
            }
            .describe {
                p {
                    margin: 0 0 4px 0;
                    font-size: 14px;
                    color: #fff;
                }
                span {
                    display: block;
                    white-space: nowrap;
                    overflow: hidden;
                    color: #fff;
                    font-size: 10px;
                    text-overflow: ellipsis;
                    opacity: .8;
                }
            }
        }
        .nav {
            padding-top: 20px;
            li {
                display: flex;
                align-items: center;
                padding-left: 24px;
                margin:8px 0;
                &:first-child{
                    margin-top:0;
                }
                .fa {
                    color: white;
                }
                /*&:hover{*/
                    /*background-color: rgb(55,64,75);*/
                    /*box-shadow: inset 4px 0 0 0 rgb(103,164,248);*/
                    /*a{*/
                        /*color:rgb(103,164,248);*/
                    /*}*/
                    /*.fa{*/
                        /*color:rgb(103,164,248)*/
                    /*}*/
                /*}*/
                a:hover{
                    color:rgb(103,164,248);
                }
            }
            .listGroup {
                margin: 10px 0 20px 0;
                padding-left: 0;
                list-style-type: none;
                a {
                    color: #bdccd3;
                    display: block;
                    padding: 7px 8px;
                    font-size: 14px;
                    i {
                        vertical-align: text-bottom;
                        width: 1.8rem;
                        text-align: left;
                        font-size: 1.25em;
                    }
                    .arrow {
                        float: right;
                        line-height: 2;
                        padding-right: 0;
                        font-size: .8em;
                        text-align: center;
                        transition: transform 0.5s;
                    }
                }
                .listHeader {
                    color: #819ca9;
                    padding: 10px 0 10px 15px;
                    font-size: 14px;
                }
            }

            .router-link-active {
                background-color: rgb(55,64,75);
                box-shadow: inset 4px 0 0 0 rgb(103,164,248);
                a{
                    color:rgb(103,164,248);
                }
                .fa{
                    color:rgb(103,164,248)
                }
            }
        }
    }

    .navTwo {
        min-width: 50px;
        background-color: #263238;
        transition: all 0.35s;
        -moz-transition: all 0.35s; /* Firefox 4 */
        -webkit-transition: all 0.35s; /* Safari 和 Chrome */
        -o-transition: all 0.35s; /* Opera */
        a:link, a:visited {
            text-decoration: none;
        }
        .profile {
            display: none
        }
        .nav {
            li {
                height: 45px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                .showTitle {
                    display: none;
                }
                .fa {
                    color: white;
                }
            }

            .listGroup {
                margin: 0 0 20px 0;
                padding-left: 0;
                list-style-type: none;
                a {
                    color: #bdccd3;
                    display: block;
                    padding: 12px 18px;
                    font-weight: 600;
                }
            }
            .router-link-active {
                background-color: #3b4d56;
                .fa{
                    color:rgb(103,164,248);
                }
                a{
                    color:rgb(103,164,248);
                }
            }
            li:hover {
                position: relative;
                background-color: #3b4d56;
                .showTitle {
                    display: flex;
                    position: absolute;
                    z-index:2000;
                    width: 110px;
                    justify-content: center;
                    left: 50px;
                    font-size: 14px;
                    top: -14px;
                    height: 45px;
                    color: #bdccd3;
                    align-items: center;
                    background: #222a2f;
                }
            }
        }

    }
</style>
