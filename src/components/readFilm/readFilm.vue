<template>
  <div class="modeMain">
    <slide-view ref="readSlice" :color="color" :file-name="path" @getLabelList="getLabelList"
                :table-model-data="tableModelData" :current-row="currentRow" @deleteId="checkDelete"
                @selectPoint="selectPoint" v-if="innerMask===0">

    </slide-view>
    <pis-slide-view :file-name="path" v-if="innerMask===1" ></pis-slide-view>
    <div class="left-panel" ref="inputBox">
      <div class="modeTop">
        <div class="inputBox">
          <input v-model="searchContent" placeholder="请输入内容" @click="handleShowLeft" @input="handleInput"  v-focus>
        </div>

        <div class="switchBtn" @click="toTableMode()">
          <a class="switch">表格模式</a>
        </div>
      </div>
      <div class="modeLeft" ref="leftMode" v-show="leftList">
        <div style="display: flex;flex: 1;" ref="leftdiv">
          <ul ref="lists" class="lists" v-loading="listLoading" style="width: 100%;">
            <li v-for="(item,index) in listData" @click="pictureChange(item.path,index,item.is_mask)" class="listsItem" :key="index"
                :class="{isSelected:item.checked}">
              <img :src=item.previewImg alt="">
              <img :src=item.label alt="" style="margin-right:15px;">
              <p>{{item.name}}</p>
            </li>

          </ul>
        </div>
        <el-pagination
          :small=true
          @size-change="handleModeSizeChange"
          @current-change="handleModeCurrentChange"
          :current-page.sync="currentModePage"
          :page-size="modeMainPageSize"
          layout="prev, pager, next, jumper"
          :total="modeMainTotal"
        >
        </el-pagination>


      </div>
    </div>
    <div class="rightTop">
      <div class="rightTopTitle">
        <div @click="showMarkTable" ref="showMarkTable">标注</div>
        <b class="tool-gap"></b>
        <div @click="submit" v-if="isSubmit">提交</div>
        <b class="tool-gap" v-if="isSubmit"></b>
        <div>
          <el-badge :value=this.sliceNum class="item" v-if="sliceNum>=1">
            <p @click="nextLabel" ref="nextLabels" style="margin:0;">{{nextContent}}</p>
          </el-badge>
          <p v-else @click="nextLabel" ref="nextLabels" style="margin:0;">{{nextContent}}</p>
        </div>
      </div>
      <div class="rightTopTable" ref="markedTable" v-show="markTable" v-if="innerMask===0">
        <el-table
          ref="multipleTable"
          :data="tableModelData"
          height="100%"
          tooltip-effect="dark"
          style="width: 100%"
          @row-click="handleRowClick"
          v-loading="markLoading">
          <el-table-column
            prop="shape"
            label="形状"
            width="60px"
            align="center">
            <template slot-scope="scope">
              <span>{{scope.row.shape}}</span>
              <el-color-picker class="tableColorPicker" disabled v-model="scope.row.color"></el-color-picker>
            </template>
          </el-table-column>
          <el-table-column
            prop="type"
            label="类别"
            width="70px"
            :show-overflow-tooltip="true">
          </el-table-column>
          <el-table-column
            prop="remark"
            label="描述"
            :show-overflow-tooltip="true">
          </el-table-column>
        </el-table>
      </div>

    </div>
    <div class="submitDialog">
      <el-dialog title="添加备注" :visible.sync="dialoglabelVisible" width="400px">
        <el-form :model="labelForm" ref="labelForm">
          <el-form-item label="切片备注">
            <el-input v-model="labelForm.advice"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="unMarkedDetail" :disabled="markAbled">{{unSubmit}}</el-button>
          <el-button type="primary" @click="markedDetail"  :disabled="markAbled">{{doSubmit}}</el-button>
        </div>
      </el-dialog>

    </div>
    <div v-if="innerMask===0">
      <div v-show="labelImage.length>0">
        <div :class="{'down el-icon-arrow-left':!showBottom,'up el-icon-arrow-right':showBottom}" class="toggle"
             @click="handleShowBottom" ref="arrowDown" :style="{'right':rightValue}"></div>

        <transition name="bounce">
          <div class="bottomList" ref="imgList" v-show="showBottom">
            <span class="left el-icon-arrow-left" @click="turnLeft"></span>
            <div style="width: 500px;overflow: hidden">
              <ul ref="listUl" :style="ulStyleObject">
                <li class="markListItem" v-for="(item,index) in labelImage" :key="index"
                    @click="labelClick(index)">
                  <img :src="item.imageUrl" :class="{'red-border':item.select}">
                  <p v-if="(index+1)<100">{{index+1}}</p>
                  <p v-else>...</p>
                </li>

              </ul>
            </div>
            <span class="right el-icon-arrow-right" @click="turnRight" ></span>
          </div>
        </transition>
      </div>
    </div>


  </div>
</template>

<script src="./readFilm.component.js"></script>

