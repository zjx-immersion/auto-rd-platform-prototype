import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright配置文件 - 完整业务流程测试
 * 使用真实浏览器（非headless）和全屏视口
 */
export default defineConfig({
  // 测试目录
  testDir: './tests',
  
  // 超时设置
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  
  // 测试执行设置
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  
  // 报告设置
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['list']
  ],
  
  // 输出设置
  use: {
    // 基础URL
    baseURL: 'http://localhost:6060',
    
    // 截图设置 - 全页面截图
    screenshot: 'always',  // 总是截图，便于查看测试过程
    
    // 浏览器设置 - 全屏模式 ⭐
    headless: false,  // 使用真实浏览器（非headless模式）
    viewport: null,   // 使用浏览器原生窗口大小（跟随全屏）
    ignoreHTTPSErrors: true,
    
    // 等待设置
    actionTimeout: 15000,
    navigationTimeout: 30000
  },

  // 项目配置
  projects: [
    {
      name: 'chromium',
      use: { 
        // 全屏浏览器配置 ⭐⭐⭐
        // 注意：当使用 viewport: null 时，不能使用 devices 预设（会冲突）
        headless: false,   // 显示浏览器
        viewport: null,    // 使用浏览器原生窗口大小
        launchOptions: {
          args: [
            '--start-maximized',       // 启动时最大化窗口
            '--start-fullscreen',      // 启动时全屏
            '--window-size=1920,1080', // 设置窗口大小（作为后备）
            '--disable-blink-features=AutomationControlled', // 隐藏自动化标识
          ],
          // 确保浏览器以最大化窗口启动
          ignoreDefaultArgs: ['--enable-automation'],
        }
      },
    }
  ],
})
