<template>
  <div class="dialog">

    <el-dialog :visible.sync="visible" :title="name" width="900px" class="allDialog" :before-close="cancel"
               :modal-append-to-body="isbody" top="9vh" :show-close=false>
      <div class="all-content">
        <div class="data-left">
          <p class="left-title">待分配切片</p>
          <div class="left-tree">
            <el-tree :data="messagesData"
                     show-checkbox
                     default-expand-all
                     node-key="cate_id"
                     @check="getNode"
                     ref="messageTree"
                     :default-checked-keys="defaultChecked"
                     v-loading="leftLoading">
                       <span class="custom-tree-node" slot-scope="{ node, data }">
                        <!--<i class="second-icon" v-if="data.children"></i>-->
                         <!--<i class="type-icon" v-else></i>-->
                        {{ node.label }}
                        <span style="margin-left:5px;" >({{data.sum}})</span>
                         <!--<span>{{data.position}}</span>-->
                        </span>

            </el-tree>
          </div>

        </div>
        <p class="center-icon"><img src="./img/hebing.png" alt=""></p>
        <div class="mark-right">
          <p class="right-title">{{rolename}}</p>
          <div class="wrapDetail" v-loading="rightLoading">
            <div v-if="usersData&&usersData.length>0">
              <div class="detail" v-for="(item,index) in usersData" :key="index">
                <p class="detailTitle"><i class="hospital-icon"></i><i class="second-icon"></i><span>{{item.hospital_name}}</span>
                </p>
                <ul class="detailItems">
                  <li class="item" v-for="(data,index) in item.users" :key="index">
                    <el-popover
                      placement="right"
                      width="100"
                      trigger="hover"
                      v-if="data.cates.length>0"
                      popper-class="dialog-popover">
                      <p v-for="(name,index) in data.cates" :key="index">{{name.cate_name}}</p>
                      <i slot="reference" :class="{checked:data.checked}" @click.stop="handleChecked(data.user_id)"></i>
                    </el-popover>
                    <i v-else slot="reference" :class="{checked:data.checked}"
                       @click.stop="handleChecked(data.user_id)"></i>

                    <p class="name">{{data.nickname}}
                    </p>
                    <p class="bigTyped" style="font-size:12px;">总数{{data.all}}/未完成{{data.pending}}</p>
                  </li>
                </ul>
              </div>
            </div>
            <div v-else style="height:100%;display:flex;align-items:center;">
              <div style="width:100%; color:#6f7180;">请勾选想要分配的切片！</div>
            </div>

          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit" :disabled="isAbled">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>

      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Dialog",
    props: {
      name: String,
      visible: false,
      usersData: {
        type:Array,
        default:() =>[],
      },
      messagesData: {
        type:Array,
        default:()=>[],
      },
      rightLoading: false,
      leftLoading: false,
      onekey: false,
      rolename: String,
      isAbled:Boolean,
      categoryId:{
        type:Array,
        default:()=>[],
      },

    },

    data() {
      return {
        user_ids: [],
        slice_ids: [],
        config_ids: [],
        checkSet: new Set(),
        isbody: false,

      }
    },
   computed:{
     defaultChecked(){
       if(this.messagesData.length===1&&this.messagesData[0].children.length===1){
         return [this.messagesData[0].children[0].cate_id]
       }
       else {
         return [];
       }
     },
     sliceCount(){
       let count = 0;
       this.messagesData.forEach((item)=>{
         count+=item.sum;
       })
       return count;
     }
   },


    methods: {
      cancel() {
        this.$emit("cancelClick");
      },
      handleSubmit() {
        this.user_ids = [];
        for (let id of this.checkSet) {
          this.user_ids.push(id);
        }
        if (!this.onekey) {
          this.slice_ids = [];
          let arr = this.$refs['messageTree'].getCheckedKeys(true);
          arr.forEach(val => {
            this.messagesData.forEach((item) => {
              item.children.forEach((subItem) => {
                if (subItem.cate_id === val) {
                  this.slice_ids.push(...subItem.ids);
                }
              })
            })
          })

          this.$emit("confirmClick", this.slice_ids, this.user_ids);
        }
        else {
          this.config_ids = [];
          let arr = this.$refs['messageTree'].getCheckedKeys(true);
          arr.forEach((val) => {
            this.messagesData.forEach((item) => {
              item.children.forEach((subItem) => {
                if (subItem.cate_id === val) {
                  subItem.config.forEach((thirdItem) => {

                    this.config_ids.push(thirdItem.id);
                  })
                }
              })
            })
          })

          this.$emit("confirmClick", this.config_ids, this.user_ids);
        }

      },
      handleChecked(data) {
        if(this.sliceCount===1){
          this.checkSet.clear();
          this.usersData.forEach(val => {
            val.users.forEach(userVal => {
              if (userVal.user_id === data) {
                userVal.checked = !userVal.checked;
              }
              else userVal.checked = false;
              if (userVal.checked) {
                this.checkSet.add(userVal.user_id);
              }
            })
          })
        }
        else{
          this.checkSet.clear();
          this.usersData.forEach(val => {
            val.users.forEach(userVal => {
              if (userVal.user_id === data) {
                userVal.checked = !userVal.checked;
              }
              if (userVal.checked) {
                this.checkSet.add(userVal.user_id);
              }
              else this.checkSet.delete(userVal.user_id);
            })
          })
        }


      },
      getNode(dataObj,statusObj) {
        if(this.categoryId.length>1){
          let cateIds = new Set();
          statusObj.checkedNodes.forEach((item)=>{
            if(item.children){
              item.children.forEach((subItem)=>{
                cateIds.add(subItem.cateId);
              })
            }
            else cateIds.add(item.cateId);
          })
          this.$emit('getUsersData',[...cateIds])
        }
      },
    }

  }
