<template>
  <Pannel v-bind:title="titleList" class="pannelTitle" v-if="labelMain" :bottom="false">
    <div slot="banner" class="markBanner">
      <div class="markBannerTitle">
        <div class="markBannerTitleLeft">
          <router-link :to="'/MarkMan/Unmark'">
            <a>未标注</a>
          </router-link>

          <router-link :to="'/MarkMan/Marked'">
            <a>已标注</a>
          </router-link>
        </div>
        <div class="markBannerTitleRight">
          <el-input v-model="input" placeholder="请输入内容" @change="getKeyWord">
            <el-button slot="append" icon="el-icon-search" @click="searchBtn"></el-button>
          </el-input>
          <div>
            <a class="switch" @click="readSlice()">标注模式</a>
          </div>


        </div>
      </div>
    </div>
    <div slot="main" class="labelMain">
        <el-table
          ref="multipleTable"
          :data="tableData"
          stripe
          height="100%"
          v-loading="loading"
          tooltip-effect="dark"
          style="width: 100%">
          <el-table-column
            prop="name"
            label="切片名称"
            min-width="220">
          </el-table-column>
          <el-table-column
            prop="cate_name"
            label="切片类型"
            min-width="100">
          </el-table-column>
          <el-table-column
            prop="source"
            label="医院"
            min-width="150">

          </el-table-column>
          <el-table-column
            prop="updated_at"
            label="分配时间"
            min-width="160"
          >
          </el-table-column>
          <el-table-column
            prop="label_count"
            label="标注数量"
            min-width="100">
          </el-table-column>

          <el-table-column
            label="操作" min-width="100" fixed="right">
            <template slot-scope="scope">
              <el-button type="text"
                         size="mini"
                         class="markBtn"
                         @click="readSlice(scope)">标注
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="position: absolute;bottom: 0;
    width: 100%;display: flex;justify-content:center ;height: 40px;align-items:center">
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
            :is-submit=true
            :page-index="pageIndex"
            @toTableMode="toTableMode"
            :is-mask="isMask"
            :search="input">

 </read-film>

</template>
<script>
  import Pannel from '../../../components/Pannel';
  import readFilm from '../../../components/readFilm/readFilm';
  import Api from '../../CheckMan/Uncheck/api';

  export default {
    data() {
      return {
        status:5,
        loading: true,
        pageIndex: 1,
        pageSize: 10,
        total: 10,
        title: '新增',
        tableData: [],
        multipleSelection: [],
        scope: {},
        titleList: ['标注'],
        currentPage: 1,
        labelMain: true,
        checkedPage: [],
        keyword: '',
        input:'',
      };
    },
    components: {
      Pannel,
      readFilm,
    },


    created() {
      this.queryList();
    },
    mounted() {

      window.onresize = () => {
        this.$root.$emit('size-change');
      };

    },
    methods: {
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



      queryList() {
        let params = {
          page: this.pageIndex,
          status: 5,
          keyword: this.keyword,
        };
        this.loading = true;
        Api.getlist(params).then(res => {
          if(res.body.ret_code===0){
            this.total = res.body.data.meta.count;
            res.body.data.list.forEach(item => {
              item.checked = false;
              item.previewImg = `/api/slice/get_image?file=${item.path}&type=preview`;
              item.label = `/api/slice/get_image?file=${item.path}&type=label`;
            })
            this.tableData = res.body.data.list;
          }



        }).finally(res => {
          this.loading = false;
        })

      },
      getKeyWord(value) {
        this.keyword = value;
      },
      searchBtn() { //
        this.pageIndex=1;
        this.currentPage = 1;
        this.queryList();
      },
      handleSizeChange(val) {
      },
      handleCurrentChange(val) {
        this.keyword = '';
        this.pageIndex = val;
        this.queryList();
      },
      handleModeCurrentChange(val) {
        this.searchContent = '';
        this.modePageIndex = val;
        this.initGetList();
      },
      handleModeSizeChange(val) {
      }

    },


  }
</script>

<style lang="scss">

  .markBanner {
    width: 100%;
    .markBannerTitle {
      display: flex;
      width: 100%;
      justify-content: space-between;
      align-items: center;
      .markBannerTitleLeft {
        .router-link-active {
          border-bottom: 2px solid #409EFF;
          color: #409EFF;
        }
        a {
          color: #222222;
          margin: 0 6px;
          text-decoration: none;
          line-height: 40px;
          display: inline-block;
        }
      }
      .markBannerTitleRight {
        display: flex;
        .el-input__inner {
          line-height: 30px;
          width: 122px;
          height: 30px;
          border: 1px solid rgba(236, 236, 236, 1);
        }
        .el-input-group__append, .el-input-group__prepend {
          padding: 0 12px;
        }
        .switch {
          display: inline-block;
          line-height: 30px;
          width: 80px;
          text-decoration: none;
          text-align: center;
          color: #fff;
          background-color: #409EFF;
          cursor: pointer;
          font-size: 12px;
          border-radius: 3px;
          margin-left: 10px;
        }

      }
    }
  }


  .labelMain {
    width: 100%;
    overflow: hidden;
    padding: 16px 20px 0;
    position:relative;
    .el-table {
      height:calc(100% - 40px)!important;
      &::before {
        height: 0;
      }
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

      .markBtn {
        color: #83C766;
        line-height: 26px;
        padding: 0 10px;
        &:focus {
          color: #83C766;
        }
        &:hover {
          color: #fff;
          background: #83C766;
        }
      }

    }
  }

</style>
