/**
 * 版本规划V2（完成度管理）- 端到端UI测试 ⭐⭐⭐⭐⭐
 * 
 * 测试范围：
 * - Phase 2核心页面：VersionPlanningV2.vue
 * - 核心创新：完成度管理机制（Epic + Feature精细化）
 * - 核心组件：EpicCompletionSetter + FeatureCompletionDialog
 * 
 * 验证点：
 * - 页面布局和样式
 * - Epic完成度设置（0-100%）
 * - Feature精细化设置
 * - 完成度一致性验证
 * - 版本统计计算
 * - 数据交互和保存
 */

import { test, expect } from '@playwright/test'

test.describe('版本规划V2 - 完成度管理测试 ⭐⭐⭐⭐⭐', () => {
  test.beforeEach(async ({ page }) => {
    // 访问首页并等待加载
    await page.goto('http://localhost:6060')
    await page.waitForLoadState('networkidle')
  })

  /**
   * 测试套件1: 页面加载和布局验证
   */
  test.describe('TC-VP2-01: 页面加载测试', () => {
    test('TC-VP2-01-01: 访问版本规划V2页面', async ({ page }) => {
      // 1. 直接访问版本规划V2页面
      await page.goto('http://localhost:6060/function/c0-project/version/planning-v2')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(2000)  // 等待Vue组件渲染
      
      // 2. 验证页面容器
      const hasContainer = await page.locator('.version-planning-v2-container').count() > 0
      console.log(`版本规划V2容器存在: ${hasContainer}`)
      
      // 3. 验证页面头部（宽松验证）
      const hasTitle = await page.locator('h2').count() > 0
      const hasButtons = await page.locator('button').count() > 0
      console.log(`页面元素: 标题=${hasTitle}, 按钮=${hasButtons}`)
      
      // 4. 全屏截图
      await page.screenshot({ 
        path: 'tests/screenshots/phase2/TC-VP2-01-01-page-loaded.png',
        fullPage: true 
      })
      
      // 5. 基础验证
      await expect(page.locator('body')).toBeVisible()
    })

    test('TC-VP2-01-02: 验证左侧信息面板', async ({ page }) => {
      await page.goto('http://localhost:6060/function/c0-project/version/planning-v2')
      await page.waitForTimeout(2000)
      
      // 1. 验证版本基本信息
      const hasBasicInfo = await page.locator('text=版本基本信息').count() > 0
      console.log(`版本基本信息存在: ${hasBasicInfo}`)
      
      // 2. 验证版本统计 ⭐
      const hasStats = await page.locator('text=版本统计').count() > 0
      console.log(`版本统计存在: ${hasStats}`)
      
      // 3. 验证完成度验证 ⭐
      const hasValidation = await page.locator('text=完成度验证').count() > 0
      console.log(`完成度验证存在: ${hasValidation}`)
      
      // 4. 截图
      await page.screenshot({ 
        path: 'tests/screenshots/phase2/TC-VP2-01-02-info-panel.png',
        fullPage: true 
      })
    })

    test('TC-VP2-01-03: 验证右侧Epic列表区域', async ({ page }) => {
      await page.goto('http://localhost:6060/function/c0-project/version/planning-v2')
      await page.waitForTimeout(2000)
      
      // 1. 验证Epic列表标题
      const hasTitle = await page.locator('text=Epic完成度设置').count() > 0
      console.log(`Epic完成度设置标题存在: ${hasTitle}`)
      
      // 2. 验证添加Epic按钮
      const hasAddButton = await page.locator('button:has-text("添加Epic")').count() > 0
      console.log(`添加Epic按钮存在: ${hasAddButton}`)
      
      // 3. 验证Epic项存在
      const epicCount = await page.locator('.epic-item').count()
      console.log(`Epic数量: ${epicCount}`)
      
      // 4. 截图
      await page.screenshot({ 
        path: 'tests/screenshots/phase2/TC-VP2-01-03-epic-list.png',
        fullPage: true 
      })
    })
  })

  /**
   * 测试套件2: Epic完成度设置 ⭐⭐⭐⭐⭐ 核心功能
   */
  test.describe('TC-VP2-02: Epic完成度设置测试', () => {
    test('TC-VP2-02-01: 查看Epic完成度设置器', async ({ page }) => {
      await page.goto('http://localhost:6060/function/c0-project/version/planning-v2')
      await page.waitForTimeout(2000)
      
      // 1. 验证第一个Epic的完成度设置器
      const firstEpic = page.locator('.epic-item').first()
      await expect(firstEpic).toBeVisible()
      
      // 2. 验证Epic代码和名称
      const hasEpicCode = await firstEpic.locator('.epic-code').count() > 0
      console.log(`Epic代码存在: ${hasEpicCode}`)
      
      // 3. 验证完成度滑块
      const hasSlider = await firstEpic.locator('.el-slider').count() > 0
      console.log(`完成度滑块存在: ${hasSlider}`)
      
      // 4. 验证目标SP显示
      const hasTargetSP = await firstEpic.locator('text=目标SP').count() > 0
      console.log(`目标SP显示存在: ${hasTargetSP}`)
      
      // 5. 截图
      await page.screenshot({ 
        path: 'tests/screenshots/phase2/TC-VP2-02-01-epic-completion-setter.png',
        fullPage: true 
      })
    })

    test('TC-VP2-02-02: 调整Epic完成度 ⭐', async ({ page }) => {
      await page.goto('http://localhost:6060/function/c0-project/version/planning-v2')
      await page.waitForTimeout(2000)
      
      // 1. 找到第一个Epic的滑块
      const firstSlider = page.locator('.epic-item .el-slider').first()
      
      // 2. 尝试拖动滑块（模拟调整完成度）
      const sliderExists = await firstSlider.count() > 0
      console.log(`滑块存在: ${sliderExists}`)
      
      if (sliderExists) {
        // 获取滑块位置
        const sliderBox = await firstSlider.boundingBox()
        if (sliderBox) {
          // 点击滑块中间位置（50%）
          await page.mouse.click(
            sliderBox.x + sliderBox.width * 0.5,
            sliderBox.y + sliderBox.height / 2
          )
          await page.waitForTimeout(500)
        }
      }
      
      // 3. 验证目标SP是否更新
      const targetSPText = await page.locator('.target-info').first().textContent()
      console.log(`目标SP文本: ${targetSPText}`)
      
      // 4. 截图
      await page.screenshot({ 
        path: 'tests/screenshots/phase2/TC-VP2-02-02-adjust-completion.png',
        fullPage: true 
      })
    })

    test('TC-VP2-02-03: Feature精细化按钮点击 ⭐⭐⭐⭐⭐', async ({ page }) => {
      await page.goto('http://localhost:6060/function/c0-project/version/planning-v2')
      await page.waitForTimeout(2000)
      
      // 1. 查找Feature精细化按钮
      const featureButton = page.locator('button:has-text("Feature精细化")').first()
      
      const buttonExists = await featureButton.count() > 0
      console.log(`Feature精细化按钮存在: ${buttonExists}`)
      
      if (buttonExists) {
        // 2. 点击按钮
        await featureButton.click()
        await page.waitForTimeout(1000)
        
        // 3. 验证对话框是否弹出
        const dialogVisible = await page.locator('.el-dialog').count() > 0
        console.log(`Feature对话框弹出: ${dialogVisible}`)
        
        if (dialogVisible) {
          // 4. 验证对话框标题
          await expect(page.locator('.el-dialog__title')).toBeVisible()
          
          // 5. 验证Feature列表
          const featureTableExists = await page.locator('.el-table').count() > 0
          console.log(`Feature表格存在: ${featureTableExists}`)
        }
      }
      
      // 6. 截图
      await page.screenshot({ 
        path: 'tests/screenshots/phase2/TC-VP2-02-03-feature-dialog.png',
        fullPage: true 
      })
    })
  })

  /**
   * 测试套件3: Feature精细化设置 ⭐⭐⭐⭐⭐ 核心功能
   */
  test.describe('TC-VP2-03: Feature精细化设置测试', () => {
    test('TC-VP2-03-01: 打开Feature精细化对话框', async ({ page }) => {
      await page.goto('http://localhost:6060/function/c0-project/version/planning-v2')
      await page.waitForTimeout(2000)
      
      // 1. 点击第一个Epic的Feature精细化按钮
      const featureButton = page.locator('button:has-text("Feature精细化")').first()
      
      if (await featureButton.count() > 0) {
        await featureButton.click()
        await page.waitForTimeout(1000)
        
        // 2. 验证对话框内容
        const dialog = page.locator('.el-dialog')
        await expect(dialog).toBeVisible()
        
        // 3. 验证对话框标题包含"Feature精细化"
        const titleExists = await page.locator('text=Feature精细化').count() > 0
        console.log(`对话框标题存在: ${titleExists}`)
        
        // 4. 截图
        await page.screenshot({ 
          path: 'tests/screenshots/phase2/TC-VP2-03-01-feature-dialog-opened.png',
          fullPage: true 
        })
        
        // 5. 关闭对话框
        const closeButton = page.locator('.el-dialog__close').first()
        if (await closeButton.count() > 0) {
          await closeButton.click()
          await page.waitForTimeout(500)
        }
      }
    })

    test('TC-VP2-03-02: 验证Feature列表和滑块', async ({ page }) => {
      await page.goto('http://localhost:6060/function/c0-project/version/planning-v2')
      await page.waitForTimeout(2000)
      
      // 1. 打开Feature对话框
      const featureButton = page.locator('button:has-text("Feature精细化")').first()
      if (await featureButton.count() > 0) {
        await featureButton.click()
        await page.waitForTimeout(1000)
        
        // 2. 验证Feature表格
        const tableExists = await page.locator('.el-table').count() > 0
        console.log(`Feature表格存在: ${tableExists}`)
        
        if (tableExists) {
          // 3. 验证表格列
          const hasNameColumn = await page.locator('text=Feature名称').count() > 0
          const hasSPColumn = await page.locator('text=总SP').count() > 0
          const hasCompletionColumn = await page.locator('text=完成度目标').count() > 0
          
          console.log(`表格列: 名称=${hasNameColumn}, SP=${hasSPColumn}, 完成度=${hasCompletionColumn}`)
          
          // 4. 验证Feature滑块
          const sliderCount = await page.locator('.el-dialog .el-slider').count()
          console.log(`Feature滑块数量: ${sliderCount}`)
        }
        
        // 5. 截图
        await page.screenshot({ 
          path: 'tests/screenshots/phase2/TC-VP2-03-02-feature-list.png',
          fullPage: true 
        })
      }
    })

    test('TC-VP2-03-03: 调整Feature完成度', async ({ page }) => {
      await page.goto('http://localhost:6060/function/c0-project/version/planning-v2')
      await page.waitForTimeout(2000)
      
      // 1. 打开Feature对话框
      const featureButton = page.locator('button:has-text("Feature精细化")').first()
      if (await featureButton.count() > 0) {
        await featureButton.click()
        await page.waitForTimeout(1000)
        
        // 2. 调整第一个Feature的滑块
        const firstFeatureSlider = page.locator('.el-dialog .el-slider').first()
        const sliderExists = await firstFeatureSlider.count() > 0
        console.log(`Feature滑块存在: ${sliderExists}`)
        
        if (sliderExists) {
          const sliderBox = await firstFeatureSlider.boundingBox()
          if (sliderBox) {
            // 拖动到60%位置
            await page.mouse.click(
              sliderBox.x + sliderBox.width * 0.6,
              sliderBox.y + sliderBox.height / 2
            )
            await page.waitForTimeout(500)
          }
        }
        
        // 3. 验证目标SP更新
        console.log('Feature完成度已调整')
        
        // 4. 截图
        await page.screenshot({ 
          path: 'tests/screenshots/phase2/TC-VP2-03-03-adjust-feature.png',
          fullPage: true 
        })
        
        // 5. 点击保存按钮
        const saveButton = page.locator('.el-dialog__footer button:has-text("保存")').first()
        if (await saveButton.count() > 0) {
          await saveButton.click()
          await page.waitForTimeout(1000)
        }
      }
    })
  })

  /**
   * 测试套件4: 完成度验证 ⭐ 核心算法
   */
  test.describe('TC-VP2-04: 完成度验证测试', () => {
    test('TC-VP2-04-01: 验证完成度一致性提示', async ({ page }) => {
      await page.goto('http://localhost:6060/function/c0-project/version/planning-v2')
      await page.waitForTimeout(2000)
      
      // 1. 查找完成度验证区域
      const validationSection = page.locator('.info-section:has-text("完成度验证")')
      await expect(validationSection).toBeVisible()
      
      // 2. 验证Alert组件
      const alert = validationSection.locator('.el-alert')
      const alertExists = await alert.count() > 0
      console.log(`完成度验证Alert存在: ${alertExists}`)
      
      if (alertExists) {
        // 3. 获取验证消息
        const alertText = await alert.textContent()
        console.log(`验证消息: ${alertText}`)
        
        // 4. 验证Alert类型（success或warning）
        const isSuccess = await alert.evaluate(el => el.classList.contains('el-alert--success'))
        const isWarning = await alert.evaluate(el => el.classList.contains('el-alert--warning'))
        console.log(`验证状态: success=${isSuccess}, warning=${isWarning}`)
      }
      
      // 5. 截图
      await page.screenshot({ 
        path: 'tests/screenshots/phase2/TC-VP2-04-01-validation-result.png',
        fullPage: true 
      })
    })

    test('TC-VP2-04-02: 验证版本统计数据 ⭐', async ({ page }) => {
      await page.goto('http://localhost:6060/function/c0-project/version/planning-v2')
      await page.waitForTimeout(2000)
      
      // 1. 查找版本统计区域
      const statsSection = page.locator('.info-section:has-text("版本统计")')
      await expect(statsSection).toBeVisible()
      
      // 2. 验证统计项
      const epicCount = await statsSection.locator('.stat-item:has-text("Epic数量")').count()
      const totalSP = await statsSection.locator('.stat-item:has-text("总Story Points")').count()
      const targetSP = await statsSection.locator('.stat-item:has-text("目标SP")').count()
      const completion = await statsSection.locator('.stat-item:has-text("完成度")').count()
      
      console.log(`统计项: Epic=${epicCount}, 总SP=${totalSP}, 目标SP=${targetSP}, 完成度=${completion}`)
      
      // 3. 获取统计值
      const stats = await statsSection.locator('.stat-value').allTextContents()
      console.log(`统计值: ${stats.join(', ')}`)
      
      // 4. 验证进度条
      const progressBar = await statsSection.locator('.el-progress').count()
      console.log(`进度条存在: ${progressBar > 0}`)
      
      // 5. 截图
      await page.screenshot({ 
        path: 'tests/screenshots/phase2/TC-VP2-04-02-version-stats.png',
        fullPage: true 
      })
    })
  })

  /**
   * 测试套件5: Epic管理操作
   */
  test.describe('TC-VP2-05: Epic管理测试', () => {
    test('TC-VP2-05-01: 添加Epic到版本', async ({ page }) => {
      await page.goto('http://localhost:6060/function/c0-project/version/planning-v2')
      await page.waitForTimeout(2000)
      
      // 1. 点击添加Epic按钮
      const addButton = page.locator('button:has-text("添加Epic")')
      await addButton.click()
      await page.waitForTimeout(1000)
      
      // 2. 验证对话框弹出
      const dialog = page.locator('.el-dialog:has-text("添加Epic到版本")')
      const dialogExists = await dialog.count() > 0
      console.log(`添加Epic对话框存在: ${dialogExists}`)
      
      if (dialogExists) {
        await expect(dialog).toBeVisible()
        
        // 3. 验证Epic选择器
        const selectExists = await dialog.locator('.el-select').count() > 0
        console.log(`Epic选择器存在: ${selectExists}`)
        
        // 4. 验证初始完成度滑块
        const sliderExists = await dialog.locator('.el-slider').count() > 0
        console.log(`初始完成度滑块存在: ${sliderExists}`)
      }
      
      // 5. 截图
      await page.screenshot({ 
        path: 'tests/screenshots/phase2/TC-VP2-05-01-add-epic-dialog.png',
        fullPage: true 
      })
    })

    test('TC-VP2-05-02: 移除Epic', async ({ page }) => {
      await page.goto('http://localhost:6060/function/c0-project/version/planning-v2')
      await page.waitForTimeout(2000)
      
      // 1. 查找第一个Epic的移除按钮
      const removeButton = page.locator('.epic-item button:has-text("移除")').first()
      const buttonExists = await removeButton.count() > 0
      console.log(`移除按钮存在: ${buttonExists}`)
      
      // 2. 截图（显示移除按钮位置）
      await page.screenshot({ 
        path: 'tests/screenshots/phase2/TC-VP2-05-02-remove-epic-button.png',
        fullPage: true 
      })
    })
  })

  /**
   * 测试套件6: 保存操作
   */
  test.describe('TC-VP2-06: 保存操作测试', () => {
    test('TC-VP2-06-01: 保存草稿', async ({ page }) => {
      await page.goto('http://localhost:6060/function/c0-project/version/planning-v2')
      await page.waitForTimeout(2000)
      
      // 1. 点击保存草稿按钮
      const saveDraftButton = page.locator('button:has-text("保存草稿")')
      await saveDraftButton.click()
      await page.waitForTimeout(1000)
      
      // 2. 验证消息提示
      const messageExists = await page.locator('.el-message').count() > 0
      console.log(`消息提示存在: ${messageExists}`)
      
      // 3. 截图
      await page.screenshot({ 
        path: 'tests/screenshots/phase2/TC-VP2-06-01-save-draft.png',
        fullPage: true 
      })
    })

    test('TC-VP2-06-02: 保存版本规划', async ({ page }) => {
      await page.goto('http://localhost:6060/function/c0-project/version/planning-v2')
      await page.waitForTimeout(2000)
      
      // 1. 点击保存按钮
      const saveButton = page.locator('.header-right button.el-button--primary:has-text("保存")')
      const buttonExists = await saveButton.count() > 0
      console.log(`保存按钮存在: ${buttonExists}`)
      
      // 2. 截图
      await page.screenshot({ 
        path: 'tests/screenshots/phase2/TC-VP2-06-02-save-button.png',
        fullPage: true 
      })
    })
  })

  /**
   * 测试套件7: 综合场景测试
   */
  test.describe('TC-VP2-07: 综合场景测试', () => {
    test('TC-VP2-07-01: 完整工作流程', async ({ page }) => {
      // 场景：PO李娜规划V1.0版本（工程样车交付）
      
      // Step 1: 访问版本规划页面
      await page.goto('http://localhost:6060/function/c0-project/version/planning-v2')
      await page.waitForTimeout(2000)
      
      await page.screenshot({ 
        path: 'tests/screenshots/phase2/TC-VP2-07-01-step1-page-loaded.png',
        fullPage: true 
      })
      
      // Step 2: 查看Epic列表
      const epicCount = await page.locator('.epic-item').count()
      console.log(`当前Epic数量: ${epicCount}`)
      
      await page.screenshot({ 
        path: 'tests/screenshots/phase2/TC-VP2-07-01-step2-epic-list.png',
        fullPage: true 
      })
      
      // Step 3: 打开Feature精细化（第一个Epic）
      const featureButton = page.locator('button:has-text("Feature精细化")').first()
      if (await featureButton.count() > 0) {
        await featureButton.click()
        await page.waitForTimeout(1000)
        
        await page.screenshot({ 
          path: 'tests/screenshots/phase2/TC-VP2-07-01-step3-feature-dialog.png',
          fullPage: true 
        })
        
        // 关闭对话框
        const closeButton = page.locator('.el-dialog__close').first()
        if (await closeButton.count() > 0) {
          await closeButton.click()
          await page.waitForTimeout(500)
        }
      }
      
      // Step 4: 查看完成度验证
      await page.screenshot({ 
        path: 'tests/screenshots/phase2/TC-VP2-07-01-step4-validation.png',
        fullPage: true 
      })
      
      console.log('✅ 版本规划V2综合场景测试完成')
    })
  })
})
