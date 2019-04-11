//生产或开发环境URL配置
class Config {
  constructor(x, y) {
    this.URL = false ? 'https://label.hzztai.com/api' : '/api';
    this.rabbitmqUrl = false ?'wss://label.hzztai.com:15675/ws':'ws://192.168.1.91:15674/ws';
    this.downJsonUrl = false? 'https://label.hzztai.com/':'/'
  }
}
const config = new Config()
export default config;