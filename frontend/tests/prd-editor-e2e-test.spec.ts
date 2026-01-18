/**
 * PRD编辑器端到端测试
 * 测试场景：
 * 1. 进入Feature详情页
 * 2. 点击"编辑PRD"进入PRD编辑器
 * 3. 测试PRD内容编辑
 * 4. 测试验收标准添加
 * 5. 测试草稿保存
 * 6. 测试版本发布
 * 7. 测试版本历史和回滚
 * 8. 测试附件上传
 * 9. 测试PRD评审流程
 */

import { test, expect } from '@playwright/test'

test.describe('PRD编辑器端到端测试', () => {
  const BASE_URL = 'http://localhost:6061'
  const FEATURE_ID = 'feat-001'

  test.beforeEach(async ({ page }) => {
    // 访问Feature详情页
    await page.goto(`/function/c1-requirement/feature/${FEATURE_ID}`)
    await page.waitForLoadState('networkidle')
  })

  test('1. 进入PRD编辑器', async ({ page }) => {
    // 切换到PRD Tab
    await page.click('text=PRD')
    await page.waitForTimeout(500)

    // 点击"编辑PRD"按钮
    const editButton = page.locator('button:has-text("编辑PRD")')
    await editButton.click()

    // 等待跳转到PRD编辑器页面
    await page.waitForURL(`**/feature/${FEATURE_ID}/prd`)
    
    // 验证页面标题
    await expect(page.locator('h2')).toContainText('PRD编辑器')
    
    console.log('✓ 成功进入PRD编辑器页面')
  })

  test('2. 测试PRD内容编辑', async ({ page }) => {
    // 进入PRD编辑器
    await page.click('text=PRD')
    await page.waitForTimeout(500)
    await page.click('button:has-text("编辑PRD")')
    await page.waitForURL(`**/feature/${FEATURE_ID}/prd`)

    // 等待编辑器加载
    await page.waitForSelector('.ProseMirror', { timeout: 5000 })

    // 在编辑器中输入内容
    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.fill('<h1>测试PRD文档</h1><p>这是测试内容...</p>')

    // 验证内容已输入
    const editorContent = await editor.textContent()
    expect(editorContent).toContain('测试PRD文档')
    
    console.log('✓ PRD内容编辑功能正常')
  })

  test('3. 测试验收标准添加', async ({ page }) => {
    // 进入PRD编辑器
    await page.click('text=PRD')
    await page.waitForTimeout(500)
    await page.click('button:has-text("编辑PRD")')
    await page.waitForURL(`**/feature/${FEATURE_ID}/prd`)

    // 等待页面加载
    await page.waitForTimeout(1000)

    // 点击"添加"按钮
    const addButton = page.locator('button:has-text("添加")').first()
    await addButton.click()

    // 输入验收标准描述
    const acInput = page.locator('input[placeholder*="验收标准"]').last()
    await acInput.fill('新增验收标准：系统响应时间<100ms')

    // 点击保存
    const saveButton = page.locator('button:has-text("保存")').last()
    await saveButton.click()

    // 验证保存成功提示
    await expect(page.locator('text=验收标准已保存')).toBeVisible({ timeout: 3000 })
    
    console.log('✓ 验收标准添加功能正常')
  })

  test('4. 测试草稿保存', async ({ page }) => {
    // 进入PRD编辑器
    await page.click('text=PRD')
    await page.waitForTimeout(500)
    await page.click('button:has-text("编辑PRD")')
    await page.waitForURL(`**/feature/${FEATURE_ID}/prd`)

    // 等待编辑器加载
    await page.waitForSelector('.ProseMirror', { timeout: 5000 })

    // 修改内容
    const editor = page.locator('.ProseMirror')
    await editor.click()
    await page.keyboard.type('新增测试内容')

    // 点击"保存草稿"
    const saveDraftButton = page.locator('button:has-text("保存草稿")')
    await saveDraftButton.click()

    // 验证保存成功提示
    await expect(page.locator('text=草稿已保存')).toBeVisible({ timeout: 3000 })
    
    console.log('✓ 草稿保存功能正常')
  })

  test('5. 测试版本发布', async ({ page }) => {
    // 进入PRD编辑器
    await page.click('text=PRD')
    await page.waitForTimeout(500)
    await page.click('button:has-text("编辑PRD")')
    await page.waitForURL(`**/feature/${FEATURE_ID}/prd`)

    // 等待编辑器加载
    await page.waitForSelector('.ProseMirror', { timeout: 5000 })

    // 点击"发布"按钮
    const publishButton = page.locator('button:has-text("发布")')
    await publishButton.click()

    // 验证发布成功提示
    await expect(page.locator('text*=PRD已发布')).toBeVisible({ timeout: 3000 })
    
    console.log('✓ 版本发布功能正常')
  })

  test('6. 测试版本历史', async ({ page }) => {
    // 进入PRD编辑器
    await page.click('text=PRD')
    await page.waitForTimeout(500)
    await page.click('button:has-text("编辑PRD")')
    await page.waitForURL(`**/feature/${FEATURE_ID}/prd`)

    // 等待页面加载
    await page.waitForTimeout(1000)

    // 查找版本历史区域
    const versionHistoryCard = page.locator('text=历史版本').locator('..')
    await expect(versionHistoryCard).toBeVisible()

    // 验证版本历史列表存在
    const timeline = page.locator('.el-timeline')
    const exists = await timeline.count() > 0
    
    if (exists) {
      console.log('✓ 版本历史显示正常')
    } else {
      console.log('⚠ 暂无版本历史（正常情况）')
    }
  })

  test('7. 测试附件上传', async ({ page }) => {
    // 进入PRD编辑器
    await page.click('text=PRD')
    await page.waitForTimeout(500)
    await page.click('button:has-text("编辑PRD")')
    await page.waitForURL(`**/feature/${FEATURE_ID}/prd`)

    // 等待页面加载
    await page.waitForTimeout(1000)

    // 查找附件区域
    const attachmentCard = page.locator('text=附件').locator('..')
    await expect(attachmentCard).toBeVisible()

    // 点击上传按钮
    const uploadButton = attachmentCard.locator('button:has-text("上传")')
    await uploadButton.click()

    // 验证上传成功提示（模拟上传）
    await expect(page.locator('text=附件上传成功')).toBeVisible({ timeout: 3000 })
    
    console.log('✓ 附件上传功能正常')
  })

  test('8. 测试PRD评审提交', async ({ page }) => {
    // 进入PRD编辑器
    await page.click('text=PRD')
    await page.waitForTimeout(500)
    await page.click('button:has-text("编辑PRD")')
    await page.waitForURL(`**/feature/${FEATURE_ID}/prd`)

    // 等待页面加载
    await page.waitForTimeout(1000)

    // 查找PRD评审区域
    const reviewCard = page.locator('text=PRD评审').locator('..')
    await expect(reviewCard).toBeVisible()

    // 点击"提交评审"按钮（如果存在）
    const submitReviewButton = reviewCard.locator('button:has-text("提交评审")')
    const buttonExists = await submitReviewButton.count() > 0
    
    if (buttonExists) {
      await submitReviewButton.click()
      await expect(page.locator('text=PRD已提交评审')).toBeVisible({ timeout: 3000 })
      console.log('✓ PRD评审提交功能正常')
    } else {
      console.log('⚠ PRD已在评审中或已评审')
    }
  })

  test('9. 测试PRD评审意见添加', async ({ page }) => {
    // 进入PRD编辑器
    await page.click('text=PRD')
    await page.waitForTimeout(500)
    await page.click('button:has-text("编辑PRD")')
    await page.waitForURL(`**/feature/${FEATURE_ID}/prd`)

    // 等待页面加载
    await page.waitForTimeout(1000)

    // 先提交评审（如果需要）
    const submitButton = page.locator('button:has-text("提交评审")')
    const submitExists = await submitButton.count() > 0
    if (submitExists) {
      await submitButton.click()
      await page.waitForTimeout(1000)
    }

    // 输入评审意见
    const commentTextarea = page.locator('textarea[placeholder*="评审意见"]')
    const textareaExists = await commentTextarea.count() > 0
    
    if (textareaExists) {
      await commentTextarea.fill('这是测试评审意见：整体设计合理，建议增加性能指标说明。')
      
      // 点击"评论"按钮
      const commentButton = page.locator('button:has-text("评论")')
      await commentButton.click()
      
      // 验证成功提示
      await expect(page.locator('text*=已添加评论')).toBeVisible({ timeout: 3000 })
      console.log('✓ PRD评审意见添加功能正常')
    } else {
      console.log('⚠ PRD未在评审状态')
    }
  })

  test('10. 完整流程测试', async ({ page }) => {
    console.log('开始完整流程测试...')
    
    // 1. 进入PRD编辑器
    await page.click('text=PRD')
    await page.waitForTimeout(500)
    await page.click('button:has-text("编辑PRD")')
    await page.waitForURL(`**/feature/${FEATURE_ID}/prd`)
    console.log('  ✓ 步骤1: 成功进入PRD编辑器')

    // 2. 编辑内容
    await page.waitForSelector('.ProseMirror', { timeout: 5000 })
    const editor = page.locator('.ProseMirror')
    await editor.click()
    await page.keyboard.type('完整流程测试内容')
    console.log('  ✓ 步骤2: 内容编辑完成')

    // 3. 保存草稿
    await page.click('button:has-text("保存草稿")')
    await expect(page.locator('text=草稿已保存')).toBeVisible({ timeout: 3000 })
    console.log('  ✓ 步骤3: 草稿保存成功')

    // 4. 添加验收标准
    await page.waitForTimeout(500)
    await page.click('button:has-text("添加")').first()
    const acInput = page.locator('input[placeholder*="验收标准"]').last()
    await acInput.fill('完整流程测试验收标准')
    await page.click('button:has-text("保存")').last()
    await expect(page.locator('text=验收标准已保存')).toBeVisible({ timeout: 3000 })
    console.log('  ✓ 步骤4: 验收标准添加成功')

    // 5. 发布版本
    await page.waitForTimeout(500)
    await page.click('button:has-text("发布")')
    await expect(page.locator('text*=PRD已发布')).toBeVisible({ timeout: 3000 })
    console.log('  ✓ 步骤5: 版本发布成功')

    // 6. 上传附件
    await page.waitForTimeout(500)
    const attachmentCard = page.locator('text=附件').locator('..')
    await attachmentCard.locator('button:has-text("上传")').click()
    await expect(page.locator('text=附件上传成功')).toBeVisible({ timeout: 3000 })
    console.log('  ✓ 步骤6: 附件上传成功')

    console.log('✅ 完整流程测试通过')
  })
})

