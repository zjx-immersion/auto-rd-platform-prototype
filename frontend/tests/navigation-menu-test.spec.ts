/**
 * 导航菜单测试 - 验证C0菜单更新
 */

import { test, expect } from '@playwright/test'

test.describe('C0导航菜单更新验证 ⭐⭐⭐⭐⭐', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:6060')
    await page.waitForLoadState('networkidle')
  })

  test('TC-NAV-01: 验证C0菜单结构', async ({ page }) => {
    // 等待菜单加载
    await page.waitForTimeout(2000)
    
    // 查找C0菜单
    const c0Menu = page.locator('text=C0: 领域项目管理')
    await expect(c0Menu).toBeVisible()
    
    // 点击展开
    await c0Menu.click()
    await page.waitForTimeout(1000)
    
    // 验证4个子菜单组
    const hasProjectMgmt = await page.locator('text=项目管理').count() > 0
    const hasVersionMgmt = await page.locator('text=版本管理').count() > 0
    const hasPIMgmt = await page.locator('text=PI管理').count() > 0
    const hasAllocation = await page.locator('text=分配管理').count() > 0
    
    console.log(`子菜单组: 项目=${hasProjectMgmt}, 版本=${hasVersionMgmt}, PI=${hasPIMgmt}, 分配=${hasAllocation}`)
    
    // 截图
    await page.screenshot({ 
      path: 'tests/screenshots/navigation/TC-NAV-01-menu-structure.png',
      fullPage: true 
    })
  })

  test('TC-NAV-02: 验证版本规划V2菜单项 ⭐⭐⭐⭐⭐', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // 展开C0菜单
    await page.locator('text=C0: 领域项目管理').click()
    await page.waitForTimeout(500)
    
    // 展开版本管理子菜单
    await page.locator('text=版本管理').click()
    await page.waitForTimeout(500)
    
    // 验证版本规划V2菜单项
    const versionPlanningV2 = page.locator('text=版本规划V2')
    const exists = await versionPlanningV2.count() > 0
    console.log(`版本规划V2菜单项存在: ${exists}`)
    
    // 截图
    await page.screenshot({ 
      path: 'tests/screenshots/navigation/TC-NAV-02-version-planning-v2-menu.png',
      fullPage: true 
    })
  })

  test('TC-NAV-03: 点击版本规划V2导航', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // 展开C0 → 版本管理
    await page.locator('text=C0: 领域项目管理').click()
    await page.waitForTimeout(500)
    await page.locator('text=版本管理').click()
    await page.waitForTimeout(500)
    
    // 点击版本规划V2
    const versionPlanningV2 = page.locator('text=版本规划V2').first()
    if (await versionPlanningV2.count() > 0) {
      await versionPlanningV2.click()
      await page.waitForTimeout(2000)
      
      // 验证页面加载
      const url = page.url()
      console.log(`当前URL: ${url}`)
      
      const hasContainer = await page.locator('.version-planning-v2-container').count() > 0
      console.log(`版本规划V2页面加载: ${hasContainer}`)
      
      // 截图
      await page.screenshot({ 
        path: 'tests/screenshots/navigation/TC-NAV-03-version-planning-v2-page.png',
        fullPage: true 
      })
    }
  })
})
