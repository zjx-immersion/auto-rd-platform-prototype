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
    
    // 截图设置
    screenshot: 'only-on-failure',
    
    // 视频设置
    video: 'retain-on-failure',
    
    // 追踪设置
    trace: 'retain-on-failure',
    
    // 浏览器设置
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    
    // 等待设置
    actionTimeout: 15000, // 15秒
    navigationTimeout: 45000 // 45秒
  },

  // 项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
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
