<template>
  <Pannel v-bind:title="titleList" class="pannelTitle" :bottom="false">
    <div slot="banner" class="bannerTitle">
      <div>标注列表</div>
      <div class="bannerTitleRight">
        <el-input v-model="input" placeholder="请输入内容" @change="getKeyWord" class="new-label">
          <el-button slot="append" icon="el-icon-search" @click="searchBtn"></el-button>
        </el-input>
        <el-button type="primary" size="mini" @click="onAdd">新增标注
        </el-button>
        <el-dialog @close="cancel" class="addDialog" :title="title" :visible.sync="dialogFormVisible" center>
          <el-form :model="myForm" ref="myForm" :rules="myRules">
            <el-row>
              <el-col :span="24" class="cate-name">
                <el-form-item label="所属大类"  :label-width="formLabelWidth">
                  <!--<el-select v-model="myForm.top_cate"  placeholder="请选择大类">
                      <el-option label="大类一" value="大类一"></el-option>
                      <el-option label="大类二" value="大类二"></el-option>
                      <el-option label="肝胆组织" value="肝胆组织"></el-option>
                  </el-select>-->
                  <el-input
                    placeholder="请输入大类"
                    v-model="myForm.cate_name"
                    disabled>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12" v-if="myForm.is_mask==='0'">
                <el-form-item label="标注形状" prop="shape" :label-width="formLabelWidth">
                  <el-select v-model="myForm.shape" @change="shapeOptionChange(myForm.shape)" placeholder="请选择形状">
                    <el-option v-for="(shapeOption,index) in shapeOptions" :label="shapeOption.label"
                               :value="shapeOption.value" :key="index"></el-option>

                  </el-select>
                  <!--<el-input
                          placeholder="请输入形状"
                          v-model="myForm.shape">
                  </el-input>-->
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="标注颜色" prop="color" :label-width="formLabelWidth">
                  <el-color-picker class="formColorPicker" v-model="myForm.color" @change="handleColor"></el-color-picker>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-form-item label="类别" prop="remark" :label-width="formLabelWidth">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 6}"
                  placeholder="请输入内容"
                  v-model="myForm.remark">
                </el-input>
              </el-form-item>
            </el-row>


          </el-form>

          <div slot="footer" class="dialog-footer dialogBtn">
            <el-button type="primary" @click="onSave">保 存</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>


        <el-dialog  class="addCateDialog" :title="cateTitle" :visible.sync="cateDialogVisible" center width="540px">
          <el-form :model="cateForm" ref="cateForm" :rules="cateRules" >
            <el-row>
              <el-col :span="24" class="cate-name">
                <el-form-item label="类别名" prop="cate_name" :label-width="cateLabelWidth">
                  <el-input
                    placeholder="请输入类别名"
                    v-model="cateForm.cate_name">
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-form-item label="mask标注" :label-width="cateLabelWidth">
                <el-switch
                  v-model="cateForm.is_mask"
                  active-color="#13ce66"
                  inactive-color="rgb(127, 124, 124)"
                  active-text="是"
                  inactive-text="否"
                  active-value='1'
                  inactive-value='0'
                  class="form-switch"
                  :disabled="isEdit">
                </el-switch>
              </el-form-item>
            </el-row>


          </el-form>

          <div slot="footer" class="dialog-footer dialogBtn">
            <el-button type="primary" @click="saveCate">保 存</el-button>
            <el-button @click="cancelCate">取 消</el-button>
          </div>
        </el-dialog>
      </div>
    </div>
    <div slot="main" class="labelMain">
      <div class="label-left" >
        <div class="left-top">
          <el-button type="primary" @click="createCate" class="create-cate" size="mini">新增类别</el-button>
        </div>
        <div v-loading="leftLoding" style="height:100%;" class="left-center" ref="leftCate">
          <div class="item" :class="item.cate_active==='true'?'active':''" v-for="(item,index) in cateList" :key="index"
               @click="showLabels(item.cate_index,item.cate_id)" @contextmenu.prevent="showContext(item.cate_id,index,$event)">
            <p class="left-title" :class="item.cate_active==='true'?'title-active':''">{{item.cate_name}}</p>
            <P class="right-number" v-if="item.cate_active==='false'">{{item.cate_count}}</P>
            <p class="active-number" v-else>
              <i class="el-icon-back"></i>
            </p>
            <div :class="{menu_show:item.is_show,menu_hide:!item.is_show}" :style="{top:menuTop,left:menuLeft}">
              <p @click.stop="editCate(item)" class="menu-edit"><i class="el-icon-edit"></i>编辑</p>
              <p @click.stop="deleteCate(index,item.cate_id)"><i class="el-icon-delete"></i>删除</p>
            </div>
          </div>
        </div>
      </div>
      <div class="label-right">
        <el-table
          ref="multipleTable"
          :data="tableData"
          stripe
          v-loading="loading"
          height="100%"
          tooltip-effect="dark"
          style="width: 100%">
          <el-table-column
            label="序号"
            prop="serial_num">
            <template slot-scope="scope">
              <el-input class="save-index" v-model="scope.row.serial_num"
                        @blur="saveIndex(scope.row.id,scope.row.serial_num)"></el-input>
            </template>
          </el-table-column>
          <el-table-column
            prop="shape"
            label="标注形状"
            v-if="shape">

          </el-table-column>
          <el-table-column
            prop="color"
            label="标注颜色">
            <template slot-scope="scope">
              <el-color-picker class="tableColorPicker" disabled v-model="scope.row.color"></el-color-picker>
            </template>
          </el-table-column>
          <el-table-column
            prop="remark"
            label="类别">
          </el-table-column>
          <el-table-column
            label="操作"
            fixed="right" width="180px"
          >

            <template slot-scope="scope">
              <el-button type="text"
                         size="mini"
                         class="editBtn"
                         @click="onUpData(scope)">编辑
              </el-button>
              <el-button
                @click.native.prevent="deleteRow(scope.row.id)"
                type="text"
                size="small"
                class="deleteBtn">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="position: absolute;bottom: 0;
    width: 100%;display: flex;justify-content:center ;height: 40px;align-items:flex-start">
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

    </div>

  </Pannel>

