#!/bin/bash

# 快速测试构建结果的脚本

echo "🔨 构建项目..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ 构建成功！"
  echo "🚀 启动预览服务器..."
  echo "📱 浏览器访问: http://localhost:4173"
  echo "💡 按 Ctrl+C 停止服务器"
  npm run preview
else
  echo "❌ 构建失败！检查错误信息。"
fi
