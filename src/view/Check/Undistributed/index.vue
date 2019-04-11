<template>
  <Pannel v-bind:title="titleList" v-if="labelMain" :bottom="false">
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
        <el-dropdown split-button type="primary" class="top-allot" @command="handleCommand">
          分配
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="onAllots">多例分配</el-dropdown-item>
            <el-dropdown-item  command="open">一键分配</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <div class="analyze-div">
          <el-dropdown split-button type="primary" class="top-allot" @command="handleAnalyzeCommand">
            解析
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="autoAnalyze" :disabled="isShowAnalyzeProgress">自动解析</el-dropdown-item>
              <el-dropdown-item  command="someAnalyze" :disabled="isShowAnalyzeProgress">批量解析</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <div class="entry-progress" v-if="isShowAnalyzeProgress" >
            <div class="align-self-end">
              <el-progress :percentage="progressAnalyzeValue" :text-inside="true" :stroke-width="15" ></el-progress>
              <span >{{currentSliceCount}}/{{totalSliceCount}}</span>
            </div>
          </div>
        </div>

        <!--<el-button size="mini" type="primary" @click="onAllots" style="height: 30px">多例分配</el-button>-->
        <!--<el-button size="mini" type="primary" @click="open(tableData)" style="height: 30px">一键分配</el-button>-->
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
            <span v-if="scope.row.status === '不予标注'" class="color">{{scope.row.status}}</span>
            <span v-else>{{scope.row.status}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="label_hospital" label="标注医院" min-width="150">
        </el-table-column>
        <el-table-column prop="label_user" label="标注人" min-width="120">
        </el-table-column>
        <el-table-column prop="label_count" label="标注数量" min-width="100">
        </el-table-column>
        <el-table-column prop="label_time" label="标注提交时间" min-width="150">
        </el-table-column>
        <el-table-column label="操作分配"
          width="220px"
          fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="deleteSlice(scope.row)" type="text" class="reallocateBtn" v-if="scope.row.status==='不予标注'">
              删除
            </el-button>
            <el-button size="mini" @click="allot(scope.row)" type="text" class="reallocateBtn" v-else>
              分配
            </el-button>
            <el-button size="mini" @click="readSlice(scope)" type="text" class="reallocateBtn">
              查看
            </el-button>
            <el-button size="mini" @click="downloadJSON(scope.row)" type="text" class="reallocateBtn" v-if="scope.row.label_count>0">
              JSON下载
            </el-button>
            <el-button size="mini" @click="analyzeSlice(scope.row)" :disabled="isShowAnalyzeProgress" type="text" class="reallocateBtn" v-if="scope.row.is_mask==1">
             解析
            </el-button>

            <!--弹窗-->
            <Dialog :name="name"
                    :messagesData="messagesData"
                    :usersData="usersData"
                    :visible="visible"
                    :onekey="onekey"
                    :rightLoading="rightLoading"
                    :leftLoading="leftLoading"
                    :isAbled="isAbled"
                    rolename="审核专家"
                    :categoryId="categoryId"
                    v-on:confirmClick="handleConfirm"
                    v-on:cancelClick="handleCancel"
                    v-on:getUsersData="getUsersData">
            </Dialog>
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
             :slice-index="sliceIndex"
             :status="status"
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
  import Dialog from '../../../components/Dialog';
  import readFilm from '../../../components/readFilm/readFilm';
  import Api from '../api';
  import hzztStomp from '../../../service/stomp'

  export default {
    name: 'home',
    data() {
      return {
        categoryId:[],
        labelMain:true,
        isonekey: false,
        status:2,
        aut: true,
        man: true,
        name: '多例分配',
        visible: false,
        titleList: ['审批管控', '未分配'],
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
        keyword: '',
        messagesData: [],
        cate_id: '',
        input: '',
        loading: true,
        value:'',
        idIndex:0,
        usersData:[],
        onekey:false,
        rightLoading:false,
        leftLoading:false,
        isAbled:false,
        hospitalMessages:[],
        categoryMessages:[],
        isMask:0,
        isShowAnalyzeProgress:false,
        progressAnalyzeValue:0,
        currentSliceCount:0,
        totalSliceCount:0,
      }
    },
    mixins:[hzztStomp],
    async created() {
      await this.getHospitalSelect();
      this.queryList();
      const queue = `slide_label_parse_json_${JSON.parse(localStorage.userInfo).username}`;
      this.subscribe(queue,'unAllocateAnalyze');
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
            hospitalOptions.push({
              label:'外来医院',
              value:'0',
            })
            hospitalOptions.unshift({
              label: '全部(标注医院)',
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
            this.categoryMessages = JSON.parse(JSON.stringify(sliceOptions));
            this.categoryMessages.shift();
          }
        })

      },
      //根据医院id获取标注人
      handleHospitalChange(val){
        if(val===''){
          this.getInitUsers();
          this.getCategories();
        }
        else if(val==='0'){
          this.userOptions=[{
            label:'外院专家',
            value:'0',
          }]
          this.userOptions.unshift({
            label:'全部(标注专家)',
            value:''
          });
          this.getCategories();
        }
        else{
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
        this.queryList()

      },
      //根据标注人id 获取类别
      handleUserChange(val){
        if(val==='0'){
          this.queryList();
        }
        else if(val === ''){
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
        }
        else{
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
      getInitUsers(){
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
        userOptions.push({
          label:'外院专家',
          value:'0',
        })
        userOptions.unshift({
          label:'全部(标注专家)',
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
      analyzeSlice(row){
        if(!this.connected){
          this.$notify.warning({
            title: '警告',
            message: 'stomp未连接，无法进行通讯',
          });
          return;
        }
        const queue = `slide_label_parse_json_${JSON.parse(localStorage.userInfo).username}`;
        const params = {
          slice_ids: [row.id],
          queue:queue,
        }
        this.$http.post('/analytical/batch',params).then(({body})=>{
          if(body){
            if(body.ret_code===0){
              if(body.data.count ===0){

                this.$message.success('暂无可解析的切片');
              }
              else {
                this.$message.success('开始解析');
              }
            }
            else{
              this.$message.success(body.ret_msg||'切片解析成功');
            }
          }

        }).catch((e)=>{
          this.$message.error('切片解析失败');
        });
      },
      handleCommand(command){
        this[`${command}`]();
      },
      handleAnalyzeCommand(command){
        this[`${command}`]();
      },
      autoAnalyze(){
        if(!this.connected){
          this.$notify.warning({
            title: '警告',
            message: 'stomp未连接，无法进行通讯',
          });
          return;
        }
        const queue = `slide_label_parse_json_${JSON.parse(localStorage.userInfo).username}`;
        let params = {
          queue:queue,
          status:this.status,
        }
        this.$http.post('/analytical/all',params).then(({body})=>{
          if(body.ret_code===0){
            if(body.data.count ===0){

              this.$message.success('暂无可解析的切片');
            }
            else {
              this.$message.success('开始解析');
            }
          }
          else {
            this.$message.error(body.ret_msg||'切片自动解析失败');
          }
        }).catch((e)=>{
          this.$message.error('切片自动解析失败');
        })
      },
      someAnalyze(){
        if(!this.connected){
          this.$notify.warning({
            title: '警告',
            message: 'stomp未连接，无法进行通讯',
          });
          return;
        }
        if(this.selectedList.length<=0){
          this.$message.error('请先选择要解析的切片');
          return ;
        }
        let sliceIds = this.selectedList.map(item=>item.id);
        const queue = `slide_label_parse_json_${JSON.parse(localStorage.userInfo).username}`;
        let params= {
          slice_ids:sliceIds,
          queue: queue,
        };
        this.$http.post('/analytical/batch',params).then(({body})=>{
          if(body){
            if(body.ret_code===0){
              if(body.data.count === 0){
                this.$message.success('暂无可解析的切片');
              }
              else{
                this.$message.success('正在解析');
              }

            }
            else{
              this.$message.success(body.ret_msg||'切片解析成功');
            }
          }

        }).catch((e)=>{
          this.$message.error('切片解析失败');
        });


      },


      deleteSlice(row){
        this.$http.delete(`/slice/${row.id}`).then((res)=>{
          if(res.body.ret_code===0){
            this.$message.success(res.body.ret_msg||'删除成功！');
            this.queryList();
          }
        }).catch(()=>{
          this.$message.error('删除失败！')
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
      handleConfirm(sliceId,usersId) {
        if([...sliceId].length===0||[...usersId].length===0){
          this.$message.warning('请选择要分配的数据或者专家');
        }
        else{
          this.isAbled = true;
          let params;
          if(this.onekey){
            params={
              config_ids: [...sliceId],
              user_ids: [...usersId],
              reapportion:0,
            };
            this.$http.post('/assign_all_recheck', {...params}).then(res => {
              if (res.body.ret_code === 0) {
                this.$message({
                  type: 'success',
                  message: '指派审核专家成功!'
                });
                this.$refs.multipleTable.clearSelection();
                this.visible = false;
                this.pageIndex = 1;
                this.queryList();
              }
              else {
                this.isAbled=false;
                this.$message({
                  type: 'info',
                  message: res.body.ret_msg
                })
              }
            }).catch(()=>{
              this.isAbled=false;
              this.$message.error('分配失败');
            })
          }
          else{
            params={
              slice_ids: [...sliceId],
              user_ids: [...usersId],
              reapportion:0,
            }
            this.$http.post('/assign_recheck', {...params}).then(res => {
              if (res.body.ret_code === 0) {
                this.$message({
                  type: 'success',
                  message: '指派审核专家成功!'
                });
                this.$refs.multipleTable.clearSelection();
                this.visible = false;
                if(this.tableData.length===1){
                  this.pageIndex=1;
                }
                this.queryList();
              }
              else {
                this.isAbled=false;
                this.$message({
                  type: 'info',
                  message: res.body.ret_msg
                })
              }
            }).catch(()=>{
              this.isAbled=false;
              this.$message.error('分配失败');
            })
          }

        }


      },
      handleCancel() {
        this.$refs.multipleTable.clearSelection();
        this.selectedList = [];
        this.visible = false;
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
        this.queryList()
      },
      //多例分配
      onAllots() {
        if(this.selectedList.length>0){
          this.selectedList.forEach((item,index)=>{
            if(item.status==='不予标注'){
              this.$refs.multipleTable.toggleRowSelection(item, false);
            }
          })
          this.idIndex=0;
          this.visible = true;
          this.name='分配'
          this.messagesData = [];
          this.usersData = [];
          let hospitals = {};
          this.onekey=false;
          this.isAbled = false;
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
                  cateId:this.categoryMessages.find((item)=>item.label===cate.name).value
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
        else {
          this.$message.warning('您还没有选择要操作的数据！')
        }


      },
      getUsersData(cateIds=[]){
        this.rightLoading = true;
        let params={
          cate_ids:cateIds,
        };
        this.$http.post('/recheck_users',params).then(({body})=>{
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
      //一键分配
      open() {
        this.idIndex=0;
        if (this.tableData.length>0) {
          this.tableData.forEach(row => {
            if(row.status==='不予标注'){
              this.$refs.multipleTable.toggleRowSelection(row, false);
            }
            else{
              this.$refs.multipleTable.toggleRowSelection(row, true);
            }

          });
          this.visible = true;
          this.onekey=true;
          this.isAbled = false;
          this.name='一键分配'
          this.messagesData = [];
          this.usersData = [];
          this.leftLoading=true;
          let params = {reapportion: 0}
          this.$http.post('/recheck_source', params).then(res => {
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
        }
        else{
          this.$message.warning('当前没有切片可以进行分配！')
        }

      },
      //分配
      allot(row) {
        this.idIndex=0;
        this.selectedList = [row];
        this.$refs.multipleTable.clearSelection();
        this.$refs.multipleTable.toggleRowSelection(row, true);
        this.name = '分配';
        this.onekey=false;
        this.isAbled = false;
        this.visible=true;
        this.rightLoading=true;
        let category = this.categoryMessages.find((item)=>item.label===row.cate_name);
        this.categoryId = [category.value];
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
          status: 2,
          cate_id: this.sliceValue,
          group_id:this.hospitalValue,
          user_id:this.userValue,
        };
        await Api.getlist('/slices', {...params}).then((list)=>{
          if (list.body.ret_code === 0) {
            this.tableData = list.body.data.list;//表格数据
            this.total = list.body.data.meta.count;//数据总条数
          }
        }).finally(()=>{
          this.loading = false;
        })

      },

    },
    components: {
      Pannel,
      Dialog,
      readFilm,
    }
  }
</script>

<style  lang="scss">


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
    .top-allot{
      margin-right:10px;
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
    .analyze-div{
      position:relative;
      .entry-progress{
        position:absolute;
        width:100%;
        top:34px;
        .align-self-end{
          display:flex;
          .el-progress{
            flex:1;
            .el-progress-bar__innerText{
              font-size:10px;
              margin-top:-3px;
            }
          }
          span{
            font-size:12px;
          }
        }

      }

    }
  }

  .checkmain {
    position:relative;
    width: 100%;
    overflow: hidden;
    padding: 16px 20px 0;
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
      .color{
        color:red;
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