</template>
<script>
  import Pannel from '../../components/Pannel';
  import Api from '../LabelManagement/api';
  import {mapState} from 'vuex';

  export default {
    data() {
      return {
        shadow: 'hover',
        cateList: [],
        loading: false,
        pageIndex: 1,
        pageSize: 10,
        total: 10,
        title: '新增',
        tableData: [],
        multipleSelection: [],
        dialogVisible: false,
        dialogFormVisible: false,
        scope: {},
        shapeOptions: [
          {label: '椭圆', value: '椭圆', draw: 'Ellipse'},
          {label: '直线', value: '直线', draw: 'Line'},
          {label: '曲线', value: '曲线', draw: 'Curve'},
          {label: '矩形', value: '矩形', draw: 'Rectangle'},
          {label: '箭头', value: '箭头', draw: 'Arrow'}],
        myRules: {
          shape: [
            {required: true, message: '请选择标注形状', trigger: 'change'}
          ],
          color: [
            {required: true, message: '请选择标注颜色', trigger: 'change'}
          ]
        },
        myForm: {
          cate_name: '',
          shape: '',
          remark: '',
          color: '',
          is_mask:0,
        },
        formLabelWidth: '120px',
        titleList: ['标注管理'],
        currentPage: 1,
        currentRow: [],
        dd: 0,
        tableId: '',
        keyword: '',
        data: {},
        index: 0,
        cate_id: '',
        leftLoding: false,
        input: '',
        serial_num: '',
        cateForm:{
          cate_name:'',
          is_mask:'0',
        },
        cateRules:{
          cate_name:[
            {required: true, message: '请输入类别名', trigger: 'blur'}
          ],
        },
        cateDialogVisible:false,
        cateTitle:'新增类别',
        cateLabelWidth:'80px',
        is_show:false,
        menuTop:0,
        menuLeft:0,
        shape:true,
        isEdit:false,
      };
    },
    computed: {
      ...mapState(['MenuState']),
      leftWidth(){
        if(this.MenuState){
          return 255;
        }
        else return 85;
      },

    },
    watch: {
      MenuState() {
        setTimeout(() => {
          this.$root.$emit('size-change');
        }, 350);
      }
    },
    created() {
      this.getCate();

    },
    mounted(){
      window.addEventListener('click',()=>{
        this.cateList.forEach((item)=>{
          item.is_show = false;
        })
      })
    },
    methods: {

      handleColor(value){
        this.$refs.myForm.validateField('color');
      },
      saveIndex(id, num) {
        if (num) {
          let params = {
            serial_num: Number(num),
          }
          this.$http.put(`/labels/${id}`, {...params}).then(data => {
            if (data.body.ret_code === 0) {
              this.$message({
                message: data.body.ret_msg,
                type: 'success'
              });
              // 关闭模态框
              this.queryList();
            }
          });
        }

      },
      showLabels(index, data) {
        this.cateList[this.index].cate_active = 'false';
        this.index = index;
        this.cateList[this.index].cate_active = 'true';
        this.cate_id = data;
        this.pageIndex = 1;
        this.keyword='';
        this.input='';
        this.cateList[this.index].is_mask==='0' ? this.shape=true:this.shape=false;
        this.queryList();
      },

      getCate() {
        this.leftLoding = true;
        this.$http.get('/cate').then(list => {
          if (list.body.ret_code === 0) {
            if(list.body.data){
              this.cateList = list.body.data.map((item, index) => ({
                cate_count: item.label_count,
                cate_name: item.cate_name,
                cate_active: 'false',
                cate_index: index,
                cate_id: item.cate_id,
                is_mask:String(item.is_mask),
                is_show:false,
              }))
              if (this.cateList.length > 0) {
                this.cate_id = this.cateList[this.index].cate_id;
                this.cateList[this.index].cate_active = 'true';
                this.cateList[this.index].is_mask==='0' ? this.shape=true:this.shape=false;
              }

              this.queryList();
            }

          }
        }).finally(()=>{
          this.leftLoding = false;
        })
      },
      queryList() {
        this.loading = true;
        let params = {
          page: this.pageIndex,
          cate_id: this.cate_id,
          keyword: this.keyword,
        };
        Api.getlist(params).then(res => {
          if (res.body.ret_code === 0) {
            this.tableData = res.body.data.list;
            this.total = res.body.data.meta.count;
          }
        }).finally(res => {
          this.loading = false;
        })
      },

      getKeyWord(value) {
        this.keyword = value;
      },
      searchBtn() { //
        this.pageIndex = 1;
        this.queryList();
      },
      deleteRow(id) { // 表格删除 index:当前操作数组的下标   tableData:表格数据源
        /*tableData.splice(index, 1); // 数组的方法：splice（指定的位置，删除的数量）*/

        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          Api.deleteTableRow(id).then(data => {
            if (data.body.ret_code === 0) {
              this.$message({
                message: '删除成功！',
                type: 'success'
              });
              this.getCate();
            }
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      shapeOptionChange(data) {
        this.data = this.shapeOptions.find(item => {
          return item.value === data;

        })


      },
      onSave() {  // 表格保存
        this.$refs.myForm.validate((valid) => {
          if (valid) { // 判断是否填写必填项
            if (this.title === "新增标注") {  // 判断当前是否为新增操作
              let params = {
                cate_id:this.myForm.cate_id,
                cate_name: this.myForm.cate_name,
                remark: this.myForm.remark,
                color: this.myForm.color,
                is_mask:Number(this.myForm.is_mask),
              };
              if(params.is_mask===0){
                params.shape = this.myForm.shape;
                params.drawing = this.data.draw ? this.data.draw : this.myForm.drawing;
              }

              let activeIndex=this.cateList.findIndex((item)=>{
               return item.cate_name===params.cate_name;
              })
              if(activeIndex===-1){
                this.index = this.cateList.length;
              }
              else this.index = activeIndex;
              this.$http.post(`/labels`, {...params}).then(data => {
                if (data.body.ret_code === 0) {
                  this.$message({
                    message: data.body.ret_msg,
                    type: 'success'
                  });
                  // 关闭模态框
                  this.dialogFormVisible = false;
                  this.getCate();
                }
                else {
                  this.$message.error(data.body.ret_msg||'新增失败')
                }
              }).catch(()=>{
                this.$message.error('新增失败');
              });

            } else { // 表格更新操作
              // 改变指定位置的表格数据
              let params = {
                cate_id:this.myForm.cate_id,
                cate_name: this.myForm.cate_name,
                remark: this.myForm.remark,
                color: this.myForm.color,
                is_mask:Number(this.myForm.is_mask),
              };
              if(params.is_mask===0){
                params.shape = this.myForm.shape;
                params.drawing = this.data.draw ? this.data.draw : this.myForm.drawing;
              }
              this.$http.put(`/labels/${this.tableId}`, {...params}).then(data => {
                if (data.body.ret_code === 0) {
                  this.$message({
                    message: data.body.ret_msg,
                    type: 'success'
                  });
                  // 关闭模态框
                  this.dialogFormVisible = false;
                  this.queryList();

                } else {
                  this.$message.error(data.body.ret_msg||'编辑失败')
                }
              }).catch(()=>{
                this.$message.error('编辑失败');
              });

            }

          } else {
            return false;
          }
        });

      },
      onAdd() {  // 新增标注
        // this.myForm={};
        if(this.cateList.length>0){
          this.title = "新增标注";
          this.dialogFormVisible = true;
          // console.log(this.cateList[this.index].cate_name)
          this.myForm.cate_name=this.cateList[this.index].cate_name;
          this.myForm.cate_id = this.cateList[this.index].cate_id;
          this.myForm.is_mask = this.cateList[this.index].is_mask;
        }
        else {
          this.$message.error('请先新增类别');
        }

      },
      onUpData(scope) {  // 修改标注 scope:当前行的数据
        this.scope = scope;
        this.tableId = scope.row.id;
        this.title = "更新标注";
        // 将当前行的数据赋值给表单中的对应项
        this.myForm = {
          cate_name: scope.row.cate_name,
          shape: scope.row.shape,
          remark: scope.row.remark,
          color: scope.row.color,
          drawing: scope.row.drawing,
          cate_id:this.cateList[this.index].cate_id,
          is_mask:this.cateList[this.index].is_mask,
        };
        this.dialogFormVisible = true;
      },
      cancel() { // 模态框取消事件
        this.$refs['myForm'].resetFields();
        this.myForm = {
          cate_name: '',
          shape: '',
          remark: '',
          color: '',
          drawing: ''
        };
        this.dialogFormVisible = false;
      },
      createCate(){
        this.cateTitle = '新增类型';
        this.isEdit=false;
        if(this.$refs['cateForm']){
          this.$refs['cateForm'].resetFields()
        }
        this.cateForm={
          cate_name:'',
          is_mask:'0',
        };
        this.cateDialogVisible = true;
      },
      saveCate(){
        let params={
          cate_name:this.cateForm.cate_name,
          is_mask:this.cateForm.is_mask,
        }
        params.is_mask = Number(params.is_mask);
        this.$refs.cateForm.validate((valid)=>{
          if(valid){
            if(this.cateForm.cate_id){
              this.$http.put(`/cate/${this.cateForm.cate_id}`,params).then(({body})=>{
                if(body.ret_code===0){
                  this.$message.success('编辑成功');
                  this.cateDialogVisible = false;
                  this.getCate();
                }
                else {
                  this.$message.error(body.ret_msg?body.ret_msg:'编辑失败')
                }
              }).catch(()=>{
                this.$message.error('编辑失败');
              })
            }
            else {
              this.$http.post('/cate',params).then(({body})=>{
                if(body.ret_code===0){
                  this.$message.success('添加成功');
                  this.cateDialogVisible = false;
                  this.getCate();
                }
                else {
                  this.$message.error(body.ret_msg?body.ret_msg:'添加失败')
                }
              }).catch(()=>{
                this.$message.error('添加失败');
              })
            }
          }
        })
      },
      cancelCate(){

        this.cateDialogVisible = false;
      },
      showContext(id,index,e){
        this.cateList.forEach((item)=>{
          if(item.cate_id===id){
            item.is_show=true;
          }
          else {
            item.is_show = false;
          }
        })
        this.menuLeft=e.pageX-this.leftWidth+'px';
        let topY
        if(this.index>=index)
        {
          topY = 205+(index*20)+(index*40)-this.$refs.leftCate.scrollTop;
        }
        else {
          topY = 205+(index*20)+(index*40)+10-this.$refs.leftCate.scrollTop;
        }
        this.menuTop = e.pageY-topY+'px';
      },
      editCate(item){
        this.cateTitle = '编辑类别';
        this.isEdit=true;
        this.cateDialogVisible = true;
        this.cateForm= item;
        this.cateList.forEach((item)=>{
          item.is_show = false;
        })
      },
      deleteCate(index,id){

        this.cateList.forEach((item)=>{
          item.is_show = false;
        })
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.delete(`/cate/${id}`).then(({body}) => {
            if (body.ret_code === 0) {
              this.$message({
                message: '删除成功！',
                type: 'success'
              });
              if(index===this.index){
                this.index = 0;
              }
              else if(this.index>index){
                this.index--;
              }
              this.getCate();
            }
            else if(body.ret_code=== 107){
              this.$message.error('请清空该分类或全部移到其他分类，再删除！');
            }else{
              this.$message.error(body.ret_msg||'删除失败');
            }
          }).catch(()=>{
            this.$message.error('删除失败');
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },


      handleSizeChange(val) {
      },
      handleCurrentChange(val) {
        this.pageIndex = val;
        this.queryList();
      }
    },
    components: {
      Pannel,
    }
  }
</script>

<style lang="scss">
  .bannerTitle {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .bannerTitleRight {
      display: flex;
      .new-label {
        width: 122px;
      }
      .el-input__inner {
        line-height: 30px;
        width: 122px;
        height: 30px;
        border: 1px solid rgba(236, 236, 236, 1);
      }

      .el-input-group__append, .el-input-group__prepend {
        padding: 0 12px;
      }
      & > button {
        margin-left: 10px;
      }
      .addDialog {
        .el-dialog {
          max-width: 650px;
          min-width: 570px;
          .el-form {

            .el-input__inner {
              line-height: 31px;
              width: 90%;
              height: 31px;
            }
            .el-col-12{
              .el-input__inner {
                line-height: 31px;
                width: 100%;
                height: 31px;
              }
            }
            .el-textarea__inner {
              width: 90%;
            }
          }
          .dialogBtn button {
            width: 103px;
            height: 34px;
            line-height: 0;
          }
        }

      }
      .addCateDialog{
        .el-form{
          width:450px;
          margin:auto;
          .el-input__inner{
            width:100%;
            height:35px;
          }

        }
        .dialogBtn button {
          width: 103px;
          height: 34px;
          line-height: 0;
        }

      }
    }
  }

  .labelMain {
    width: 100%;
    padding: 20px 0 0 0;
    overflow: hidden;
    display: flex;
    background: #f3f3f3;
    .label-left {
      display:flex;
      flex-direction: column;
      width: 220px;
      background: white;
      padding: 15px 8px 0 20px;
      .left-top{
        height:50px;
        text-align:center;
      }
      .left-center{
        flex:1;
        overflow:auto;
        .item {
          position: relative;
          border-radius: 4px;
          border: 1px solid #ebeef5;
          background-color: #fff;
          color: #303133;
          transition: .3s;
          box-sizing: border-box;
          width: 180px;
          height: 40px;
          padding: 0 10px 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          cursor: pointer;
          .menu_hide{
            display:none;
          }
          .menu_show{
            display:block;
            position:absolute;
            width:70px;
            height:45px;
            background-color: #263238;
            z-index:2000;
            border-radius:4px;
            box-shadow:0 4px 8px 0 rgba(0,0,0,0.6);
            p{
              color: white;
              margin: 0;
              padding: 2px 10px;
              font-size: 12px;
              cursor:pointer;
              &.menu-edit{
                margin-bottom:2px;
              }
              i{
                margin-right:6px;
              }
            }

          }
          &.active {
            width: 195px;
            height: 50px;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
            p.title-active {
              font-size: 17px;
              font-weight: 600;
              color: rgba(79, 147, 254, 1);
            }
            p.active-number {
              position: absolute;
              color: #faf9f9;
              font-size: 12px;
              top: 50%;
              margin-top: -11px;
              right: -10px;
              height: 22px;
              transition: right .4s;
              width: 22px;
              border-radius: 50%;
              background: #489ae8;
              .el-icon-back {
                transform: rotate(180deg);
                margin: 5px 0 0 5px;
              }
            }
          }
          p.left-title {
            font-size: 15px;
            font-weight: 400;
            color: rgba(162, 162, 162, 1);
          }
          p.active-number {
            position: absolute;
            color: #faf9f9;
            font-size: 12px;
            top: 7px;
            right: -10px;
            height: 22px;
            transition: right .4s;
            width: 22px;
            border-radius: 50%;
            background: #489ae8;
            .el-icon-back {
              transform: rotate(180deg);
              margin: 5px 0 0 5px;
            }
          }
          p.right-number {
            /*position:absolute;*/
            color: #faf9f9;
            font-size: 12px;
            /*top: 4px;*/
            /*right: 23px;*/
            height: 15px;
            border-radius: 10px;
            padding: 1px 8px 2px;
            background: #e67477;
          }
        }
      }


    }
    .label-right {
      background: white;
      padding: 25px 25px 0 25px;
      flex: 1;
      margin-left: 20px;
      overflow: hidden;
      position: relative;
      .el-table__fixed-right::before, .el-table__fixed::before {
        height: 0;
      }
      .el-table {
        height: calc(100% - 40px) !important;
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
        .tableColorPicker {
          height: 0;
          .el-icon-arrow-down:before {
            content: '';
          }
          .el-color-picker__mask {
            display: none;
          }
          .el-color-picker__trigger {
            width: 16px;
            height: 16px;
            padding: 0;
          }

        }
        .editBtn {
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
        .deleteBtn {
          color: #DA7265;
          line-height: 26px;
          padding: 0 10px;
          &:focus {
            color: #DA7265;
          }
          &:hover {
            color: #fff;
            background: #DA7265;
          }
        }
        .save-index {
          height: 30px;
          width: 50px;
          .el-input__inner {
            height: 30px;
            text-align: center;
          }
        }

      }
    }

  }

</style>
