<template>
  <Pannel v-bind:title="titleList" v-bind:banner="false" :bottom="false" style="paddingBottom:32px;">
    <div slot="main" class="echarts-main">
      <div class="echarts-left">
        <div class="item-title">
          <div class="title-left">
            切片种类统计
          </div>

        </div>
        <div class="item-echarts" v-loading="pieLoading">
          <div id="pie" v-if="pieShow">

          </div>
          <div v-else="pieShow">暂无数据</div>
        </div>
      </div>
      <div class="echarts-right">
        <div class="top" v-loading="loading">
          <div class="bar-title">
            <div class="title-left">
              工作量统计
            </div>
            <div class="title-right">
              <el-select v-model="barRoleValue" placeholder="角色" @change="barRoleHandleChange">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <el-select v-model="barUserValue" placeholder="名字" @change="barUserHandleChange">
                <el-option
                  v-for="item in userOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <el-select v-model="barPeriodValue" placeholder="周期" @change="barPeriodHandleChange">
                <el-option
                  v-for="item in periodOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
          </div>
          <div class="bar-echarts">
            <div id="bar">

            </div>
          </div>
        </div>
        <div class="bottom" v-loading="bottomLoading">
          <div class="line-title">

            <div class="title-left">
              切片收录量统计
            </div>
            <div class="title-right">
              <el-select v-model="linePeriodValue" placeholder="周期" @change="linePeriodHandleChange">
                <el-option
                  v-for="item in periodOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
          </div>
          <div class="line-echarts">
            <div id="line">

            </div>
          </div>
        </div>
      </div>
    </div>
  </Pannel>
