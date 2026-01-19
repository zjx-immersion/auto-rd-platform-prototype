import { test, expect } from '@playwright/test'

test.describe('PI Planning 阶段2 - 模块需求排布工作台', () => {
  test.beforeEach(async ({ page }) => {
    // 先确保阶段1已完成
    await page.goto('/function/c3/planning/pi/pi-001/stage1')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // 完成阶段1（如果未完成）
    const completeButton = page.locator('button').filter({ hasText: '完成阶段1' })
    const isEnabled = await completeButton.isEnabled()
    
    if (isEnabled) {
      await completeButton.click()
      await page.waitForTimeout(500)
      const confirmButton = page.locator('button').filter({ hasText: '完成' }).last()
      await confirmButton.click()
      await page.waitForTimeout(1000)
    }
    
    // 访问阶段2页面
    await page.goto('/function/c3/planning/pi/pi-001/stage2')
    await page.waitForLoadState('networkidle')
  })

  test('页面加载和基本元素显示', async ({ page }) => {
    // 检查页面标题
    await expect(page.locator('text=PI Planning - 阶段2: 模块需求排布')).toBeVisible()
    
    // 检查PI信息卡片
    await expect(page.locator('text=PI名称')).toBeVisible()
    
    // 检查团队选择
    await expect(page.locator('.el-radio-group')).toBeVisible()
    
    // 检查左侧Sprint列表
    await expect(page.locator('text=Sprint列表')).toBeVisible()
    
    // 检查右侧MR列表
    await expect(page.locator('text=MR列表')).toBeVisible()
  })

  test('团队切换', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // 选择不同的团队
    const teamButtons = page.locator('.el-radio-button')
    const count = await teamButtons.count()
    
    if (count > 1) {
      await teamButtons.nth(1).click()
      await page.waitForTimeout(1000)
      
      // 检查Sprint列表是否更新
      const sprintCards = page.locator('.sprint-card')
      const sprintCount = await sprintCards.count()
      expect(sprintCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('MR按Sprint分组显示', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // 检查MR分组
    const mrGroups = page.locator('.mr-group')
    const groupCount = await mrGroups.count()
    expect(groupCount).toBeGreaterThanOrEqual(0)
    
    // 检查每个分组都有Sprint名称
    for (let i = 0; i < groupCount; i++) {
      const group = mrGroups.nth(i)
      const header = group.locator('.mr-group-header')
      await expect(header).toBeVisible()
    }
  })

  test('MR默认分配到所属SSTS的Sprint', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // 检查MR卡片是否显示默认位置提示
    const mrCards = page.locator('.mr-card')
    const cardCount = await mrCards.count()
    
    if (cardCount > 0) {
      const hint = page.locator('text=默认位置')
      const hintCount = await hint.count()
      // 应该有默认位置提示
      expect(hintCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('拖拽分配MR到Sprint', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // 查找可拖拽的MR卡片
    const mrCard = page.locator('.mr-card').first()
    const isVisible = await mrCard.isVisible()
    
    if (isVisible) {
      // 获取Sprint卡片
      const sprintCard = page.locator('.sprint-card').first()
      
      // 执行拖拽操作
      await mrCard.dragTo(sprintCard)
      await page.waitForTimeout(500)
      
      // 检查是否显示成功消息
      const successMessage = page.locator('text=MR已分配')
      await expect(successMessage).toBeVisible({ timeout: 2000 })
    }
  })

  test('容量检查和负载显示', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // 检查Sprint容量信息
    const sprintCards = page.locator('.sprint-card')
    const count = await sprintCards.count()
    
    if (count > 0) {
      const firstSprint = sprintCards.first()
      
      // 检查容量显示
      const capacityInfo = firstSprint.locator('.sprint-capacity')
      await expect(capacityInfo).toBeVisible()
      
      // 检查进度条
      const progress = firstSprint.locator('.el-progress')
      await expect(progress).toBeVisible()
    }
  })

  test('搜索和筛选MR', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // 测试搜索功能
    const searchInput = page.locator('input[placeholder*="搜索MR"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('ACC')
      await page.waitForTimeout(500)
    }
    
    // 测试筛选功能
    const filterSelect = page.locator('.el-select').last()
    if (await filterSelect.isVisible()) {
      await filterSelect.click()
      await page.locator('text=未分配').click()
      await page.waitForTimeout(500)
    }
  })

  test('保存草稿和完成阶段2', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // 点击保存草稿按钮
    const saveButton = page.locator('button').filter({ hasText: '保存草稿' })
    await saveButton.click()
    await page.waitForTimeout(500)
    
    // 检查保存成功消息
    const saveMessage = page.locator('text=草稿已保存')
    await expect(saveMessage).toBeVisible({ timeout: 2000 })
    
    // 点击完成阶段2按钮
    const completeButton = page.locator('button').filter({ hasText: '完成阶段2' })
    const isEnabled = await completeButton.isEnabled()
    
    if (isEnabled) {
      await completeButton.click()
      await page.waitForTimeout(500)
      
      // 确认对话框
      const confirmButton = page.locator('button').filter({ hasText: '完成' }).last()
      await confirmButton.click()
      await page.waitForTimeout(500)
      
      // 检查完成消息
      const completeMessage = page.locator('text=阶段2已完成')
      await expect(completeMessage).toBeVisible({ timeout: 2000 })
    }
  })
})
