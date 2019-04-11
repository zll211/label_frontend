<template>
  <div class="slide-view">
    <div class="label-info" v-show="showMaskInfo">
      <el-card class="box-card">
        <div v-for="(info,index) in infoList" :key="index" class="text item">
          <span type="text" size="mini">{{info}}</span>
        </div>
      </el-card>
    </div>
    <el-dialog width="500px" :title="title" :visible.sync="labelChangeView"
               :before-close="closeLabelDialog">
      <el-form :model="labelForm" ref="labelForm" label-position="left">
        <el-row>
          <el-col :span="24">
            <el-form-item label="名称" label-width="40px" prop="name">
              <el-select v-if="labelType === 'edit'" size="small"
                         v-model="labelForm.name"
                         placeholder="请选择名称" style="width: 100%"
                         @change="selectLabelChange">
                <el-option
                  v-for="(name,index) in labelNameList"
                  :key="index"
                  :label="name"
                  :value="name">
                </el-option>
              </el-select>
              <el-input v-if="labelType === 'add'" size="small"
                        v-model="labelForm.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="labelType === 'edit'">
            <el-form-item label="操作" label-width="40px" prop="name">
              <div class="flex align-items-center" style="height: 40px">
                <div class="flex-item"><i
                  class="fa fa-trash fa-lg"
                  @click="deleteLabel(labelForm.id)"
                ></i><span @click="deleteLabel(labelForm.id)">删除</span>
                </div>
                <div class="flex-item"><i
                  class="fa fa-eye fa-lg"
                  @click="hideLabel(labelForm.id, !labelForm.show)"
                ></i><span
                  @click="hideLabel(labelForm.id, !labelForm.show)">{{labelForm.show===false?'显示': '隐藏'}}</span>
                </div>
                <div class="flex-item"><i
                  class="el-icon-more"
                  @click="hideAllLabel(!showAllLabel)"
                ></i><span @click="hideAllLabel(!showAllLabel)">{{showAllLabel===false?'全部显示': '全部隐藏'}}</span>
                </div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="线宽" label-width="40px">
              <el-select style="width: 150px" size="small"
                         v-model="labelForm.width"
                         placeholder="请选择线宽"
                         filterable
                         allow-create
                         default-first-option>
                <el-option
                  v-for="(lineWidth,index) in lineWidthList"
                  :key="index"
                  :label="lineWidth"
                  :value="lineWidth">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item class="flex justify-content-between" label="颜色"
            >
              <div class="flex align-items-center">
                <span style="margin-right: 10px">{{labelForm.color}}</span>
                <el-color-picker v-model="labelForm.color"
                                 size="small"></el-color-picker>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="类别" label-width="40px">
              <el-select
                v-model="labelForm.types"
                style="width: 100%"
                @change="selectTypeChange">
                <el-option
                  v-for="(item,index) in tableModelData"
                  :key="index"
                  :label="item.type"
                  :value="item.type">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" label-width="40px">
              <el-select
                v-model="labelForm.description"
                style="width: 100%"
                @change="selectRemarkChange">
                <el-option
                  v-for="(item,index) in tableModelData"
                  :key="index"
                  :label="item.remark"
                  :value="item.remark">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="定位图标" label-width="80px">
              <el-radio-group
                class="flex align-items-center justify-content-between"
                v-model="labelForm.pin">
                <el-radio label="1" class="flex align-items-center">
                  <img class="pin-img" src="./assets/img/pin_1.png">
                </el-radio>
                <el-radio label="2" class="flex align-items-center">
                  <img class="pin-img" src="./assets/img/pin_2.png">
                </el-radio>
                <el-radio label="3" class="flex align-items-center">
                  <img class="pin-img" src="./assets/img/pin_3.png">
                </el-radio>
                <el-radio label="4" class="flex align-items-center">
                  <img class="pin-img" src="./assets/img/pin_4.png">
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <!--<el-col :span="24" v-if="labelType==='edit'">
            <el-form-item label="测量信息" label-width="80px">
              <div v-html="getMeasureInfo(labelForm)"></div>
            </el-form-item>
          </el-col>-->
          <el-col :span="24" v-if="labelType==='edit'&&labelForm.type!=='Mask'">
            <el-form-item label="测量信息" label-width="80px">
              <div v-for="(info,index) in infoList" :key="index" class="text item">
                <span>{{info}}</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeLabelDialog" size="small">取 消</el-button>
        <el-button type="primary" @click="saveLabelChange()" size="small" :disabled="sureAbled">确 定
        </el-button>
      </div>

    </el-dialog>

    <el-dialog class="image-info" width="600px" title="图像信息"
               :visible.sync="imageInfoView">
      <el-form label-position="left" label-width="100px" :model="imageInfo">
        <el-form-item label="文件名">
          <span class="flex-1">{{imageInfo.fileName}}</span>
        </el-form-item>
        <el-form-item label="图像像素">
          <span class="flex-1">{{imageInfo.width}}Pixel - {{imageInfo.height}}Pixel</span>
        </el-form-item>
        <el-form-item label="扫描倍率">
          <span class="flex-1">{{imageInfo.scanScale|| '无'}}</span>
        </el-form-item>
        <el-form-item label="扫描时刻">
          <span class="flex-1">{{imageInfo.scanTime}}</span>
        </el-form-item>
        <el-form-item label="扫描时间">
          <span class="flex-1">{{imageInfo.scanDuration||0}}ms</span>
        </el-form-item>
        <el-form-item label="预览图" label-position="top">
        </el-form-item>
        <el-form-item class="flex" label-width="0px">
          <img class="preview-img" style="width: 180px" alt="预览图图片"
               :src="imageInfo.labelImg">
          <img class="preview-img flex-1" alt="预览图图片"
               :src="imageInfo.previewImg">
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
  import slideViewService from './slideView.service.js';
  import {mapState} from 'vuex'
  import KfbView from 'kfb-view';
  import {formatDateTime, encodeQueryData} from '../pisSlideView/config/utils';

  export default {
    name: "slideView",
    data() {
      return {
        slideView: {},
        labelForm: {types: '', width: 2, color: '#0000FF', pin: '1', description: ''},
        imageInfo: {},
        imageInfoView: false,
        labelChangeView: false,
        title: '',
        labelNameList: [],
        lineWidthList: [1, 2, 5, 8, 10],
        labelType: 'add',
        showAllLabel: false,
        sureAbled: false,
        infoList: [],
        showMaskInfo: false,
        labelPosition: undefined
      }
    },
    props: {
      fileName: {
        type: String,
        // default: '/ASC-US/T2017-08468.kfb',
        // default: '/ASC-US/T2017-08480.kfb',
      },
      color: {
        type: String,
        default: '#0000FF',
      },
      list: {
        type: Object
      },
      tableModelData: {
        type: Array
      },
      currentRow: {
        type: Object
      }


    },
    watch: {
      fileName(val) {
        if (!val) return;
        this.destroySlideView();
        this.initial();
      }
    },
    async created() {

    },
    computed: mapState(['MenuState']),
//
    mounted() {
      // this.initial();

    },

    methods: {
      async initial() {
        try {
          await this.initSlideView();
          this.drawPointList();
          this.drawLabelList();
          this.pointListChange();
          this.labelChange();
          this.onMeasureChange();
          this.screenShotImageChange();
          this.showImageInfo();
          // this.resize();
          this.$root.$on('size-change', this.resize);
        } catch (e) {
          console.error(e);
          this.$message.error('读取图像信息失败');
        }
      },
      selectRemarkChange(val) {
        let data = this.tableModelData.find(item => {
          if (item.remark === val) {
            return item;
          }
        })
        this.labelForm.types = data.type;
      },
      selectTypeChange(val) {
        let data = this.tableModelData.find(item => {
          if (item.type === val) {
            return item;
          }
        })
        this.labelForm.description = data.remark;
      },

      resize() {
        if (this.slideView) {
          this.slideView.resizeViewContainer({
            height: this.$el.parentElement.getBoundingClientRect().height,
            width: this.$el.parentElement.getBoundingClientRect().width,
          });
          setTimeout(() => {
            if (this.slideView.viewer.viewport.getZoom() <= 1) {
              this.slideView.control.changeZoom(1,
                this.slideView.viewer.viewport.getCenter(), true);
            }
          }, 100);
        }
      },
      //先初始化，将切片有关的信息都取出来
      async initSlideView() {

        //根据父组件传进来的文件名进行请求接口，获取信息，创建slideView对象
        const {body} = await slideViewService.getImageInfo('/slice/info', {file: this.fileName});
        this.imageInfo = body;
        //这里的formatDateTime
        // this.imageInfo.scanTime = body.scanTime && formatDateTime(new Date(body.scanTime));
        this.imageInfo.scanTime = body.scanTime && formatDateTime(new Date(body.scanTime*1000));
        this.imageInfo.fileName = this.fileName;
        this.imageInfo.previewImg = `/api/slice/get_image?file=${this.fileName}&type=preview`;
        this.imageInfo.labelImg = `/api/slice/get_image?file=${this.fileName}&type=label`;
        let params = {};
        params.file = this.fileName;

        this.slideView = new KfbView({
          //这个this.$el代表着template里面的全部
          el: this.$el,
          fileName: this.fileName,
          thumbnail: `/api/slice/get_image?file=${this.fileName}&type=thumbnail`,
          // width: (window.innerWidth-200)*0.625,
          height: this.$el.parentElement.getBoundingClientRect().height,
          width: this.$el.parentElement.getBoundingClientRect().width,
          scale: body.scanScale,
          imageCapRes: body.imageCapRes,
          control: {
            style: 'bottom: 90px; right: 20px',
          },
          viewerScale: {
            show: true,
            imageCapRes: body.imageCapRes,
            style: 'bottom: 10px; left: 250px',
          },
          openSeadragonOptions: {
            maxZoomLevel: body.scanScale * 10,
            tileSources: {
              height: body.height,
              width: body.width,
              tileSize: 256,
              minLevel: 10,
              getTileUrl(level, x, y) {
                // params.oriLevel = level;
                params.x = x;
                params.y = y;
                if (body.fileNum == level) {
                  level = body.scanScale;
                  params.scale = level.toFixed(6);
                } else {
                  level = body.scanScale / Math.pow(2, body.fileNum - level);
                  params.scale = level.toFixed(6);
                  level = body.ratiomap[level.toFixed(6)];
                  if (level === undefined) {
                    level = 0;
                  }
                }
                params.level = level;
                // return 'http://192.168.1.29:8011/api/slide/view?'+ encodeQueryData(params) ;
                return `/image.php?${encodeQueryData(params)}`;
              },
            },
          }
        });


        const {width, height} = this.$el.parentElement.getBoundingClientRect();
        const radio = width > height ?
          width / height : height / width;
        const zoom = this.slideView.viewer.viewport.getHomeZoom() * radio;
        setTimeout(() => {
          this.slideView.control.changeZoom(zoom,
            this.slideView.viewer.viewport.getCenter(), true);
        }, 500);
      },

      //画导航器里面的路线
      drawPointList() {

        return slideViewService.navigatorPointList('/image_annotation/above', {path: this.fileName})
          .then((res) => {
            this.slideView.navigator.drawPointList(res.data.data);
          }).finally(() => {
          });
      },

      //导航器里面点变化的监听事件 point-list-change
      pointListChange() {
        this.slideView.addHandler('point-list-change', (e) => {
          slideViewService.navigatorPoint('/image_annotation/above', this.slideView.navigator.pointList, this.fileName)
            .then((res) => {
              this.slideView.navigator.drawPointList(res.data.data);
            });
        })
      },

      //得到标注列表
      drawLabelList() {
        return slideViewService.labelList('/image_annotation', {path: this.fileName})
          .then(({body}) => {
            this.initLabelList(body.data);
          });
      },


      /*点击右上角列表时从父组件那传来type参数（形状：line,curve,rect,oval,arrow,pin）*/
      setDrawContents(type, options) {
        this.slideView.board.setOtherParams(options.width, options.color, options.pin, options.description)
        this.slideView.board.setDrawContent(type);
      },
      switchPicture(formData) {
        formData.select = true;
        this.slideView.area.moveCenterPoint(formData);
        this.slideView.change();
      },
      //对标注进行不同的变化
      labelChange() {
        this.slideView.addHandler('select-label', (e) => {
          const label = e.detail;
          this.$emit('selectPoint', label);
          if (!label) {
            this.showMaskInfo = false;
            this.infoList = [];
          } else if (label.type !== 'Mask') {
            this.setMeasureInfo(label);
            this.showMaskInfo = true;
          } else {
            this.infoList = [];
            this.showMaskInfo = false;
          }
        });

        this.slideView.addHandler('label-change', (e) => {
          this.labelType = e.detail.type;
          switch (e.detail.type) {
            case 'edit':
              this.title = '编辑注释';
              this.labelChangeView = true;
              this.sureAbled = false;

              const label = e.detail.label || this.slideView.labelList[0];
              // console.log(label)
              if (!label) {
                return;
              }
              if (this.$refs.labelForm) this.$refs.labelForm.resetFields();
              this.labelForm = {
                ...label,
                width: label.width||label.lineWidth||2,
              };
              break;
            case 'delete': {
              if (!e.detail.label) {
                this.$message.warning('请选择删除的标签');
                return;
              }
              this.$emit('deleteId', e.detail.label.id);
              this.deleteLabel(e.detail.label.id);
            }
              break;
            case 'add': {
              this.title = '添加注释';
              this.labelChangeView = true;
              this.sureAbled = false;
              if (this.$refs.labelForm) this.$refs.labelForm.resetFields();
              this.labelForm = Object.assign({}, e.detail.label, {
                width: 2,
                color: this.color,
                pin: '1',
                name: '图型' + this.slideView.labelList.length,
                description: this.currentRow.remark,
                types: this.currentRow.type
              });
            }
              break;
            case 'move': {
              const label = e.detail.label;
              slideViewService.modifyLabel('/image_annotation', label.id, this.getShapeParams(label), this.fileName)
                .then(({body}) => {
                });
            }
          }
        })
      },
      onMeasureChange() {
        this.slideView.$on('measure-range', (e) => {
          const result = e.detail;
          if (!result) {
            this.infoList = [];
            this.showMaskInfo = false;
          } else {
            result.type = 'Measure';
            const item = this.slideView.convertNoteForm(result, this.slideView.viewerScale.imageCapRes);
            this.infoList = [`长度: ${item.perimeter.toFixed(2)}微米`];
            this.showMaskInfo = true;
          }
        })
      },
      //按标注名称出现不同的标注
      selectLabelChange(name) {
        if (this.$refs.labelForm) this.$refs.labelForm.resetFields();
        const labelList = this.slideView.labelList.map((item) => {
          item.select = false;
          return item;
        });
        const label = labelList.find((item) => item.name === name);
        //select属性用于设置标注是否可编辑
        label.select = true;
        this.labelForm = Object.assign({}, label);
        this.slideView.area.moveCenterPoint(this.labelForm);
        this.slideView.change();
      },
      //对话框关闭之前执行的函数
      closeLabelDialog() {
        if (this.labelType === 'add') {
          const board = this.slideView.board;
          if (board.canDraw) {
            board[board.type].clearCanvas();
            board.canDraw = false;
          }
        }
        this.labelChangeView = false;
        this.slideView.$emit('select-label');
      },
      //保存标注，或者是保存标注的编辑
      saveLabelChange() {
        this.sureAbled = true;
        if (this.labelType === 'add') {

          //保存接口自己处理一下
          slideViewService.saveLabel('/image_annotation', this.getShapeParams(this.labelForm), this.fileName)
            .then(({body}) => {
              this.initLabelList(body.data);
              this.$message.success('新增成功');
              this.closeLabelDialog();
              this.slideView.change();
            }).catch(() => {
            this.sureAbled = false;
            this.$message.error('新增失败');
          });
        } else {

          //编辑标记接口自己处理一下
          slideViewService.modifyLabel('/image_annotation', this.labelForm.id, this.getShapeParams(this.labelForm), this.fileName)
            .then(({body}) => {
              this.slideView.labelList.forEach((item) => {
                this.labelNameList = [...new Set((body.data || []).filter((item) => item.id).map((item) => item.name))];
                if (item.id == this.labelForm.id) {
                  item = Object.assign(item, this.labelForm);
                  item.select = true;
                }
              });
              this.$message.success('修改成功');
              this.labelChangeView = false;
              this.slideView.change();
            }).catch(() => {
            this.sureAbled = false;
            this.$message.error('修改失败');
          });
        }
      },

      //删除标注
      deleteLabel(id) {
        //调用删除标注接口，先准备要发送的参数
        slideViewService.deleteLabel('/image_annotation', id, this.fileName)
          .then(({body}) => {
            this.initLabelList(body.data);
            this.labelChangeView = false;
            this.$message.success('删除成功');
          }).catch(() => {
          this.$message.error('删除失败');
        });
      },

      //隐藏标注
      hideLabel(id, state) {
        this.slideView.labelList.forEach((item) => {
          if (item.id === id) {
            this.$set(this.labelForm, 'show', state);
            item.show = state;
          }
        });
        this.slideView.change();
      },

      hideAllLabel(state) {
        this.showAllLabel = state;
        this.slideView.labelList.forEach((item) => item.show = state);
        this.slideView.change();
      },

      //屏幕截图
      screenShotImageChange() {
        //在截图的过程中（也就是e.detail.type =='change'）会触发screen-image-change事件，截图的状态为down的时候就是完整的截图
        this.slideView.addHandler('screen-image-change', (e) => {
          if (e.detail.type === 'down') {
          }
        });
      },

      setMeasureInfo(draw) {
        draw = this.slideView.convertNoteForm(draw, this.slideView.viewerScale.imageCapRes);
        if (draw.type === 'Line' || draw.type === 'Arrow') {
          this.infoList = [`长度: ${draw.perimeter.toFixed(2)}微米`];
        }
        if (draw.type === 'Measure') {
          this.infoList = [`长度: ${draw.perimeter.toFixed(2)}微米`];
        } else if (draw.type === 'Rectangle' || draw.type === 'Ellipse') {
          this.infoList = [`宽: ${Math.abs(draw.width).toFixed(2)}微米`, `高: ${Math.abs(draw.height).toFixed(2)}微米`, `面积: ${draw.acreage.toFixed(2)}平方微米`, `周长: ${draw.perimeter.toFixed(2)}微米
          `,`描述：${draw.description}`];
        } else if (draw.type === 'Position' || draw.type === 'Curve') {
          this.infoList = [];
        }
      },

      showImageInfo() {
        this.slideView.addHandler('image-info', (e) => {
          this.imageInfoView = true;
        });
      },

      //初始化标注列表
      initLabelList(data) {
        // console.log(data);
        this.$emit('getLabelList', data);
        /*const content = (data || []).map(item => {
          return item.content
        });
        this.labelNameList = content.map(item => {
          return item.name
        })*/
        this.labelNameList = [...new Set((data || []).filter((item) => item.id && !item.content).map((item) => item.name))];
        this.slideView.setLabelList((data || []).filter((item) => item.id && !item.content).map((item) => item));
      },

      //画的参数设置
      getShapeParams(params) {
        return {
          width: params.width||2,
          description: params.description,
          name: params.name,
          startPoint: params.startPoint,
          endPoint: params.endPoint,
          color: KfbView.convertColorToInt(params.color),
          type: params.type,
          pin: params.pin,
          points: params.points,
          scale: params.scale,
          region: params.region,
          types: params.types,
        }
      },
      destroySlideView() {
        this.$root.$off('size-change', this.resize);
        // debugger;
        if (!this.slideView || !this.slideView.destroy) return;
        this.slideView.destroy();
        this.slideView = null;
      },


    },
    beforeDestroy() {
      this.destroySlideView();
    },
  }
</script>

<style lang="scss">
  .slide-view {
    .label-info {
      position: absolute;
      z-index: 10;
      top: 480px;
      right: 81px;
      width: 245px;
      max-height: 158px;
      .text {
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    .flex-item {
      margin-right: 20px;
      i {
        margin-right: 10px;
        cursor: pointer;
      }
      span {
        cursor: pointer;
      }
    }
    .pin-img {
      height: 37px;
      width: 31px;
    }
    .image-info {
      .preview-img {
        height: 180px;
        max-width: 360px;
        img {
          height: 100%;
        }
      }
      .el-form-item {
        word-break: break-all;
        &.el-form-item {
          margin-bottom: 0;
        }
      }
    }
    .pis-icon {
      margin-right: 20px;
    }
  }
</style>
