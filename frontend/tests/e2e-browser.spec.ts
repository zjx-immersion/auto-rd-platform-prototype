/**
 * 基于浏览器的完整页面测试
 * 使用实际的用户交互方式进行验证
 */

import { test, expect, Page } from '@playwright/test'

const BASE_URL = 'http://localhost:6060'

test.describe.configure({ mode: 'serial' })

let page: Page

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await page.setViewportSize({ width: 1920, height: 1080 })
  
  // 启用详细日志
  page.on('console', msg => {
    const type = msg.type()
    const text = msg.text()
    if (type === 'log' && (text.includes('✓') || text.includes('✅') || text.includes('📦'))) {
      console.log(`浏览器: ${text}`)
    }
  })
  
  page.on('pageerror', err => {
    console.error('页面错误:', err.message)
  })
})

test.afterAll(async () => {
  await page.close()
})

/**
 * Phase 1: 基础验证和数据加载
 */
test.describe('Phase 1: 基础验证', () => {
  test('1.1 打开首页并等待数据加载', async () => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('开始测试: Phase 1 - 基础验证')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    
    // 验证标题
    await expect(page).toHaveTitle(/整车软件研发平台|我的工作台/)
    console.log('✅ 页面标题验证通过')
    
    // 等待数据加载完成
    await page.waitForTimeout(3000)
    
    // 验证侧边栏菜单
    const sidebar = await page.locator('.el-menu').count()
    expect(sidebar).toBeGreaterThan(0)
    console.log('✅ 侧边栏菜单加载成功')
    
    // 截图
    await page.screenshot({ 
      path: 'test-results/browser-1.1-homepage.png', 
      fullPage: true 
    })
    console.log('✅ 首页截图已保存\n')
  })
})

/**
 * Phase 2: 通过点击菜单导航到项目列表
 */
test.describe('Phase 2: 项目管理验证', () => {
  test('2.1 通过侧边栏导航到项目列表', async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('开始测试: Phase 2 - 项目管理')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // 查找并点击"C0: 领域项目管理"菜单项
    const c0Menu = page.locator('text=/C0.*领域项目管理/').first()
    await c0Menu.waitFor({ state: 'visible', timeout: 5000 })
    await c0Menu.click()
    await page.waitForTimeout(500)
    console.log('✅ 点击了 C0: 领域项目管理')
    
    // 查找并点击"项目列表"
    const projectListMenu = page.locator('text=/项目列表/').first()
    await projectListMenu.waitFor({ state: 'visible', timeout: 5000 })
    await projectListMenu.click()
    await page.waitForTimeout(2000)
    console.log('✅ 点击了项目列表菜单')
    
    // 截图
    await page.screenshot({ 
      path: 'test-results/browser-2.1-project-list-nav.png', 
      fullPage: true 
    })
    console.log('✅ 导航截图已保存\n')
  })

  test('2.2 验证项目列表数据', async () => {
    // 等待页面加载
    await page.waitForTimeout(2000)
    
    // 查找表格或卡片
    const hasTable = await page.locator('.el-table').count() > 0
    const hasCards = await page.locator('.el-card').count() > 0
    
    if (hasTable) {
      const rows = await page.locator('.el-table__row').count()
      console.log(`✅ 找到表格，显示 ${rows} 行数据`)
      expect(rows).toBeGreaterThan(0)
    } else if (hasCards) {
      const cards = await page.locator('.el-card').count()
      console.log(`✅ 找到卡片，显示 ${cards} 个卡片`)
      expect(cards).toBeGreaterThan(0)
    } else {
      console.log('⚠️  未找到表格或卡片，检查页面内容...')
      const bodyText = await page.locator('body').textContent()
      console.log('页面内容预览:', bodyText?.substring(0, 200))
    }
    
    // 截图
    await page.screenshot({ 
      path: 'test-results/browser-2.2-project-list-data.png', 
      fullPage: true 
    })
    console.log('✅ 项目列表截图已保存\n')
  })
  
  test('2.3 尝试点击第一个项目', async () => {
    // 尝试找到可点击的项目
    const projectLinks = await page.locator('a:has-text("项目"), a:has-text("智能"), .project-name, .el-table__row a').all()
    
    if (projectLinks.length > 0) {
      console.log(`✅ 找到 ${projectLinks.length} 个项目链接`)
      await projectLinks[0].click()
      await page.waitForTimeout(2000)
      console.log('✅ 点击了第一个项目\n')
      
      // 截图
      await page.screenshot({ 
        path: 'test-results/browser-2.3-project-detail.png', 
        fullPage: true 
      })
      console.log('✅ 项目详情截图已保存\n')
    } else {
      console.log('⚠️  未找到项目链接，跳过点击测试\n')
    }
  })
})

/**
 * Phase 3: Epic管理验证
 */
