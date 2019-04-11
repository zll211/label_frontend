<template>
  <Pannel v-bind:title="titleList" v-bind:banner="false" :bottom="false">
    <div slot="banner">演示组件</div>
    <div slot="main" class=" myusers main-container">
      <div class="flex-1">
        <div class="userLeft">
          <div class="lefttop">
            <el-button type="primary" @click="createUser" class="create-user">新增用户</el-button>
            <el-button type="primary" @click="createGroup" class="create-group">新增工作组</el-button>

          </div>
          <el-input
            placeholder="请输入搜索内容"
            v-model="filterText">
            <i slot="suffix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <div class="zongTree">
            <el-tree :data="data5"
                     node-key="hospital_id"
                     :default-expanded-keys="defaultExpanded"
                     :filter-node-method="filterNode"
                     ref="tree2"
                     @node-click="handleNodeClick"
                     accordion
                     class="allTree"
                     v-loading="loading">
                        <span class="custom-tree-node" slot-scope="{ node, data }">
                          <span class="custom-tree-node__children">
                            <i :class="data.icon" aria-hidden="true"></i>
                              <span v-bind:style="{background:data.color }" class="user-position">{{data.role_name}}</span>
                              {{ node.label }}
                              <span v-if="data.children" style="margin-left:5px;">({{data.children.length}})</span>
                              <span style="position:absolute;right:34px;" v-if="!data.children&&data.all>0" >{{data.processed}}/{{data.all}}</span>
                          </span>
                          <!--<span>{{data.position}}</span>-->
                        </span>
            </el-tree>
          </div>
        </div>
      </div>

      <div class="flex-2" >
        <!--组信息展示-->
        <div class="groups" v-loading="showGLoading" v-show="data5.length>0">
          <el-form ref="groupRules" :model="groupForm" label-width="120px" label-position="left"
                   class="group-forms" :rules="userRules" v-if="showGroups">

            <el-form-item label="医院名称" prop="hospital" class="firstItem">

              <el-input v-model="groupForm.hospital" :disabled="true"></el-input>

            </el-form-item>

            <el-form-item label="拥有类别" class="userTree groupTree secondItem">
              <div v-if="groupForm.haveType.length>0" style="max-width:350px;max-height:270px;overflow:auto;">
                <el-tag v-for="(item,index) in groupForm.haveType" :key="index" class="user-tag">
                  {{item.cate_name}}
                </el-tag>
              </div>
              <div v-else style="color:#909399">
                暂无数据
              </div>

            </el-form-item>
            <el-form-item label="综合统计" class="userTree groupTree secondItem">
              <div>
                <div>
                  <el-tag class="user-tag" type="warning">未标注：{{groupForm.workload.labeling}}</el-tag>
                  <el-tag class="user-tag" type="success">已标注：{{groupForm.workload.labeled}}</el-tag>
                  <el-tag class="user-tag" type="danger">不予标注：{{groupForm.workload.unlabel}}</el-tag>
                </div>
                <div>
                  <el-tag class="user-tag" type="warning">未审核：{{groupForm.workload.rechecking}}</el-tag>
                  <el-tag class="user-tag" type="success">已审核：{{groupForm.workload.rechecked}}</el-tag>
                  <el-tag class="user-tag" type="danger">审核不通过：{{groupForm.workload.unrecheck}}</el-tag>
                </div>

              </div>


            </el-form-item>
            <el-form-item class="thirdItem">
              <el-button type="primary" class="to-edit" @click="toEditgroup">编辑</el-button>
              <el-button class="to-delete" @click="toDeletegroup">删除</el-button>
            </el-form-item>

          </el-form>
          <el-form ref="userForm" :model="userForm" class="user-forms" label-width="80px"
                   label-position="left" v-if="showUsers">
            <el-form-item label="账号">
              <el-input v-model="userForm.username" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="姓名">
              <el-input v-model="userForm.nickname" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="角色">
              <el-input v-model="userForm.role_name" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="拥有类别" class="userTree fourthItem">
              <div style="max-width:350px; max-height:270px;overflow:auto;" v-if="userForm.cates.length>0">
                <el-tag v-for="(item,index) in this.userForm.cates" :key="index" class="user-tag">{{item.cate_name}}
                </el-tag>
              </div>
              <div v-else style="color:#909399">
                暂无数据
              </div>

            </el-form-item>
            <el-form-item label="工作完成" class="userTree " v-show="showProgress">
              <el-popover
                placement="bottom"
                width="150"
                trigger="hover"
                popper-class="user-popover"
              >
                <p style="margin-bottom:5px;">切片总数：{{this.slice_count}}</p>
                <p v-if="userForm.role_name==='标注专家'" >已标注：{{ this.processed_count}}</p>
                <p v-if="userForm.role_name === '审核专家'">已审核：{{ this.processed_count}}</p>
                <el-progress :percentage="userForm.percentage" slot="reference"></el-progress>
              </el-popover>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" class="to-edit" @click="toEdituser('userForm')">编辑</el-button>
              <el-button class="to-delete" @click="toDeleteuser">删除</el-button>
            </el-form-item>
          </el-form>
        </div>

      </div>


      <el-dialog title="用户信息" :visible.sync="dialogUser" center class="userDialog">
        <el-form ref="userMessages" :model="userMessages" label-position="left" label-width="80px"
                 class="user-messages" :rules="userRules" @validate="validateMessages">
          <el-row :gutter="20">

            <el-col :span="12">
              <el-form-item label="账号" prop="username">
                <el-input v-model="userMessages.username" @input="usernameChange" :class="{redBorder:promptShow}"></el-input>
                <div class="el-form-item__error" v-if="promptShow">{{prompt}}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="密码" prop="password">
                <el-input v-model="userMessages.password"
                          type="password"
                          class="password"></el-input>
              </el-form-item>
            </el-col>

          </el-row>

          <el-row :gutter="20">

            <el-col :span="12">
              <el-form-item label="用户名" prop="nickname">
                <el-input v-model="userMessages.nickname"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用户角色" prop="role_name">
                <el-select v-model="userMessages.role_name">
                  <el-option label="标注专家" value="1"></el-option>
                  <el-option label="审核专家" value="2"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

          </el-row>
          <el-form-item label="所属医院" prop="hospital">
            <el-input v-model="userMessages.hospital" :disabled="newUser"></el-input>
          </el-form-item>
          <el-form-item label="所属类别" prop="defaultChecked">
            <el-tree
              style="margin-left:-9px;"
              :data="userMessages.cates"
              node-key="id"
              show-checkbox
              default-expand-all
              :default-checked-keys="userMessages.defaultChecked"
              v-loading="createULoading"
              ref="newUTree"
              @check="getNodes('newUTree')"
              :props="userProps"
              :expand-on-click-node="false">
                <span class="custom-tree-node" slot-scope="{ node, data }">
                   <span class="nodeLabel">{{ node.label }}</span>
                </span>
            </el-tree>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="saveUser('userMessages')" type="primary">保存</el-button>
          <el-button @click="cancelUser" class="userCancel">取消</el-button>
        </div>

      </el-dialog>
      <!--工作组信息框-->
      <el-dialog title="工作组信息" :visible.sync="dialogGroup" center class="groupDialog">
        <el-form ref="groupMessages" :model="groupMessages" label-position="left" label-width="80px"
                 class="group-messages" :rules="groupRules">
          <el-form-item label="医院名称" prop="hospital">
            <el-input v-model="groupMessages.hospital"></el-input>
          </el-form-item>
          <el-form-item label="拥有类别" class="over" prop="checkedArray">
            <div>
              <el-tree style="margin-left:-9px;"
                       :data="groupMessages.groupData"
                       :props="zongProps"
                       node-key="id"
                       ref="newGTree"
                       empty-text="暂无数据，请至标注管理新建类别"
                       @check="getNodes('newGTree')"
                       :default-checked-keys="groupMessages.checkedArray"
                       show-checkbox
                       default-expand-all
                       v-loading="createGLoading"
                       :expand-on-click-node="false">
                            <span class="custom-tree-node" slot-scope="{ node, data }">
                               <span class="nodeLabel">{{ node.label }}</span>
                            </span>
              </el-tree>
            </div>
          </el-form-item>


        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="saveGroup" type="primary">保 存</el-button>
          <el-button @click="cancelGroup" class="groupCancel">取 消</el-button>
        </div>

      </el-dialog>

    </div>

  </Pannel>

</template>
<script src="./users.component.js"></script>
<style src="./users.scss"></style>