</template>
<script>
  import Vue from 'vue';
  import Pannel from '../../components/Pannel';
  import Api from './api';
  import {mapState} from 'vuex';

  var echarts = require('echarts');
  export default {
    name: 'home',
    data() {
      return {
        loading: false,
        pieLoading: false,
        bottomLoading: false,
        pieShow: true,
        titleList: ['数据统计'],
        roleOptions: [{
          value: 1,
          label: '标注人'
        }, {
          value: 2,
          label: '审核人'
        }],
        userOptions: [],
        periodOptions: [{
          value: 'day',
          label: '天'
        }, {
          value: 'week',
          label: '周'
        }, {
          value: 'month',
          label: '月'
        }],
        itemPeriodValue: 'month',
        barRoleValue: '',
        barUserValue: '',
        barPeriodValue: '',
        linePeriodValue: 'day',
        lineXAxisData: [],
        lineSeriesData: [],
        pieLegendData: [],
        pieSeriesData: [],
        barXAxisData: [],
        barSeriesData: [],
        barNumberData:[],


      };
    },
    computed: mapState(['MenuState']),
    watch: {
      MenuState() {
        setTimeout(() => {
         this.resize();
        }, 400)
      }
    },
    mounted: function () {
      // this.$root.$on('menu-change', this.resize);
      this.myChart = echarts.init(document.getElementById('pie'));
      this.myChartBar = echarts.init(document.getElementById('bar'));
      this.myChartLine = echarts.init(document.getElementById('line'));
      this.queryDrawPie();
      this.queryDrawBar();
      this.queryDrawLine();
      this.$root.$on('dash-change', this.resize);

    },
    components: {
      Pannel,
    },
    methods: {
      resize(){

        if (this.myChartBar) this.myChartBar.resize();
        if (this.myChart) this.myChart.resize();
        if (this.myChartLine) this.myChartLine.resize();
      },
      // 切片种类统计
      drawPie: function () {
        if (this.myChart && this.myChart.clear) this.myChart.clear();

        // 指定图表的配置项和数据

        let option = {
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
          },
          legend: {
            x: 'center',
            y: '75%',
            data: this.pieLegendData
          },
          series: [
            {
              name: '切片种类统计',
              type: 'pie',
              radius: ['60%', '80%'],
              center: ['50%', '35%'],
              avoidLabelOverlap: false,
              label: {
                normal: {
                  show: false,
                  position: 'center'
                },
                emphasis: {
                  show: false,
                  textStyle: {
                    fontSize: '30',
                    fontWeight: 'bold'
                  }
                }
              },
              labelLine: {
                normal: {
                  show: false
                }
              },
              data: this.pieSeriesData
            }
          ]
        };

        // 使用刚指定的配置项和数据显示图表。
        this.myChart.setOption(option);
      },
      // 工作量统计
      drawBar: function () {
        if (this.myChartBar && this.myChartBar.clear) this.myChartBar.clear();

        // 指定图表的配置项和数据
        let option = {
          color: ['#3398DB'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
              type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              data: this.barXAxisData,
              axisTick: {
                alignWithLabel: true
              }
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: '切片数量',
              type: 'bar',
              barWidth: '30%',
              color:'#ac5f95',
              data: this.barSeriesData
            },
            {
              name: '切片标注数量',
              type: 'bar',
              barWidth: '30%',
              color:'#2661ab',
              data: this.barNumberData
            }
          ]
        };
        // 使用刚指定的配置项和数据显示图表。
        this.myChartBar.setOption(option);

      },
      // 切片收录量
      drawLine: function () {
        if (this.myChartLine && this.myChartLine.clear) this.myChartLine.clear();

        // 指定图表的配置项和数据
        let option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#6a7985'
              }
            }
          },

          toolbox: {
            feature: {
              saveAsImage: {}
            },
            right:'15px',
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: this.lineXAxisData
            }
          ],
          yAxis: [
            {
              type: 'value',
              show: true,
            }
          ],
          series: [

            {
              name: '切片收录量',
              type: 'line',
              stack: '总量',
              smooth: true,
              label: {
                normal: {
                  show: true,
                  position: 'top'
                }
              },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                    offset: 0, color: '#4FAAFE' // 0% 处的颜色
                  }, {
                    offset: 1, color: '#9BB4FF' // 100% 处的颜色
                  }],
                  globalCoord: false // 缺省为 false
                }
              },
              color:'#4F93FE',
              lineStyle: {
                width: 1
              },
              data: this.lineSeriesData
            }
          ]
        };
        // 使用刚指定的配置项和数据显示图表。
        this.myChartLine.setOption(option);

      },
      //查询工作量统计数据
      queryDrawBar() {
        this.loading = true;
        this.barRoleValue = 1
        let params = {
          role_id: this.barRoleValue
        }
        this.userOptions = [];
        this.barUserValue = '';
        Api.getRoleUsers(params).then(data => {
          if (data.body.ret_code === 0) {
            this.userOptions = data.body.data.map((item) => ({
              value: item.id,
              label: item.nickname,
            }));
            this.userOptions.splice(0,0,{
              value:0,
              label:'全部'
            })
            if (this.userOptions.length > 0) {
              this.barUserValue = this.userOptions[0].value;
            }
            this.barPeriodValue = 'day'
            this.getBarData()
          }
        }).finally(()=>{
          this.loading=false;
        })
      },
      // 查询切片收入量数据
      queryDrawLine() {
        this.bottomLoading = true;
        let params = {
          period: this.linePeriodValue
        }
        this.lineXAxisData = [],
          this.lineSeriesData = [],
          Api.getDrawLineData(params).then(data => {
            if (data.body.ret_code === 0) {
              for (let key in data.body.data) {
                this.lineXAxisData.push(key);
                this.lineSeriesData.push(data.body.data[key]);
              }
              this.drawLine()
            }
          }).finally(() => {
            this.bottomLoading = false;
          })
      },
      linePeriodHandleChange(value) {
        this.linePeriodValue = value;
        this.queryDrawLine()
      },
      // 查询切片种类统计数据
      queryDrawPie() {

        let params = {
          period: this.itemPeriodValue
        }
        this.pieLoading = true;
        this.pieLegendData = [],
          this.pieSeriesData = [],
          this.pieShow = true;
        Api.queryDrawPieData(params).then(data => {
          if (data.body.ret_code === 0) {
            if (data.body.data && data.body.data.length) {
              data.body.data.map((item) => {
                this.pieSeriesData.push({
                  value: item.slice_count,
                  name: item.cate_name
                })
                this.pieLegendData.push(item.cate_name)
              })
              this.pieShow = true;
              this.drawPie()
            } else {
              this.pieShow = false;
            }
          }
        }).finally(() => {
          this.pieLoading = false;
        })
      },
      itemPeriodHandleChange(value) {
        this.itemPeriodValue = value;
        this.queryDrawPie()
      },
      barRoleHandleChange(value) {
        this.barRoleValue = value;
        let params = {
          role_id: this.barRoleValue
        }
        this.userOptions = [];
        this.barUserValue = '';
        Api.getRoleUsers(params).then(data => {
          if (data.body.ret_code === 0) {
            this.userOptions = data.body.data.map((item) => ({
              value: item.id,
              label: item.nickname,
            }));
            this.userOptions.splice(0,0,{
              value:0,
              label:'全部'
            })
            if (this.userOptions.length > 0) {
              this.barUserValue = this.userOptions[0].value;
            }
            this.getBarData()
          }
        })
      },
      barUserHandleChange(value) {
        this.barUserValue = value;
        this.getBarData()
      },
      barPeriodHandleChange(value) {
        this.barPeriodValue = value;
        this.getBarData()
      },
      getBarData() {
        this.loading = true;
        let params = {
          role_id: this.barRoleValue,
          user_id: this.barUserValue,
          period: this.barPeriodValue
        }
        this.barXAxisData = [];
        this.barSeriesData = [];
        this.barNumberData=[];
        Api.queryDrawBarData(params).then(data => {
          let dealCount = data.body.deal_count;
          for (let key in dealCount) {
            this.barXAxisData.push(key);
            this.barSeriesData.push(dealCount[key]);
          }
          //处理标注数量
          let annotationCount = data.body.annotation_count
          for(let key in annotationCount){
            this.barNumberData.push(annotationCount[[key]]);
          }
          this.drawBar()
        }).finally(() => {
          this.loading = false
        })
      }
    },
    destroyed() {
      this.$root.$off('dash-change', this.resize);
    },
  }
