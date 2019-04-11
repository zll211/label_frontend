<template>
    <Pannel v-bind:title="titleList" v-bind:banner="false" style="paddingBottom:32px;" :bottom="false">
        <div slot="main"   class="echarts-main">
            <div class="echarts">
                <div class="item-title">

                    <div id="progressBar">

                    </div>
                    <div class="item-title-center">建议每天处理 <span>10</span> 张 / 今日完成 <span>{{todayDeal}}</span> 张 <span class="iconWarning"><i class="el-icon-warning"></i>请少侠快马加鞭</span></div>
                    <div class="item-title-right">
                        周期：
                        <el-select v-model="barPeriodValue" placeholder="" @change="periodHandleChange">
                            <el-option
                                    v-for="item in periodOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div  class="item-echarts" >
                    <div id="smoothLine">

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
                titleList:['个人工作完成度'],
                xAxisData:[],
                dealData:[],
                insertData:[],
                annotationData:[],
                progressData:[],
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
                barPeriodValue: 'day',
                todayDeal:0,
                planDeal:0
            };
        },
        computed: mapState(['MenuState']),
        watch:{
            MenuState(){
                setTimeout(()=>{
                    if(this.myChart)this.myChart.resize();
                    if(this.myChartBar)this.myChartBar.resize();
                },600)
            }
        },
        async created(){
            this.queryData()

        },
        mounted:function(){
          this.myChart = echarts.init(document.getElementById('smoothLine'));
          this.myChartBar = echarts.init(document.getElementById('progressBar'));
            this.smoothLine();
            this.progressBar();
            this.$root.$on('dash-change',this.resize)
        },
        components:{
            Pannel,
        },
        methods:{
          resize(){
            if (this.myChart) this.myChart.resize();
            if (this.myChartBar) this.myChartBar.resize();
          },
            smoothLine:function(){

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
                    grid: {
                        x:'70px'
                    },
                    legend: {
                        data:['工作量', '切片收录量','标注数量'],
                        x:'right',
                        y:'top',
                        padding:[10,80,0,0]
                    },
                    xAxis: {
                        type: 'category',
                        // data: ['08-02', '08-03', '08-04', '08-05', '08-06', '08-07', '08-08']
                        data:this.xAxisData
                    },
                    yAxis: {
                        type: 'value',
                        // scale:true,
                    },
                    series: [
                        {
                            name:'工作量',
                            data: this.dealData,
                            // xAxisIndex: 1,
                            type: 'line',
                            smooth: true,
                            color:'#DA7265',
                            label: {
                                normal: {
                                    show: true,
                                }
                            },
                        },
                        {
                            name:'切片收录量',
                            data: this.insertData,
                            type: 'line',
                            smooth: true,
                            color:'#4F93FE',
                            label: {
                                normal: {
                                    show: true,
                                }
                            },
                        },
                      {
                        name:'标注数量',
                        data: this.annotationData,
                        type: 'line',
                        smooth: true,
                        color:'#2C6706',
                        label: {
                          normal: {
                            show: true,
                          }
                        },
                      }
                    ],

                };
                // 使用刚指定的配置项和数据显示图表。
                this.myChart.setOption(option);
            },
            progressBar:function(){

                let percentage=this.progressData;
                let option = {
                    grid: {
                        x:'50px'
                    },
                    color: ['#4F93FE'],
                    xAxis: [{
                        show: false,
                    },
                        //由于下边X轴已经是百分比刻度了,所以需要在顶部加一个X轴,刻度是金额,也隐藏掉
                        {
                            show: false,
                        }
                    ],
                    yAxis: {
                        type: 'category',
                        axisLabel: {
                            show: false, //让Y轴数据不显示
                        },
                        itemStyle: {
                        },
                        axisTick: {
                            show: false, //隐藏Y轴刻度
                        },
                        axisLine: {
                            show: false, //隐藏Y轴线段
                        },
                    },
                    series: [
                        {
                            show: true,
                            type: 'bar',
                            barGap: '-100%',
                            barWidth: '100%', //统计条宽度
                            itemStyle: {
                                normal: {
                                    barBorderRadius: 50,
                                    color: 'rgba(102, 102, 102,0.5)'
                                },
                            },
                            z:1,
                            data: [1],
                        },
                        {
                            show: true,
                            type: 'bar',
                            barGap: '-100%',
                            barWidth: '100%', //统计条宽度
                            itemStyle: {
                                normal: {
                                    barBorderRadius: 50, //统计条弧度
                                }

                            },
                            max: 1,
                            label: {
                                normal: {
                                    show: true,
                                    textStyle: {
                                        color: '#fff', //百分比颜色
                                    },
                                    position: 'right',
                                    //百分比格式
                                    formatter: function(data) {
                                        return (percentage[data.dataIndex] * 100).toFixed(1) + '%';
                                    },
                                }
                            },
                            labelLine: {
                                show: false,
                            },
                            z:2,
                            data:percentage,
                        },
                        //数据条--------------------我是分割线君------------------------------//
                       /* {
                            show: true,
                            type: 'bar',
                            xAxisIndex: 1, //代表使用第二个X轴刻度!!!!!!!!!!!!!!!!!!!!!!!!
                            barGap: '-100%',
                            barWidth: '25%', //统计条宽度
                            itemStyle: {
                                normal: {
                                    barBorderRadius: 20,
                                    color: 'rgba(22,203,115,0.05)'
                                },
                            },
                            label: {
                                normal: {
                                    show: true,
                                    //label 的position位置可以是top bottom left,right,也可以是固定值
                                    //在这里需要上下统一对齐,所以用固定值
                                    position: [0, '-100%'],
                                    rich: { //富文本
                                        black: { //自定义颜色
                                            color: '#000',
                                        },
                                        start2: {
                                            backgroundColor: { //这里可以添加你想自定义的图片
                                                image: uploadedDataURL2,
                                            },
                                        },
                                        start1: {
                                            backgroundColor: {
                                                image: uploadedDataURL1,
                                            }
                                        },
                                        green: {
                                            color: '#70DDA7',
                                        },
                                        yellow: {
                                            color: '#FEC735',
                                        },
                                    },
                                    formatter: function(data) {
                                        //富文本固定格式{colorName|这里填你想要写的内容}
                                        return paiming[data.dataIndex] == 1 ? '{start1|}{yellow|' + paiming[data.dataIndex] + '  ' + city[data.dataIndex] + '}' + '{black|    总金额:}{yellow|' + zongjine[data.dataIndex] / 10000 + '}{black|万元,已分配金额:}' + '{green|' + fenpeijine[data.dataIndex] / 10000 + '万元}' : ' {start2|}{black|' + paiming[data.dataIndex] + '  ' + city[data.dataIndex] + '}' + '{black|总金额:}{yellow|' + zongjine[data.dataIndex] / 10000 + '}{black|万元,已分配金额:}' + '{green|' + fenpeijine[data.dataIndex] / 10000 + '万元}';

                                    },
                                }
                            },
                            data: 30
                        }*/

                    ]
                };
                this.myChartBar.setOption(option);
            },
            queryData(){
                let params={
                    period:this.barPeriodValue,
                    role_id:JSON.parse(localStorage.userInfo).role_id,
                    user_id:JSON.parse(localStorage.userInfo).id,
                }
                this.progressData=[],
                this.xAxisData=[],
                this.dealData=[],
                this.insertData=[];
                this.annotationData=[];
                Api.getProgress(params).then(data=>{
                  if(data.status===200){
                    this.todayDeal=data.body.today_deal;
                    this.planDeal=data.body.plan_deal;
                    let dealCount=data.body.deal_count;
                    let insertCount=data.body.insert_count;
                    let annotationCount=data.body.annotation_count;
                    this.progressData.push(data.body.progress);
                    for(let key in dealCount){
                      this.xAxisData.push(key);
                      this.dealData.push(dealCount[key]);
                    }
                    for(let key in insertCount){
                      this.insertData.push(insertCount[key]);
                    }
                    for(let key in annotationCount){
                      this.annotationData.push(annotationCount[key])
                    }
                    this.smoothLine();
                    this.progressBar();
                  }

                })
            },

            periodHandleChange(value){
                this.barPeriodValue=value;
                this.queryData()
            },
        }
    }
