#!/bin/bash

# 代码分割构建分析脚本

echo "🚀 开始构建分析..."
echo "=================="

# 清理之前的构建
rm -rf dist

# 构建项目
echo "📦 正在构建项目..."
npm run build

echo ""
echo "📊 构建结果分析:"
echo "=================="

# 分析打包结果
echo "📁 文件大小分析:"
find dist -name "*.js" -exec ls -lh {} \; | awk '{print $5 "\t" $9}' | sort -hr

echo ""
echo "📈 Gzip 压缩大小:"
find dist -name "*.js" -exec bash -c 'gzip -c "$1" | wc -c | numfmt --to=iec' _ {} \; | paste - <(find dist -name "*.js") | column -t

echo ""
echo "🎯 关键指标:"
echo "============"

# 计算总大小
TOTAL_JS=$(find dist -name "*.js" -exec stat -f%z {} \; | awk '{sum += $1} END {print sum}')
TOTAL_JS_HUMAN=$(echo $TOTAL_JS | numfmt --to=iec)

TOTAL_CSS=$(find dist -name "*.css" -exec stat -f%z {} \; | awk '{sum += $1} END {print sum}')
TOTAL_CSS_HUMAN=$(echo $TOTAL_CSS | numfmt --to=iec)

echo "总 JS 大小: $TOTAL_JS_HUMAN"
echo "总 CSS 大小: $TOTAL_CSS_HUMAN"

# 检查是否有过大的包
echo ""
echo "⚠️  大小检查:"
echo "============"

find dist -name "*.js" -size +200k -exec echo "警告: {} 超过 200KB" \;
find dist -name "*.js" -size +500k -exec echo "严重: {} 超过 500KB" \;

# 显示 chunk 数量
JS_COUNT=$(find dist -name "*.js" | wc -l)
CSS_COUNT=$(find dist -name "*.css" | wc -l)

echo "JS 文件数量: $JS_COUNT"
echo "CSS 文件数量: $CSS_COUNT"

echo ""
echo "✅ 分析完成!"
echo "================"
echo "💡 优化建议:"
echo "- 主包应小于 100KB (gzip)"
echo "- Vendor 包可以较大 (150-200KB)"
echo "- 页面包应小于 50KB (gzip)"
echo "- 总 JS 大小建议小于 500KB"

echo ""
echo "🔍 要查看详细分析，运行: npm run analyze"
