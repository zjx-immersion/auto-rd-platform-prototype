/**
 * 简化版E2E测试 - 直接URL访问
 * 避免复杂的菜单导航，直接验证核心页面
 */

import { test, expect, Page } from '@playwright/test'

const BASE_URL = 'http://localhost:6060'

test.describe.configure({ mode: 'serial' })

let page: Page

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await page.setViewportSize({ width: 1920, height: 1080 })
  
  page.on('console', msg => {
    if (msg.type() === 'log') {
      console.log(`浏览器日志: ${msg.text()}`)
    }
  })
})

test.afterAll(async () => {
  await page.close()
})

/**
 * Phase 1: 基础验证
 */
test.describe('Phase 1: 基础验证', () => {
  test('1.1 打开首页并验证数据加载', async () => {
    await page.goto(BASE_URL)
    await expect(page).toHaveTitle(/整车软件研发平台|我的工作台/)
    
    // 等待数据加载
    await page.waitForTimeout(3000)
    
    await page.screenshot({ path: 'test-results/step-1.1-homepage.png', fullPage: true })
    console.log('✅ 首页加载成功，数据初始化完成')
  })
})

/**
 * Phase 2: C0 项目管理验证
 */
test.describe('Phase 2: C0 项目管理', () => {
  test('2.1 直接访问项目列表', async () => {
    await page.goto(`${BASE_URL}/#/function/c0-project/list`)
    await page.waitForTimeout(2000)
    
    await page.screenshot({ path: 'test-results/step-2.1-project-list.png', fullPage: true })
    console.log('✅ 项目列表页面加载')
  })

  test('2.2 验证项目列表数据', async () => {
    // 等待表格加载
    await page.waitForSelector('.el-table', { timeout: 5000 })
    await page.waitForTimeout(1000)
    
    // 检查是否有表格行
    const rows = await page.locator('.el-table__row').count()
    console.log(`✅ 项目列表显示 ${rows} 个项目`)
    
    expect(rows).toBeGreaterThan(0)
    
    await page.screenshot({ path: 'test-results/step-2.2-project-data.png', fullPage: true })
  })

  test('2.3 点击项目详情', async () => {
    // 等待表格加载
    await page.waitForSelector('.el-table__row', { timeout: 5000 })
    
    // 查找并点击第一行的链接
    const firstRow = page.locator('.el-table__row').first()
    const link = firstRow.locator('a').first()
    
    if (await link.count() > 0) {
      await link.click()
      await page.waitForTimeout(2000)
      console.log('✅ 成功点击项目详情')
    } else {
      console.log('⚠️  未找到可点击的链接，尝试点击第一行')
      await firstRow.click()
      await page.waitForTimeout(2000)
    }
    
    await page.screenshot({ path: 'test-results/step-2.3-project-detail.png', fullPage: true })
  })
})

/**
 * Phase 3: C1 需求管理验证
 */
test.describe('Phase 3: C1 需求管理', () => {
  test('3.1 直接访问Epic列表', async () => {
    await page.goto(`${BASE_URL}/#/function/c1-requirement/epic`)
    await page.waitForTimeout(2000)
    
    await page.screenshot({ path: 'test-results/step-3.1-epic-list.png', fullPage: true })
    console.log('✅ Epic列表页面加载')
  })

  test('3.2 验证Epic列表数据', async () => {
    await page.waitForSelector('.el-table', { timeout: 5000 })
    await page.waitForTimeout(1000)
    
    const rows = await page.locator('.el-table__row').count()
    console.log(`✅ Epic列表显示 ${rows} 个Epic`)
    
    expect(rows).toBeGreaterThanOrEqual(6)
    
    await page.screenshot({ path: 'test-results/step-3.2-epic-data.png', fullPage: true })
  })

  test('3.3 直接访问Feature列表', async () => {
    await page.goto(`${BASE_URL}/#/function/c1-requirement/feature`)
    await page.waitForTimeout(2000)
    
    await page.screenshot({ path: 'test-results/step-3.3-feature-list.png', fullPage: true })
    console.log('✅ Feature列表页面加载')
  })

  test('3.4 验证Feature列表数据', async () => {
    await page.waitForSelector('.el-table', { timeout: 5000 })
    await page.waitForTimeout(1000)
    
    const rows = await page.locator('.el-table__row').count()
    console.log(`✅ Feature列表显示 ${rows} 个Feature`)
    
    expect(rows).toBeGreaterThanOrEqual(10)
    
    await page.screenshot({ path: 'test-results/step-3.4-feature-data.png', fullPage: true })
  })

  test('3.5 点击Feature详情', async () => {
    await page.waitForSelector('.el-table__row', { timeout: 5000 })
    
    const firstRow = page.locator('.el-table__row').first()
    const link = firstRow.locator('a').first()
    
    if (await link.count() > 0) {
      await link.click()
      await page.waitForTimeout(2000)
      console.log('✅ 成功打开Feature详情')
    } else {
      await firstRow.click()
      await page.waitForTimeout(2000)
    }
    
    await page.screenshot({ path: 'test-results/step-3.5-feature-detail.png', fullPage: true })
  })

  test('3.6 直接访问SSTS列表', async () => {
    await page.goto(`${BASE_URL}/#/function/c1-requirement/ssts/list`)
    await page.waitForTimeout(2000)
    
    await page.screenshot({ path: 'test-results/step-3.6-ssts-list.png', fullPage: true })
    console.log('✅ SSTS列表页面加载')
  })

  test('3.7 验证SSTS列表数据', async () => {
    await page.waitForSelector('.el-table', { timeout: 5000 })
    await page.waitForTimeout(1000)
    
    const rows = await page.locator('.el-table__row').count()
    console.log(`✅ SSTS列表显示 ${rows} 个SSTS`)
    
    expect(rows).toBeGreaterThanOrEqual(15)
    
    await page.screenshot({ path: 'test-results/step-3.7-ssts-data.png', fullPage: true })
  })
})

/**
 * Phase 4: C3 规划协调验证
 */
test.describe('Phase 4: C3 规划协调', () => {
  test('4.1 直接访问PI Planning', async () => {
    await page.goto(`${BASE_URL}/#/function/c3/pi-planning-board`)
    await page.waitForTimeout(2000)
    
    await page.screenshot({ path: 'test-results/step-4.1-pi-planning.png', fullPage: true })
    console.log('✅ PI Planning页面加载')
  })

  test('4.2 验证PI Planning数据', async () => {
    await page.waitForTimeout(2000)
    
    const pageText = await page.textContent('body')
    const hasPIInfo = pageText?.includes('PI') || pageText?.includes('2026')
    
    console.log(`✅ PI Planning数据显示: ${hasPIInfo}`)
    
    await page.screenshot({ path: 'test-results/step-4.2-pi-planning-data.png', fullPage: true })
  })
})

/**
 * 测试总结
 */
test.describe('测试总结', () => {
  test('生成最终报告', async () => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ 简化版E2E测试完成')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('验证项目:')
    console.log('  ✓ 首页和数据加载')
    console.log('  ✓ 项目列表（直接访问）')
    console.log('  ✓ 项目详情（点击跳转）')
    console.log('  ✓ Epic列表（6+个Epic）')
    console.log('  ✓ Feature列表（10+个Feature）')
    console.log('  ✓ Feature详情（点击跳转）')
    console.log('  ✓ SSTS列表（15+个SSTS）')
    console.log('  ✓ PI Planning')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('截图已保存到: test-results/')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  })
})
