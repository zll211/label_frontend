<template>
  <Pannel v-bind:title="titleList"  v-if="labelMain" :bottom="false">
    <div slot="banner" class="side">
      <div class="checkleft">
        <router-link :to="'/check/undistributedCheck'">
          <a> 未分配</a>
        </router-link>
        <router-link :to="'/check/allocatedCheck'">
          <a> 已分配</a>
        </router-link>
        <router-link :to="'/check/result'">
          <a> 已审批</a>
        </router-link>
      </div>
      <div class="checkright">
        <span style="margin-right:10px">
          <el-input
            v-model="input" placeholder="请输入内容" @change="getKeyWord">
              <el-button slot="append" icon="el-icon-search" @click="searchBtn"></el-button>
          </el-input>
        </span>
        <span style="margin-right:10px;line-height: 30px">
          <el-select v-model="hospitalValue" placeholder="医院"
                     @change="handleHospitalChange"
                     class="select-option">
                      <el-option
                        v-for="item in hospitalOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
        </el-select>
        </span>
        <span style="margin-right:10px;line-height: 30px">
          <el-select v-model="userValue" placeholder="标注人" @change="handleUserChange" class="select-option">
          <el-option
            v-for="item in userOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        </span>
        <span style="margin-right:10px;line-height: 30px">
          <el-select v-model="sliceValue" placeholder="类别" @change="handleChange" class="select-option">
          <el-option
            v-for="item in sliceOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        </span>
        <el-button size="mini" type="primary" @click="downloadAll(tableData)" style="height: 30px">一键下载</el-button>
      </div>
    </div>

    <div slot="main" class="checkmain">
      <el-table ref="multipleTable" :data="tableData" stripe tooltip-effect="dark" @select="selectRow"
                @select-all="selectAll"
                @selection-change="handleSelectionChange" width="100%" height="100%" v-loading="loading">
        <el-table-column type="selection">
        </el-table-column>
        <el-table-column prop="name" label="切片名称" min-width="220">
          <template slot-scope="scope">
            <el-popover trigger="hover" placement="top-start" offset="-5" popper-class="slice-popover">
              <p style="max-width:600px;">{{ scope.row.path }}</p>
              <!--{{ scope.row.path }}-->
              <div slot="reference" class="name-wrapper">
                {{ scope.row.name }}
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="数据来源" min-width="150">
        </el-table-column>
        <el-table-column prop="cate_name" label="切片类型" min-width="100">
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="120">
          <template slot-scope="scope">
            <span v-if="scope.row.status === '审核不通过'" class="color">{{scope.row.status}}</span>
            <span v-else>{{scope.row.status}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="label_hospital" label="标注医院" min-width="150">
        </el-table-column>
        <el-table-column prop="label_user" label="标注人" min-width="120">
        </el-table-column>
        <el-table-column prop="label_count" label="标注数量" min-width="100">
        </el-table-column>
        <el-table-column prop="recheck_hospital" label="审核医院" min-width="150">
        </el-table-column>
        <el-table-column prop="recheck_user" label="审核人" min-width="120">
        </el-table-column>
        <el-table-column prop="recheck_advice" label="备注" min-width="100">
        </el-table-column>
        <el-table-column prop="recheck_time" label="审核提交时间" min-width="180">
        </el-table-column>
        <el-table-column label="操作"
                         width="160px"
                         fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="text" class="reallocateBtn" @click="readSlice(scope)">
              查看
            </el-button>
            <el-button v-if="scope.row.status==='审核不通过'" size="mini" type="text" class="reallocateBtn"
                       @click="reLabel(scope.row)">
              重新标注
            </el-button>
            <el-button  size="mini" @click="downloadJSON(scope.row)" type="text"
                        class="reallocateBtn"  v-if="scope.row.label_count>0">
              JSON下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="page">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="pageIndex"
          :page-size="pageSize"
          layout="prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>
  </Pannel>
  <read-film v-else
             :status="status"
             :slice-index="sliceIndex"
             :page-index="pageIndex"
             :is-submit=false
             @toTableMode="toTableMode"
             :is-mask="isMask"
             :search="input"
             :sliceValue="String(sliceValue)"
             :hospitalValue="String(hospitalValue)"
             :userValue="String(userValue)">
  </read-film>
</template>


<script>
  import Pannel from '../../../components/Pannel';
  import readFilm from '../../../components/readFilm/readFilm';
  import Api from '../api';

  export default {
    name: 'home',
    data() {
      return {
        labelMain: true,
        status:4,
        name: '多例分配',
        visible: false,
        titleList: ['审批管控', '已审批'],
        pageIndex: 1,
        pageSize: 10,
        total: 10,
        tableData: [],
        selectedList: [],
        hospitalOptions: [],
        userOptions: [],
        sliceOptions: [],
        hospitalValue: '',
        userValue: '',
        sliceValue: '',
        selectedOptions: [],
        keyword: '',
        messagesData: [],
        cate_id: '',
        input: '',
        loading: true,
        value:'',
        onekey:false,
        leftLoading:false,
        rightLoading:false,
        usersData:[],
        idIndex:0,
        hospitalMessages:[],
        clearTimeId: null,
        isMask:0,
      }
    },
    created() {
      this.getHospitalSelect();
      this.queryList();
    },
    methods: {
      //获取医院下拉框
      getHospitalSelect(){
        this.$http.get('/groups').then(({body})=>{
          if(body.ret_code===0){
            this.hospitalMessages = body.data||[];
            let hospitalOptions = (body.data||[]).map((item)=>{
              return {
                value: item.id,
                label: item.hospital_name,
              }
            })
            hospitalOptions.unshift({
              label: '全部(审核医院)',
              value: '',
            })
            this.hospitalOptions = hospitalOptions;
            //得到初始状态下的标注人
           this.getInitUsers();
            //得到初始化状态下的类别
            this.getCategories();
          }
          else {
            this.$message.error(body.ret_msg)
          }
        }).catch(()=>{
          this.$message.error('医院获取失败')
        })
      },
      //得到类别
      getCategories(){
        this.$http.get(`/cate`).then(data => {
          if (data.body.ret_code === 0) {
            let sliceOptions = [];
            let dataArr = data.body.data;
            dataArr.forEach((val) => {
              sliceOptions.push({
                label: val.cate_name,
                value: val.cate_id,
              })
            })
            sliceOptions =sliceOptions.filter((item)=>item.label);
            sliceOptions.unshift({
              label: '全部(类别)',
              value: '',
            })
            this.sliceOptions = sliceOptions;
          }
        })

      },
      //根据医院id获取标注人
      handleHospitalChange(val){
        if(val===''){
          this.getInitUsers();
          this.getCategories();
        }else{
          this.$http.get(`/groups/${val}`).then(({body})=>{
            if(body.ret_code===0){
              let userOptions = (body.data.users||[]).filter((item)=>item.role_id===2)
              userOptions = userOptions.map((item)=>{
                return {
                  value:item.id,
                  label:item.nickname,
                }
              });
              if(userOptions.length>0){
                userOptions.unshift({
                  value:'',
                  label:'全部(审核专家)',
                });
                this.userOptions = userOptions;
              }
              else{
                this.userOptions = [];
              }

              let sliceOptions = body.data.cates.map((item)=>{
                return {
                  label:item.cate_name,
                  value:item.cate_id,
                }
              })
              sliceOptions =sliceOptions.filter((item)=>item.label);
              if(sliceOptions.length>0){
                sliceOptions.unshift({
                  label:'全部(类别)',
                  value:'',
                })
                this.sliceOptions = sliceOptions
              }
              else{
                this.sliceOptions=[];
              }
              this.queryList()
            }
            else {
              this.$message.error(body.ret_msg);
            }
          }).catch(()=>{
            this.$message.error('用户获取失败')
          })
        }
        this.userValue = '';
        this.sliceValue = '';
        this.queryList()


      },
      //根据标注人id 获取类别
      handleUserChange(val){
        if(val=== ''){
          if(this.hospitalValue===''){
            this.getCategories();
          }
          else {
            this.$http.get(`/groups/${this.hospitalValue}`).then(({body})=>{
              if(body.ret_code===0){
                let sliceOptions = body.data.cates||[];
                sliceOptions = sliceOptions.map((item)=>{
                  return {
                    label:item.cate_name,
                    value:item.cate_id,
                  }
                })
                sliceOptions =sliceOptions.filter((item)=>item.label);
                if(sliceOptions.length>0){
                  sliceOptions.unshift({
                    label:'全部(类别)',
                    value:'',
                  })
                  this.sliceOptions = sliceOptions;
                }
                else {
                  this.sliceOptions = [];
                }
              }
            })
          }
        }else{
          this.$http.get(`/users/${val}`).then(({body})=>{
            if(body.ret_code===0){
              let sliceOptions = (body.data.cates||[]).map((item)=>{
                return {
                  value:item.cate_id,
                  label:item.cate_name,
                }
              })
              sliceOptions =sliceOptions.filter((item)=>item.label);
              if(sliceOptions.length>0){
                sliceOptions.unshift({
                  value:'',
                  label:'全部(类别)',
                });
              }
              else {
                this.sliceOptions=[];
              }
              this.sliceOptions = sliceOptions;
              this.queryList();
            }
          }).catch(()=>{
            this.$message.error('类别获取失败')
          })
        }
        this.sliceValue = '';
        this.queryList();


      },
      getInitUsers(){
        let users = this.hospitalMessages.map((item)=>{
          return{
            users:(item.users||[]).filter((val)=>val.role_id===2)
          }
        })
        let userOptions = [];
        users.forEach((item)=>{
          item.users.forEach(val=>{
            userOptions.push({
              value:val.id,
              label:val.nickname,
            })
          })
        })
        userOptions.unshift({
          label:'全部(审核专家)',
          value:'',
        });
        this.userOptions = userOptions;
      },



      readSlice(data){
        if(this.tableData.length<=0){
          this.$message('当前没有数据可以进行操作');
        }
        else{
          this.isMask = data.row.is_mask;
          this.sliceIndex = data.$index;
          this.labelMain = !this.labelMain;
          this.$store.commit('HiddenStateTaggle');
        }

      },
      toTableMode(){
        this.labelMain = !this.labelMain;
        this.queryList();
      },

      downloadJSON(data){
        let anchor = document.createElement('a');
        anchor.setAttribute('href', data.path.replace('.kfb', '.json'));
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('download', (data.name).replace('.kfb', '.json'));
        anchor.click();
      },
      downloadAll(){
        this.$http.get('/download/labels').then(({body})=>{
          if(body.ret_code===0){
            let anchor = document.createElement('a');
            anchor.setAttribute('href', body.path);
            anchor.setAttribute('target', '_blank');
            anchor.setAttribute('download', new Date().getTime() + '.json.zip');
            anchor.click();
          }
          else {
            this.$message.error(body.ret_msg?body.ret_msg:'json文件不存在')
          }
        }).catch(()=>{
          this.$message.error('下载失败')
        })
      },



      selectAll() {
        // 全选
        let arr = [];
        this.selectedList.forEach((val) => {
          arr.push({
            'slice_id': val.id
          });

        })
        this.selectId = arr;
      },
      selectRow(value) {
        let arr = [];
        value.forEach((val) => {
          arr.push({
            'slice_id': val.id
          });
        })
        this.selectId = arr;
      },
      toggleSelection(rows) {
        if (rows) {
          rows.forEach(row => {
            this.$refs.multipleTable.toggleRowSelection(row);
          });
        } else {
          this.$refs.multipleTable.clearSelection();
        }
      },
      handleSelectionChange(val) {
        this.selectedList = val;
      },
      handleSizeChange(val) {
      },
      handleCurrentChange(val) {
        this.selectId = [];
        this.pageIndex = val;
        this.queryList();
      },
      handleSelect(key, keyPath) {
      },
      handleChange(value) {
        this.cate_id = value;
        this.queryList();
      },
      getKeyWord(value) {
        this.keyword = value;
      },
      searchBtn() {
        this.pageIndex=1;
        this.queryList();
      },
      async queryList() {
        this.loading = true;
        let params = {
          page: this.pageIndex,
          keyword: this.keyword,
          cate_id: this.sliceValue,
          group_id:this.hospitalValue,
          user_id:this.userValue,
          status: 4,
        };
        await Api.getlist('/slices', {...params}).then((list)=>{
          if (list.body.ret_code === 0) {
            list.body.data.list.forEach(item => {
              item.checked = false;
            })
            this.tableData = list.body.data.list;//表格数据
            this.total = list.body.data.meta.count;//数据总条数
          }
        }).finally(()=>{
          this.loading = false;
        })
      },
      reLabel(data) {
        this.$http.get(`/slices/relabel?slice_id=${data.id}`).then(res => {
          if (res.body.ret_code === 0) {
            this.$message.success(res.body.ret_msg);
            if(this.tableData.length===1){
              this.pageIndex=1;
            }
            this.queryList();
          }
          else {
            this.$message.error(res.body.ret_msg)
          }

        })
      },
    },
    components: {
      Pannel,
      readFilm,
    },
  }
</script>

<style  lang="scss">


  .color {
    color: red;
  }

  .slice-popover {
    padding: 4px 8px !important;
    p {
      margin: 12px;
    }
  }

  .side {
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
    .checkleft {
      a {
        color: #222222;
        line-height: 40px;
        margin: 0 3px;
        display: inline-block;
      }
      .router-link-active {
        border-bottom: 2px solid #409EFF;
        color: #409EFF;
      }
    }

    .checkright {
      display: flex;
      height: 30px;
      justify-content: flex-end;
      .el-input {
        width: 122px;
        .el-input-group__append {
          height: 28px;
          line-height: 28px;
          .el-button--default {
            padding: 0 10px;

          }
        }

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
    .reallocateBtn {
      color: #83C766;
      line-height: 26px;
      padding: 0 10px;
      margin-left:0;
      &:hover {
        color: #fff;
        background: #83C766;
      }
    }
    .el-table {
      height: calc(100% - 40px)!important;
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
      .el-table__fixed-right::before, .el-table__fixed::before{
        height:0;
      }
    }
    .page {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 40px;
    }
  }
  @media screen and (max-width: 1360px){
    .side{
      .checkright{
        .el-input{
          width:110px;
          .el-input__inner{
            width:110px;
          }
        }
      }
    }
  }
</style>
