</script>

<style lang="scss">
  .main {
    background: #f3f3f3;
  }

  .echarts-main {
    height: 100%;
    width: 100%;
    display: flex;
    background: #f3f3f3;
    .item-title, .bar-title, .line-title {
      display: flex;
      justify-content: space-between;
      .title-right {
        padding-right: 20px;
        .el-select {
          width: 100px;
          height: 30px;
          &:last-child {
            width: 70px;
          }
        }
        .el-input__inner {
          height: 30px;
        }
        .el-input__icon {
          line-height: 30px;
        }
      }
    }

    .echarts-left {
      width:42%;
      background: white;
      margin-right: 12px;
      display: flex;
      flex-direction: column;
      .item-title {
        height: 60px;
        color: black;
        padding-top: 20px;
        padding-left: 24px;
      }
      .item-echarts {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        color: black;
        padding: 0 100px;
        text-align: center;
        color: #909399;
      }
      #pie {
        height: 100%;
        width: 100%
      }
    }
    .echarts-right {
      width:58%;
      margin-left: 12px;
      display: flex;
      flex-direction: column;
      .top {
        flex: 1;
        background: white;
        margin-bottom: 12px;
        display: flex;
        flex-direction: column;
        .bar-title {
          /*height: 60px;*/
          color: black;
          padding-top: 20px;
          padding-left: 24px;
        }
        .bar-echarts {
          flex: 1;
          color: black;
          padding: 0 24px;
          padding-bottom: 30px;
        }
        #bar {
          height: 100%;
          width: 100%
        }
      }
      .bottom {
        flex: 1;
        margin-top: 12px;
        background: white;
        display: flex;
        flex-direction: column;
        .line-title {
          /*height: 60px;*/
          color: black;
          padding-top: 20px;
          padding-left: 24px;
        }
        .line-echarts {
          flex: 1;
          color: black;
          padding: 0 24px;
          padding-bottom: 30px;
        }
        #line {
          height: 100%;
          width: 100%
        }
      }
    }
  }


</style>
