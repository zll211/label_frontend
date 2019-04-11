<template>
    <div class="pannel">
        <div class="banner" v-if="showBanner">
             <slot name="banner"></slot>
        </div>
        <div class="main" v-bind:class="{ marginTop: showBottom}">
             <slot name="main"></slot>
        </div>
    </div>
</template>
<script>
    import Vue from 'vue';
    export default {
        name: 'Pannel',
        props: {
            title: '',
            banner: {
                type: Boolean,
                default: true
            },
            bottom:{
                type: Boolean,
                default: true
            }
        },
        data() {
            // console.log(this.bottom,this.banner,'---k')
            return {
                list: this.title,
                showBanner: this.banner,
                showBottom: this.bottom
            }
        }

    }
</script>
<style  scope lang="scss">
    .pannel{
        display: flex;
        flex-direction: column;
        background: #f3f3f3;
        padding: 20px;
        box-sizing: border-box;
        height: 100%;
        .title{
            height: 80px;
            background: #f3f3f3;
            display: flex;
            align-items: center;
            .active{
                border-left: 3px solid #4f93fe;
                :first-child{
                    padding-left: 8px;
                    font-weight: bold;
                }
            }
            .el-breadcrumb__inner{
                font-size: 16px;
            }
        }
        .banner{
            padding: 0 24px;
            height: 60px;
            display: flex;
            align-items: center;
            background: #FFFFFF;
        }
        .main{
            flex: 1;
            background: #fff;
            border-radius: 4px;
            display: flex;
        }
        .marginTop{
            padding-bottom: 60px;
            position: relative;
        }
    }
</style>
