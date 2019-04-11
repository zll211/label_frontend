<template>
  <Pannel v-bind:title="titleList"  v-if="labelMain" :bottom="false">
    <div slot="banner" class="side">
      <div class="checkleft">
        <router-link :to="'/CheckMan/Uncheck'">
          <a> 未审核</a>
        </router-link>
        <router-link :to="'/CheckMan/Checked'">
          <a> 已审核</a>
        </router-link>
      </div>
      <div class="checkright">
          <span style="margin-right:10px">
                    <el-input
                      v-model="input" placeholder="请输入内容">
                        <el-button slot="append" icon="el-icon-search" @click="searchBtn"></el-button>
                    </el-input>
                </span>
        <span style="margin-right:10px;line-height: 30px">
                    <el-select v-model="value" placeholder="全部"  @change="handleChange" class="select-option">
                            <el-option
                              v-for="item in options"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value">
                            </el-option>
                        </el-select>
                </span>
        <el-button size="mini" type="primary" @click="readSlice()" style="height: 30px">
          <a> 审核模式</a>
        </el-button>
      </div>
    </div>

    <div slot="main" class="checkmain">
      <el-table ref="multipleTable" :data="tableData" stripe tooltip-effect="dark"
                width="100%" height="100%" v-loading="checkLoading">
        <el-table-column prop="name" label="切片名称"  min-width="220">
        </el-table-column>
        <el-table-column prop="source" label="医院"  min-width="150">
        </el-table-column>
        <el-table-column prop="cate_name" label="切片类型" min-width="100">
        </el-table-column>
        <el-table-column prop="label_user" label="标注专家" min-width="120">
        </el-table-column>
        <el-table-column prop="label_count" label="标注数量" min-width="100">
        </el-table-column>
        <el-table-column prop="updated_at" label="审核分配时间" min-width="160">
        </el-table-column>
        <el-table-column prop="label_advice" label="标注备注" min-width="120">
        </el-table-column>
        <el-table-column label="操作" min-width="100" fixed="right">
          <template slot-scope="scope" >
            <el-button size="mini" @click="" type="text" class="reallocateBtn" @click="readSlice(scope)">
              审核
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="page">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-size="pageSize"
          layout="prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>

  </Pannel>
  <read-film v-else
             :slice-index="sliceIndex"
             :status="status"
             :page-index="pageIndex"
             :is-submit=true
             @toTableMode="toTableMode"
             :is-mask="isMask"
             :search="input"
             :sliceValue="String(cate_id)">
  </read-film>
</template>


<script>
  import Pannel from '../../../components/Pannel'
  import readFilm from '../../../components/readFilm/readFilm'
  import {mapState} from 'vuex'
  import Api from '../Uncheck/api';

  export default {
    name: 'home',
    data() {
      return {
        labelMain: true,
        tableModelData: [],
        checkLoading: false,
        total: 0,
        pageIndex: 1,
        pageSize: 10,
        color: '#0000FF',
        cate_id: '',
        titleList: ['审批人', '未审核'],
        tableData: [],
        currentPage: 1,
        options: [],
        keyword: '',
        input: '',
        value:'',
        status:3,

      }
    },
    components: {
      Pannel,
      readFilm,
    },

    created() {
      this.queryList();
      this.getOption();
    },
    mounted() {

      window.onresize = () => {
        this.$root.$emit('size-change');
      };

    },
    methods: {

      //级联处理函数
      getOption() {
        Api.getOptions('/cate').then(res => {
          if(res.body.ret_code===0){
            if(res.body.data){
              res.body.data.forEach(item => {
                this.options.push({
                  label: item.cate_name,
                  value: item.cate_id,
                })
              })
              this.options.unshift({
                label: '全部',
                value: '',
              })
            }
          }
        })
      },
      handleChange(value) {
        this.cate_id = value;
        this.queryList();
      },

      readSlice(data){
        if(this.tableData.length<=0){
          this.$message('当前没有数据可以进行操作');
        }
        else{
          if(data===undefined){
            this.isMask = this.tableData[0].is_mask;
            this.sliceIndex=-1
          }
          else {
            this.isMask = data.row.is_mask;
            this.sliceIndex=data.$index;
          }

          this.labelMain = !this.labelMain;
          this.$store.commit('HiddenStateTaggle');
        }
      },
      toTableMode(){
        this.labelMain = !this.labelMain;
        this.queryList();
      },

      //得到待审核列表
      queryList() {
        let params = {
          page: this.pageIndex,
          status: 3,
          keyword: this.keyword,
          cate_id: this.cate_id,
        };
        this.checkLoading = true;
        Api.getlist(params).then(res => {

          this.total = res.body.data.meta.count;
          res.body.data.list.forEach(item => {
            item.checked = false;
            item.previewImg = `/api/slice/get_image?file=${item.path}&type=preview`;
            item.label = `/api/slice/get_image?file=${item.path}&type=label`;
          })
          this.tableData = res.body.data.list;
          for (let i = 0; i < this.tableData.length; i++) {
            // 有分页
            if (this.pageIndex && this.pageSize) {
              this.tableData[i]['num'] = this.pageSize * (this.pageIndex - 1) + i + 1;
            }
          }


        }).finally(res => {
          this.checkLoading = false;
        })

      },


      handleSizeChange(val) {
      },
      handleCurrentChange(val) {
        this.pageIndex = val;
        this.queryList();
      },
      searchBtn() {
        this.keyword = this.input;
        this.pageIndex=1;
        this.currentPage = 1;
        this.queryList();
      },

    },

  }
</script>

<style lang="scss">


  .side {
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
    .checkleft {
      a {
        color: #222222;
        line-height: 40px;
        margin: 0 6px;
        display: inline-block;
      }
      .router-link-active {
        border-bottom: 2px solid #409EFF;
        color: #409EFF;
      }
    }

    .checkright {
      display: flex;
      justify-content: flex-end;
      .el-input {
        width: 122px;
      }
      .el-input__icon {
        line-height: 30px;
      }
      .el-input__inner {
        width: 122px;
        height: 30px;
        line-height: 30px;
      }
      .el-cascader {
        width: 122px;
        line-height: 30px;
        input::-webkit-input-placeholder { /* WebKit browsers */
          color: #606266;
        }
        input:-moz-placeholder { /* Mozilla Firefox 4 to 18 */
          color: #606266;
        }
        input::-moz-placeholder { /* Mozilla Firefox 19+ */
          color: #606266;
        }
        input:-ms-input-placeholder { /* Internet Explorer 10+ */
          color: #606266;
        }
      }
      a {
        color: white;
      }
    }
    a {
      text-decoration: none;
    }
  }

  .checkmain {
    width: 100%;
    overflow: hidden;
    padding: 16px 20px 0;
    position:relative;
    .el-table{
      height:calc(100% - 40px)!important;
    }
    .reallocateBtn {
      color: #83C766;
      line-height: 26px;
      padding: 0 10px;
      &:hover {
        color: #fff;
        background: #83C766;
      }
    }
    .el-table {
      thead tr th {
        height: 48px;
        color: #222222;
        background: rgba(235, 238, 246, 1);
      }
      td, th {
        padding: 0;
        height: 48px;
        line-height: 48px;
      }
      &:before {
        height: 0;
      }
    }
    .page {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 40px;
    }
  }

</style>