<style lang="scss">
  .bounce-enter-active {
    animation: bounce-in 0.59s linear;

  }

  .bounce-leave-active {
    animation: bounce-out 0.5s linear;
  }

  @keyframes bounce-in {
    0% {
      right: -539px;
    }
    50% {
      right: -170px;
    }
    75% {
      right: -40px;
    }
    100% {
      right: 20px;
    }
  }

  @keyframes bounce-out {
    0% {
      right: 20px;
    }
    50% {
      right: -300px;
    }
    100% {
      right: -539px;
    }
  }

  .el-tooltip__popper.is-dark {
    background: white;
    color: #303133;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
    border: 1px solid #ebeef5;
    line-height: 25px;
    font-size: 14px;
  }

  .el-tooltip__popper[x-placement^=top] .popper__arrow:after {
    border-top-color: white;
  }

  .el-tooltip__popper[x-placement^=top] .popper__arrow {
    border-top-color: rgba(0, 0, 0, 0.07);
  }
  .modeMain {
    width: 100%;
    height: 100%;
    position: relative;
    background: white;
    overflow: hidden;

    .left-panel {
      width: 300px;
      position: absolute;
      top: 24px;
      left: 47px;
      display: flex;
      flex-direction: column;
      .modeTop {
        height: 38px;
        display: flex;
        justify-content: space-between;
        background: #fff;
        border-radius: 0 2px 2px 0;
        box-shadow: 1px 2px 1px rgba(0, 0, 0, .15);
        .inputBox {
          flex: 3;
          background: #f3f3f3;
          input {
            width: 100%;
            height: 38px;
            border: 0;
            text-indent: 1em;
            border-top: 1px solid #ebebeb;
            border-left: 1px solid #ebebeb;
            border-radius: 2px 0 0 2px;
            box-sizing: border-box;
            &:focus {
              outline: none;
            }
          }

        }
        .switchBtn {
          flex: 1;
        }

        .switch {
          display: inline-block;
          width: 100%;
          height: 100%;
          line-height: 40px;
          text-decoration: none;
          text-align: center;
          color: #fff;
          background-color: #409EFF;
          cursor: pointer;
          font-size: 14px;
          border-radius: 0 2px 2px 0;
        }

      }
      .modeLeft {
        height: 100%;
        overflow: auto;
        margin-top: 8px;
        background: #fff;
        border: 1px solid #ebebeb;
        border-radius: 3px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
        .el-pagination {
          padding: 8px 0 !important;
          border-top: 1px solid #ebebeb;
          text-align: center;
          max-width: 300px;
          overflow: auto;
          button {
            padding: 0;
          }
        }
        .el-pagination__editor.el-input .el-input__inner {
          height: 23px;
        }
        ul.lists {
          list-style: none;
          padding: 0;
          margin: 0;
          height: 400px;
          overflow: auto;

          li.listsItem {
            display: flex;
            cursor: pointer;
            height: 34px;
            border-bottom: 1px solid #ebebeb;
            padding: 8px 8px;
            img {
              margin-left: 5px;
              width: 40px;
            }
            p {
              font-size: 14px;
              display: flex;
              align-items: center;
              line-height: 17px;
            }
          }
          li.isSelected {
            background: #409EFF;
          }
        }
      }

    }
    .rightTop {
      width: 300px;
      height: 34px;
      position: absolute;
      top: 24px;
      right: 27px;
      .rightTopTitle {
        display: flex;
        border-radius: 2px;
        background: #f3f3f3;
        box-shadow: 1px 2px 1px rgba(0, 0, 0, .15);
        div {
          flex: 1;
          text-align: center;
          margin: 0;
          line-height: 34px;
          cursor: pointer;
          color: #666;
        }
        div:hover {
          color: #409EFF
        }
        .tool-gap {
          height: 15px;
          display: inline-block;
          border-right: 1px solid #c8c5c5;
          position: relative;
          top: 10px;
        }
      }
      .rightTopTable {
        height: 400px;
        margin-top: 8px;
        border: 1px solid #ebebeb;
        border-radius: 3px;
        .el-table {
          &::before {
            height: 0;
          }
          td {
            padding: 6px 0;
          }
          .tableColorPicker {
            display: block;
            height: 22px;
            .el-icon-arrow-down:before {
              content: '';
            }
            .el-color-picker__mask {
              display: none;
            }
            .el-color-picker__trigger {
              width: 22px;
              height: 22px;
              padding: 0;
            }

          }
        }
      }

    }
    .el-icon-arrow-left:before {
      width: 19px;
      height: 19px;
      text-align: center;
    }
    .el-icon-arrow-right:before {
      width: 19px;
      height: 19px;
      text-align: center;
    }
    .toggle {
      transition: right .7s;
    }
    .down {
      width: 19px;
      height: 46px;
      position: absolute;
      right: 38px;
      bottom: 16px;
      border-radius: 2px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(44, 199, 175, 1);
    }
    .up {
      color: white;
      width: 19px;
      height: 46px;
      position: absolute;
      bottom: 16px;
      right: 566px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(44, 199, 175, 1);
    }
    .bottomList {
      position: absolute;
      bottom: 0;
      right: 20px;
      background: rgba(255, 255, 255, 0.82);
      /*width:500px;*/
      overflow: hidden;
      display: flex;
      justify-content: space-between;

      ul {
        margin: 0;
        list-style: none;
        font-size: 0;
        height: 70px;
        width: 990px;
        background: rgba(255, 255, 255, 0.82);
        position: relative;
        padding: 10px 0 0 10px;
        overflow: hidden;
        left: 0;
        li {
          position: relative;
          font-size: 0;
          display: inline-block;
          margin-right: 10px;
          width: 88px;
          height: 62px;
          img {
            width: 86px;
            height: 60px;
            border: 1px solid rgba(153, 153, 153, .42);
            box-sizing: border-box;
            position: relative;
          }
          p {
            position: absolute;
            color: #faf9f9;
            font-size: 12px;
            top: 4px;
            left: 6px;
            opacity: 1;
            height: 15px;
            border-radius: 10px;
            padding: 0px 8px 1px;
            background: #20c6ac;
          }
          .red-border {
            border: 2px solid red;
          }
        }
      }
      & > span {
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(98, 98, 98, 1);
        border-radius: 2px 0 0 2px;
        height: 80px;
        width: 19px;
        font-size: 20px;
        &:before {
          width: 19px;
          height: 19px;
        }
      }

    }
    .submitDialog {
      .dialog-footer {
        text-align: center;
      }
    }
  }
</style>
