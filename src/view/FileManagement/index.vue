<template>
  <Pannel v-bind:title="titleList" v-bind:banner="false" :bottom="false">
    <div slot="banner">演示组件</div>
    <div slot="main" class="main-content">
      <div class="fileFlex-1">
        <div class="operate">
          <el-button type="primary" @click="createSource">新增文件夹</el-button>
          <el-button type="primary" @click="onekeyDownload">一键下载</el-button>
        </div>
        <div class="allHospitals">
          <div class="hospitalTree">
            <el-tree :data="sourceData"
                     node-key="id"
                     accordion
                     :default-expanded-keys="defaultExpanded"
                     ref="sourceTree"
                     @node-click="handleNodeClick"
                     v-loading="loading">
                        <span class="custom-tree-node" slot-scope="{ node, data }">
                          <i :class="data.icon" aria-hidden="true" style="margin-right:5px;"></i>
                          <span >{{node.label}}</span>
                          <span style="text-align:right"  v-if="data.children">{{data.count.inserted}}/{{data.count.total}}</span>

                        </span>
            </el-tree>
          </div>
        </div>
      </div>
      <div class="fileFlex-2">
        <div class="hospitalFiles" v-if="show">
          <el-form ref="sourceForm" :model="sourceForm" label-width="80px" label-position="left"
                   class="source-form" v-if="showSource" v-loading="formLoading">

            <el-form-item label="医院名称">

              <el-input v-model="sourceForm.label" :disabled="true"></el-input>

            </el-form-item>
            <el-form-item label="类别">
              <div v-if="sourceForm.children.length>0">
                <el-tag v-for="(item,index) in sourceForm.children" :key="index" class="user-tag">
                  {{item.label}}
                </el-tag>
              </div>
              <div v-else style="color:#909399">暂无数据</div>

            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="to-edit" @click="toEditsource">编辑</el-button>
              <el-button @click="toDeletesource">删除</el-button>
              <el-button @click="downloadJSON(sourceForm.id)" class="json-download">JSON下载</el-button>
            </el-form-item>

          </el-form>
          <div v-else>
            <div class="treeRow" v-loading="pathLoading" element-loading-background="#fbfafa">
              <div class="fileTreeRow" style="display: flex;margin-bottom: 0">
                <div><span class="not-tag">路径</span></div>
                <div>
                  <div v-for="(item,index) in inputLists" :key=index>
                    <el-input v-model="item.path"></el-input>
                    <!--<el-button type="danger" size="mini" v-if="(inputLists.length > 1)" icon="el-icon-minus" @click="deleteInput(index,inputList.config_id)" circle></el-button>-->
                    <i v-if="(inputLists.length > 1)" class="el-icon-minus"
                       @click="deletePath(index,item.id)"></i>
                  </div>
                  <div class="inputBox" style="display: flex;justify-content:center;width: 360px;"><i
                    class="el-icon-plus" @click="addPath"></i>
                  </div>
                </div>


              </div>
              <el-button type="primary" @click="commitChanges" class="save-path">保存</el-button>
              <el-button @click="deleteCate" class="json-download">删除</el-button>
              <el-button @click="downloadcateJSON" class="json-download">JSON下载</el-button>

            </div>
          </div>


        </div>
      </div>

      <!--弹框-->
      <el-dialog title="医院信息" :visible.sync="dialogSource" center class="hospitalDialog">
        <el-form ref="sourceMessage" :model="sourceMessage" label-position="left" label-width="80px"
                 class="hospital-messages" :rules="sourceRules">
          <el-form-item label="医院名称" prop="label">
            <el-input v-model="sourceMessage.label"></el-input>
          </el-form-item>
          <el-form-item label="拥有类别" class="over" prop="defaultChecked">
            <div >
              <el-tree style="margin-left:-9px;"
                       :data="sourceMessage.haveType"
                       node-key="id"
                       ref="newHTree"
                       class="source-message"
                       @check="getNodes('newHTree')"
                       show-checkbox
                       empty-text="暂无数据，请至标注管理新建类别"
                       default-expand-all
                       v-loading="createSLoading"
                       :props="sourceProps"
                       :expand-on-click-node="false">
                            <span class="custom-tree-node" slot-scope="{ node, data }">
                               <span class="nodeLabel">{{ node.label }}</span>
                            </span>
              </el-tree>
            </div>
          </el-form-item>


        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="saveSource" type="primary" class="groupCancel">保 存</el-button>
          <el-button @click="cancelSource" class="groupCancel">取 消</el-button>
        </div>

      </el-dialog>

    </div>

  </Pannel>
