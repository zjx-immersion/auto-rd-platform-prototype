import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Shell from '@/components/Layout/Shell.vue'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/workspace/my'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      hideInMenu: true
    }
  },
  {
    path: '/',
    component: Shell,
    children: [
      // ===== 流程驱动路由 =====
      {
        path: 'process',
        children: [
          {
            path: 'my',
            name: 'MyProcess',
            component: () => import('@/views/Process/MyProcess.vue'),
            meta: {
              title: '我的流程',
              breadcrumb: ['流程驱动', '我的流程']
            }
          },
          {
            path: 'p1-strategic',
            name: 'P1Strategic',
            component: () => import('@/views/Process/P1Strategic/index.vue'),
            meta: {
              title: 'P1: 战略规划流程',
              breadcrumb: ['流程驱动', 'P1: 战略规划流程']
            }
          },
          {
            path: 'p2-feature',
            name: 'P2Feature',
            component: () => import('@/views/Process/P2Feature/index.vue'),
            meta: {
              title: 'P2: 特性设计流程',
              breadcrumb: ['流程驱动', 'P2: 特性设计流程']
            }
          },
          {
            path: 'p3-solution',
            name: 'P3Solution',
            component: () => import('@/views/Process/P3Solution/index.vue'),
            meta: {
              title: 'P3: 方案设计流程',
              breadcrumb: ['流程驱动', 'P3: 方案设计流程']
            }
          },
          {
            path: 'p4-iteration',
            name: 'P4Iteration',
            component: () => import('@/views/Process/P4Iteration/index.vue'),
            meta: {
              title: 'P4: 团队迭代流程',
              breadcrumb: ['流程驱动', 'P4: 团队迭代流程']
            }
          },
          {
            path: 'p5-testing',
            name: 'P5Testing',
            component: () => import('@/views/Process/P5Testing/index.vue'),
            meta: {
              title: 'P5: 测试验证流程',
              breadcrumb: ['流程驱动', 'P5: 测试验证流程']
            }
          },
          {
            path: 'p6-release',
            name: 'P6Release',
            component: () => import('@/views/Process/P6Release/index.vue'),
            meta: {
              title: 'P6: 发布交付流程',
              breadcrumb: ['流程驱动', 'P6: 发布交付流程']
            }
          }
        ]
      },
      
      // ===== 固有功能路由 =====
      {
        path: 'function',
        children: [
          // C0: 领域项目管理 - V3.0重新设计
          {
            path: 'c0-project',
            children: [
              // ========== 项目管理 ==========
              {
                path: 'list',
                name: 'ProjectList',
                component: () => import('@/views/C0-Project/ProjectList.vue'),
                meta: { title: '项目列表', breadcrumb: ['固有功能', 'C0: 领域项目管理', '项目列表'] }
              },
              {
                path: 'create',
                name: 'ProjectCreate',
                component: () => import('@/views/C0-Project/ProjectCreate.vue'),
                meta: { title: '创建项目', breadcrumb: ['固有功能', 'C0: 领域项目管理', '创建项目'] }
              },
              {
                path: 'detail/:id',
                name: 'ProjectDetail',
                component: () => import('@/views/C0-Project/ProjectDetail.vue'),
                meta: { title: '项目详情', breadcrumb: ['固有功能', 'C0: 领域项目管理', '项目详情'] }
              },
              {
                path: 'monitor/:id',
                name: 'ProjectMonitor',
                component: () => import('@/views/C0-Project/ProjectMonitor.vue'),
                meta: { title: '项目监控', breadcrumb: ['固有功能', 'C0: 领域项目管理', '项目监控'] }
              },
              
              // ========== 1级视图层 ==========
              // 项目Timeline（整体多集计划主页）⭐⭐⭐⭐
              {
                path: 'timeline/:projectId',
                name: 'ProjectTimeline',
                component: () => import('@/views/C0-Project/ProjectTimeline.vue'),
                meta: { title: '项目Timeline', breadcrumb: ['固有功能', 'C0: 领域项目管理', '项目Timeline'] }
              },
              // PI集合视图
              {
                path: 'pi-collection/:projectId',
                name: 'PICollectionView',
                component: () => import('@/views/C0-Project/PICollectionView.vue'),
                meta: { title: 'PI集合视图', breadcrumb: ['固有功能', 'C0: 领域项目管理', 'PI集合视图'] }
              },
              
              // ========== 2级规划层（核心工作台）⭐⭐⭐⭐⭐ ==========
              // 多产品版本规划工作台
              {
                path: 'version-planning-workspace/:projectId',
                name: 'VersionPlanningWorkspace',
                component: () => import('@/views/C0-Project/VersionPlanningWorkspace.vue'),
                meta: { title: '多产品版本规划工作台', breadcrumb: ['固有功能', 'C0: 领域项目管理', '版本规划工作台'] }
              },
              
              // ========== 管理层 ==========
              // 版本管理
              {
                path: 'version/list',
                name: 'VersionManagement',
                component: () => import('@/views/C0-Project/VersionManagement.vue'),
                meta: { title: '版本列表', breadcrumb: ['固有功能', 'C0: 领域项目管理', '版本列表'] }
              },
              // 产品管理（Phase1已实现）
              {
                path: 'products',
                name: 'ProductManagement',
                component: () => import('@/views/C0-Project/ProductManagement.vue'),
                meta: { title: '产品管理', breadcrumb: ['固有功能', 'C0: 领域项目管理', '产品管理'] }
              },
              // 团队管理 ⚠️新增（紧急修复）
              {
                path: 'team/management',
                name: 'TeamManagement',
                component: () => import('@/views/C0-Project/TeamManagement.vue'),
                meta: { title: '团队管理', breadcrumb: ['固有功能', 'C0: 领域项目管理', '团队管理'] }
              }
            ]
          },
          
          // C1: 需求管理
          {
            path: 'c1-requirement',
            children: [
              // 需求池 ⭐新增
              {
                path: 'pool',
                name: 'RequirementPool',
                component: () => import('@/views/C1-Requirement/RequirementPool.vue'),
                meta: { title: '需求池', breadcrumb: ['固有功能', 'C1: 需求管理', '需求池'] }
              },
              // Epic管理
              {
                path: 'epic',
                name: 'EpicList',
                component: () => import('@/views/C1-Requirement/EpicList.vue'),
                meta: { title: 'Epic列表', breadcrumb: ['固有功能', 'C1: 需求管理', 'Epic列表'] }
              },
              {
                path: 'epic/:id',
                name: 'EpicDetail',
                component: () => import('@/views/C1-Requirement/EpicDetail.vue'),
                meta: { title: 'Epic详情', breadcrumb: ['固有功能', 'C1: 需求管理', 'Epic详情'] }
              },
              // Feature管理
              {
                path: 'feature',
                name: 'FeatureList',
                component: () => import('@/views/C1-Requirement/FeatureList.vue'),
                meta: { title: 'Feature列表', breadcrumb: ['固有功能', 'C1: 需求管理', 'Feature列表'] }
              },
              {
                path: 'feature/:id',
                name: 'FeatureDetail',
                component: () => import('@/views/C1-Requirement/FeatureDetail.vue'),
                meta: { title: 'Feature详情', breadcrumb: ['固有功能', 'C1: 需求管理', 'Feature详情'] }
              },
              {
                path: 'feature/:id/decompose',
                name: 'FeatureDecompose',
                component: () => import('@/views/C1-Requirement/FeatureDecompose.vue'),
                meta: { title: 'Feature拆解', breadcrumb: ['固有功能', 'C1: 需求管理', 'Feature拆解'] }
              },
              {
                path: 'feature/:id/prd',
                name: 'PRDEditor',
                component: () => import('@/views/C1-Requirement/PRDEditor.vue'),
                meta: { title: 'PRD编辑器', breadcrumb: ['固有功能', 'C1: 需求管理', 'PRD编辑器'] }
              },
              // SSTS管理
              {
                path: 'ssts/list',
                name: 'SSTSList',
                component: () => import('@/views/C1-Requirement/SSTSList.vue'),
                meta: { title: 'SSTS列表', breadcrumb: ['固有功能', 'C1: 需求管理', 'SSTS列表'] }
              },
              {
                path: 'ssts/:id',
                name: 'SSTSDetail',
                component: () => import('@/views/C1-Requirement/SSTSDetail.vue'),
                meta: { title: 'SSTS详情', breadcrumb: ['固有功能', 'C1: 需求管理', 'SSTS详情'] }
              },
              {
                path: 'ssts/:id/decompose',
                name: 'SSTSDecompose',
                component: () => import('@/views/C1-Requirement/SSTSDecompose.vue'),
                meta: { title: 'SSTS拆解', breadcrumb: ['固有功能', 'C1: 需求管理', 'SSTS拆解'] }
              },
              // MR管理
              {
                path: 'mr/list',
                name: 'MRList',
                component: () => import('@/views/C1-Requirement/MRList.vue'),
                meta: { title: 'MR列表', breadcrumb: ['固有功能', 'C1: 需求管理', 'MR列表'] }
              },
              {
                path: 'mr/:id',
                name: 'MRDetail',
                component: () => import('@/views/C1-Requirement/MRDetail.vue'),
                meta: { title: 'MR详情', breadcrumb: ['固有功能', 'C1: 需求管理', 'MR详情'] }
              },
              {
                path: 'mr/:id/assign',
                name: 'MRAllocation',
                component: () => import('@/views/C1-Requirement/MRAllocation.vue'),
                meta: { title: 'MR分配', breadcrumb: ['固有功能', 'C1: 需求管理', 'MR分配'] }
              },
              // 需求池
              {
                path: 'pool',
                name: 'RequirementPool',
                component: () => import('@/views/C1-Requirement/RequirementPool.vue'),
                meta: { title: '需求池', breadcrumb: ['固有功能', 'C1: 需求管理', '需求池'] }
              }
            ]
          },
          
          // C2: 资产管理
          {
            path: 'c2',
            children: [
              {
                path: 'productline/list',
                name: 'ProductLineList',
                component: () => import('@/views/C2-Assets/ProductLineList.vue'),
                meta: { title: '产品线管理', breadcrumb: ['固有功能', 'C2: 资产管理', '产品线管理'] }
              },
              {
                path: 'product/list',
                name: 'ProductList',
                component: () => import('@/views/C2-Assets/ProductList.vue'),
                meta: { title: '产品管理', breadcrumb: ['固有功能', 'C2: 资产管理', '产品管理'] }
              },
              {
                path: 'asset/search',
                name: 'AssetSearch',
                component: () => import('@/views/C2-Assets/AssetSearch.vue'),
                meta: { title: '资产搜索', breadcrumb: ['固有功能', 'C2: 资产管理', '资产搜索'] }
              },
              {
                path: 'asset/list',
                name: 'AssetList',
                component: () => import('@/views/C2-Assets/AssetList.vue'),
                meta: { title: '资产库', breadcrumb: ['固有功能', 'C2: 资产管理', '资产库'] }
              },
              {
                path: 'asset/recommend',
                name: 'AssetRecommend',
                component: () => import('@/views/C2-Assets/AssetRecommend.vue'),
                meta: { title: '资产推荐', breadcrumb: ['固有功能', 'C2: 资产管理', '资产推荐'] }
              }
            ]
          },
          // C3: 规划协调
          {
            path: 'c3',
            children: [
              {
                path: 'sprint/list',
                name: 'SprintList',
                component: () => import('@/views/C3-Planning/SprintList.vue'),
                meta: { title: 'Sprint管理', breadcrumb: ['固有功能', 'C3: 规划协调', 'Sprint管理'] }
              },
              {
                path: 'pi-planning-board',
                name: 'PIPlanningBoard',
                component: () => import('@/views/C3-Planning/PIPlanningBoard.vue'),
                meta: { title: 'PI Planning看板', breadcrumb: ['固有功能', 'C3: 规划协调', 'PI Planning看板'] }
              },
              {
                path: 'pi/planning',
                name: 'PIPlanning',
                component: () => import('@/views/C3-Planning/PIPlanning.vue'),
                meta: { title: 'PI Planning', breadcrumb: ['固有功能', 'C3: 规划协调', 'PI Planning'] }
              },
              {
                path: 'planning/pi/:piId/stage1',
                name: 'PIPlanningStage1',
                component: () => import('@/views/C3-Planning/PIPlanningStage1.vue'),
                meta: { title: 'PI Planning - 阶段1', breadcrumb: ['固有功能', 'C3: 规划协调', 'PI Planning', '阶段1'] }
              },
              {
                path: 'planning/pi/:piId/stage2',
                name: 'PIPlanningStage2',
                component: () => import('@/views/C3-Planning/PIPlanningStage2.vue'),
                meta: { title: 'PI Planning - 阶段2', breadcrumb: ['固有功能', 'C3: 规划协调', 'PI Planning', '阶段2'] }
              },
              {
                path: 'dependency-matrix',
                name: 'DependencyMatrix',
                component: () => import('@/views/C3-Planning/DependencyMatrix.vue'),
                meta: { title: '依赖矩阵', breadcrumb: ['固有功能', 'C3: 规划协调', '依赖矩阵'] }
              },
              {
                path: 'dependency',
                name: 'DependencyManagement',
                component: () => import('@/views/C3-Planning/DependencyManagement.vue'),
                meta: { title: '依赖管理', breadcrumb: ['固有功能', 'C3: 规划协调', '依赖管理'] }
              },
              {
                path: 'risk',
                name: 'RiskManagement',
                component: () => import('@/views/C3-Planning/RiskManagement.vue'),
                meta: { title: '风险管理', breadcrumb: ['固有功能', 'C3: 规划协调', '风险管理'] }
              },
              {
                path: 'risk/detail/:id',
                name: 'RiskDetail',
                component: () => import('@/views/C3-Planning/RiskDetail.vue'),
                meta: { title: '风险详情', breadcrumb: ['固有功能', 'C3: 规划协调', '风险管理', '风险详情'] }
              },
              {
                path: 'pi/progress/:id',
                name: 'PIProgress',
                component: () => import('@/views/C3-Planning/PIProgress.vue'),
                meta: { title: 'PI进度跟踪', breadcrumb: ['固有功能', 'C3: 规划协调', 'PI进度跟踪'] }
              },
              {
                path: 'pi/review/:id',
                name: 'PIReview',
                component: () => import('@/views/C3-Planning/PIReview.vue'),
                meta: { title: 'PI回顾会议', breadcrumb: ['固有功能', 'C3: 规划协调', 'PI回顾会议'] }
              },
              {
                path: 'pi/capacity',
                name: 'PICapacityManagement',
                component: () => import('@/views/C3-Planning/PICapacityManagement.vue'),
                meta: { title: 'PI容量管理', breadcrumb: ['固有功能', 'C3: 规划协调', 'PI容量管理'] }
              }
            ]
          },
          // C4: 迭代执行
          {
            path: 'c4',
            children: [
              {
                path: 'sprint/list',
                name: 'SprintList',
                component: () => import('@/views/C4-Iteration/SprintList.vue'),
                meta: { title: 'Sprint管理', breadcrumb: ['固有功能', 'C4: 迭代执行', 'Sprint管理'] }
              },
              {
                path: 'sprint/:id',
                name: 'SprintDetail',
                component: () => import('@/views/C4-Iteration/SprintDetail.vue'),
                meta: { title: 'Sprint详情', breadcrumb: ['固有功能', 'C4: 迭代执行', 'Sprint详情'] }
              },
              {
                path: 'sprint/board/:sprintId',
                name: 'SprintBoard',
                component: () => import('@/views/C4-Iteration/SprintBoard.vue'),
                meta: { title: 'Sprint看板', breadcrumb: ['固有功能', 'C4: 迭代执行', 'Sprint看板'] }
              },
              {
                path: 'sprint/review/:id',
                name: 'SprintReview',
                component: () => import('@/views/C4-Iteration/SprintReview.vue'),
                meta: { title: 'Sprint回顾', breadcrumb: ['固有功能', 'C4: 迭代执行', 'Sprint回顾'] }
              },
              {
                path: 'task/list',
                name: 'TaskList',
                component: () => import('@/views/C4-Iteration/TaskList.vue'),
                meta: { title: '任务列表', breadcrumb: ['固有功能', 'C4: 迭代执行', '任务列表'] }
              },
              {
                path: 'task/:id',
                name: 'TaskDetail',
                component: () => import('@/views/C4-Iteration/TaskDetail.vue'),
                meta: { title: '任务详情', breadcrumb: ['固有功能', 'C4: 迭代执行', '任务详情'] }
              },
              {
                path: 'task/board',
                name: 'TaskBoard',
                component: () => import('@/views/C4-Iteration/TaskBoard.vue'),
                meta: { title: '任务看板', breadcrumb: ['固有功能', 'C4: 迭代执行', '任务看板'] }
              },
              {
                path: 'code/review',
                name: 'CodeReview',
                component: () => import('@/views/C4-Iteration/CodeReview.vue'),
                meta: { title: '代码评审', breadcrumb: ['固有功能', 'C4: 迭代执行', '代码评审'] }
              }
            ]
          },
          // C5: 测试验收
          {
            path: 'c5',
            children: [
              {
                path: 'testplan/list',
                name: 'TestPlanList',
                component: () => import('@/views/C5-Testing/TestPlanList.vue'),
                meta: { title: '测试计划', breadcrumb: ['固有功能', 'C5: 测试验收', '测试计划'] }
              },
              {
                path: 'testcase/list',
                name: 'TestCaseList',
                component: () => import('@/views/C5-Testing/TestCaseList.vue'),
                meta: { title: '测试用例', breadcrumb: ['固有功能', 'C5: 测试验收', '测试用例'] }
              },
              {
                path: 'testcase/:id',
                name: 'TestCaseDetail',
                component: () => import('@/views/C5-Testing/TestCaseDetail.vue'),
                meta: { title: '测试用例详情', breadcrumb: ['固有功能', 'C5: 测试验收', '测试用例详情'] }
              },
              {
                path: 'defect/list',
                name: 'DefectList',
                component: () => import('@/views/C5-Testing/DefectList.vue'),
                meta: { title: '缺陷管理', breadcrumb: ['固有功能', 'C5: 测试验收', '缺陷管理'] }
              },
              {
                path: 'defect/:id',
                name: 'DefectDetail',
                component: () => import('@/views/C5-Testing/DefectDetail.vue'),
                meta: { title: '缺陷详情', breadcrumb: ['固有功能', 'C5: 测试验收', '缺陷详情'] }
              },
              {
                path: 'report',
                name: 'TestReport',
                component: () => import('@/views/C5-Testing/TestReport.vue'),
                meta: { title: '测试报告', breadcrumb: ['固有功能', 'C5: 测试验收', '测试报告'] }
              }
            ]
          },
          // C6: DevOps交付
          {
            path: 'c6',
            children: [
              {
                path: 'build/list',
                name: 'BuildList',
                component: () => import('@/views/C6-DevOps/BuildList.vue'),
                meta: { title: '构建管理', breadcrumb: ['固有功能', 'C6: DevOps交付', '构建管理'] }
              },
              {
                path: 'deploy/list',
                name: 'DeployList',
                component: () => import('@/views/C6-DevOps/DeployList.vue'),
                meta: { title: '部署管理', breadcrumb: ['固有功能', 'C6: DevOps交付', '部署管理'] }
              },
              {
                path: 'pipeline',
                name: 'PipelineList',
                component: () => import('@/views/C6-DevOps/PipelineList.vue'),
                meta: { title: '流水线', breadcrumb: ['固有功能', 'C6: DevOps交付', '流水线'] }
              },
              {
                path: 'environment',
                name: 'EnvironmentManagement',
                component: () => import('@/views/C6-DevOps/EnvironmentManagement.vue'),
                meta: { title: '环境管理', breadcrumb: ['固有功能', 'C6: DevOps交付', '环境管理'] }
              }
            ]
          },
          // C7: 分析与治理
          {
            path: 'c7',
            children: [
              {
                path: 'metrics/requirement',
                name: 'RequirementMetrics',
                component: () => import('@/views/C7-Analytics/RequirementMetrics.vue'),
                meta: { title: '需求度量', breadcrumb: ['固有功能', 'C7: 分析与治理', '需求度量'] }
              },
              {
                path: 'metrics/quality',
                name: 'QualityMetrics',
                component: () => import('@/views/C7-Analytics/QualityMetrics.vue'),
                meta: { title: '质量度量', breadcrumb: ['固有功能', 'C7: 分析与治理', '质量度量'] }
              },
              {
                path: 'metrics/delivery',
                name: 'DeliveryMetrics',
                component: () => import('@/views/C7-Analytics/DeliveryMetrics.vue'),
                meta: { title: '交付度量', breadcrumb: ['固有功能', 'C7: 分析与治理', '交付度量'] }
              },
              {
                path: 'metrics/team',
                name: 'TeamEfficiency',
                component: () => import('@/views/C7-Analytics/TeamEfficiency.vue'),
                meta: { title: '团队效能', breadcrumb: ['固有功能', 'C7: 分析与治理', '团队效能'] }
              }
            ]
          }
        ]
      },
      
      // ===== 工作台路由 =====
      {
        path: 'workspace',
        children: [
          {
            path: 'my',
            name: 'MyWorkspace',
            component: () => import('@/views/Workspace/MyWorkspace.vue'),
            meta: {
              title: '我的工作台',
              breadcrumb: ['工作台', '我的工作台']
            }
          },
          {
            path: 'team',
            name: 'TeamWorkspace',
            component: () => import('@/views/Workspace/TeamWorkspace.vue'),
            meta: {
              title: '团队工作台',
              breadcrumb: ['工作台', '团队工作台']
            }
          },
          {
            path: 'project',
            name: 'ProjectWorkspace',
            component: () => import('@/views/Workspace/ProjectWorkspace.vue'),
            meta: {
              title: '项目工作台',
              breadcrumb: ['工作台', '项目工作台']
            }
          },
          {
            path: 'management',
            name: 'ManagementWorkspace',
            component: () => import('@/views/Workspace/ManagementWorkspace.vue'),
            meta: {
              title: '管理工作台',
              breadcrumb: ['工作台', '管理工作台']
            }
          }
        ]
      }
    ]
  },
  
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title 
    ? `${to.meta.title} - 整车软件研发平台` 
    : '整车软件研发平台'
  
  // TODO: 权限检查
  next()
})

export default router
