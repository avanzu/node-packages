import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: 'Omnium-Gatherum',
    tagline: 'Because not everything needs to be a framework.',
    favicon: 'img/favicon.ico',

    url: 'https://avanzu.github.io',
    baseUrl: '/node-packages/', // ← repo name if hosted under a project page
    organizationName: 'avanzu',
    projectName: 'node-packages',
    deploymentBranch: 'gh-pages',

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    // editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
                },
                // blog: {
                //   showReadingTime: true,
                //   feedOptions: {
                //     type: ['rss', 'atom'],
                //     xslt: true,
                //   },
                //   // Please change this to your repo.
                //   // Remove this to remove the "edit this page" links.
                //   editUrl:
                //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
                //   // Useful options to enforce blogging best practices
                //   onInlineTags: 'warn',
                //   onInlineAuthors: 'warn',
                //   onUntruncatedBlogPosts: 'warn',
                // },
                theme: {
                    customCss: './src/css/avanzu.css',
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        // Replace with your project's social card
        image: 'img/docusaurus-social-card.jpg',
        navbar: {
            title: '@avanzu',
            // logo: {
            //     alt: 'My Site Logo',
            //     src: 'img/logo.png',
            // },
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'kernelSidebar',
                    position: 'left',
                    label: 'kernel',
                },
                {
                    type: 'docSidebar',
                    sidebarId: 'httpClientSidebar',
                    position: 'left',
                    label: 'http-client',
                },
                {
                    type: 'docSidebar',
                    sidebarId: 'decoratorsSidebar',
                    position: 'left',
                    label: 'decorators',
                },
                // {to: '/blog', label: 'Blog', position: 'left'},
                {
                    href: 'https://github.com/avanzu/node-packages',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Docs',
                    items: [
                        {
                            label: 'Intro',
                            to: '/docs',
                        },
                        {
                            label: 'GitHub',
                            href: 'https://github.com/avanzu/node-packages',
                        },
                        {
                            label: 'Avanzu',
                            href: 'https://avanzu.de',
                        },
                    ],
                },

                // {
                //     title: 'More',
                //     items: [
                //
                //     ],
                // },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Avanzu, Inc. Built with Docusaurus.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
}

export default config
