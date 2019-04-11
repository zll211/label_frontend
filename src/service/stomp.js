import Stomp from 'stompjs';
import config from '../../config/hzzt';
import debounce from 'lodash/debounce';

export default {
  data() {
    return {
      client: null, // stomp的主体
      connected: false,// ws是否已经连接
      subscribeMap: new Map(),// 已经订阅的stomp map
      waitForSubscribe: [], // 在ws连接之前就申请订阅的
      reconnectTimes: 0, // 重连次数
      resetReconnectTimesTimeout: 0, // 重置重连次数的倒计时
      noticeHasShowed: false // 是否已显示重连modal

    }
  },
  created() {
    this.startConnect();
  },
  methods: {
    /**
     * 连接stomp
     */
    startConnect() {
      this.client = null;
      const ws = Stomp.client(`${config.rabbitmqUrl}`);
      this.client = ws;
      // 用于测试stomp断线重连
      // window.setTimeout(() => {
      //     this.client.disconnect()
      // }, 5000)
      this.client.connect('guest','guest', this.connectCallBack, debounce(this.disconnectCallBack, 5000));
    },
    connectCallBack() {
      // console.log('---ooo')
      // 置为true
      this.connected = true;
      // 稳定连接 60s后 重置重连次数、重连提示状态
      this.resetReconnectTimesTimeout = window.setTimeout(() => {
        this.reconnectTimes = 0;
        this.noticeHasShowed = false;
      }, 60000);
      // 如果是重连，就要恢复之前的订阅
      this.subscribeMap.forEach((item, key) => {
        // this.unsubscribe(key)
        this.addToWaitList(key,item.type);
      });
      // 已订阅map置空
      this.subscribeMap.clear();
      // 遍历订阅
      this.waitForSubscribe.forEach((item)=> {
        this.subscribe(item.topic,item.type);
      });
    },
    disconnectCallBack() {
      // 鉴于这个函数会因为多种原因触发，需要加一个定时，以免频繁调用
      // 取消重置重连次数的倒计时
      if (this.resetReconnectTimesTimeout) {
        window.clearTimeout(this.resetReconnectTimesTimeout);
      }
      this.connected = false;
      if (this.reconnectTimes < 3) {
        this.reconnectTimes++;
        this.$notify({
          title: '消息连接意外中断',
          message: `请检查网络环境，正在第${this.reconnectTimes}次重连...`,
          duration: 5000
        });
        this.startConnect();
      } else {
        if (!this.noticeHasShowed) {
          this.noticeHasShowed = true;
          this.$notify({
            title: '消息连接已连续多次中断',
            message: '当前网络环境可能较差，请确认网络环境良好后刷新重试',
            duration: 0
          });
        }
      }
    },
    /**
     * 添加在等待订阅的list中
     * @param topic 订阅主题 string
     */
    addToWaitList(topic,type) {
      if (this.waitForSubscribe.findIndex(item => item.topic === topic) === -1) {
        this.waitForSubscribe.push({
          topic:topic,
          type:type,
        });
      }
    },
    /**
     * 订阅
     * @param topic 订阅主题 string
     */
    subscribe(topic,type) {
      if (this.connected) {
        if (!this.subscribeMap.has(topic)) {
          let subscribeUrl = '/topic/' + topic;
          const scribe = this.client.subscribe(subscribeUrl, data => {

            try {
              // 消息来源
              // console.log(data.body, '=======K');
              let obj = JSON.parse(data.body);
              if(type==='scan'){
                if(obj){
                  this.isShowButton = true
                  this.isShowDetail=false;
                }
                if (obj.count === obj.completed) {
                  this.isShowProgress = true;
                  this.progressValue = 100;
                  this.allSlice=obj.completed;
                  this.outSlice = obj.labeled;
                } else {
                  this.isShowProgress = true;
                  this.progressValue = ((obj.completed / obj.count) * 100).toFixed(2) / 1;
                }
                if (obj.labeled!=undefined&&Math.floor(this.progressValue) === 100) {
                  this.$message.success('扫描切片成功');
                  this.queryList();
                  setTimeout(() => {
                    this.isShowProgress = false;
                    this.isShowButton = false;
                    this.isShowDetail=true;
                  }, 3000);
                }
              }
              else if(type==='unAllocateAnalyze'){
                if(obj){
                  this.isShowAnalyzeProgress = !!obj;
                  this.currentSliceCount = obj.current_slice;
                  this.totalSliceCount = obj.count_slice;
                  if(obj.count === obj.completed){
                    this.progressAnalyzeValue = 100;
                    if(obj.current_slice === obj.count_slice){
                      this.$message.success('解析成功');
                      this.queryList();
                      setTimeout(()=>{
                        this.isShowAnalyzeProgress = false;
                      },2000)
                    }

                  }
                  else {
                    this.progressAnalyzeValue = ((obj.completed / obj.count) * 100).toFixed(2) / 1;
                  }
                }
              }
              else if(type==='AllocatedAnalyze'){
                if(obj){
                  this.isShowAllotProgress = !!obj;
                  this.currentAllotCount = obj.current_slice;
                  this.totalAllotCount = obj.count_slice;
                  if(obj.count === obj.completed){
                    this.progressAllotValue = 100;

                    if(obj.current_slice === obj.count_slice){
                      this.$message.success('解析成功');
                      this.queryList();
                      setTimeout(()=>{
                        this.isShowAllotProgress = false;
                      },2000)
                    }
                  }
                  else {
                    this.progressAllotValue = ((obj.completed / obj.count) * 100).toFixed(2) / 1;
                  }
                }
              }

            } catch (e) {
              console.error(e);
            }
          });
          this.subscribeMap.set(topic, {scribe:scribe,type:type});
        }
      } else {
        this.addToWaitList(topic,type);
      }
    },
    /**
     * 取消订阅 string
     * @param topic 订阅主题
     */
    unsubscribe(topic) {
      if (this.subscribeMap.has(topic)) {
        this.subscribeMap.get(topic).scribe.unsubscribe();
        this.subscribeMap.delete(topic);
      }
    }
  }

}
