const Slice = () => import(/* webpackChunkName: "Slice" */ '../view/Slice');
const Check = () => import(/* webpackChunkName: "Check" */ '../view/Check');
const UndistributedSlice = () => import(/* webpackChunkName: "UndistributedSlice" */ '../view/Slice/Undistributed');
const AllocatedSlice = () => import(/* webpackChunkName: "AllocatedSlice" */ '../view/Slice/Allocated');
const UndistributedCheck = () => import(/* webpackChunkName: "UndistributedCheck" */ '../view/Check/Undistributed');
const AllocatedCheck = () => import(/* webpackChunkName: "AllocatedCheck" */ '../view/Check/Allocated');
const CheckResult = () => import(/* webpackChunkName: "CheckResult" */ '../view/Check/Result');
const LabelManagement = () => import(/* webpackChunkName: "LabelManagement" */ '../view/LabelManagement');
const FileManagement = () => import(/* webpackChunkName: "FileManagement" */ '../view/FileManagement');
const UserManagement = () => import(/* webpackChunkName: "UserManagement" */ '../view/UserManagement');
const Dashboard = () => import(/* webpackChunkName: "Dashboard" */ '../view/Dashboard');
const CheckMan = () => import(/* webpackChunkName: "CheckMan" */ '../view/CheckMan');
const MarkMan = () => import(/* webpackChunkName: "MarkMan" */ '../view/MarkMan');
const MarkResult = () => import(/* webpackChunkName: "MarkResult" */ '../view/MarkResult');
const MarkManCompletion = () => import(/* webpackChunkName: "MarkResult" */ '../view/MarkManCompletion');
const Marked = () => import(/* webpackChunkName: "Marked" */ '../view/MarkMan/Marked');
const Unmark = () => import(/* webpackChunkName: "Unmark" */ '../view/MarkMan/Unmark');
const Checked = () => import(/* webpackChunkName: "Checked" */ '../view/CheckMan/Checked');
const Uncheck = () => import(/* webpackChunkName: "Uncheck" */ '../view/CheckMan/Uncheck');
const AdminRouterConfig = [
  {
    path: '/',
    redirect: '/dashboard',

  },
  {
    path: '/dashboard',
    icon: 'fa fa-line-chart',
    name: '数据统计',
    exact: true,
    component: Dashboard,
  },
  {
    path: '/silce',
    name: '切片管控',
    exact: true,
    component: Slice,
    icon: 'fa fa-file-photo-o',
    redirect: '/silce/undistributedSlice',
    children: [
      {
        path: 'undistributedSlice',
        name: '未分配',
        exact: true,
        component: UndistributedSlice,
      },
      {
        path: 'allocatedSlice',
        name: '已分配',
        exact: true,
        component: AllocatedSlice,
      }
    ]
  },
  {
    path: '/check',
    name: '审批管控',
    exact: true,
    icon: 'fa fa-gavel',
    component: Check,
    redirect: '/check/undistributedCheck',
    children: [
      {
        path: 'undistributedCheck',
        name: '未分配审批',
        exact: true,
        component: UndistributedCheck,
      },
      {
        path: 'allocatedCheck',
        name: '已分配审批',
        exact: true,
        component: AllocatedCheck,
      },
      {
        path: 'result',
        name: '已审批',
        exact: true,
        component: CheckResult,
      }
    ]
  },
  {
    path: '/labelManagement',
    icon: 'fa fa-pencil',
    name: '标注管理',
    exact: true,
    component: LabelManagement,
  },
  {
    path: '/FileManagement',
    icon: 'fa fa-file',
    name: '文件管理',
    exact: true,
    component: FileManagement,
  },
  {
    path: '/userManagement',
    icon: 'fa fa-users',
    name: '用户管理',
    exact: true,
    component: UserManagement,
  },

]

const markRouterConfig = [
  {
    path: '/',
    redirect: '/MarkManCompletion',

  },
  {
    path: '/MarkManCompletion',
    icon: 'fa fa-line-chart',
    name: '数据统计',
    exact: true,
    component: MarkManCompletion,
  },
  {
    path: '/MarkMan',
    icon: 'fa fa-bookmark',
    name: '切片标注',
    exact: true,
    component: MarkMan,
    redirect: '/MarkMan/Unmark',
    children: [
      {
        path: 'Unmark',
        name: '未标注',
        exact: true,
        component: Unmark,
      },
      {
        path: 'Marked',
        name: '已标注',
        exact: true,
        component: Marked,
      },
    ]
  },
  {
    path: '/MarkResult',
    icon: 'fa fa-users',
    name: '审核结果',
    exact: true,
    component: MarkResult,
  },
]

const CheckRouterConfig = [
  {
    path: '/',
    redirect: '/MarkManCompletion',

  },
  {
    path: '/MarkManCompletion',
    icon: 'fa fa-line-chart',
    name: '数据统计',
    exact: true,
    component: MarkManCompletion,
  },
  {
    path: '/CheckMan',
    icon: 'fa fa-users',
    name: '切片审核',
    exact: true,
    component: CheckMan,
    redirect: '/CheckMan/Uncheck',
    children: [
      {
        path: 'Uncheck',
        name: '未审核',
        exact: true,
        component: Uncheck,
      },
      {
        path: 'Checked',
        name: '已审核',
        exact: true,
        component: Checked,
      },
    ]
  },
]
let RouterConfig = [];
//根据登录信息判断哪个角色
switch (localStorage.userInfo !== undefined && JSON.parse(localStorage.userInfo).role_id) {
  case '0' :
  case 0 : {
    RouterConfig = AdminRouterConfig;
    break;
  }
  case '1' :
  case 1 : {
    RouterConfig = markRouterConfig;
    break;
  }
  case '2' :
  case 2 : {
    RouterConfig = CheckRouterConfig;
    break;
  }
}
export default RouterConfig
