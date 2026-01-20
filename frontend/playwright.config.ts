import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright配置文件
 * 用于端到端自动化测试
 */
export default defineConfig({
  // 测试目录
  testDir: './tests',
  
  // 超时设置
  timeout: 60000, // 60秒
  expect: {
    timeout: 10000 // 10秒
  },
  
  // 测试执行设置
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  
  // 报告设置
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/test-results.json' }]
  ],
  
  // 输出设置
  use: {
    // 基础URL
    baseURL: 'http://localhost:6060',
    
    // 截图设置 - 全页面截图
    screenshot: 'always',  // 总是截图，用于测试报告
    
    // 视频设置
    video: 'retain-on-failure',
    
    // 追踪设置
    trace: 'retain-on-failure',
    
    // 浏览器设置 - 全屏模式 ⭐
    headless: false,  // 显示浏览器界面，方便观察测试过程
    viewport: null,   // 使用浏览器原生窗口大小（跟随全屏）
    ignoreHTTPSErrors: true,
    
    // 等待设置
    actionTimeout: 15000,     // 15秒
    navigationTimeout: 45000  // 45秒
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

  // Web服务器配置（如果需要自动启动）
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:6060',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000
  // },
})
