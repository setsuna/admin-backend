import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ========== 基础配色（shadcn/ui 兼容，保持向后兼容）========== */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        /* ========== 主品牌色（支持状态变体）========== */
        /* 使用方式：
         * - bg-primary           默认态
         * - bg-primary-hover     悬停态（或使用 hover:bg-primary-hover）
         * - bg-primary-active    点击态（或使用 active:bg-primary-active）
         * - bg-primary-disabled  禁用态
         */
        primary: {
          DEFAULT: "hsl(var(--primary))",          /* 保持向后兼容 */
          foreground: "hsl(var(--primary-foreground))",
          default: "hsl(var(--primary-default))",  /* 新增：默认态 */
          hover: "hsl(var(--primary-hover))",      /* 新增：悬停态 */
          active: "hsl(var(--primary-active))",    /* 新增：点击态 */
          disabled: "hsl(var(--primary-disabled))", /* 新增：禁用态 */
        },
        
        /* ========== 辅助品牌色（支持状态变体）========== */
        secondary: {
          DEFAULT: "hsl(var(--secondary))",        /* 保持向后兼容 */
          foreground: "hsl(var(--secondary-foreground))",
          default: "hsl(var(--secondary-default))",
          hover: "hsl(var(--secondary-hover))",
          active: "hsl(var(--secondary-active))",
          disabled: "hsl(var(--secondary-disabled))",
        },
        
        /* ========== 其他基础配色 ========== */
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        /* ========== 政务红专用色彩 ========== */
        /* 仅在 .gov-red 主题下生效 */
        "gov-gold": "hsl(var(--gov-gold))",         /* 金色点缀 */
        "gov-dark-red": "hsl(var(--gov-dark-red))", /* 深红色 */
        "gov-light-red": "hsl(var(--gov-light-red))",/* 浅红背景 */
        "gov-gray": "hsl(var(--gov-gray))",         /* 中性灰 */
        
        /* ========== 背景色系统（多层级）========== */
        /* 使用方式：
         * - bg-bg-page        页面最外层背景
         * - bg-bg-container   容器背景（比页面深一点）
         * - bg-bg-card        卡片背景（最亮/最白）
         * - bg-bg-elevated    悬浮层背景（Dialog、Popover、Tooltip）
         */
        bg: {
          page: "hsl(var(--bg-page))",
          container: "hsl(var(--bg-container))",
          card: "hsl(var(--bg-card))",
          elevated: "hsl(var(--bg-elevated))",
        },
        
        /* ========== 文字颜色系统（多层级）========== */
        /* 使用方式：
         * - text-text-primary     一级标题、重要内容
         * - text-text-secondary   二级标题、次要内容
         * - text-text-regular     正文、常规内容
         * - text-text-tertiary    辅助文字、说明文本
         * - text-text-inverse     反色文字（深色背景上的白字）
         */
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          regular: "hsl(var(--text-regular))",
          tertiary: "hsl(var(--text-tertiary))",
          inverse: "hsl(var(--text-inverse))",
        },
        
        /* ========== 功能语义色（固定不变）========== */
        /* 这些颜色不随主题变化，符合用户认知习惯 */
        success: "hsl(var(--success))",  /* #52c41a 成功-绿色 */
        warning: "hsl(var(--warning))",  /* #faad14 警告-黄色 */
        info: "hsl(var(--info))",        /* #1B8CF6 信息-蓝色 */
        error: "hsl(var(--error))",      /* #FF2600 错误-红色 */
        
        /* ========== Sidebar 相关颜色 ========== */
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      
      /* ========== 圆角系统 ========== */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      
      /* ========== 动画关键帧 ========== */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
      },
      
      /* ========== 动画定义 ========== */
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