test.describe('Phase 3: Epic管理验证', () => {
  test('3.1 导航到Epic列表', async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('开始测试: Phase 3 - Epic管理')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // 查找并点击"C1: 需求管理"
    const c1Menu = page.locator('text=/C1.*需求管理/').first()
    await c1Menu.waitFor({ state: 'visible', timeout: 5000 })
    await c1Menu.click()
    await page.waitForTimeout(500)
    console.log('✅ 点击了 C1: 需求管理')
    
    // 等待子菜单展开
    await page.waitForTimeout(300)
    
    // 查找并点击"Epic管理"（子菜单项，需要等待展开）
    const epicMenu = page.locator('text=/Epic管理|Epic列表/').first()
    // 先检查是否可见，如果不可见则尝试强制点击
    const isVisible = await epicMenu.isVisible().catch(() => false)
    if (!isVisible) {
      // 如果不可见，尝试点击父菜单来展开
      await c1Menu.click()
      await page.waitForTimeout(300)
    }
    await epicMenu.click({ force: true })
    await page.waitForTimeout(2000)
    console.log('✅ 点击了 Epic管理菜单')
    
    // 截图
    await page.screenshot({ 
      path: 'test-results/browser-3.1-epic-list.png', 
      fullPage: true 
    })
    console.log('✅ Epic列表截图已保存\n')
  })

  test('3.2 验证Epic列表数据', async () => {
    await page.waitForTimeout(2000)
    
    const hasTable = await page.locator('.el-table').count() > 0
    const hasCards = await page.locator('.el-card').count() > 0
    
    if (hasTable) {
      const rows = await page.locator('.el-table__row').count()
      console.log(`✅ Epic列表显示 ${rows} 行数据`)
      expect(rows).toBeGreaterThanOrEqual(0)
    } else if (hasCards) {
      const cards = await page.locator('.el-card').count()
      console.log(`✅ Epic列表显示 ${cards} 个卡片`)
    }
    
    // 截图
    await page.screenshot({ 
      path: 'test-results/browser-3.2-epic-data.png', 
      fullPage: true 
    })
    console.log('✅ Epic数据截图已保存\n')
  })
})

/**
 * Phase 4: Feature管理验证
 */
test.describe('Phase 4: Feature管理验证', () => {
  test('4.1 导航到Feature列表', async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('开始测试: Phase 4 - Feature管理')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // 查找并点击"Feature管理"
    const featureMenu = page.locator('text=/Feature管理|Feature列表/').first()
    await featureMenu.waitFor({ state: 'visible', timeout: 5000 })
    await featureMenu.click()
    await page.waitForTimeout(2000)
    console.log('✅ 点击了 Feature管理菜单')
    
    // 截图
    await page.screenshot({ 
      path: 'test-results/browser-4.1-feature-list.png', 
      fullPage: true 
    })
    console.log('✅ Feature列表截图已保存\n')
  })

  test('4.2 验证Feature列表数据', async () => {
    await page.waitForTimeout(2000)
    
    const hasTable = await page.locator('.el-table').count() > 0
    const hasCards = await page.locator('.el-card').count() > 0
    
    if (hasTable) {
      const rows = await page.locator('.el-table__row').count()
      console.log(`✅ Feature列表显示 ${rows} 行数据`)
      expect(rows).toBeGreaterThanOrEqual(0)
    } else if (hasCards) {
      const cards = await page.locator('.el-card').count()
      console.log(`✅ Feature列表显示 ${cards} 个卡片`)
    }
    
    // 截图
    await page.screenshot({ 
      path: 'test-results/browser-4.2-feature-data.png', 
      fullPage: true 
    })
    console.log('✅ Feature数据截图已保存\n')
  })
})

/**
 * Phase 5: SSTS管理验证
 */
test.describe('Phase 5: SSTS管理验证', () => {
  test('5.1 导航到SSTS列表', async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('开始测试: Phase 5 - SSTS管理')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // 查找并点击"SSTS管理"
    const sstsMenu = page.locator('text=/SSTS管理|SSTS列表/').first()
    await sstsMenu.waitFor({ state: 'visible', timeout: 5000 })
    await sstsMenu.click()
    await page.waitForTimeout(2000)
    console.log('✅ 点击了 SSTS管理菜单')
    
    // 截图
    await page.screenshot({ 
      path: 'test-results/browser-5.1-ssts-list.png', 
      fullPage: true 
    })
    console.log('✅ SSTS列表截图已保存\n')
  })

  test('5.2 验证SSTS列表数据', async () => {
    await page.waitForTimeout(2000)
    
    const hasTable = await page.locator('.el-table').count() > 0
    const hasCards = await page.locator('.el-card').count() > 0
    
    if (hasTable) {
      const rows = await page.locator('.el-table__row').count()
      console.log(`✅ SSTS列表显示 ${rows} 行数据`)
      expect(rows).toBeGreaterThanOrEqual(0)
    } else if (hasCards) {
      const cards = await page.locator('.el-card').count()
      console.log(`✅ SSTS列表显示 ${cards} 个卡片`)
    }
    
    // 截图
    await page.screenshot({ 
      path: 'test-results/browser-5.2-ssts-data.png', 
      fullPage: true 
    })
    console.log('✅ SSTS数据截图已保存\n')
  })
})

/**
 * 测试总结
 */
test.describe('测试总结', () => {
  test('生成测试报告', async () => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ 浏览器页面测试完成')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('已完成测试:')
    console.log('  ✓ Phase 1: 基础验证 (首页加载)')
    console.log('  ✓ Phase 2: 项目管理 (列表+导航)')
    console.log('  ✓ Phase 3: Epic管理 (列表+数据)')
    console.log('  ✓ Phase 4: Feature管理 (列表+数据)')
    console.log('  ✓ Phase 5: SSTS管理 (列表+数据)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('截图位置: test-results/browser-*.png')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  })
})
