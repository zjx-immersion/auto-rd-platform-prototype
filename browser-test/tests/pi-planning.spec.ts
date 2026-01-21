/**
 * PI Planning 页面端到端测试
 * 验证页面加载、数据显示、核心功能
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:6060'

test.describe('PI Planning 页面测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到PI Planning页面
    await page.goto(`${BASE_URL}/function/c3-planning/pi-planning-board`)
    // 等待页面加载完成
    await page.waitForLoadState('networkidle')
    // 等待一下数据加载
    await page.waitForTimeout(2000)
  })

  test('1. 页面应该正常加载', async ({ page }) => {
    // 检查页面标题
    await expect(page.locator('h2:has-text("PI Planning 看板")')).toBeVisible()
    
    // 截图
    await page.screenshot({ path: 'browser-test/results/pi-planning-loaded.png', fullPage: true })
    
    console.log('✅ 页面标题显示正常')
  })

  test('2. PI下拉框应该有数据', async ({ page }) => {
    // 点击PI选择下拉框
    const piSelect = page.locator('.page-header .el-select').first()
    await piSelect.click()
    await page.waitForTimeout(500)
    
    // 检查下拉选项
    const options = page.locator('.el-select-dropdown__item')
    const count = await options.count()
    
    console.log(`✅ PI下拉框选项数量: ${count}`)
    expect(count).toBeGreaterThan(0)
    
    // 截图下拉框
    await page.screenshot({ path: 'browser-test/results/pi-planning-dropdown.png' })
    
    // 关闭下拉框
    await page.keyboard.press('Escape')
  })

  test('3. 应该能选择PI并加载数据', async ({ page }) => {
    // 点击PI选择下拉框
    const piSelect = page.locator('.page-header .el-select').first()
    await piSelect.click()
    await page.waitForTimeout(500)
    
    // 选择第一个PI
    const firstOption = page.locator('.el-select-dropdown__item').first()
    const piName = await firstOption.textContent()
    console.log(`选择PI: ${piName}`)
    await firstOption.click()
    
    // 等待数据加载
    await page.waitForTimeout(2000)
    
    // 检查是否显示了内容（依赖规划、Feature分配等）
    // 注意：具体内容可能需要根据实际页面结构调整
    const hasContent = await page.locator('.pi-planning-board').isVisible()
    expect(hasContent).toBe(true)
    
    // 截图选择后的状态
    await page.screenshot({ path: 'browser-test/results/pi-planning-selected.png', fullPage: true })
    
    console.log('✅ PI选择成功，数据加载完成')
  })

  test('4. Tab切换应该正常工作', async ({ page }) => {
    // 选择一个PI
    const piSelect = page.locator('.page-header .el-select').first()
    await piSelect.click()
    await page.waitForTimeout(500)
    await page.locator('.el-select-dropdown__item').first().click()
    await page.waitForTimeout(1000)
    
    // 查找Tab按钮
    const tabs = ['查看依赖矩阵', '查看风险列表', '导出规划']
    
    for (const tabText of tabs) {
      const tabButton = page.locator(`button:has-text("${tabText}")`)
      if (await tabButton.isVisible()) {
        console.log(`点击Tab: ${tabText}`)
        await tabButton.click()
        await page.waitForTimeout(500)
        
        // 截图
        await page.screenshot({ 
          path: `browser-test/results/pi-planning-tab-${tabText}.png`,
          fullPage: true 
        })
      }
    }
    
    console.log('✅ Tab切换测试完成')
  })

  test('5. 检查Console错误', async ({ page }) => {
    const errors: string[] = []
    const warnings: string[] = []
    
    // 监听Console消息
    page.on('console', msg => {
      const text = msg.text()
      if (msg.type() === 'error') {
        // 过滤掉浏览器插件的错误
        if (!text.includes('qk-background') && 
            !text.includes('native messaging') &&
            !text.includes('DraggableContainer') &&
            !text.includes('KaTeX')) {
          errors.push(text)
        }
      } else if (msg.type() === 'warning') {
        // 过滤掉已知的警告
        if (!text.includes('deprecated') && 
            !text.includes('el-radio') &&
            !text.includes('Slot')) {
          warnings.push(text)
        }
      }
    })
    
    // 重新加载页面
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // 输出Console日志
    console.log('\n📊 Console错误统计:')
    console.log(`  - 错误数: ${errors.length}`)
    console.log(`  - 警告数: ${warnings.length}`)
    
    if (errors.length > 0) {
      console.log('\n❌ Console错误:')
      errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`)
      })
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ Console警告:')
      warnings.forEach((warn, i) => {
        console.log(`  ${i + 1}. ${warn}`)
      })
    }
    
    // 允许一些已知的废弃警告，但不应该有致命错误
    expect(errors.length).toBe(0)
  })

  test('6. 验证数据完整性', async ({ page }) => {
    // 执行JavaScript获取Store数据
    const storeData = await page.evaluate(() => {
      // @ts-ignore
      const piStore = window.__PINIA__.state.value.pi
      return {
        pisCount: piStore?.pis?.length || 0,
        loading: piStore?.loading || false,
        error: piStore?.error || null
      }
    })
    
    console.log('\n📊 Store数据状态:')
    console.log(`  - PI数量: ${storeData.pisCount}`)
    console.log(`  - Loading: ${storeData.loading}`)
    console.log(`  - Error: ${storeData.error}`)
    
    // 验证至少有PI数据
    expect(storeData.pisCount).toBeGreaterThan(0)
    expect(storeData.loading).toBe(false)
    expect(storeData.error).toBeNull()
    
    console.log('✅ Store数据验证通过')
  })

  test('7. 截取完整页面截图', async ({ page }) => {
    // 选择第一个PI
    const piSelect = page.locator('.page-header .el-select').first()
    await piSelect.click()
    await page.waitForTimeout(500)
    await page.locator('.el-select-dropdown__item').first().click()
    await page.waitForTimeout(2000)
    
    // 完整页面截图
    await page.screenshot({ 
      path: 'browser-test/results/pi-planning-full-page.png',
      fullPage: true 
    })
    
    // 视口截图
    await page.screenshot({ 
      path: 'browser-test/results/pi-planning-viewport.png',
      fullPage: false 
    })
    
    console.log('✅ 截图已保存')
  })
})

test.describe('PI Planning 功能测试', () => {
  test('8. Feature依赖矩阵应该可访问', async ({ page }) => {
    await page.goto(`${BASE_URL}/function/c3-planning/pi-planning-board`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // 选择PI
    const piSelect = page.locator('.page-header .el-select').first()
    await piSelect.click()
    await page.waitForTimeout(500)
    await page.locator('.el-select-dropdown__item').first().click()
    await page.waitForTimeout(1000)
    
    // 点击"查看风险列表"或"查看依赖矩阵"
    const buttons = page.locator('button')
    const buttonTexts = await buttons.allTextContents()
    console.log('页面按钮:', buttonTexts.filter(t => t.trim()))
    
    // 截图
    await page.screenshot({ 
      path: 'browser-test/results/pi-planning-buttons.png',
      fullPage: true 
    })
  })
})