</script>

<style lang="scss">
  .el-tabs__nav-wrap::after {
    display: none;
  }

  .el-tabs__nav {
    width: 100% !important;
  }

  .el-tabs__active-bar {
    width: 0 !important;

  }

  .dialog-popover {
    min-width: 40px !important;
    line-height: 1;
    padding:10px 12px;
    p {
      margin-bottom: 0;
      margin-top:7px;
      &:first-child {
        margin-top: 0;
      }
    }

  }

  .allDialog {
    .el-dialog {
      text-align: center;
      .el-dialog__body {
        padding: 30px 27px;
        height: 580px;
      }

      .el-dialog__footer {
        text-align: center;
        .dialog-footer {
          margin-bottom: 20px;

          .el-button {
            width: 72px;
            height: 34px;
            line-height: 7px;

          }
        }
      }
    }
    .all-content {
      display: flex;
      height: 100%;
      .data-left {
        flex: 1.5;
        display: flex;
        flex-direction: column;
        .el-tree-node__expand-icon {
          font-size: 18px;
        }
        .left-title {
          width: 80px;
          height: 22px;
          font-size: 16px;
          font-family: PingFangSC-Regular;
          font-weight: 400;
          color: rgba(73, 74, 76, 1);
          line-height: 22px;
        }

        .left-tree {
          overflow-y: auto;
          flex: 1;
          border: 1px solid #E0E0E0;
          .el-tree {
            margin-top: 17px;
            margin-left: 9px;
            margin-right: 9px;
            height:92%;
            .el-tree-node__content {
              height: 35px;
            }
          }
          .type-icon{
            width: 13px;
            height: 13px;
            background: url('./img/xibao.png') no-repeat;
            display: inline-block;
            margin-right: 10px;
            margin-left: 20px;
          }
        }
      }
      .center-icon {
        width: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          width: 15px;
          height: 15px;
        }
      }
      .mark-right {
        flex: 2;
        display: flex;
        flex-direction: column;
        .right-title {
          width: 66px;
          height: 22px;
          font-size: 16px;
          font-family: PingFangSC-Regular;
          font-weight: 400;
          color: #494a4c;
          line-height: 22px;
        }
        .wrapDetail {
          flex: 1;
          overflow-y: auto;
          border: 1px solid #E0E0E0;
          .detail {
            .detailTitle {
              text-align: left;
              font-size: 14px;
              font-family: PingFangSC-Regular;
              font-weight: 400;
              color: rgba(73, 74, 76, 1);
              line-height: 20px;
              margin: 17px 0 0 15px;
              display: flex;
              align-items: center;
              .data {
                margin-left: 4px;
                margin-right: 4px;
                font-size: 16px;
                color: rgba(79, 147, 254, 1);
                line-height: 22px;
              }
              .hospital-icon {
                width: 7px;
                height: 12px;
                background: url('./img/Rectangle.png') no-repeat;
                display: inline-block;
                margin-right: 5px;
              }

            }
            .detailItems {
              padding-left: 0;
              list-style: none;
              display: flex;
              flex-wrap: wrap;
              margin: 0;
              li {
                margin-left: 48px;
                position: relative;
                margin-top: 10px;

                .name {
                  margin-bottom: 0;
                  margin-top: 0;
                }

                .bigTyped {
                  margin: 0;
                }
                i {
                  outline: none;
                  display: inline-block;
                  width: 55px;
                  height: 55px;
                  background: url('./img/head.png');
                  cursor: pointer;
                }
                .checked {
                  background: url('./img/headChecked.png');
                }
              }
            }
          }
        }
      }

      .second-icon {
        width: 14px;
        height: 14px;
        background: url('./img/yiyuan.png') no-repeat;
        display: inline-block;
        margin-right: 10px;
        margin-left: 20px;
      }
    }

  }

  @media screen and (max-height: 800px) {
    .allDialog {
      .el-dialog {
        .el-dialog__body {
          padding: 30px 27px;
          height: 480px;
        }
      }
    }
  }


</style>
