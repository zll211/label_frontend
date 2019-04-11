<template>
  <Pannel v-bind:title="titleList" v-if="labelMain" :bottom="false">
    <div slot="banner" class="sliceBanner">
      <div class="sliceBannerTitle">
        <div class="sliceBannerTitleLeft">

          <router-link :to="'/silce/undistributedSlice'">
            <a> 未分配</a>
          </router-link>

          <router-link :to="'/silce/allocatedSlice'">
            <a> 已分配</a>
          </router-link>


        </div>
        <div class="sliceBannerTitleRight">
          <el-input v-model="input" placeholder="请输入内容" @change="getKeyWord">
            <el-button slot="append" icon="el-icon-search" @click="searchBtn"></el-button>
          </el-input>
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
          <el-select v-model="userValue" placeholder="标注人" @change="handleUserChange" class="select-option">
            <el-option
              v-for="item in userOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-select v-model="sliceValue" placeholder="类别" @change="handleChange" class="select-option">
            <el-option
              v-for="item in sliceOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-dropdown split-button type="primary" class="top-allot" @command="handleCommand">
            分配
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="onAllots">多例分配</el-dropdown-item>
              <el-dropdown-item  command="onCheckAll">一键分配</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button size="mini"
                     type="primary"
                     :aut="true"
                     @click="downloadAll(tableData)">一键下载
          </el-button>


        </div>
      </div>
    </div>
    <div slot="main" class="sliceMain">
      <el-table
        ref="multipleTable"
        :data="tableData"
        stripe
        height="100%"
        v-loading="loading"
        tooltip-effect="dark"
        style="width: 100%;"
        @selection-change="handleSelectionChange">
        <el-table-column

          type="selection">
        </el-table-column>

        <el-table-column
          prop="name"
          label="切片名称"
          min-width="220">
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
        <el-table-column
          prop="source"
          label="数据来源"
          min-width="150">
        </el-table-column>
        <el-table-column
          prop="cate_name"
          label="切片类型"
          min-width="100">
        </el-table-column>
        <el-table-column
          prop="label_hospital"
          label="标注医院"
          min-width="150">
        </el-table-column>
        <el-table-column
          prop="label_user"
          label="标注人"
          min-width="120">
        </el-table-column>
        <el-table-column
          prop="label_count"
          label="标注数量"
          min-width="80">
        </el-table-column>
        <el-table-column
          prop="updated_at"
          label="分配时间"
          min-width="180">
        </el-table-column>
        <el-table-column
          label="操作分配"
          fixed="right"
          min-width="180">
          <template slot-scope="scope">
            <el-button type="text" size="mini" class="reallocateBtn"
                       @click="onAllot(scope.row)">重新分配
            </el-button>
            <el-button type="text" size="mini" class="reallocateBtn"
                       @click="readSlice(scope)">查看
            </el-button>
            <el-button type="text" size="mini" class="reallocateBtn"
                       v-if="scope.row.label_count>0"
                       @click="downloadJSON(scope.row)">JSON下载
            </el-button>
            <Dialog :name="name"
                    :messagesData="messagesData"
                    :usersData="usersData"
                    :rightLoading="rightLoading"
                    :leftLoading="leftLoading"
                    :categoryId="categoryId"
                    v-on:confirmClick="handleConfirm"
                    :visible="visible"
                    :onekey="onekey"
                    rolename="标注专家"
                    v-on:cancelClick="handleCancel"
                    :isAbled="isAbled"
                    @getUsersData="getUsersData"
                   >
            </Dialog>

          </template>
        </el-table-column>
      </el-table>
      <div style="position: absolute;bottom: 0;
    width: 100%;display: flex;justify-content:center ;height: 40px;align-items:flex-start">
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
             :is-submit=false
             :page-index="pageIndex"
             @toTableMode="toTableMode"
             :is-mask="isMask"
             :search="input"
             :sliceValue="String(sliceValue)"
             :hospitalValue="String(hospitalValue)"
             :userValue="String(userValue)">
  </read-film>