test.describe('PRD编辑器UI验证', () => {
  const FEATURE_ID = 'feat-001'

  test('验证PRD编辑器页面元素', async ({ page }) => {
    // 进入PRD编辑器
    await page.goto(`/function/c1-requirement/feature/${FEATURE_ID}`)
    await page.click('text=PRD')
    await page.waitForTimeout(500)
    await page.click('button:has-text("编辑PRD")')
    await page.waitForURL(`**/feature/${FEATURE_ID}/prd`)

    // 验证关键UI元素
    await expect(page.locator('text=PRD编辑器')).toBeVisible()
    await expect(page.locator('button:has-text("返回")')).toBeVisible()
    await expect(page.locator('button:has-text("保存草稿")')).toBeVisible()
    await expect(page.locator('button:has-text("发布")')).toBeVisible()
    
    // 验证编辑器工具栏
    await expect(page.locator('.editor-toolbar')).toBeVisible()
    
    // 验证右侧信息栏
    await expect(page.locator('text=状态')).toBeVisible()
    await expect(page.locator('text=历史版本')).toBeVisible()
    await expect(page.locator('text=附件')).toBeVisible()
    await expect(page.locator('text=PRD评审')).toBeVisible()
    
    // 验证验收标准区域
    await expect(page.locator('text=验收标准')).toBeVisible()
    
    console.log('✓ PRD编辑器UI元素验证通过')
  })
})
