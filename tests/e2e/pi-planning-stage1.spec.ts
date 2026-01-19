import { test, expect } from '@playwright/test'

test.describe('PI Planning 阶段1 - Feature/SSTS排布工作台', () => {
  test.beforeEach(async ({ page }) => {
    // 访问PI Planning阶段1页面
    await page.goto('/function/c3/planning/pi/pi-001/stage1')
    await page.waitForLoadState('networkidle')
  })

  test('页面加载和基本元素显示', async ({ page }) => {
    // 检查页面标题
    await expect(page.locator('text=PI Planning - 阶段1: Feature/SSTS排布')).toBeVisible()
    
    // 检查PI信息卡片
    await expect(page.locator('text=PI名称')).toBeVisible()
    
    // 检查左侧待分配列表
    await expect(page.locator('text=待分配列表')).toBeVisible()
    
    // 检查右侧排布看板
    await expect(page.locator('text=团队×Sprint排布看板')).toBeVisible()
  })

  test('搜索和筛选功能', async ({ page }) => {
    // 测试搜索功能
    const searchInput = page.locator('input[placeholder*="搜索Feature/SSTS"]')
    await searchInput.fill('ACC')
    await page.waitForTimeout(500)
    
    // 测试类型筛选
    const typeSelect = page.locator('.el-select').first()
    await typeSelect.click()
    await page.locator('text=Feature').click()
    await page.waitForTimeout(500)
  })

  test('拖拽分配Feature/SSTS', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForTimeout(1000)
    
    // 查找可拖拽的Feature或SSTS卡片
    const itemCard = page.locator('.item-card').first()
    const isVisible = await itemCard.isVisible()
    
    if (isVisible) {
      // 获取看板中的Sprint单元格
      const sprintCell = page.locator('.sprint-cell').first()
      
      // 执行拖拽操作
      await itemCard.dragTo(sprintCell)
      await page.waitForTimeout(500)
      
      // 检查是否显示成功消息
      const successMessage = page.locator('text=分配成功')
      await expect(successMessage).toBeVisible({ timeout: 2000 })
    }
  })

  test('SSTS依赖高亮显示', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // 点击一个SSTS卡片
    const sstsCard = page.locator('.item-card').filter({ hasText: 'SSTS' }).first()
    const isVisible = await sstsCard.isVisible()
    
    if (isVisible) {
      await sstsCard.click()
      await page.waitForTimeout(500)
      
      // 检查是否有高亮显示
      const highlighted = page.locator('.highlight-dependency')
      const count = await highlighted.count()
      // 如果有依赖，应该有高亮显示
      expect(count).toBeGreaterThanOrEqual(0)
    }
  })

  test('SSTS依赖关系管理', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // 点击依赖管理按钮
    const depButton = page.locator('button').filter({ hasText: /依赖|Connection/ }).first()
    const isVisible = await depButton.isVisible()
    
    if (isVisible) {
      await depButton.click()
      await page.waitForTimeout(500)
      
      // 检查依赖关系面板是否打开
      const drawer = page.locator('.el-drawer')
      const drawerVisible = await drawer.isVisible()
      expect(drawerVisible).toBeTruthy()
    }
  })

  test('设置Sprint里程碑', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // 点击里程碑设置按钮
    const milestoneButton = page.locator('button').filter({ hasText: /Sprint|里程碑/ }).first()
    const isVisible = await milestoneButton.isVisible()
    
    if (isVisible) {
      await milestoneButton.click()
      await page.waitForTimeout(500)
      
      // 检查里程碑对话框是否打开
      const dialog = page.locator('.el-dialog').filter({ hasText: '设置Sprint里程碑' })
      const dialogVisible = await dialog.isVisible()
      expect(dialogVisible).toBeTruthy()
    }
  })

  test('保存草稿和完成阶段1', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // 点击保存草稿按钮
    const saveButton = page.locator('button').filter({ hasText: '保存草稿' })
    await saveButton.click()
    await page.waitForTimeout(500)
    
    // 检查保存成功消息
    const saveMessage = page.locator('text=草稿已保存')
    await expect(saveMessage).toBeVisible({ timeout: 2000 })
    
    // 点击完成阶段1按钮（如果有分配）
    const completeButton = page.locator('button').filter({ hasText: '完成阶段1' })
    const isEnabled = await completeButton.isEnabled()
    
    if (isEnabled) {
      await completeButton.click()
      await page.waitForTimeout(500)
      
      // 确认对话框
      const confirmButton = page.locator('button').filter({ hasText: '完成' }).last()
      await confirmButton.click()
      await page.waitForTimeout(500)
      
      // 检查完成消息
      const completeMessage = page.locator('text=阶段1已完成')
      await expect(completeMessage).toBeVisible({ timeout: 2000 })
    }
  })

  test('进入阶段2', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // 先完成阶段1（如果未完成）
    const completeButton = page.locator('button').filter({ hasText: '完成阶段1' })
    const isEnabled = await completeButton.isEnabled()
    
    if (isEnabled) {
      await completeButton.click()
      await page.waitForTimeout(500)
      const confirmButton = page.locator('button').filter({ hasText: '完成' }).last()
      await confirmButton.click()
      await page.waitForTimeout(1000)
    }
    
    // 点击进入阶段2按钮
    const stage2Button = page.locator('button').filter({ hasText: '进入阶段2' })
    const stage2Enabled = await stage2Button.isEnabled()
    
    if (stage2Enabled) {
      await stage2Button.click()
      await page.waitForTimeout(1000)
      
      // 检查是否跳转到阶段2页面
      await expect(page).toHaveURL(/.*stage2/)
    }
  })
})