</template>
<script>
  import Pannel from '../../components/Pannel';
  import Api from './api.js';
  import config from '../../../config/hzzt'

  let list = [];
  export default {
    name: "home",
    data() {
      return {
        allpaths: '',
        currentData: {},
        currentNode: {},
        createSLoading: false,
        defaultExpanded: [],
        dialogSource: false,
        formLoading: false,
        inputLists: [],
        loading: false,
        paths: [],
        pathLoading: false,
        titleList: [],
        sourceData: [],
        sourceForm: {},
        showSource: false,
        show: false,
        sourceMessage: {},
        sourceProps: {
          label: 'label',
          children: 'children',
        },
        sourceRules: {
          label: [
            {required: true, message: '请输入医院名称', trigger: 'blur'}
          ],
          defaultChecked:[
            {required: true, message: '请选择类别', trigger: 'check'}
          ]
        },
      }
    },
    created() {
      this.getSources();

    },
    methods: {
      deleteCate(){
        let params={
          cate_id:this.currentData.cate_id,
          source_id:this.currentData.parentId,
        }
        Api.deleteCate('/source_cate',params).then((res)=>{
          if(res.body.ret_code===0){
            const parent = this.currentNode.parent;
            const children = parent.data.children || parent.data;
            const index = children.findIndex(d => d.cate_id === this.currentData.cate_id);
            children.splice(index, 1);
            parent.childNodes.splice(index, 1);
            this.$message.success(res.body.ret_msg)
            if(parent.data.children&&parent.data.children.length>0) {
              this.currentData = parent.data.children[0];
              this.getcatePath();
              this.showSource = false;
              this.currentNode=parent.childNodes[0];
            }
            else{
              this.currentData=parent.data;
              this.currentNode=parent;
              this.sourceForm = Object.assign({}, this.currentData);
              this.showSource = true;
            }
          }
          else {
            this.$message.error(res.body.ret_msg);
          }
        }).catch(()=>{
          this.$message.error('删除失败');
        })
      },
      getSources(sourceIndex = 0) {
        this.loading = true;
        return Api.sourceList('/source').then((res,) => {
          if (res.body.ret_code === 0) {
            if(res.body.data&&res.body.data.length>0){
              this.sourceData = res.body.data.map((item, index) => {
                let children = item.cates.map((val) => {
                  return {
                    cate_id: val.cate_id,
                    label: val.cate_name,
                    type: 2,
                    parentId: item.id,
                    config: val.config,
                    parentIndex: index,
                    icon:'fa fa-folder'
                  }
                })
                return {
                  id: item.id,
                  label: item.hospital,
                  type: 1,
                  children: children,
                  index: index,
                  icon:'fa fa-folder',
                  count:item.count,

                }
              });
              this.show = true;
              if (this.currentData.parentId) {
                this.getcatePath();
              } else {
                this.showSource = true;
                this.sourceForm = this.sourceData[sourceIndex];
                this.currentData = this.sourceData[sourceIndex];
              }
              this.sourceData.forEach(item => {
                item.children.forEach((subItem) => {
                  if (subItem.pathGroup !== '') {
                    this.paths.push({
                      path: subItem.pathGroup,
                    })
                  }
                })
              })
              this.allpaths = this.paths.map(val => val.path).join(',');
            }
            else {
              this.sourceData=[];
              this.show = false;
            }
          }
          else {
            this.$message.error(res.body.ret_msg)
          }
        }).catch(() => {
          this.$message.error('获取来源列表失败')
        }).finally(() => {
          this.loading = false;
        })
      },
      handleNodeClick(data, node) {
        this.formLoading = true;
        this.currentData = data;
        this.currentNode = node;
        if (this.currentData.type === 1) {

          this.sourceForm = Object.assign({}, this.currentData);
          this.showSource = true;

        }
        else {
          this.getcatePath();
        }
        this.formLoading = false;
      },
      getcatePath() {
        this.inputLists = [];
        this.pathLoading = true;
        this.showSource = false;
        let params = {
          source_id: this.currentData.parentId,
          cate_id: this.currentData.cate_id,
        };
        Api.getFileDirectory('/source_path', params).then((res) => {
          if (res.body.ret_code === 0) {
            if (res.body.data.length > 0) {
              res.body.data.forEach((item) => {
                this.inputLists.push({
                  path: item.path,
                  id: item.id,
                })
              })
            }
            else {
              this.inputLists.push({
                path: '',
              })
            }

          }
          else {
            this.$message.error(res.body.ret_msg)
          }
        }).finally(() => {
          this.pathLoading = false;
        })
      },
      createSource() {
        this.createSLoading = true;
        if (this.$refs['sourceMessage']) {
          this.$refs['sourceMessage'].resetFields();
          let checkArray = [];
          this.$refs['newHTree'].setCheckedKeys(checkArray)
        }
        this.sourceMessage = {
          label:'',
          haveType:[],
          defaultChecked:[],
        };
        this.dialogSource = true;
        Api.createGroup('/cate').then((res) => {
          // res.body.data = JSON.parse(JSON.stringify(res.body.data).replace(/cate_name/g, "label"));
          if(res.body.ret_code===0){
            if(res.body.data){
              res.body.data = res.body.data.map((item) => ({
                label: item.cate_name,
                id: item.cate_id,
              }))
              this.sourceMessage.haveType = res.body.data;
              this.$refs['newHTree'].setCheckedKeys([]);


            }
          }


        }).finally((res) => {
          this.createSLoading = false;

        })
      },
      toEditsource() {
        if (this.$refs['sourceMessage']) this.$refs['sourceMessage'].resetFields();
        this.createSLoading = true;
        this.sourceMessage = Object.assign({}, this.sourceForm);

        let checkArray = [];
        this.dialogSource = true;
        this.sourceForm.children.forEach((item) => {
          checkArray.push(item.cate_id);
        });
        this.sourceMessage.defaultChecked = checkArray;
        Api.createGroup('/cate').then((res) => {
          if(res.body.ret_code===0){
            if(res.body.data){
              res.body.data = res.body.data.map((item) => ({
                label: item.cate_name,
                id: item.cate_id,
              }))
              this.sourceMessage.haveType = res.body.data;
              this.$refs['newHTree'].setCheckedKeys(checkArray);
            }
          }
        }).finally((res) => {
          this.createSLoading = false;
        })

      },
      toDeletesource() {
        Api.deleteSource(`/source/${this.currentData.id}`).then((res) => {
          if (res.body.ret_code === 0) {
            this.$message.success(res.body.ret_msg);
            this.getSources();
          }
          else {
            this.$message.error(res.body.ret_msg)
          }
        })
      },
      addPath() {
        this.inputLists.push({
          path: ''
        })
      },
      deletePath(index, id) {
        this.inputLists.splice(index, 1);
        this.defaultExpanded = [this.currentData.parentId]

      },
      commitChanges() {
        let path=this.inputLists.map((val)=>val.path);
        path.forEach((val,index)=>{
          if(val===""){
            path.splice(index,1)
          }
        })
        let set = new Set(path);
        if([...set].length<path.length){
          this.$message.warning('不要重复设置路径名');
        }
        else {
          let params = {
            path: path,
            source_id: this.currentData.parentId,
            cate_id: this.currentData.cate_id,
          }
          Api.postConfig('/source_path', params).then((res) => {
            if (res.body.ret_code === 0) {
              this.$message.success(res.body.ret_msg);
              this.defaultExpanded = [this.currentData.parentId];
            }
            else {
              this.$message.error(res.body.ret_msg||'配置目录失败')
            }
          }).catch((err) => {
            this.$message.error( '配置目录失败')
            // this.$message.error('配置目录失败');
          })
        }

      },
      saveSource() {
        this.getNodes('newHTree');
        let params = {
          hospital: this.sourceMessage.label,
          cates: [...this.cates],
        };
        this.$refs['sourceMessage'].validate((valid) => {
          if (valid) {
            if (!this.sourceMessage.id) {
              Api.saveHospital('/source', params).then(({body}) => {
                if(body.ret_code===0){
                  this.$message.success(body.ret_msg);
                  this.defaultExpanded=[];
                  this.getSources();
                  this.dialogSource = false;
                }
                else {
                  this.$message.error(body.ret_msg);
                }
              }).catch(() => {
                this.$message.error('创建来源失败')
              }).finally(() => {

              })
            }
            else {
              Api.editSource(`/source/${this.sourceMessage.id}`, params).then(({body}) => {
                if(body.ret_code===0){
                  this.$message.success(body.ret_msg);
                  this.getSources(this.currentData.index);
                  this.defaultExpanded = [this.currentData.id];
                  this.dialogSource = false;
                }
                else {
                  this.$message.error(body.ret_msg);
                }

              }).catch(() => {
                this.$message.error('编辑来源失败')
              }).finally(() => {

              })
            }
          }
        })


      },
      cancelSource() {
        this.dialogSource = false;
      },
      getNodes(refName) {
        this.cates = this.$refs[refName].getCheckedKeys(true);
        this.$set(this.sourceMessage,'defaultChecked',this.cates)
        this.$refs.sourceMessage.validateField('defaultChecked');
        return this.cates;
      },

      downloadJSON(id) {
        let params = {
          source_id: id
        }
        this.$http.get('/download/labels', {params:params}).then(({body}) => {
          if(body.ret_code===0){
            let anchor = document.createElement('a');
            anchor.setAttribute('href', body.path);
            anchor.setAttribute('target', '_blank');
            anchor.setAttribute('download', new Date().getTime() + '.json.zip');
            anchor.click();
          }
          else{
            this.$message.error(body.ret_msg?body.ret_msg:'json文件不存在');
          }

        }).catch(()=>{
          this.$message.error('下载失败');
        })
      },
      downloadcateJSON() {
        let params = {
          source_id: this.currentData.parentId,
          cate_id: this.currentData.cate_id,
        }
        this.$http.get('/download/labels', {params:params}).then(({body}) => {
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
          this.$message.error('下载失败');
        })
      },
      onekeyDownload() {
        this.$http.get('/download/labels').then(({body}) => {
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
    },
    components: {
      Pannel
    }
  }


</script>
<style lang="scss">
  .main-content {
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex: 1;
    .source-message{
      .el-tree__empty-text{
        width:100%;
        height:80%;
        top:38%;
      }
    }
    .fileFlex-1 {
      padding: 27px 24px 0;
      display: flex;
      flex-direction: column;
      width: 30%;
      box-sizing: border-box;
      /*flex: 1;*/
      /*min-width: 500px;*/
      .operate {
        display: flex;
        .el-button--primary {
          width: 103px;
          height: 34px;
          background: #4F93FE;
          border-radius: 4px;
          line-height: 7px;
          text-align: center;
        }
      }
      .allHospitals {

        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        .hospitalTree {
          display: flex;
          flex: 1;
          margin: 20px 0;
          overflow-y: auto;
          .el-tree-node {
            padding: 5px 1px !important;
          }

          .el-tree {
            width: 100%;
            color:#676767;
            .el-tree__empty-text{
              font-size:14px;
            }
            .custom-tree-node {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 14px;
              padding-right: 8px;
              width: 80%;
              & > span {
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

            }
          }
        }
      }

    }
    .fileFlex-2 {
      /*flex: 1;*/
      width: 70%;
      background-color: #fbfafa;
      .hospitalFiles {
        font-size: 14px;
        display: flex;
        flex: 1;
        flex-direction: column;
        height: 100%;

        .source-form {
          margin: 88px 0;
          padding-left: 40px;
          overflow-y: auto;
          width: 500px;

          .inputBox {
            margin-bottom: 10px;
            align-items: center;
          }
          .to-edit {
            margin-top: 40px;
            margin-left: -80px;
          }
          .el-tag {
            margin-bottom: 10px;
            margin-right: 6px;
          }

        }
        .treeRow {
          width: 500px;
          .fileTreeRow {
            margin: 88px 0;
            padding-left: 40px;
            overflow-y: auto;
            width: 500px;
            max-height: 380px;
            .not-tag {
              display: inline-block;
              width: 68px;
              font-size: 14px;
              color: #606266;
              line-height: 30px;
            }
            .el-icon-minus, .el-icon-plus {
              display: inline-block;
              height: 20px;
              line-height: 20px;
              width: 20px;
              text-align: center;
              font-size: 18px;
            }
            .el-icon-minus {
              color: red;
            }
            .el-icon-plus {
              color: green;
            }
            .el-input {
              margin-bottom: 10px;
            }

          }
          .save-path {
            width: 100px;
            height: 34px;
            border-radius: 4px;
            line-height: 7px;
            text-align: center;
            margin-left: 40px;
            margin-top: 30px;
          }
        }
        .el-button {
          width: 100px;
          height: 34px;
          border-radius: 4px;
          line-height: 7px;
          text-align: center;
        }
        .json-download {
          padding: 0;
        }
        .el-input {
          width: 360px;
          height: 30px;
        }
        .el-input__inner {
          line-height: 30px;
          height: 30px;
        }
      }
    }
    .hospitalDialog {
      .el-dialog--center {
        width: 576px;
        input {
          height: 30px;
        }
      }
      .hospital-messages {
        padding: 0 50px;
        .el-tree {
          margin-top:5px;
          height: 200px;
          overflow-y: auto;
          overflow-x: hidden;
          .el-tree-node {
            .el-tree-node__content {
              max-height: 60px;
              height: auto;
              line-height: 30px;
              .custom-tree-node {
                height: auto;
                .nodeLabel {
                  font-size: 14px;
                  max-height: 76px;
                  display: inline-block;
                  width: 300px;
                  white-space: normal;
                }
              }
              &>.el-tree-node__expand-icon{
                padding:0;
              }
            }
            //width: 400px
          }
        }
      }

    }

    .el-dialog__footer {
      .groupCancel {
        width: 103px;
        height: 34px;
        line-height: 7px;
      }
    }
  }

  .file-popover {
    padding: 10px 12px !important;
    p {
      margin: 0;
    }
  }
</style>
