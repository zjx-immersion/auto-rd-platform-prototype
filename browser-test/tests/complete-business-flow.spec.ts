import { test, expect } from '@playwright/test'
import * as path from 'path'

/**
 * 完整业务流程测试
 * 
 * 测试目标：验证从Epic到Sprint计划的完整业务流程
 * 
 * 测试场景：
 * 1. 需求查看（Epic列表 → Epic详情 → Feature列表）
 * 2. PI Planning看板
 * 3. 全局视角（Feature/SSTS分配）
 * 4. 团队视角（MR分配）
 */

// 测试配置
const BASE_URL = 'http://localhost:6060'
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots/business-flow')

// 使用真实浏览器（非headless）并设置全屏viewport
test.use({
  viewport: { width: 1920, height: 1080 },
  launchOptions: {
    headless: false, // 使用真实浏览器
    slowMo: 500 // 减慢操作速度，便于观察
  }
})

test.describe('完整业务流程测试', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前等待应用初始化
    await page.goto(BASE_URL)
    await page.waitForTimeout(2000) // 等待数据加载
  })

  test('场景1: 需求管理 - Epic和Feature查看', async ({ page }) => {
    // ============ 步骤1-1: 查看Epic列表 ============
    console.log('📍 步骤1-1: 导航到Epic列表')
    await page.goto(`${BASE_URL}/function/c1-requirement/epic`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // ✅ 使用更可靠的验证方式
    await expect(page.locator('button:has-text("创建Epic")')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=/\\d+\\s*个Epic/i')).toBeVisible()
    console.log('✅ Epic列表页面已加载')
    
    // 全页面截图
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'TC-S1-1-Epic-List.png'),
      fullPage: true
    })
    console.log('✅ 截图已保存: TC-S1-1-Epic-List.png')

    // ============ 步骤1-2: 查看Epic详情 ============
    console.log('📍 步骤1-2: 点击查看Epic详情')
    
    // 等待列表加载
    await page.waitForTimeout(1000)
    
    // ✅ 查找并点击"查看"按钮（更可靠）
    const viewButton = page.locator('button:has-text("查看")').first()
    if (await viewButton.count() > 0) {
      await viewButton.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)
      
      // 验证详情页面
      await expect(page.locator('text=/EPIC-\\d+/i').first()).toBeVisible()
      console.log('✅ Epic详情页面已加载')
      
      // 全页面截图
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'TC-S1-2-Epic-Detail.png'),
        fullPage: true
      })
      console.log('✅ 截图已保存: TC-S1-2-Epic-Detail.png')
    } else {
      console.log('⚠️ 未找到查看按钮，跳过详情测试')
    }

    // ============ 步骤1-3: 查看Feature列表 ============
    console.log('📍 步骤1-3: 导航到Feature列表')
    await page.goto(`${BASE_URL}/function/c1-requirement/feature`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // ✅ 使用更可靠的验证方式
    await expect(page.locator('button:has-text("创建Feature"), button:has-text("创建")')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=/\\d+\\s*个Feature/i, text=/Feature/i').first()).toBeVisible()
    console.log('✅ Feature列表页面已加载')
    
    // 全页面截图
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'TC-S1-3-Feature-List.png'),
      fullPage: true
    })
    console.log('✅ 截图已保存: TC-S1-3-Feature-List.png')
  })

  test('场景2: PI Planning看板', async ({ page }) => {
    console.log('📍 场景2: 导航到PI Planning看板')
    await page.goto(`${BASE_URL}/function/c3/pi-planning-board`)
    await page.waitForTimeout(2000)
    
    // 验证看板标题
    await expect(page.locator('h2, .page-title')).toContainText(/PI Planning/i)
    
    // 全页面截图
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'TC-S2-1-PI-Board.png'),
      fullPage: true
    })
    console.log('✅ 截图已保存: TC-S2-1-PI-Board.png')
  })

  test('场景3: PI Planning - 全局视角', async ({ page }) => {
    console.log('📍 场景3: 进入PI Planning全局视角')
    
    // ✅ 直接导航到全局视角（最可靠的方式）
    await page.goto(`${BASE_URL}/function/c3/planning/pi/pi-001/stage1`, {
      waitUntil: 'networkidle'
    })
    await page.waitForTimeout(2000)
    
    // ✅ 等待关键元素加载
    await page.waitForSelector('.action-bar', { timeout: 15000 })
    console.log('✅ 全局视角页面已加载')
    
    // ✅ 验证页面有内容
    const elementCount = await page.locator('button, .el-button').count()
    console.log(`✅ 页面元素数量: ${elementCount}`)
    expect(elementCount).toBeGreaterThan(0)
    
    // 全页面截图
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'TC-S3-1-Global-View.png'),
      fullPage: true
    })
    console.log('✅ 截图已保存: TC-S3-1-Global-View.png')
  })

  test('场景4: PI Planning - 团队视角', async ({ page }) => {
    console.log('📍 场景4: 进入PI Planning团队视角')
    
    // 直接导航到团队视角
    await page.goto(`${BASE_URL}/function/c3/planning/pi/pi-001/stage2`)
    await page.waitForTimeout(3000)
    
    // 验证团队视角页面
    await expect(page.locator('.page-title, h2')).toContainText(/团队视角|模块需求/i)
    
    // ============ 步骤4-1: 团队视角初始状态 ============
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'TC-S4-1-Team-View.png'),
      fullPage: true
    })
    console.log('✅ 截图已保存: TC-S4-1-Team-View.png')

    // ============ 步骤4-2: 选择团队 ============
    console.log('📍 步骤4-2: 选择团队')
    
    // 查找团队选择器
    const teamSelector = page.locator('select, .el-select').first()
    if (await teamSelector.count() > 0) {
      // 如果是下拉框，点击展开
      if (await page.locator('.el-select').count() > 0) {
        await page.locator('.el-select').first().click()
        await page.waitForTimeout(500)
        
        // 选择第一个团队选项
        const firstOption = page.locator('.el-select-dropdown__item').first()
        if (await firstOption.count() > 0) {
          await firstOption.click()
          await page.waitForTimeout(1000)
        }
      }
    }
    
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'TC-S4-2-Team-Selected.png'),
      fullPage: true
    })
    console.log('✅ 截图已保存: TC-S4-2-Team-Selected.png')

    // ============ 步骤4-3: 展开特性树 ============
    console.log('📍 步骤4-3: 展开特性树')
    
    // 查找并点击"全部展开"按钮
    const expandButton = page.locator('button', { hasText: /全部展开|展开/i })
    if (await expandButton.count() > 0) {
      await expandButton.first().click()
      await page.waitForTimeout(1500)
    }
    
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'TC-S4-3-Tree-Expanded.png'),
      fullPage: true
    })
    console.log('✅ 截图已保存: TC-S4-3-Tree-Expanded.png')

    // ============ 步骤4-4: 多选MR ============
    console.log('📍 步骤4-4: 测试多选MR功能')
    
    // 查找树中的checkbox并选择几个
    const checkboxes = page.locator('.el-tree .el-checkbox__input')
    const checkboxCount = await checkboxes.count()
    
    if (checkboxCount > 0) {
      // 选择前3个（如果有的话）
      const selectCount = Math.min(3, checkboxCount)
      for (let i = 0; i < selectCount; i++) {
        await checkboxes.nth(i).click()
        await page.waitForTimeout(300)
      }
      
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'TC-S4-4-MR-Selected.png'),
        fullPage: true
      })
      console.log('✅ 截图已保存: TC-S4-4-MR-Selected.png')
    }
  })

  test('场景5: 视角切换', async ({ page }) => {
    console.log('📍 场景5: 测试视角切换功能')
    
    // 先进入全局视角并等待数据加载
    await page.goto(`${BASE_URL}/function/c3/planning/pi/pi-001/stage1`, {
      waitUntil: 'networkidle'
    })
    await page.waitForSelector('.action-bar', { timeout: 10000 })
    await page.waitForTimeout(2000)
    console.log('✅ 全局视角已加载')
    
    // 点击"切换到团队视角"
    const switchButton = page.locator('button', { hasText: /切换到团队视角|团队视角/i })
    if (await switchButton.count() > 0) {
      await switchButton.first().click()
      
      // ✅ 等待导航完成
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)
      
      // 验证切换到团队视角
      await expect(page).toHaveURL(/stage2/)
      console.log('✅ 已切换到团队视角')
      
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'TC-S5-1-Switch-To-Team.png'),
        fullPage: true
      })
      console.log('✅ 截图已保存: TC-S5-1-Switch-To-Team.png')
    }
    
    // 切换回全局视角
    const switchBackButton = page.locator('button', { hasText: /切换到全局视角|全局视角/i })
    if (await switchBackButton.count() > 0) {
      await switchBackButton.first().click()
      
      // ✅ 等待导航和数据加载完成
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(3000)  // 增加等待时间
      
      // ✅ 等待关键元素
      await page.waitForSelector('.action-bar', { timeout: 15000 })
      
      // 验证切换回全局视角
      await expect(page).toHaveURL(/stage1/)
      console.log('✅ 已切换回全局视角')
      
      // ✅ 验证页面有内容（不是空白）
      const elementCount = await page.locator('button, .el-button, .el-card').count()
      console.log(`✅ 页面元素数量: ${elementCount}`)
      expect(elementCount).toBeGreaterThan(0)
      
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'TC-S5-2-Switch-To-Global.png'),
        fullPage: true
      })
      console.log('✅ 截图已保存: TC-S5-2-Switch-To-Global.png')
    }
  })
})