</script>

<style lang="scss">

    .echarts-main{
        height: 100%;
        width: 100%;
        display: flex;
        background: #f3f3f3;
        .echarts{
            flex: 1;
            background: white;
            margin-right: 12px;
            display: flex;
            flex-direction: column;
            .item-title{
                display: flex;
                height: 100px;
                align-items: center;
                /*padding-top: 20px;
                padding-left: 24px;*/
                width: 100%;
                #progressBar{
                    flex:3;
                    height: 100%;
                    width: 100%
                }
                .item-title-center{
                    display: flex;
                    flex:4;
                    align-items: center;
                    font-size:14px;
                    span{
                        color: #4F93FE;
                        padding: 0 6px;
                    }
                    .iconWarning{
                        margin-left: 10px;
                        color: #F25C5C;
                        i{
                            padding-right: 4px;
                        }
                    }
                }
                .item-title-right{
                    display: flex;
                    align-items: center;
                    justify-content:flex-end;
                    margin-bottom: -50px;
                    flex:1;
                    color: #ADADAD;
                    font-size: 14px;
                    padding-right: 80px;
                    .el-select{
                        width: 70px;
                        height: 26px;
                    }
                    .el-input__inner{
                        height: 26px;
                    }
                    .el-input__icon{
                        line-height: 26px;
                    }
                }
            }
            .item-echarts{
                flex: 1;
                color: black;
                #smoothLine{
                    height: 100%;
                    width: 100%
                }
            }

        }

    }


</style>
