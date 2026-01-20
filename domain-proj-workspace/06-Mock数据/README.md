# Mock数据说明

> **文档版本**: V1.0  
> **创建时间**: 2026-01-20  
> **数据用途**: 前端开发和测试使用的Mock数据

---

## 📦 数据文件清单

| 文件 | 说明 | 数量 |
|------|------|------|
| projects.json | 整车项目数据 | 3个项目 |
| milestones.json | 车型里程碑数据 | 12个里程碑 |
| versions.json | 产品版本数据（含完成度） | 6个版本 |
| pis.json | PI规划数据（含里程碑映射） | 12个PI |

---

## 🔗 数据关系

```
项目PRJ-2025-001（岚图H56）
├── 里程碑
│   ├── MILE-001: 样车交付（2025-04-30）
│   ├── MILE-002: 工程样车（2025-06-30）→ 关联PI-2
│   ├── MILE-003: PP车（2025-09-30）→ 关联PI-3
│   └── MILE-004: 量产车（2025-12-31）→ 关联PI-4
├── 版本
│   ├── V1.0 (MVP版本, 目标2025-06-30)
│   │   ├── Epic A (80%) → Feature A1(100%), A2(100%), A3(33%)
│   │   └── Epic B (60%) → Feature B1(100%), B2(20%)
│   └── V2.0 (完整版, 目标2025-12-31)
│       ├── Epic A (20%) → Feature A3(67%)
│       └── Epic B (40%) → Feature B2(80%)
└── PI
    ├── PI-1 (2025-02-01~04-13, 无里程碑)
    ├── PI-2 (2025-04-14~06-22, 关联工程样车)
    ├── PI-3 (2025-06-23~09-01, 关联PP车)
    └── PI-4 (2025-09-02~11-10, 关联量产车)
```

---

## 📊 数据特点

### 完成度设置示例 ⭐核心创新
```json
// 版本V1.0
{
  "versionId": "VER-2025-001",
  "versionNumber": "V1.0",
  "scope": {
    "epics": [
      {
        "epicId": "ADAS-E001",
        "completionTarget": 80,  // Epic完成80%
        "features": [
          {
            "featureId": "ADAS-F001",
            "completionTarget": 100  // Feature全部完成
          },
          {
            "featureId": "ADAS-F002",
            "completionTarget": 100
          },
          {
            "featureId": "ADAS-F003",
            "completionTarget": 33   // Feature部分完成33%
          }
        ]
      }
    ]
  }
}
```

### 里程碑对齐示例 ⭐核心创新
```json
// PI-2与工程样车对齐
{
  "piId": "PI-2025-002",
  "piNumber": "PI-2",
  "endDate": "2025-06-22",
  "linkedMilestoneId": "MILE-2025-002",  // 工程样车(2025-06-30)
  "alignmentInfo": {
    "daysDiff": 8,
    "alignmentLevel": "ACCEPTABLE"  // 8天差异，可接受
  }
}
```

---

## 🚀 使用方式

### 前端集成
```typescript
// 1. 数据加载器
import projectsData from '@/mock-data/projects.json'
import milestonesData from '@/mock-data/milestones.json'
import versionsData from '@/mock-data/versions.json'
import pisData from '@/mock-data/pis.json'

// 2. 初始化Store
export async function initializeMockData() {
  const projectStore = useProjectStore()
  const milestoneStore = useMilestoneStore()
  const versionStore = useVersionStore()
  const piStore = usePIStore()
  
  // 加载数据到Store
  projectStore.projectList = projectsData
  milestoneStore.milestones = milestonesData
  versionStore.versions = versionsData
  piStore.pis = pisData
  
  console.log('✅ Mock数据加载完成')
}
```

---

**创建时间**: 2026-01-20  
**维护人员**: 平台设计组
