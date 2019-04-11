<template>
  <div id="container" style="width:100%">
    <el-container style="width:100%;height:100%">
      <el-header class="header">
        <NavHeader/>
      </el-header>
      <el-container style="flex-basis: 0">
        <Navigation/>
        <el-main>
          <router-view/>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
  import Vue from 'vue';
  import NavHeader from './components/NavHeader';
  import Navigation from './components/Navigation';

  export default {
    name: 'App',
    components: {
      NavHeader,
      Navigation
    },
    mounted() {
      window.onresize = () => {
        this.$root.$emit('dash-change');
      }
    },
  }
</script>

<style lang="scss">
  @import './style';

  html,
  body {
    width: 100%;
    height: 100%;
    margin: 0 !important;
    background: #fff;
    font-family: hzztFont;
  }

  #container {
    height: 100%;
    width: 100%;
    flex-flow: column;
  }

  .header {
    height: 40px !important;
    background-color: #3b4d56;
    padding: 0 !important;

  }

  .el-main {
    padding: 0;
    height: 100%;
    background: #f3f3f3;
  }

</style>
