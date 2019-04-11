import Pannel from '../../components/Pannel'
import Api from './users.service.js';

export default {

  data() {
    return {
      banner: false,
      currentData: {},
      currentNode: {},
      groupData: [],
      showGroups: false,
      showUsers: false,
      data5: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      zongProps: {
        children: 'typeChildren',
        label: 'typeName'
      },
      titleList: ['用户管理'],
      dialogUser: false,
      dialogGroup: false,
      filterText: '',
      userForm: {
        username: '',
        nickname: '',
        role_id: '',
        role_name: '',
        cate: [],
        percentage: 60,
        defaultChecked: [],
      },
      groupForm: {
        hospital: '',
        haveType: [],
        defaultChecked: [],
        workload:{
          labeled:0,
          labeling:0,
          rechecked:0,
          rechecking:0,
          sum:0,
        },
      },
      userMessages: {
        username: '',
        nickname: '',
        role_id: 0,
        role_name: '',
        cates: [],
        hospital: '',
        percentage: 60,
        defaultChecked: [],

      },
      groupMessages: {
        hospital: '',
        groupData: [],
        checkedArray: []
      },
      slice_count: 0,
      processed_count: 0,
      newUser: true,
      userRules: {
        //这里写了前面会有一个红色的*（星号）
        username: [
          {required: true, message: '请输入账号', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'}
        ],
        nickname: [
          {required: true, message: '请输入用户名', trigger: 'blur'}
        ],
        role_name: [
          {required: true, message: '请选择用户身份', trigger: 'change'}
        ],
        defaultChecked:[
          {required: true, message: '请选择分类', trigger: 'check'}
        ]

      },
      groupRules: {
        hospital: [
          {required: true, message: '请输入医院名称', trigger: 'blur'}
        ],
        checkedArray:[
          {required: true, message: '请选择分类', trigger: 'check'}
        ]

      },
      userClick: false,
      groupClick: false,
      loading: false,
      createGLoading: false,
      createULoading: false,

      showGLoading: false,
      editGroup: false,
      cates: [],
      defaultExpanded: [],
      expand: 0,
      showProgress: false,
      groupProps: {
        label: 'cate_name',
        children: 'children'
      },
      userProps: {
        label: 'cate_name',
        children: 'children'
      },
      promptShow:false,
      prompt:'',

    };
  },
  components: {
    Pannel,
  },
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val);
    }
  },
  created() {
    this.hospitalList();

  },


  methods: {
    usernameChange(){
      this.promptShow=false;
    },

    hospitalList(url) {
      this.loading = true;
      const list = Api.hospitalList('/groups').then(res => {
        if (res.body.ret_code === 0) {
          this.data = JSON.parse(JSON.stringify(res.body.data).replace(/hospital_name/g, "label"));
          this.data = JSON.parse(JSON.stringify(this.data).replace(/nickname/g, "label"));
          this.data = JSON.parse(JSON.stringify(this.data).replace(/users/g, "children"));
          this.data5 = JSON.parse(JSON.stringify(this.data))
          // this.defaultExpanded = [18];
          // debugger;
          if (this.data5.length > 0) {
            this.data5.forEach(item => {
              item.hospital_id = item.id;
              for (let i = 0; i < item.children.length; i++) {
                item.children[i].icon = 'fa fa-user';
                item.children[i].role_name = this.isRole(item.children[i].role_id)
                if (item.children[i].role_name.includes('标注')) {
                  item.children[i].color = 'rgba(218,114,101,1)';
                }
                else if (item.children[i].role_name.includes('审核')) {
                  item.children[i].color = 'rgba(235,192,99,1)';
                }
                else if (item.children[i].role_name.includes('复审')) {
                  item.children[i].color = 'rgba(79,147,254,1)';
                }
                else item.children[i].color = 'rgba(131,199,102,1)';
              }
            })
            if (arguments.length === 0) {
              this.defaultHospital(`/groups/${this.data5[0].id}`);
            }
            else if ((url.indexOf('group') !== -1) || (url.indexOf('user') !== -1)) {
              this.defaultHospital(url);
            }
          }
          else {
            this.groupForm.hospital = '';
            this.groupForm.haveType = []

          }
        }
      }).finally(() => {
        this.loading = false;
      })
    },
    defaultHospital(url) {
      if (url.indexOf("user") !== -1) {
        this.showGLoading = true;
        this.showUsers = false;
        this.showGroups = false;
        Api.userDetail(url).then(res => {
          if(res.body.ret_code===0){
            if(res.body.data){
              res.body.data.role_name = this.isRole(res.body.data.role_id);
              this.userForm = res.body.data;
              this.userForm.cates = this.userForm.cates.filter((item)=>item.cate_name)
              this.slice_count = res.body.data.all;
              this.processed_count = res.body.data.processed
              if (this.slice_count === 0) {
                this.showProgress = false;
              }
              else {
                this.showProgress = true;
                let prop = this.processed_count / this.slice_count;
                prop = parseInt(prop * 100);
                this.userForm.percentage = prop;
              }
              this.userForm.defaultChecked = []
              this.showUsers = true;
            }
          }
        }).finally((res) => {
          this.showGLoading = false;
        });
      }
      else if (url.indexOf("group") !== -1) {
        this.showUsers = false;
        this.showGroups = false;
        this.showGLoading = true;
        Api.userGroup(url).then(res => {
          if(res.body.ret_code===0){
            if(res.body.data){
              this.currentData = JSON.parse(JSON.stringify(res.body.data).replace(/users/g, "children"));
              this.groupForm.id = res.body.data.id;
              this.groupForm.hospital = res.body.data.hospital_name;
              this.groupForm.haveType = res.body.data.cates.filter((item)=>item.cate_name);
              this.groupForm.workload = res.body.data.workload;

              // this.groupForm.haveType = JSON.parse(JSON.stringify(res.body.data.cates).replace(/cate_name/g, "label"));
              // this.groupForm.haveType = JSON.parse(JSON.stringify(this.groupForm.haveType).replace(/sec_cates/g, "children"));
              this.showGroups = true;
            }
          }

        }).finally(res => {
          this.showGLoading = false;
        })
      }


    },

    toEdituser(formName) {
      this.promptShow=false;
      this.prompt='';
      this.groupForm = {
        hospital: '',
        haveType: [],
        defaultChecked: [],
        workload:{
          labeled:0,
          labeling:0,
          rechecked:0,
          rechecking:0,
        },
      }
      //resetFields()方法会让表单的数值变成第一次被赋值的时候
      if (this.$refs['userMessages']) this.$refs['userMessages'].resetFields();
      //更新类别选中的key的数组
      this.userForm.defaultChecked = []
      this.userForm.cates.forEach((val, index) => {
        this.userForm.defaultChecked.push(val.cate_id);
      })
      let _form = {}
      _form = this.userForm;
      this.userMessages = {..._form};
      this.createULoading = true;
      Api.userGroup(`/groups/${this.userMessages.work_group_id}`).then(res => {
        if(res.body.ret_code===0){
          if(res.body.data){
            if(res.body.data.cates){
              this.userMessages.cates = res.body.data.cates;
              this.userMessages.cates.forEach((item) => {
                item.id = item.cate_id;
              })
              // console.log(this.userMessages.cates)
              this.userMessages.cates = this.userMessages.cates.filter((item)=>item.cate_name)
              // this.$refs['newUTree'].setCheckedKeys(this.userMessages.defaultChecked);
              this.userMessages.hospital = res.body.data.hospital_name;
            }
          }
        }

      }).finally((res) => {
        this.createULoading = false;
      });
      this.dialogUser = true;

    },
    toEditgroup() {
      this.dialogGroup = true;
      this.editGroup = true;
      if (this.$refs['groupMessages']) this.$refs['groupMessages'].resetFields();
      this.groupMessages.hospital = this.groupForm.hospital;

      //用于选中的类别
      this.groupForm.defaultChecked = []
      this.groupForm.haveType.forEach((val, index) => {
        this.groupForm.defaultChecked.push(val.cate_id);

      })
      this.groupMessages.checkedArray = this.groupForm.defaultChecked;
      this.createGLoading = true;
      Api.createGroup('/cate').then((res) => {
        // res.body.data = JSON.parse(JSON.stringify(res.body.data).replace(/cate_name/g, "label"));
        if(res.body.ret_code===0){
          if(res.body.data){
            res.body.data = res.body.data.map((item) => ({
              typeName: item.cate_name,
              id: item.cate_id,
            }))
            this.groupMessages.groupData = res.body.data;
            // this.$refs['newGTree'].setCheckedKeys(this.groupMessages.checkedArray);
          }
        }

      }).finally((res) => {
        this.createGLoading = false;
      })


    },
    createUser() {
      this.promptShow=false;
      this.prompt='';
      if (this.groupClick) {
        //清空之前填写的所有记录，要用这个重置方法，那些表单项必须有prop属性
        if (this.$refs['userMessages']) {
          this.$refs['userMessages'].resetFields();
          this.userMessages = {
            username: '',
            nickname: '',
            role_id: 0,
            role_name: '',
            cates: [],
            hospital: '',
            defaultChecked: [],
          };
          // this.$refs['newUTree'].setCheckedKeys(this.userMessages.defaultChecked);
        }
        this.dialogUser = true;
        this.userMessages.defaultChecked=[];

        this.$set(this.userMessages,'role_name','标注专家')
        this.userMessages.hospital = this.groupForm.hospital
        this.userMessages.cates = this.groupForm.haveType;
        this.userMessages.cates = JSON.parse(JSON.stringify(this.groupForm.haveType).replace(/cate_id/g, "id"))


      }
      else {
        this.$message.error("请先选择医院");
      }


    },
    createGroup() {

      if (this.$refs['groupMessages']) {
        this.$refs['groupMessages'].resetFields();
      }
      this.editGroup = false;
      this.dialogGroup = true;
      this.groupMessages={
        checkedArray:[],
        hospital:'',
        groupData:[],
      }
      this.createGLoading = true;

      Api.createGroup('/cate').then((res) => {
        // res.body.data = JSON.parse(JSON.stringify(res.body.data).replace(/cate_name/g, "label"));
        if(res.body.ret_code===0){
          if(res.body.data){
            res.body.data = res.body.data.map((item) => ({
              typeName: item.cate_name,
              id: item.cate_id,
            }))
            this.groupMessages.groupData = res.body.data;
            // console.log(this.$refs['newGTree']);
            this.$refs['newGTree'].setCheckedKeys([]);
          }

        }

      }).finally((res) => {
        this.createGLoading = false;

      })


    },
    cancelUser() {
      this.dialogUser = false;
    },
    saveUser(formName) {
      this.promptShow=false;
      this.getNodes('newUTree');
      let params = {
        username: this.userMessages.username,
        password: this.userMessages.password ? this.userMessages.password : '',
        group_id: this.groupForm.id || this.userMessages.work_group_id,
        nickname: this.userMessages.nickname,
        role_id: this.userMessages.role_name,
        cates: this.cates,
        // datarange:dataRange,
      }
      // console.log(params)
      var p = /[0-9]/;
      if (!p.test(params.role_id)) {
        if (params.role_id === "标注专家") {
          params.role_id = '1';
        }
        else if (params.role_id === "审核专家") {
          params.role_id = '2';
        }
        else params.role_id = '0';
      }

        //更新类别选中的key的数组
        this.userMessages.defaultChecked = this.$refs['newUTree'].getCheckedKeys();
      // console.log(formName)
      // console.log(this[formName]);
        this.$refs.userMessages.validate((valid) => {
          // console.log(valid)
          if (valid) {
              if (!this.userMessages.id) {

                Api.createUser('/users', params).then((res) => {
                  if(res.body.ret_code===0){
                    this.$message.success(res.body.ret_msg);
                    this.defaultExpanded = []
                    this.defaultExpanded.push(this.groupForm.id)
                    this.hospitalList(`/groups/${this.groupForm.id}`);
                    this.dialogUser = false;

                  }
                  else{
                    if(~res.body.ret_msg.indexOf('已经存在')){
                      this.promptShow=true;
                      this.prompt='该账号已存在';
                    }
                    else {
                      this.$message.error(res.body.ret_msg)
                    }

                  }
                }).catch(() => {
                  this.$message.error('新增用户失败')
                })
              }
              else {
                params.id = this.userMessages.id;
                Api.patchUser(`/users/${this.currentNode.data.id}`, params).then((res) => {
                  if(res.body.ret_code===0){
                    this.$message.success(res.body.ret_msg);
                    this.defaultExpanded = []
                    this.defaultExpanded.push(this.currentNode.parent.data.id);
                    this.hospitalList(`/users/${this.currentNode.data.id}`);
                    this.dialogUser = false;
                  }
                  else{
                    if(~res.body.ret_msg.indexOf('已经存在')){
                      this.promptShow=true;
                      this.prompt='该账号已存在';
                    }
                    else {
                      this.$message.error(res.body.ret_msg)
                    }

                  }
                }).catch(() => {
                  this.$message.error('修改用户失败')
                })
              }

          }

        })



    },
    cancelGroup() {
      this.dialogGroup = false;
    },
    saveGroup() {
      //得到选择的节点id
      this.getNodes('newGTree')
      let params = {
        hospital: this.groupMessages.hospital,
        cates: [...this.cates],
      }
        this.groupMessages.checkedArray = this.$refs['newGTree'].getCheckedKeys();
        this.$refs['groupMessages'].validate((valid) => {
          if (valid) {
            if (this.editGroup) {
              Api.patchGroup(`/groups/${this.groupForm.id}`, params).then((res) => {
                if(res.body.ret_code===0){
                  this.$message.success(res.body.ret_msg);
                  this.hospitalList(`/groups/${this.groupForm.id}`);
                  this.defaultExpanded = []
                  this.defaultExpanded.push(this.groupForm.id);
                  this.dialogGroup = false;

                }
                else {
                  this.$message.error(res.body.ret_msg);
                }

              }).catch(() => {
                this.$message.error(res.body.ret_msg)
              })
            }
            else {
              Api.saveGroup('/groups', params).then((res) => {
                if(res.body.ret_code===0){
                  this.$message.success(res.body.ret_msg);
                  this.hospitalList();
                  this.dialogGroup = false;
                  this.defaultExpanded = [];
                }
                else {
                  this.$message.error(res.body.ret_msg)
                }
              }).catch(() => {
                this.$message.error(res.body.ret_msg)
              })
            }
            // this.$refs['newGTree'].setCheckedKeys([])
          }
        })



    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    //点击树形控件的某项的回调函数
    handleNodeClick(item, node) {

      this.currentData = item;
      this.expand = item.id;
      this.index = node.parent.data.id;
      this.currentNode = node;
      var flag = false;
      for (let prop in item) {
        if ((Object.prototype.hasOwnProperty.call(item, prop))) {
          if (prop === "role_id") {
            flag = true;
          }
        }
      }

      if (flag) {
        // 子节点
        this.groupClick = false;
        this.userClick = true;

        //点击切换成用户信息展示
        this.showGLoading = true;
        Api.userDetail('/users/' + `${item.id}`).then(res => {
          if(res.body.ret_code===0){
            res.body.data.role_name = this.isRole(res.body.data.role_id);
            this.userForm = res.body.data;
            this.userForm.cates = this.userForm.cates.filter((item)=>item.cate_name)
            this.slice_count = res.body.data.all;
            this.processed_count = res.body.data.processed
            if (this.slice_count === 0) {
              this.showProgress = false;
            }
            else {
              this.showProgress = true;
              let prop = this.processed_count / this.slice_count;
              prop = parseInt(prop * 100);
              this.userForm.percentage = prop;
            }
            this.showGroups = false;
            this.showUsers = true;
          }
        }).finally((res) => {
          this.showGLoading = false;
        });


      }
      else {
        //父节点
        // debugger;
        this.showUsers = false;
        // this.groupForm = {}
        this.groupClick = true;
        this.userClick = false;
        this.showGroups = true;
        this.showGLoading = true;

        Api.userGroup('/groups/' + `${item.id}`).then(res => {
          if(res.body.ret_code===0){
            this.groupForm.id = res.body.data.id;
            this.groupForm.hospital = res.body.data.hospital_name;
            this.groupForm.haveType = res.body.data.cates.filter((item)=>item.cate_name);
            this.groupForm.workload = res.body.data.workload;
            this.newUser = true;
          }
        }).finally((res) => {
          this.showGLoading = false;
        });


      }


    },

    toRemove(message) {

      this.$confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const parent = this.currentNode.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === this.currentNode.data.id);
        Api.deleteUser('/users/' + `${this.currentNode.data.id}`)
          .then((res) => {
            if(res.body.ret_code===0){
              children.splice(index, 1);
              parent.childNodes.splice(index, 1);
              if (parent.childNodes.length === 0) {
                this.currentNode = parent;
              }
              else {
                this.currentNode = parent.childNodes[0];
              }
              this.$message.success(res.body.ret_msg);
              this.defaultExpanded = [];
              if (this.currentNode.level === 2) {
                this.defaultExpanded = [];
                this.defaultExpanded.push(this.currentNode.parent.data.id);
                this.currentData = this.currentNode.data;
                this.hospitalList(`/users/${this.currentNode.data.id}`);
              }
              else {
                this.defaultExpanded = [];
                this.defaultExpanded.push(this.currentNode.data.id);
                this.groupClick = true;
                this.currentData = this.currentNode.data;
                this.hospitalList(`/groups/${this.currentNode.data.id}`);
              }
            }
            else {
              this.$message.error(res.body.ret_msg);
            }


          }).catch((res) => {
          this.$message.error('删除失败');
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });


    },
    toDeletegroup() {
      if (this.groupClick) {
        if (this.currentData.children && this.currentData.children.length > 0) {
          this.$message.error('请先删除用户');
          return false;
        }
        else {
          const parent = this.currentNode.parent;
          const children = parent.data.children || parent.data;
          const index = children.findIndex(d => d.id === this.currentData.id);
          Api.deleteGroup('/groups/' + `${this.groupForm.id}`).then((res) => {
            if(res.body.ret_code===0){
              children.splice(index, 1);
              parent.childNodes.splice(index, 1);
              this.$message.success('删除成功');
              if (parent.childNodes && parent.childNodes.length > 0) {
                this.currentNode = parent.childNodes[0];
                this.currentData = this.currentNode.data;
              }

              this.hospitalList();
            }
            else {
              this.$message.error(res.body.ret_msg?res.body.ret_msg:'删除失败')
            }

          }).catch((error) => {
            this.$message.error('删除失败')
          })
        }
      }
      else this.$message.error('请先选择医院');

    },
    toDeleteuser() {
      if (this.userClick) {
        let deleteMessages
        if(this.showProgress){
          deleteMessages='该用户下面有切片，如果删除，切片会进入相应的未分配表格中,是否继续?';
        }
        else{
          deleteMessages='此操作将永久删除该信息, 是否继续?'
        }
        this.toRemove(deleteMessages);

      }
      else this.$message.error('请先选择用户');

    },
    isRole(data) {
      if (data === 0 || data === '0') {
        return '管理员'
      }
      else if (data === 1 || data === '1') {
        return '标注专家'
      }
      else if (data === 2|| data==='2') {
        return '审核专家'
      }

    },
    getNodes(refName) {
      // console.log(refName)
      this.cates = this.$refs[refName].getCheckedKeys();
      if(refName==='newUTree'){
        this.$set(this.userMessages,'defaultChecked',this.cates)
        // this.userMessages.defaultChecked = [...this.cates];
        // console.log('this.userMessages.defaultChecked:',this.userMessages.defaultChecked)
        // console.log(this.$refs.userMessages)
        // console.log(this.$refs.userMessages.validateField)
        this.$nextTick(() => {
          this.$refs.userMessages.validateField('defaultChecked');
        })
      }
      else if(refName==='newGTree'){
        this.$set(this.groupMessages,'checkedArray',this.cates)
        // console.log('this.groupMessages.checkedArray:',this.groupMessages.checkedArray)
        this.$refs.groupMessages.validateField('checkedArray');
      }
      return this.cates;
    },
    validateMessages(...rest) {
      // console.log(rest);
    },

  },


}
