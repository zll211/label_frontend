import slideView from '../slideView/slideView.vue';
import Api from '../../view/CheckMan/Uncheck/api';
import config from '../../../config/hzzt';
import pisSlideView from '../pisSlideView/pisSlideView';

export default {
  data() {
    return {
      loading: true,
      pageSize: 10,
      total: 10,
      title: '新增',
      currentPage: 1,
      currentModePage: 1,
      currentRow: {},
      tableModelData: [],
      color: '#0000FF',
      labelList: [],
      labelImage: [],
      listLoading: false,
      list: {},
      path: '/ASC-US/T2017-08468.kfb',
      currentData: {},
      listData: [],
      checkedPage: [],
      searchContent: '',
      modeMainPageSize: 10,
      modeMainTotal: 0,
      modePageIndex: 1,
      newList: [],
      markTable: true,
      markAbled: false,
      leftList: false,
      nextContent: '下一张',
      modeEnter: true,
      index: 0,
      currentPageCount: 0,
      dialoglabelVisible: false,
      labelForm: {
        advice: '',
      },
      bottomList: true,
      showBottom: true,
      typeList: [],
      listIndex: 0,//轮播图中可视范围内的最左边图片的index
      redIndex: undefined,
      deleteFlag: false,
      sliceNum: 0,
      clickRed: false,
      markLoading: false,
      slice_id: undefined,
      searchListData:[],
      innerMask:this.isMask,
      leftListData:[],
      clearTimeId:null,
    };
  },
  props: {
    sliceIndex: Number,
    status: Number,
    isSubmit: Boolean,
    pageIndex: Number,
    isMask:Number,
    search:{
      type: String,
      default:'',
    },
    sliceValue:{
      type:String,
      default:'',
    },
    hospitalValue:{
      type:String,
      default:'',
    },
    userValue:{
      type:String,
      default:'',
    }
  },
  components: {
    slideView,
    pisSlideView

  },
  computed: {
    rightValue() {
      if (this.showBottom) {
        return 566 + 'px';
      }
      else {
        return '38px';
      }
    },
    ulStyleObject() {
      return {
        width: this.labelImage.length * 98 + 'px',
        left: (-98) * this.listIndex + 'px',
        transitionProperty: 'left',
        transitionDuration: '.5s',
      }
    },
    unSubmit() {
      if (this.status === 5 || this.status === 2)
        return '不予标注';
      else if (this.status === 3 || this.status === 4) {
        return '不予审核';
      }
    },
    doSubmit() {
      let label = '标注完成';
      let check = '审核完成';
      if (this.status === 5 || this.status === 2)
        return label;
      else if (this.status === 3 || this.status === 4) {
        return check;
      }
    },
  },


  created() {

  },
  mounted() {
    this.switchMode();
    window.onresize = () => {
      this.$root.$emit('size-change');
    };
    document.addEventListener('click', this.clickListener, false);


  },
  beforeDestroy() {

    document.removeEventListener('click', this.clickListener, false);

  },
  directives: {
    'focus': {
      bind: function (el) {

      },
      inserted: function (el) {
        el.focus();
      }
    }
  },
  methods: {

    selectPoint(data) {
      if (data) {
        if(data.id){
          let selectIndex = this.labelList.findIndex((item) => item.select === true);
          this.redIndex = selectIndex;
          this.labelImage.forEach((item, index) => item.select = index === this.redIndex);
          if (this.labelImage.length >= 5) {
            if (this.redIndex + 4 <= this.labelImage.length - 1) {
              this.listIndex = this.redIndex;
            }
            else this.listIndex = this.labelImage.length - 5;
          }
          else {
            this.listIndex = 0;
          }
        } else {
          this.labelImage.forEach((item) => item.select = false);
        }
        }

    },
    clickListener(e) {
      if (this.$refs.inputBox && this.$refs.nextLabels) {
        var nextlabels = this.$refs.nextLabels.contains(e.target);
        var inputBox = this.$refs.inputBox.contains(e.target);
        if (!nextlabels && !inputBox) {
          this.leftList = false;
        }
      }
    },
    handleShowBottom() {
      this.showBottom = !this.showBottom;
    },
    turnLeft() {
      this.redIndex = this.labelImage.findIndex(item => item.select);
      if (!~this.redIndex) {
        this.listIndex -= 5
      }
      else if (this.redIndex >= this.listIndex && this.redIndex < this.listIndex + 4) {
        this.listIndex = this.redIndex - 4;
      }
      else {
        this.listIndex -= 5
      }
      if (this.listIndex < 0) {
        this.listIndex = 0;
      }
    },
    turnRight() {
      if (this.labelImage.length > 5) {
        this.redIndex = this.labelImage.findIndex(item => item.select);
        if (!~this.redIndex) {
          this.listIndex += 5
        }
        else if (this.redIndex > this.listIndex && this.redIndex <= this.listIndex + 4) {
          this.listIndex = this.redIndex;
        }
        else {
          this.listIndex += 5
        }
        if (this.listIndex > (this.labelList.length - 5)) {
          this.listIndex = this.labelList.length - 5;
          this.$message.warning('没有更多数据了');
        }
      }
      else{
        this.$message.warning('没有更多数据了');
      }
    },
    // 得到右下角已经标注过的切片图片列表，当点击图片之后由子组件触发父组件相关事件
    async getLabelList(data) {
      this.labelList = data || [];
      let params = {
        file: this.path,
      }
      await Api.getMarkedImage('/slice/labels', params).then(res => {
        if (res.status === 200) {
          this.labelImage = res.body.map((item) => ({
            imageUrl: item.imageUrl,
            select: false,
          }));
        }
      }).catch((err) => {
        this.$message.warning('你标注的图形有错误！请删除后重新标注')
      });
      if (this.deleteFlag) {
        if (this.listIndex > 0) {
          this.listIndex -= 1;
        }
      }
      this.deleteFlag = false;
    },
    //点击右下角标注图片执行的方法
    labelClick(index) {
      this.labelList.forEach(item => {
        item.select = false;
      });
      this.redIndex = index;
      let label = this.labelList[index];
      this.labelImage.forEach((item, index) => {
        item.select = index === this.redIndex;
      });
      this.list = label;
      this.$refs.readSlice.switchPicture(label);
    },
    checkDelete(data) {
      //这里的labelList还是原来的，未删除时候的
      this.deleteFlag = true;
      this.redIndex = undefined;
    },
    submit() {
      this.markAbled = false;
      if (this.$refs['labelForm']) this.$refs['labelForm'].resetFields();
      this.labelForm.advice = '';
      this.dialoglabelVisible = true;
    },
    //得到右上角标注表格
    getMarkList() {
      this.markLoading = true;
      let params = {
        slice_id: this.slice_id,
      };
      Api.getMarkList('/all_labels', params).then(res => {
        if (res.body.ret_code === 0) {
          if (res.body.data) {
            res.body.data.forEach(item => {
              item.type = `${item.cate_name}`;
              this.typeList.push({name: item.type});
            })
            this.tableModelData = res.body.data
            if (this.tableModelData.length > 0) {
              this.currentRow = this.tableModelData[0];
            }

          }

        }

      }).finally(() => {
        this.markLoading = false;
      })

    },
    //表格行点击事件
    handleRowClick(row, event, column) {
      this.currentRow = row;
      let type = row.drawing;
      let option = {color: row.color, description: row.remark};
      this.color = row.color;
      this.$refs.readSlice.setDrawContents(type, option)
    },
    showMarkTable() {
      this.markTable = !this.markTable;
    },
    handleShowLeft() {
      this.leftList = true;

    },
    //切换模式方法
    toTableMode() {
      this.leftList = false;
      this.showBottom = true;
      this.$store.commit('ShowStateTaggle');
      this.labelImage = [];
      this.$emit('toTableMode');
    },
    async switchMode() {
      this.markLoading = true;
      this.path = undefined;
      this.modeEnter = true;
      this.currentModePage = this.pageIndex
      this.listLoading = true;
      this.modePageIndex = this.pageIndex;
      // console.log(this.currentModePage)
      let params = {
        page: this.modePageIndex,
        status: this.status,
        keyword: this.searchContent,
        cate_id: this.sliceValue,
        group_id:this.hospitalValue,
        user_id:this.userValue,
      };
      if(this.search !==''){
        params.keyword = this.search;
      }
      await Api.getlist(params).then(res => {
        //组合数据结构然后赋给listData
        if (res.body.data.list) {
          res.body.data.list.forEach(item => {
            item.checked = false;
            item.previewImg = `/api/slice/get_image?file=${item.path}&type=preview`;
            item.label = `/api/slice/get_image?file=${item.path}&type=label`;
          })
          this.listData = res.body.data.list;
          this.modeMainTotal = res.body.data.meta.count;
          // debugger;
          this.currentPageCount = this.listData.length;
          this.sliceNum = res.body.data.meta.count - 1;
          //设置默认值，当前值
          if (this.sliceIndex !== -1) {
            this.modeEnter = false;
            this.currentData = this.listData[this.sliceIndex];
            this.index = this.sliceIndex;
          }
          else {
            this.currentData = this.listData[0];
            this.index = 0;
          }
          this.currentData.checked = true;
          this.slice_id = this.currentData.id;
          this.path = this.currentData.path;

          this.getMarkList();

        }
      }).finally(res => {
        this.listLoading = false;
      })
      this.currentModePage = this.pageIndex


    },

    handleInput() {
      this.modePageIndex = 1;
      this.currentModePage = 1;
      if (this.clearTimeId) {
        clearTimeout(this.clearTimeId);
        this.clearTimeId = null;
      } else if (!this.clearTimeId) {
        this.searchList();
      }
      this.clearTimeId = setTimeout( this.searchList, 800);
    },
    searchList(){
      let params = {
        page: this.modePageIndex,
        status: this.status,
        keyword: this.searchContent,
        cate_id: this.sliceValue,
        group_id:this.hospitalValue,
        user_id:this.userValue,
      };
      this.listLoading = true;
      Api.getlist(params).then(res => {
        if (res.body.data.list) {
          //组合数据结构然后赋给listData
          res.body.data.list.forEach(item => {
            item.checked = false;
            item.previewImg = `/api/slice/get_image?file=${item.path}&type=preview`;
            item.label = `/api/slice/get_image?file=${item.path}&type=label`;
          })
          this.listData = res.body.data.list;
          this.currentPageCount = this.listData.length;
          this.modeMainTotal = res.body.data.meta.count;
          if(params.keyword===''){
            if(this.listData.length>0){
              this.currentData = this.listData[0];
              this.currentData.checked = true;
              this.innerMask = this.currentData.is_mask;
              setTimeout(() => {
                this.path = this.currentData.path;
                this.listIndex = 0;
                this.redIndex = undefined;
                this.index = 0;
                this.slice_id = this.currentData.id;
                this.getMarkList();
              })
            }


          }
        }
        }).finally(res => {
        this.listLoading = false;
      })
    },

    initGetList() {
      let params = {
        page: this.modePageIndex,
        status: this.status,
        keyword: this.searchContent,
        cate_id: this.sliceValue,
        group_id:this.hospitalValue,
        user_id:this.userValue,
      };
      if(this.searchContent==='' && this.search!==''){
        params.keyword = this.search;
      }
      this.listLoading = true;
      Api.getlist(params).then(res => {
        if (res.body.data.list) {
          //组合数据结构然后赋给listData
          if (res.body.data.list.length > 0) {
            res.body.data.list.forEach(item => {
              item.checked = false;
              item.previewImg = `/api/slice/get_image?file=${item.path}&type=preview`;
              item.label = `/api/slice/get_image?file=${item.path}&type=label`;
            })
            this.listData = res.body.data.list;
            this.currentPageCount = this.listData.length;
            this.modeMainTotal = res.body.data.meta.count;
            this.currentData = this.listData[0];
            this.currentData.checked = true;
            this.innerMask = this.currentData.is_mask;
            setTimeout(() => {
              this.path = this.currentData.path;
              this.listIndex = 0;
              this.redIndex = undefined;
              this.index = 0;
              this.slice_id = this.currentData.id;
              this.getMarkList();
            })

          }
          else {
            this.listData = [];
            this.$message('没有更多数据了')
          }
        }


      }).finally(res => {
        this.listLoading = false;
      })
    },
    //下一张的点击事件
    nextLabel() {
      //初始化
      this.listIndex = 0;
      this.redIndex = undefined;
      this.index++;
      if (this.index >= this.currentPageCount) {
        if (this.modePageIndex * this.modeMainPageSize >= this.modeMainTotal) {
          if (this.sliceNum < 1) {
            this.$message('没有更多数据了');
            return;
          } else {
            this.modePageIndex = 1;
          }

        }
        else {
          this.modePageIndex++;
        }
        this.labelImage = [];
        this.currentModePage = this.modePageIndex;
        this.initGetList();
      }

      else {
        const listEl = this.$refs.leftdiv.getElementsByClassName('lists')[0];
        listEl.scrollTop += 51;
        this.labelImage = []
        this.currentData.checked = false;
        this.currentData = this.listData[this.index];
        this.currentData.checked = true;
        this.innerMask = this.currentData.is_mask;
        this.slice_id = this.currentData.id;
        setTimeout(()=>{
          this.path = this.currentData.path;
        })
        this.getMarkList();
      }

    },
    //切换图片
    pictureChange(path, index,mask) {
      if (path !== this.path) {
        this.labelImage = [];
        this.listIndex = 0;
        this.redIndex = undefined;
        this.innerMask =mask;

        setTimeout(()=>this.path = path)
        // this.path = path
        this.index = index;

        this.listData.forEach(item => {
          if (item.path === path) {
            item.checked = true;
            this.currentData = item;
          }
          else item.checked = false;
        })
        this.slice_id = this.currentData.id;
        this.getMarkList();
      }
      else{
        this.listData.forEach(item => {
          if (item.path === path) {
            item.checked = true;
            this.currentData = item;
          }
          else item.checked = false;
        })
      }

    },
    handleSizeChange(val) {
    },
    handleModeCurrentChange(val) {
      this.modePageIndex = val;
      this.labelImage = []

      this.initGetList();
    },
    handleModeSizeChange(val) {
    },
    unMarkedDetail() {
      let params = {
        slice_id: this.currentData.id,
        result: '0',
        advice: this.labelForm.advice,
      }
      switch (this.status) {
        case 5:
          this.submitUAdvice(params);
          break;
        case 2:
          this.submitAdvice(params);
          break;
        case 3:
          this.checkUAdvice(params);
          break;
        case 4:
          this.checkAdvice(params);
          break;
      }
    },
    markedDetail() {
      let params = {
        slice_id: this.currentData.id,
        result: 1,
        advice: this.labelForm.advice,
      }
      switch (this.status) {
        case 5:
          this.submitUAdvice(params);
          break;
        case 2:
          this.submitAdvice(params);
          break;
        case 3:
          this.checkUAdvice(params);
          break;
        case 4:
          this.checkAdvice(params);
          break;
      }

    },
    submitUAdvice(params) {
      this.markAbled = true;
      this.$http.post('/slices/label', params).then(res => {
        if (res.body.ret_code === 0) {
          this.$message({
            type: 'success',
            message: '标注提交完成'
          })
          this.labelImage = [];
          if (this.sliceNum <= 0) {
            setTimeout(() => {
              this.toTableMode();
            }, 300);
          }

          else {
            this.sliceNum--;
            this.modePageIndex = 1;
            this.currentModePage = 1;
            this.initGetList();
          }
          this.dialoglabelVisible = false;
        }
        else {
          this.$message.error(res.body.ret_msg ? res.body.ret_msg : '标注提交失败')
        }
      }).catch(() => {
        this.$message.error('提交失败')
      }).finally(() => {

      })
    },
    submitAdvice(params) {
      this.markAbled = true;
      this.$http.post('/slices/label', params).then(res => {
        if (res.body.ret_code === 0) {
          this.$message({
            type: 'success',
            message: '标注提交完成'
          })
          if ((this.index + 1) >= this.currentPageCount) {
            if (this.modePageIndex * this.modeMainPageSize >= this.modeMainTotal) {
              this.modePageIndex = 1;
              this.listIndex = 0;
              this.redIndex = undefined;
              this.currentModePage = this.modePageIndex;
              this.initGetList();
            }
            else {
              this.nextLabel();
            }
          } else {
            this.nextLabel();
          }

          this.dialoglabelVisible = false;
        }
        else {
          this.$message.error(res.body.ret_msg ? res.body.ret_msg : '标注提交失败')
        }
      }).catch(() => {
        this.$message.error('提交失败')
      }).finally(() => {

      })
    },
    checkUAdvice(params) {
      this.markAbled = true;
      this.$http.post('/slices/recheck', params).then(res => {
        if (res.body.ret_code === 0) {
          this.$message({
            type: 'success',
            message: '审核提交完成'
          })
          this.labelImage = [];

          if (this.sliceNum <= 0) {
            setTimeout(() => {
              this.toTableMode()
            }, 300)
          }
          else {
            this.sliceNum--;
            this.modePageIndex = 1;
            this.currentModePage = 1;
            this.initGetList();
          }
          this.dialoglabelVisible = false;
        }
        else {
          this.$message.error(res.body.ret_msg ? res.body.ret_msg : '标注提交失败')
        }

      }).catch(() => {
        this.$message.error('提交失败')
      }).finally(() => {

      })
    },
    checkAdvice(params) {
      this.markAbled = true;
      this.$http.post('/slices/recheck', params).then(res => {
        if (res.body.ret_code === 0) {
          this.$message({
            type: 'success',
            message: '审核提交完成'
          })
          if ((this.index + 1) >= this.currentPageCount) {
            if (this.modePageIndex * this.modeMainPageSize >= this.modeMainTotal) {
              this.modePageIndex = 1;
              this.listIndex = 0;
              this.redIndex = undefined;
              this.currentModePage = this.modePageIndex;
              this.initGetList();
            }
            else {
              this.nextLabel();
            }
          } else {
            this.nextLabel();
          }
          this.dialoglabelVisible = false;
        }
        else {
          this.$message.error(res.body.ret_msg ? res.body.ret_msg : '标注提交失败')
        }
      }).catch(() => {
        this.$message.error('提交失败')
      }).finally(() => {

      })
    },
  },


}
