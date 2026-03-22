import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/Hyper-pick-up-code-Docs/',
  title: 'Docs',
  description: '文档站点',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: '下载最新正式版', link: 'https://github.com/Badnng/Hyper-pick-up-code/releases/latest/download/app-release.apk' },
      { text: 'GitHub Repo', link: 'https://github.com/Hyper-pick-up-code' }
    ],
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '识别方式', link: '/guide/usage' },
          { text: '常见问题', link: '/guide/troubleshooting' },
          { text: '问题反馈', link: '/guide/feedback' }
        ]
      }
    ]
  }
})