</template>
<script>
  import Pannel from '../../../components/Pannel'
  import Dialog from '../../../components/Dialog'
  import Api from '../Undistributed/api';
  import readFilm from '../../../components/readFilm/readFilm'

  export default {
    data() {
      return {
        isMask:0,
        categoryId:[],
        labelMain:true,
        isonekey: false,
        status: 1,
        loading: true,
        name: '多例分配',
        aut: false,
        man: true,
        visible: false,
        messagesData: [],
        pageIndex: 1,
        pageSize: 10,
        total: 10,
        titleList: ['切片管控', '已分配'],
        tableData: [],
        selectedList: [],
        dialogVisible: false,
        input: '',
        currentPage: 1,
        activeIndex: '2',
        hospitalOptions: [],
        userOptions: [],
        sliceOptions: [],
        selectId: {},
        user_ids: [],
        keyword: '',
        cate_id: '',
        activeName: 'first',
        hospitalValue: '',
        userValue: '',
        sliceValue: '',
        usersData:[],
        rightLoading:false,
        idIndex:0,
        leftLoading:false,
        onekey:false,
        rolename:'标注专家',
        isAbled:false,
        hospitalMessages:[],
        categoryMessages:[],
      };
    },
    async created() {
      await this.getHospitalSelect();
      this.queryList();

    },
    methods: {
      //初始化医院，用户，类别下拉框数据
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
              label: '全部（标注医院）',
              value: '',
            })
            this.hospitalOptions = hospitalOptions;
            //得到初始状态下的标注人
            let users = this.hospitalMessages.map((item)=>{
              return{
                users:(item.users||[]).filter((val)=>val.role_id===1)
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
              label:'全部(标注专家)',
              value:'',
            });
            this.userOptions = userOptions;
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
        Api.searchType().then(data => {
          if (data.body.ret_code === 0) {
            let sliceOptions = [];
            let dataArr = data.body.data;
            dataArr.forEach((val) => {
              sliceOptions.push({
                label: val.cate_name,
                value: val.cate_id,
              })
            })
            sliceOptions.unshift({
              label: '全部(类别)',
              value: '',
            });
            sliceOptions =sliceOptions.filter((item)=>item.label);
            console.log(sliceOptions)
            this.sliceOptions = sliceOptions;
            this.categoryMessages = JSON.parse(JSON.stringify(sliceOptions));
            this.categoryMessages.shift();
          }
        })

      },
      //根据医院id获取标注人以及类别
      handleHospitalChange(val){
        if(val===''){
          let users = this.hospitalMessages.map((item)=>{
            return{
              users:(item.users||[]).filter((val)=>val.role_id===1)
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
            label:'全部(标注专家)',
            value:'',
          });
          this.userOptions = userOptions;
          //得到初始化状态下的类别
          this.getCategories();

        }
        else {
          this.$http.get(`/groups/${val}`).then(({body})=>{
            if(body.ret_code===0){
              let userOptions = (body.data.users||[]).filter((item)=>item.role_id===1)
              userOptions = userOptions.map((item)=>{
                return {
                  value:item.id,
                  label:item.nickname,
                }
              });
              if(userOptions.length>0){
                userOptions.unshift({
                  value:'',
                  label:'全部(标注专家)',
                });
                this.userOptions = userOptions;
              }
              else{
                this.userOptions = [];
              }
              //获取该医院下的所有类别
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
        this.queryList();

      },
      //根据标注人id 获取类别
      handleUserChange(val){
        if(val===''){
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
                this.sliceOptions = sliceOptions;
              }
              else {
                this.sliceOptions=[];
              }
            }
          }).catch(()=>{
            this.$message.error('类别获取失败')
          })
        }
        this.sliceValue = '';
        this.queryList();


      },


      //切换模式
      readSlice(data){
        console.log(data)
        if(this.tableData.length<=0){
          this.$message('当前没有数据可以进行操作');
        }
        else{
          this.isMask = data.row.is_mask;
          this.sliceIndex = data.$index
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

      handleCommand(command){
        this[`${command}`]();
      },



      //查询列表
      queryList() {
        let params = {
          page: this.pageIndex,
          status: 1,
          keyword: this.keyword,
          cate_id: this.sliceValue,
          group_id:this.hospitalValue,
          user_id:this.userValue,
        };
        this.loading = true;
        Api.getlist(params).then(list => {
          if (list.body.ret_code === 0) {
            this.tableData = list.body.data.list;
            this.total = list.body.data.meta.count;
          }
        }).finally(()=>{
          this.loading = false;
        })
      },
      getKeyWord(value) {
        this.keyword = value;
      },
      searchBtn() { //
        this.pageIndex = 1;
        this.currentPage = 1;
        this.queryList();
      },
      handleSelectionChange(val) {
        this.selectedList = val;
      },


      //分配
      onAllot(row) {
        this.isAbled=false;
        this.idIndex=0;
        this.selectedList = [row];
        this.$refs.multipleTable.clearSelection();
        this.$refs.multipleTable.toggleRowSelection(row, true);
        this.name = '重新分配';
        this.visible=true;
        this.onekey=false;
        this.rightLoading=true;
        let category = this.categoryMessages.find((item)=>item.label===row.cate_name);
        this.categoryId = [category.value]
        this.messagesData=[{
          label:row.source,
          sum:1,
          cate_id:this.idIndex++,
          children:[{
            cate_id:this.idIndex++,
            ids:[row.id],
            label:row.cate_name,
            sum:1,
            cateId:category.value,
          }]
        }];
        this.getUsersData(this.categoryId);
      },
      //多例分配
      onAllots() {
        if(this.selectedList.length>0){
          this.idIndex=0;
          this.visible = true;
          this.name='多例分配'
          this.messagesData = [];
          this.usersData = [];
          let hospitals = {};
          this.onekey=false;
          this.isAbled=false;
          //自己统计的数据
          this.selectedList.map((item) => {
            //存在某医院，添加大类
            if (hospitals[item.source]) {
              hospitals[item.source].push({name:item.cate_name,id:item.id});
            }
            //不存在
            else {
              hospitals[item.source] = [{name:item.cate_name,id:item.id}];
            }
          });
          for (let key in hospitals) {
            const hospital = {};
            hospital.children = [];//大类数组
            hospital.cate_id = this.idIndex++;
            hospital.sum = hospitals[key].length;//总数
            hospital.label=key;
            hospitals[key].forEach((cate) => {
              const topCate =  hospital.children.find((item) => item.label === cate.name);
              if (topCate) {
                topCate.sum++;
                topCate.ids.push(cate.id);
              } else {
                hospital.children.push({
                  cate_id:this.idIndex++,
                  label: cate.name,
                  sum: 1,
                  ids:[cate.id],
                  //增加一项类别id
                  cateId:this.categoryMessages.find((item)=>item.label===cate.name).value,
                });
              }
            })
            this.messagesData.push(hospital)
          }
          let cateIds = new Set();
          this.messagesData.forEach((item)=>{
            (item.children||[]).forEach((val)=>{
              cateIds.add(val.cateId);
            })
          })
          this.categoryId = [...cateIds]
          if([...cateIds].length===1){
            this.getUsersData([...cateIds]);
          }

        }
        else{
          this.$message.warning('你还没有选中任何切片！')
        }
      },
      //一键分配
      onCheckAll() {
        this.idIndex=0;
        if (this.tableData.length > 0) {
          this.tableData.forEach(row => {
            this.$refs.multipleTable.toggleRowSelection(row, true);
          });
          this.isAbled=false;
          this.visible = true;
          this.leftLoading=true;
          this.name = '一键分配';
          this.onekey=true;
          this.messagesData = [];
          this.usersData = [];
          let params = {reapportion: 1}
          this.$http.post('/label_source', params).then(res => {
            if(res.body.ret_code===0){
              if(res.body.data){
                this.messagesData=res.body.data.map((item)=>{
                  let children=item.cates.map((val)=>{
                    return {
                      label:val.cate_name,
                      id:val.cate_id,
                      config:val.config,
                      cate_id:this.idIndex++,
                      sum:val.count,
                      //增加一项类别id
                      cateId:val.cate_id,
                    }
                  })
                  return {
                    label:item.hospital,
                    id:item.id,
                    children:children,
                    cate_id:this.idIndex++,
                    sum:item.count,
                  }
                })
                let cateIds = new Set();
                this.messagesData.forEach((item)=>{
                  (item.children||[]).forEach((val)=>{
                    cateIds.add(val.cateId);
                  })
                })
                this.categoryId = [...cateIds]
                if([...cateIds].length===1){
                  this.getUsersData([...cateIds]);
                }
              }

            }
            else {
              this.$message.error(res.body.ret_msg?res.body.ret_msg:'数据获取失败')
            }


          }).catch(()=>{
            this.$message.error('数据获取失败')
          }).finally(()=>{
            this.leftLoading = false;
          })
        } else {
          this.$message.warning('当前没有切片可以进行分配！')
        }

      },
      getUsersData(cateIds=[]){
        this.rightLoading = true;
        let params={
          cate_ids:cateIds,
        };
        this.$http.post('/label_users',params).then(({body})=>{
          if(body.ret_code===0){
            if(body.data){
              body.data.forEach((item)=>{
                item.users.forEach((val)=>{
                  val.checked = false;
                  val.user_id = val.id;
                })
              })
              this.usersData = body.data;
            }
          }
          else {
            this.$message.error(body.ret_msg?body.ret_msg:'数据获取失败')
          }
        }).catch(()=>{
          this.$message.error('数据获取失败');
        }).finally(()=>{
          this.rightLoading = false;
        })

      },



      handleSizeChange(val) {
      },
      handleCurrentChange(val) {
        this.selectedList = [];
        this.selectId = [];
        this.pageIndex = val;
        this.queryList();
      },
      handleSelect(key, keyPath) {
      },
      handleChange(value) {
        this.cate_id = value
        this.queryList();
      },
      handleConfirm(sliceId,usersId) {
        if([...sliceId].length===0||[...usersId].length===0){
          this.$message.warning('请选择要分配的数据或者专家');
        }
        else{
          let params;
          this.isAbled=true;
          if(this.onekey){
            params={
              config_ids: [...sliceId],
              user_ids: [...usersId],
              reapportion:1,
            }
            this.$http.post('/assign_all_label',params).then(({body})=>{
              if(body.ret_code===0){
                this.$message({
                  type: 'success',
                  message: '指派标注专家成功!'
                });
                this.visible = false;
                this.queryList();
              }else {
                this.isAbled=false;
                this.$message({
                  type: 'info',
                  message: res.body.ret_msg
                });
              }
            }).catch(()=>{
              this.isAbled=false;
              this.$message.error('分配失败')
            })
          }
          else{
            params={
              slice_ids: [...sliceId],
              user_ids: [...usersId],
              reapportion:1,
            }
            Api.assignLabel(params).then(res => {
              if (res.body.ret_code===0) {
                this.$message({
                  type: 'success',
                  message: '指派标注专家成功!'
                });
                this.visible = false,
                  this.queryList();

              } else {
                this.isAbled=false;
                this.$message({
                  type: 'info',
                  message: res.body.ret_msg
                });
              }
            }).catch(()=>{
              this.isAbled=false;
              this.$message.error('分配失败')
            })
          }

        }

      },
      handleCancel() {
        this.visible = false;
        this.$refs.multipleTable.clearSelection();
        this.selectedList = [];
      },


    },
    components: {
      Pannel,
      Dialog,
      readFilm,
    }
  }
</script>

<style lang="scss">

  .slice-popover {
    padding: 4px 8px !important;
    p {
      margin: 12px;
    }
  }

  .sliceBanner {
    width: 100%;
    .sliceBannerTitle {
      display: flex;
      width: 100%;
      justify-content: space-between;
      align-items: center;
      .sliceBannerTitleLeft {
        .router-link-active {
          border-bottom: 2px solid #409EFF;
          color: #409EFF;
        }
        a {
          color: #222222;
          margin: 0 3px;
          text-decoration: none;
          line-height: 40px;
          display: inline-block;
        }
      }
      .sliceBannerTitleRight {
        display: flex;
        justify-content: flex-end;
        flex: 5;
        align-items: center;
        .el-input {
          width: 122px;
        }
        & > div, & > button {
          margin-left: 10px;
        }
        .el-input__inner {
          width: 122px;
          height: 30px;
          line-height: 30px;
          border: 1px solid rgba(236, 236, 236, 1);
        }
        .el-input-group__append, .el-input-group__prepend {
          padding: 0 12px;
        }
        .cascader {
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
        .select-option{
          .el-input__icon{
            line-height: 25px;
          }
        }
        .top-allot{
          .el-button{
            padding:7px 10px;
            span{
              font-size:12px;
            }
          }
          .el-dropdown__caret-button{
            padding:7px 5px;
          }
        }

      }
    }
  }

  .sliceMain {
    position: relative;
    width: 100%;
    padding: 16px 24px 0;
    overflow: hidden;
    .el-table {
      height: calc(100% - 40px) !important;
      .el-button{
        &+.el-button{
          margin-left:0;
        }
      }
      thead tr th {
        color: #222222;
        background: rgba(235, 238, 246, 1);
      }
      td, th {
        padding: 0;
        height: 48px;
        line-height: 48px;
      }
      tr{
        cursor:pointer !important;
      }
      &::before {
        height: 0;
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
      .el-table__fixed-right::before, .el-table__fixed::before {
        height: 0;
      }

    }

  }
  @media screen and (max-width: 1360px){
    .sliceBanner{
      .sliceBannerTitle{
        .sliceBannerTitleRight{
          .el-input{
            width:110px;
          }
          .el-input__inner{
            width:110px;
          }
        }
      }
    }
  }


</style>
