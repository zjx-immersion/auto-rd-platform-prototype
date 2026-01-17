# E2E 自动化测试指南

## 📋 概述

本目录包含完整的端到端（E2E）自动化测试，用于验证平台的功能完整性和数据连续性。

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装Playwright
npm install -D @playwright/test

# 安装浏览器
npx playwright install chromium
```

### 2. 启动应用

```bash
# 在终端1中启动应用
cd frontend
npm run dev
```

应用应该在 http://localhost:6060 运行

### 3. 运行测试

```bash
# 在终端2中运行测试
cd frontend
npx playwright test

# 或运行特定测试
npx playwright test e2e-automated.spec.ts

# 查看测试报告
npx playwright show-report test-results/html-report
```

## 📊 测试覆盖范围

### Phase 1: 基础验证
- ✅ 首页加载
- ✅ 数据初始化验证

### Phase 2: C0 项目管理
- ✅ 项目列表（3个项目）
- ✅ 项目详情
- ✅ 版本和PI统计

### Phase 3: C1 需求管理
- ✅ Epic列表（6个Epic）
- ✅ Epic详情
- ✅ Feature列表（10个Feature）
- ✅ Feature详情
- ✅ SSTS列表（15个SSTS）

### Phase 4: 功能测试
- ✅ 搜索功能
- ✅ 筛选功能

### Phase 5: C3 规划协调
- ✅ PI Planning Board
- ✅ PI数据展示

## 📸 测试输出

测试会自动生成以下内容：

### 截图
位置: `frontend/test-results/`
- step-1.1-homepage.png
- step-2.1-project-list.png
- step-2.2-project-data.png
- step-2.3-project-detail.png
- step-3.1-epic-list.png
- step-3.2-epic-data.png
- ... 等

### 报告
- HTML报告: `test-results/html-report/index.html`
- JSON报告: `test-results/test-results.json`

### 视频和追踪
失败的测试会自动保存：
- 视频录制
- 追踪信息（用于调试）

## 🎯 测试场景

### 场景1: 项目到Epic流程
```
首页 → 项目列表 → 项目详情 → Epic Tab → Epic详情
```

### 场景2: Epic到SSTS完整流程
```
Epic列表 → Epic详情 → Feature列表 → Feature详情 → SSTS列表
```

### 场景3: 搜索和筛选
```
Feature列表 → 搜索"ACC" → 验证结果
```

### 场景4: PI Planning
```
规划协调 → PI Planning Board → 验证数据
```

## 🔧 配置说明

### playwright.config.ts
```typescript
{
  testDir: './tests',          // 测试目录
  timeout: 30000,              // 测试超时30秒
  workers: 1,                  // 串行执行
  baseURL: 'http://localhost:6060',
  viewport: { width: 1920, height: 1080 }
}
```

### 自定义配置
可以通过环境变量覆盖：

```bash
# 设置基础URL
BASE_URL=http://localhost:8080 npx playwright test

# 设置超时时间
TIMEOUT=60000 npx playwright test
```

## 📝 测试编写指南

### 基本结构
```typescript
test('测试名称', async ({ page }) => {
  // 1. 导航
  await page.goto('/path')
  
  // 2. 操作
  await page.click('text=按钮')
  
  // 3. 断言
  await expect(page).toHaveURL(/expected/)
  
  // 4. 截图
  await page.screenshot({ path: 'screenshot.png' })
})
```

### 最佳实践

1. **使用有意义的选择器**
```typescript
// ✅ 好
await page.click('text=项目列表')
await page.locator('[data-testid="project-list"]')

// ❌ 避免
await page.click('.el-button:nth-child(3)')
```

2. **等待元素加载**
```typescript
await page.waitForSelector('.el-table__row')
await page.waitForTimeout(1000) // 必要时使用
```

3. **添加有意义的日志**
```typescript
console.log('✅ 项目列表加载成功')
console.log(`✅ 显示${count}个项目`)
```

4. **截图关键步骤**
```typescript
await page.screenshot({ 
  path: 'test-results/step-name.png',
  fullPage: true 
})
```

## 🐛 调试技巧

### 1. 头部模式运行
```bash
npx playwright test --headed
```

### 2. 调试特定测试
```bash
npx playwright test --debug e2e-automated.spec.ts
```

### 3. 查看追踪
```bash
npx playwright show-trace test-results/trace.zip
```

### 4. 启用详细日志
```bash
DEBUG=pw:api npx playwright test
```

## 📈 CI/CD 集成

### GitHub Actions示例
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install chromium
      - run: npm run dev &
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## 🎓 进阶主题

### 数据驱动测试
```typescript
const testData = [
  { epic: 'epic-001', features: 3 },
  { epic: 'epic-002', features: 2 }
]

for (const data of testData) {
  test(`验证${data.epic}`, async ({ page }) => {
    // 测试逻辑
  })
}
```

### 页面对象模式
```typescript
class ProjectListPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/projects')
  }
  
  async getProjectCount() {
    return await this.page.locator('.el-table__row').count()
  }
}
```

## 📚 参考资源

- [Playwright官方文档](https://playwright.dev)
- [Element Plus测试指南](https://element-plus.org/zh-CN/guide/dev-guide.html)
- [Vue Testing指南](https://test-utils.vuejs.org/)

## 🆘 常见问题

### Q: 测试超时怎么办？
A: 增加timeout配置或使用 `page.waitForTimeout()`

### Q: 元素找不到怎么办？
A: 使用 `page.waitForSelector()` 等待元素出现

### Q: 如何测试登录后的页面？
A: 使用 `test.use()` 配置storageState保存登录状态

### Q: 如何并行运行测试？
A: 修改 `playwright.config.ts` 中的 `workers` 配置

---

**最后更新**: 2026-01-17  
**版本**: 1.0.0
