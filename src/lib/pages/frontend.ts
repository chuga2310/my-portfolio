import type { PageConfig } from '../types';
import { AURA_RECAP, CONTENT } from '../content';
import { yearsShipping } from '../yearsShipping';

/** "8+" or "9": counted from CAREER_START, recomputed on every load (see yearsShipping.ts). */
const YEARS = yearsShipping();
const { en, vi } = CONTENT;

const APPSOURCE = 'https://appsource.microsoft.com/en-us/product/office/wa200007444';
const COKE = 'https://www.coca-cola.com/vn/vi';
const LUMI = 'https://lumi.vn/works-with-lumi.html';

/** /frontend — Frontend Developer: ReactJS, Next.js and React Native. Same sections as the main page. */
export const FRONTEND_PAGE: PageConfig = {
  orbit: {
    outer: [
      'logically', 'react', 'typescript', 'expo', 'coke', 'nextjs', 'reactnative', 'tailwind', 'lumi', 'electron', 'threejs', 'vite',
      'claude', 'storybook', 'javascript', 'vercel',
    ],
    inner: ['redux', 'mui', 'jest', 'reactquery', 'android', 'figma'],
    marquee: ['logically', 'react', 'nextjs', 'reactnative', 'expo', 'typescript', 'coke', 'electron', 'lumi', 'threejs', 'tailwind', 'claude', 'vite', 'redux'],
  },
  content: {
    en: {
      ...en,
      hero: {
        ...en.hero,
        kicker: 'Frontend · React · React Native — Hanoi, UTC+7',
        roles: ['Principal Frontend Engineer', 'ReactJS & Next.js', 'React Native'],
        tagline: 'React on every screen — web, desktop and mobile from one TypeScript codebase.',
        meta: [`${YEARS} yrs shipping`, '8 yrs React Native', 'Frontend teams of 3–10'],
      },
      about: {
        ...en.about,
        title: 'A frontend leader who still ships the components.',
        body: 'I lead frontend teams of 3–10 engineers and own the architecture, the shared design system, review standards and releases — across web, Electron desktop and iOS / Android from shared codebases. I work with Claude Code, Cursor and Copilot every day, and every change still has an engineer accountable for it.',
        stats: [
          { k: 'Years shipping', v: YEARS },
          { k: 'Frontend team size', v: '3–10' },
          { k: 'Years of React Native', v: '8' },
          { k: 'Surfaces, one codebase', v: '4' },
        ],
      },
      skills: {
        ...en.skills,
        title: 'Three frameworks, one frontend.',
        center: 'One frontend',
        cards: [
          { tag: 'RE', title: 'ReactJS', body: 'Design systems, component libraries, document-heavy editors, 3D and Office add-ins on React 19 and TypeScript.', chips: ['React 19', 'TypeScript', 'Design systems', 'Zustand / Jotai', 'TanStack Query', 'Tiptap', 'Three.js', 'Word add-in'], tips: ['Server Components, Actions, Suspense', 'Every frontend since 2019', 'IRIS · Coca-Cola AR · Logically', 'Logically state layer', 'Logically data fetching', 'Real-time editing with Hocuspocus', 'IRIS 3D avatars & scenes', 'Cite · AI chat + citations in Word'] },
          { tag: 'NX', title: 'Next.js', body: 'App Router products with server rendering, streamed AI answers and SEO-friendly pages.', chips: ['App Router', 'Server Actions', 'SSR / SSG / ISR', 'Middleware', 'Streaming UI', 'Tailwind v4', 'shadcn/ui', 'MUI', 'Vercel AI SDK', 'Core Web Vitals'], tips: ['Logically web app', 'Forms and mutations', 'SEO-friendly public pages', 'Auth and routing rules', 'Streamed LLM answers in Logically', 'Current styling default', 'Radix-based component kit', 'Logically and Cite UI kit', 'Streaming chat and generative UI', 'Faster document-heavy screens'] },
          { tag: 'RN', title: 'React Native', body: 'Eight years, from bare React Native with native modules and BLE to Expo with EAS and over-the-air updates.', chips: ['Expo / EAS', 'Expo Router', 'New Architecture', 'Reanimated', 'Liquid Glass UI', 'BLE mesh', 'Unity embed', 'Redux-Saga', 'Detox', 'Store releases'], tips: ['Logically mobile · Build, Submit, Update', 'Logically navigation', 'Fabric, TurboModules, JSI', 'Gesture-driven UI', 'iOS 26 design across Logically mobile', 'Lumi · device control and OTA firmware', 'Coca-Cola AR Training', 'Lumi · Coca-Cola AR', 'Coca-Cola AR test suite', 'App Store & Google Play since 2018'] },
        ],
      },
      tools: {
        ...en.tools,
        title: 'The frontend toolbox.',
        sub: 'Frameworks, libraries and platforms I have shipped frontends with — grouped by where they sit in a product.',
        languages: { title: 'Languages', tools: ['typescript', 'javascript', 'java', 'csharp'] },
        groups: [
          { id: 'web', title: 'Web frameworks & UI', body: 'From SaaS dashboards and editors to public pages.', tools: ['react', 'nextjs', 'tailwind', 'shadcn', 'mui', 'vite', 'turborepo'] },
          { id: 'mobile', title: 'Mobile', body: 'React Native on iOS and Android, bare and Expo.', tools: ['reactnative', 'expo', 'android', 'firebase', 'bluetooth', 'mqtt'] },
          { id: 'desktop', title: 'Desktop, 3D & Office', body: 'The same React code on more screens.', tools: ['electron', 'threejs', 'unity', 'word'] },
          { id: 'data', title: 'State, data & cloud', body: 'Client state, server cache, and where the app runs.', tools: ['redux', 'reactquery', 'recoil', 'nodejs', 'gcp', 'vercel'] },
          { id: 'quality', title: 'Testing & release', body: 'How it is checked and how it ships.', tools: ['jest', 'vitest', 'testinglibrary', 'storybook', 'sentry', 'actions', 'fastlane', 'appstore', 'googleplay'] },
          { id: 'ai', title: 'AI in the workflow', body: 'Coding agents and the models behind the product.', tools: ['claude', 'cursor', 'copilot', 'openai', 'anthropic', 'gemini'] },
        ],
      },
      exp: {
        ...en.exp,
        items: [
          { y: 'May 2025 — Now', org: 'Afforai (Logically)', role: 'Frontend Leader / Project Leader', loc: 'Remote', body: 'Own the React / Next.js frontend of a US AI research platform and lead a team of 4. Real-time collaborative editing (Tiptap + Hocuspocus), the web app converted into a Windows app with Electron, the Expo mobile app with the iOS 26 Liquid Glass UI, and a Word citation add-in.', from: '2025-05', to: null, tools: ['react', 'nextjs', 'typescript', 'reactnative', 'expo', 'electron', 'mui', 'reactquery', 'recoil', 'word', 'nodejs', 'gcp', 'stripe', 'claude', 'cursor'] },
          { y: 'May 2024 — May 2025', org: 'Undisclosed Company', role: 'Frontend Engineer (remote contract)', loc: 'Remote', body: 'Built ReactJS and TypeScript features for an AI-powered web product in a distributed team: REST and LLM-backed features, UI performance and usability, code review and production support.', from: '2024-05', to: '2025-05', tools: ['react', 'typescript', 'javascript', 'nodejs'] },
          { y: 'Mar 2023 — May 2024', org: 'akaVerse — FPT IS', role: 'Frontend Leader & Project Leader', loc: 'Hanoi', body: 'IRIS (5 engineers): React + Electron foundation and shared design system for web and Windows, Three.js 3D avatar customisation. Coca-Cola AR Training (10 members): React Native + Unity app, component libraries, Jest / Detox tests and store releases. Set frontend standards across three teams.', from: '2023-03', to: '2024-05', tools: ['react', 'electron', 'threejs', 'reactnative', 'unity', 'csharp', 'redux', 'jest'] },
          { y: 'Dec 2020 — Mar 2023', org: 'FPT Telecom', role: 'Software Developer & Project Manager', loc: 'Hanoi', body: 'A Phaser 3 / WebGL lucky-draw game on the HiFPT app; the LearnR dApp in ReactJS + CosmJS — Top 5, Aura Hackathon 2022; PM for the FPT Partner platform (Flutter, ReactJS, .NET).', from: '2020-12', to: '2023-03', tools: ['react', 'javascript', 'rust', 'nodejs', 'flutter', 'java'] },
          { y: 'Oct 2019 — Nov 2020', org: 'Lumi Vietnam', role: 'Mobile Developer (React Native)', loc: 'Hanoi', body: 'Three smart-home apps — Lumi Life, RaliSmart, Eureka — with Redux-Saga, React Navigation, WebSocket and MQTT; BLE device control, mesh provisioning and OTA firmware updates; an Electron debugging tool; App Store and Google Play releases.', from: '2019-10', to: '2020-11', tools: ['reactnative', 'javascript', 'redux', 'bluetooth', 'mqtt', 'firebase', 'electron'] },
          { y: 'Jan 2018 — Oct 2019', org: 'DigiMed / VJ-Soft', role: 'Mobile Developer (Android + RN)', loc: 'Hanoi', body: 'React Native and Android (Java) features from Figma and Sketch designs; REST APIs, Firebase, SQLite and third-party SDKs.', from: '2018-01', to: '2019-10', tools: ['reactnative', 'android', 'java', 'javascript', 'firebase', 'figma'] },
          { y: 'Jan 2018 — Jun 2018', org: 'FPT Polytechnic', role: 'Teaching Assistant', loc: 'Hanoi', body: 'Mentored students in Java, SQL, JavaScript, ReactJS and React Native lab sessions.', from: '2018-01', to: '2018-06', tools: ['java', 'javascript', 'react', 'reactnative'] },
        ],
      },
      projects: {
        ...en.projects,
        featured: {
          ...en.projects.featured,
          sub: 'AI document research, summarization & citation — one React codebase on web, desktop, mobile and Word.',
          bullets: [
            'Own the frontend architecture: Next.js, Zustand, Jotai, TanStack Query, MUI, DND-kit',
            'Built the real-time collaborative editor on Tiptap + Hocuspocus',
            'Shared TypeScript domain and API layer for the web, Electron and React Native apps',
            'Set frontend standards and sped up document-heavy screens',
          ],
          stack: ['React', 'Next.js', 'TypeScript', 'React Native', 'Expo', 'Electron', 'Tiptap', 'MUI', 'TanStack Query', 'Stripe'],
        },
        grid: [
          { name: 'Logically Desktop & Mobile', role: 'Frontend leader', body: 'The web app converted into a Windows app with Electron, and an Expo app for iOS and Android with the iOS 26 Liquid Glass UI — on the same TypeScript core.', chips: ['Electron', 'React Native', 'Expo', 'EAS'], link: { label: 'logically.app', href: 'https://logically.app' } },
          { name: 'Afforai Cite Extension', role: 'Lead engineer', body: 'Microsoft Word add-in for querying an AI chatbot and inserting citations into the document. React + MUI + Tiptap + Recoil.', chips: ['MS Word', 'React', 'MUI', 'Tiptap'], link: { label: 'Microsoft AppSource', href: APPSOURCE } },
          { name: 'IRIS 3D Web/Desktop', role: 'Frontend lead — 5 ppl', body: 'Customize 3D avatars, clothing and accessories, and launch VR/AR experiences. Web + Windows from one React codebase and design system.', chips: ['Three.js', 'Electron', 'React', 'Design system'], note: 'Internal · no public shots' },
          { name: 'Coca-Cola AR Training', role: 'Project lead & RN dev — 10 ppl', body: 'React Native app with an embedded Unity AR runtime for Coca-Cola Vietnam sales training; component library, Jest and Detox tests.', chips: ['React Native', 'Unity', 'Redux-Saga', 'Detox'], link: { label: 'Client · Coca-Cola Vietnam', href: COKE } },
          { name: 'Lumi IoT Suite', role: 'Mobile dev', body: 'Smart-home control over BLE + MQTT on iOS/Android — Lumi Life, RaliSmart, Eureka — with mesh provisioning and OTA firmware updates.', chips: ['React Native', 'BLE', 'MQTT', 'Firebase'], link: { label: 'lumi.vn · Lumi Life', href: LUMI } },
          { name: 'LearnR (Aura Hackathon)', role: 'Project lead — 5 ppl', body: 'Learn-to-Earn dApp: a ReactJS + CosmJS frontend over Rust smart contracts. Top 5 finalist, 2022.', chips: ['React', 'CosmJS', 'Rust', 'Node'], link: { label: 'Hackathon recap · Aura Network', href: AURA_RECAP } },
        ],
      },
      metrics: {
        ...en.metrics,
        items: [
          { v: YEARS, k: 'Years shipping', sub: 'Web, desktop and mobile' },
          { v: '8', k: 'Years of React Native', sub: 'Bare RN to Expo + EAS' },
          { v: '4', k: 'Surfaces, one codebase', sub: 'Web · Windows · iOS/Android · Word' },
          { v: '10', k: 'Largest team led', sub: 'Coca-Cola AR Training' },
          { v: 'Top 5', k: 'Aura Hackathon', sub: 'Blockchain track, 2022' },
          { v: '9.22', k: 'GPA / 10', sub: 'Valedictorian, FPT Polytechnic' },
        ],
      },
      awards: {
        ...en.awards,
        awards: [
          { y: '2022', t: 'Top 5 — Aura Network Hackathon', s: 'Led a 5-person team building LearnR' },
          { y: '2019', t: 'Valedictorian — FPT Polytechnic', s: 'Ranked 1st in graduating cohort' },
          { y: '2018', t: 'Best Student — React Native', s: 'FPT Polytechnic' },
          { y: '2018', t: 'Best Student — Advanced Android Programming', s: 'FPT Polytechnic' },
        ],
      },
      jd: {
        ...en.jd,
        title: 'Does my CV fit your frontend role?',
        sub: 'Drop a React, Next.js or React Native job description. An AI pipeline scores it against my real experience, stage by stage.',
      },
      contact: {
        ...en.contact,
        title: 'Building a React product for web and mobile?',
        composeLabel: 'What are you building?',
        composePlaceholder: 'Tell me about the product and the stack…',
        composeSubject: 'Frontend role from your portfolio',
      },
    },
    vi: {
      ...vi,
      hero: {
        ...vi.hero,
        kicker: 'Frontend · React · React Native — Hà Nội, UTC+7',
        roles: ['Principal Frontend Engineer', 'ReactJS & Next.js', 'React Native'],
        tagline: 'React trên mọi màn hình — web, desktop và mobile từ một codebase TypeScript.',
        meta: [`${YEARS} năm ship sản phẩm`, '8 năm React Native', 'Lead team frontend 3–10 người'],
      },
      about: {
        ...vi.about,
        title: 'Frontend leader vẫn tự tay ship component.',
        body: 'Tôi dẫn team frontend 3–10 engineer, owner kiến trúc, design system dùng chung, chuẩn review và release — trên web, desktop Electron và iOS / Android từ codebase dùng chung. Tôi dùng Claude Code, Cursor và Copilot mỗi ngày, và mọi thay đổi vẫn có một engineer chịu trách nhiệm.',
        stats: [
          { k: 'Năm kinh nghiệm', v: YEARS },
          { k: 'Quy mô team frontend', v: '3–10' },
          { k: 'Năm làm React Native', v: '8' },
          { k: 'Nền tảng, một codebase', v: '4' },
        ],
      },
      skills: {
        ...vi.skills,
        title: 'Ba framework, một frontend.',
        center: 'Một frontend',
        cards: [
          { tag: 'RE', title: 'ReactJS', body: 'Design system, thư viện component, editor nhiều tài liệu, 3D và add-in Office trên React 19 và TypeScript.', chips: ['React 19', 'TypeScript', 'Design system', 'Zustand / Jotai', 'TanStack Query', 'Tiptap', 'Three.js', 'Add-in Word'], tips: ['Server Components, Actions, Suspense', 'Mọi frontend từ 2019', 'IRIS · Coca-Cola AR · Logically', 'Tầng state của Logically', 'Data fetching của Logically', 'Soạn thảo realtime với Hocuspocus', 'Avatar & scene của IRIS 3D', 'Cite · AI chat + trích dẫn trong Word'] },
          { tag: 'NX', title: 'Next.js', body: 'Sản phẩm App Router có server rendering, câu trả lời AI dạng stream và trang thân thiện SEO.', chips: ['App Router', 'Server Actions', 'SSR / SSG / ISR', 'Middleware', 'Streaming UI', 'Tailwind v4', 'shadcn/ui', 'MUI', 'Vercel AI SDK', 'Core Web Vitals'], tips: ['Web app Logically', 'Form và mutation', 'Trang public thân thiện SEO', 'Luật auth và routing', 'Câu trả lời LLM dạng stream trong Logically', 'Lựa chọn styling hiện tại', 'Bộ component trên Radix', 'UI kit của Logically và Cite', 'Streaming chat và generative UI', 'Tăng tốc màn hình nhiều tài liệu'] },
          { tag: 'RN', title: 'React Native', body: 'Tám năm, từ React Native thuần với native module và BLE tới Expo với EAS và cập nhật OTA.', chips: ['Expo / EAS', 'Expo Router', 'New Architecture', 'Reanimated', 'Liquid Glass UI', 'BLE mesh', 'Nhúng Unity', 'Redux-Saga', 'Detox', 'Release store'], tips: ['Logically mobile · Build, Submit, Update', 'Điều hướng của Logically', 'Fabric, TurboModules, JSI', 'UI điều khiển bằng cử chỉ', 'Thiết kế iOS 26 trên toàn app Logically', 'Lumi · điều khiển thiết bị và firmware OTA', 'Coca-Cola AR Training', 'Lumi · Coca-Cola AR', 'Bộ test của Coca-Cola AR', 'App Store & Google Play từ 2018'] },
        ],
      },
      tools: {
        ...vi.tools,
        title: 'Bộ công cụ frontend.',
        sub: 'Framework, thư viện và nền tảng tôi đã dùng để ship frontend — chia theo vị trí của chúng trong một sản phẩm.',
        languages: { title: 'Ngôn ngữ', tools: ['typescript', 'javascript', 'java', 'csharp'] },
        groups: [
          { id: 'web', title: 'Framework web & UI', body: 'Từ dashboard SaaS, editor tới trang public.', tools: ['react', 'nextjs', 'tailwind', 'shadcn', 'mui', 'vite', 'turborepo'] },
          { id: 'mobile', title: 'Mobile', body: 'React Native trên iOS và Android, thuần và Expo.', tools: ['reactnative', 'expo', 'android', 'firebase', 'bluetooth', 'mqtt'] },
          { id: 'desktop', title: 'Desktop, 3D & Office', body: 'Cùng code React trên nhiều màn hình hơn.', tools: ['electron', 'threejs', 'unity', 'word'] },
          { id: 'data', title: 'State, dữ liệu & cloud', body: 'State phía client, cache phía server, và nơi app chạy.', tools: ['redux', 'reactquery', 'recoil', 'nodejs', 'gcp', 'vercel'] },
          { id: 'quality', title: 'Test & release', body: 'Cách sản phẩm được kiểm tra và được ship.', tools: ['jest', 'vitest', 'testinglibrary', 'storybook', 'sentry', 'actions', 'fastlane', 'appstore', 'googleplay'] },
          { id: 'ai', title: 'AI trong quy trình', body: 'Coding agent và các model đứng sau sản phẩm.', tools: ['claude', 'cursor', 'copilot', 'openai', 'anthropic', 'gemini'] },
        ],
      },
      exp: {
        ...vi.exp,
        items: [
          { y: '5/2025 — Nay', org: 'Afforai (Logically)', role: 'Frontend Leader / Project Leader', loc: 'Remote', body: 'Owner frontend React / Next.js của một nền tảng nghiên cứu AI tại Mỹ, dẫn team 4 người. Soạn thảo cộng tác realtime (Tiptap + Hocuspocus), chuyển web app thành app Windows bằng Electron, app mobile Expo với giao diện iOS 26 Liquid Glass, và add-in trích dẫn cho Word.', from: '2025-05', to: null, tools: ['react', 'nextjs', 'typescript', 'reactnative', 'expo', 'electron', 'mui', 'reactquery', 'recoil', 'word', 'nodejs', 'gcp', 'stripe', 'claude', 'cursor'] },
          { y: '5/2024 — 5/2025', org: 'Công ty ẩn danh', role: 'Frontend Engineer (hợp đồng remote)', loc: 'Remote', body: 'Build feature ReactJS và TypeScript cho một sản phẩm web AI trong team phân tán: tích hợp REST và LLM, cải thiện hiệu năng và trải nghiệm UI, code review và hỗ trợ production.', from: '2024-05', to: '2025-05', tools: ['react', 'typescript', 'javascript', 'nodejs'] },
          { y: '3/2023 — 5/2024', org: 'akaVerse — FPT IS', role: 'Frontend Leader & Project Leader', loc: 'Hà Nội', body: 'IRIS (5 engineer): nền tảng React + Electron và design system dùng chung cho web và Windows, tuỳ biến avatar 3D bằng Three.js. Coca-Cola AR Training (10 người): app React Native + Unity, thư viện component, test Jest / Detox và release store. Đặt chuẩn frontend cho cả ba team.', from: '2023-03', to: '2024-05', tools: ['react', 'electron', 'threejs', 'reactnative', 'unity', 'csharp', 'redux', 'jest'] },
          { y: '12/2020 — 3/2023', org: 'FPT Telecom', role: 'Software Developer & Project Manager', loc: 'Hà Nội', body: 'Game vòng quay may mắn Phaser 3 / WebGL trên app HiFPT; dApp LearnR bằng ReactJS + CosmJS — Top 5 Aura Hackathon 2022; PM cho nền tảng FPT Partner (Flutter, ReactJS, .NET).', from: '2020-12', to: '2023-03', tools: ['react', 'javascript', 'rust', 'nodejs', 'flutter', 'java'] },
          { y: '10/2019 — 11/2020', org: 'Lumi Vietnam', role: 'Mobile Developer (React Native)', loc: 'Hà Nội', body: 'Ba app nhà thông minh — Lumi Life, RaliSmart, Eureka — với Redux-Saga, React Navigation, WebSocket và MQTT; điều khiển thiết bị qua BLE, provisioning mesh và cập nhật firmware OTA; tool debug bằng Electron; release App Store và Google Play.', from: '2019-10', to: '2020-11', tools: ['reactnative', 'javascript', 'redux', 'bluetooth', 'mqtt', 'firebase', 'electron'] },
          { y: '1/2018 — 10/2019', org: 'DigiMed / VJ-Soft', role: 'Mobile Developer (Android + RN)', loc: 'Hà Nội', body: 'Feature React Native và Android (Java) từ thiết kế Figma, Sketch; tích hợp REST API, Firebase, SQLite và SDK bên thứ ba.', from: '2018-01', to: '2019-10', tools: ['reactnative', 'android', 'java', 'javascript', 'firebase', 'figma'] },
          { y: '1/2018 — 6/2018', org: 'FPT Polytechnic', role: 'Trợ giảng', loc: 'Hà Nội', body: 'Hướng dẫn sinh viên các buổi lab Java, SQL, JavaScript, ReactJS và React Native.', from: '2018-01', to: '2018-06', tools: ['java', 'javascript', 'react', 'reactnative'] },
        ],
      },
      projects: {
        ...vi.projects,
        featured: {
          ...vi.projects.featured,
          sub: 'AI nghiên cứu, tóm tắt và trích dẫn tài liệu — một codebase React trên web, desktop, mobile và Word.',
          bullets: [
            'Owner kiến trúc frontend: Next.js, Zustand, Jotai, TanStack Query, MUI, DND-kit',
            'Build editor cộng tác realtime trên Tiptap + Hocuspocus',
            'Tầng domain và API TypeScript dùng chung cho app web, Electron và React Native',
            'Đặt chuẩn frontend và tăng tốc các màn hình nhiều tài liệu',
          ],
          stack: ['React', 'Next.js', 'TypeScript', 'React Native', 'Expo', 'Electron', 'Tiptap', 'MUI', 'TanStack Query', 'Stripe'],
        },
        grid: [
          { name: 'Logically Desktop & Mobile', role: 'Frontend leader', body: 'Chuyển web app thành app Windows bằng Electron, và app Expo cho iOS, Android với giao diện iOS 26 Liquid Glass — trên cùng lõi TypeScript.', chips: ['Electron', 'React Native', 'Expo', 'EAS'], link: { label: 'logically.app', href: 'https://logically.app' } },
          { name: 'Afforai Cite Extension', role: 'Lead engineer', body: 'Add-in Microsoft Word để hỏi chatbot AI và chèn trích dẫn vào tài liệu. React + MUI + Tiptap + Recoil.', chips: ['MS Word', 'React', 'MUI', 'Tiptap'], link: { label: 'Microsoft AppSource', href: APPSOURCE } },
          { name: 'IRIS 3D Web/Desktop', role: 'Frontend lead — 5 người', body: 'Tuỳ biến avatar 3D, quần áo, phụ kiện và mở trải nghiệm VR/AR. Web + Windows từ một codebase React và design system.', chips: ['Three.js', 'Electron', 'React', 'Design system'], note: 'Nội bộ · không có ảnh công khai' },
          { name: 'Coca-Cola AR Training', role: 'Project lead & RN dev — 10 người', body: 'App React Native nhúng runtime Unity AR để đào tạo sales cho Coca-Cola Việt Nam; thư viện component, test Jest và Detox.', chips: ['React Native', 'Unity', 'Redux-Saga', 'Detox'], link: { label: 'Khách hàng · Coca-Cola Việt Nam', href: COKE } },
          { name: 'Lumi IoT Suite', role: 'Mobile dev', body: 'Điều khiển nhà thông minh qua BLE + MQTT trên iOS/Android — Lumi Life, RaliSmart, Eureka — có provisioning mesh và cập nhật firmware OTA.', chips: ['React Native', 'BLE', 'MQTT', 'Firebase'], link: { label: 'lumi.vn · Lumi Life', href: LUMI } },
          { name: 'LearnR (Aura Hackathon)', role: 'Project lead — 5 người', body: 'dApp Learn-to-Earn: frontend ReactJS + CosmJS trên smart contract Rust. Top 5 chung kết, 2022.', chips: ['React', 'CosmJS', 'Rust', 'Node'], link: { label: 'Recap hackathon · Aura Network', href: AURA_RECAP } },
        ],
      },
      metrics: {
        ...vi.metrics,
        items: [
          { v: YEARS, k: 'Năm ship sản phẩm', sub: 'Web, desktop và mobile' },
          { v: '8', k: 'Năm làm React Native', sub: 'Từ RN thuần tới Expo + EAS' },
          { v: '4', k: 'Nền tảng, một codebase', sub: 'Web · Windows · iOS/Android · Word' },
          { v: '10', k: 'Team lớn nhất đã dẫn', sub: 'Coca-Cola AR Training' },
          { v: 'Top 5', k: 'Aura Hackathon', sub: 'Blockchain track, 2022' },
          { v: '9.22', k: 'GPA / 10', sub: 'Thủ khoa FPT Polytechnic' },
        ],
      },
      awards: {
        ...vi.awards,
        awards: [
          { y: '2022', t: 'Top 5 — Aura Network Hackathon', s: 'Dẫn team 5 người build LearnR' },
          { y: '2019', t: 'Thủ khoa — FPT Polytechnic', s: 'Xếp thứ 1 toàn khoá tốt nghiệp' },
          { y: '2018', t: 'Best Student — React Native', s: 'FPT Polytechnic' },
          { y: '2018', t: 'Best Student — Advanced Android Programming', s: 'FPT Polytechnic' },
        ],
      },
      jd: {
        ...vi.jd,
        title: 'CV của tôi có hợp vị trí frontend của bạn?',
        sub: 'Thả JD React, Next.js hoặc React Native vào đây. Pipeline AI chấm điểm theo kinh nghiệm thật của tôi, từng bước một.',
      },
      contact: {
        ...vi.contact,
        title: 'Đang build sản phẩm React cho web và mobile?',
        composeLabel: 'Bạn đang build gì?',
        composePlaceholder: 'Kể tôi nghe về sản phẩm và stack…',
        composeSubject: 'Vị trí Frontend từ portfolio',
      },
    },
  },
};
