#!/bin/bash

# 查看截图和测试报告脚本
# 使用方法: ./VIEW-SCREENSHOTS-AND-REPORTS.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📸 打开测试截图目录"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 打开Phase 1截图
echo "✅ 打开 Phase 1 截图..."
open frontend/tests/screenshots/phase1

# 打开Phase 2截图
echo "✅ 打开 Phase 2 截图..."
open frontend/tests/screenshots/phase2

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 打开测试报告"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 打开Playwright HTML报告
echo "✅ 打开 Playwright HTML 报告..."
cd frontend
npx playwright show-report &

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 文档报告位置"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FULLSCREEN-TEST-EXECUTION-REPORT.md"
echo "✅ AUTO-EXECUTION-COMPLETE-SUMMARY.md"
echo "✅ PLAYWRIGHT-CONFIG-OPTIMIZATION.md"
echo ""
echo "🎉 完成！"
