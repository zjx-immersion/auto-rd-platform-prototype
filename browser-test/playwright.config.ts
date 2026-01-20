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
    
    // 截图设置
    screenshot: 'only-on-failure',
    
    // 浏览器设置 - 全屏viewport
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    
    // 使用真实浏览器（非headless模式）
    headless: false,
    
    // 等待设置
    actionTimeout: 15000,
    navigationTimeout: 30000
  },

  // 项目配置
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        headless: false
      },
    }
  ],
})
