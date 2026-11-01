import type { PageConfig } from '../types';
import { AURA_RECAP, CONTENT } from '../content';
import { yearsShipping } from '../yearsShipping';

/** "8+" or "9": counted from CAREER_START, recomputed on every load (see yearsShipping.ts). */
const YEARS = yearsShipping();
const { en, vi } = CONTENT;

const APPSOURCE = 'https://appsource.microsoft.com/en-us/product/office/wa200007444';

/** /fullstack — Fullstack Engineer, AI Product Builder and Project Leader. Same sections as the main page. */
export const FULLSTACK_PAGE: PageConfig = {
  orbit: {
    outer: [
      'logically', 'claude', 'typescript', 'nextjs', 'coke', 'nodejs', 'rag', 'postgres', 'openai', 'gcp', 'lumi', 'mongodb', 'sprint',
      'docker', 'gemini', 'rust',
    ],
    inner: ['react', 'reactnative', 'flutter', 'n8n', 'stripe', 'redis'],
    marquee: ['logically', 'claude', 'nextjs', 'nodejs', 'rag', 'postgres', 'openai', 'gcp', 'coke', 'gemini', 'docker', 'sprint', 'react', 'rust'],
  },
  content: {
    en: {
      ...en,
      hero: {
        ...en.hero,
        kicker: 'Fullstack · AI · Project Lead — Hanoi, UTC+7',
        roles: ['Fullstack Engineer', 'Project Leader', 'AI Product Builder'],
        tagline: 'From PRD to production — UI, API, cloud and the AI features in between.',
        meta: [`${YEARS} yrs shipping`, '3 LLM providers in prod', 'Teams of 3–10 led'],
      },
      about: {
        ...en.about,
        title: 'Builds the whole product, leads the team that ships it.',
        body: 'I take a product end to end: React / Next.js frontends, NodeJS APIs on MongoDB and PostgreSQL, Google Cloud infrastructure, React Native apps, and AI features on OpenAI, Anthropic and Gemini. As project leader I set the architecture, plan the sprint and review the code. I work AI-native every day — Claude Code, Cursor, MCP, n8n — and keep an engineer accountable for every change.',
        stats: [
          { k: 'Years shipping', v: YEARS },
          { k: 'LLM providers in prod', v: '3' },
          { k: 'Team size led', v: '3–10' },
          { k: 'Surfaces, one product', v: '4' },
        ],
      },
      skills: {
        ...en.skills,
        title: 'Three hats, one builder.',
        center: 'One builder',
        cards: [
          { tag: 'FS', title: 'Fullstack Engineering', body: 'React to Postgres to GCP: features owned across frontend, backend and cloud.', chips: ['React / Next.js', 'Node.js', 'PostgreSQL', 'MongoDB', 'GCP', 'Stripe & OAuth', 'React Native', 'Electron'], tips: ['Logically web app · SSR pages', 'Logically APIs: LLM, search, billing', 'Logically · pgvector', 'Logically data layer', 'App Engine, Cloud Run, Cloud SQL, CDN', 'Logically billing · Google/Okta/Microsoft sign-in', 'Logically mobile · Coca-Cola AR', 'Logically Windows app'] },
          { tag: 'AI', title: 'AI Product Builder', body: 'RAG with citations, multi-provider LLMs, agent workflows and fast AI prototypes.', chips: ['RAG', 'Streaming + citations', 'OpenAI', 'Anthropic', 'Gemini', 'Model tiers', 'Multi-agent', 'MCP', 'n8n', 'Claude Code'], tips: ['Retrieval over user documents in Logically', 'Logically answers', 'LLM provider in Logically prod', 'LLM provider in Logically prod', 'LLM provider in Logically prod', 'Standard, advanced and reasoning lineups', 'BA → Developer → Review → Tester', 'Tools and context for agents', 'LLM-triggered ops workflows', 'Daily driver for builds and reviews'] },
          { tag: 'PL', title: 'Project Leadership', body: 'Delivery and technical quality together: architecture, sprints, reviews and stakeholders.', chips: ['Architecture review', 'Code review', 'Sprint planning', 'PRDs & ACs', 'Teams of 3–10', 'Stakeholders', 'Release management', 'Risk mgmt', 'CI/CD', 'Agile/Scrum'], tips: ['Logically · fewer production incidents', 'Every team I lead', 'Logically · PeakApp', 'PeakApp PRD template', 'Logically 4 · Coca-Cola AR 10', 'BOD, CTO, Coca-Cola Vietnam', 'App Store, Google Play, GCP', 'FPT Partner · Coca-Cola AR', 'GitHub Actions · EAS', 'Every team since 2020'] },
        ],
      },
      tools: {
        ...en.tools,
        languages: { title: 'Languages', tools: ['typescript', 'javascript', 'java', 'csharp', 'rust', 'dart'] },
        groups: [
          { id: 'web', title: 'Frontend', body: 'Web, desktop and Office interfaces.', tools: ['react', 'nextjs', 'tailwind', 'shadcn', 'mui', 'electron', 'threejs'] },
          { id: 'backend', title: 'Backend & data', body: 'APIs, ORMs, queues and data stores.', tools: ['nodejs', 'express', 'nestjs', 'springboot', 'prisma', 'postgres', 'mongodb', 'redis'] },
          { id: 'ai', title: 'AI & agents', body: 'Models, retrieval sources and the agents I build with.', tools: ['claude', 'anthropic', 'openai', 'gemini', 'semanticscholar', 'n8n', 'cursor', 'copilot'] },
          { id: 'cloud', title: 'Cloud & DevOps', body: 'Where it runs and how it ships.', tools: ['gcp', 'vercel', 'cloudflare', 'docker', 'actions', 'sentry', 'github'] },
          { id: 'integrations', title: 'Integrations', body: 'Payments, sign-in, email and app backends.', tools: ['stripe', 'okta', 'sendgrid', 'firebase', 'supabase'] },
          { id: 'mobile', title: 'Mobile & Office', body: 'Apps on the same domain layer.', tools: ['reactnative', 'expo', 'flutter', 'word'] },
        ],
      },
      exp: {
        ...en.exp,
        items: [
          { y: 'Feb 2026 — Now', org: 'PeakApp', role: 'Product Owner / Product Lead', loc: 'Hanoi', body: 'Lead technical direction for the Flutter app and the NodeJS backend on AWS behind AI video apps for iOS and Android; review code and unblock developers. Validate new features with AI-generated UI prototypes (Claude Design) before engineering starts, and own PRDs, in-app purchase flows and store releases.', from: '2026-02', to: null, tools: ['flutter', 'dart', 'nodejs', 'claude', 'appstore', 'googleplay'] },
          { y: 'May 2025 — Now', org: 'Afforai (Logically)', role: 'Fullstack & Project Leader', loc: 'Remote', body: 'Own features end to end and lead a team of 4. NodeJS APIs for LLM orchestration, document search (Serper, Semantic Scholar), sign-in and Stripe billing on MongoDB and PostgreSQL; services on App Engine and Cloud Run; RAG with streamed, cited answers; an email automation system on SendGrid; and a multi-agent delivery pipeline.', from: '2025-05', to: null, tools: ['react', 'nextjs', 'typescript', 'nodejs', 'postgres', 'mongodb', 'gcp', 'openai', 'anthropic', 'gemini', 'semanticscholar', 'stripe', 'okta', 'sendgrid', 'electron', 'reactnative', 'n8n', 'claude'] },
          { y: 'May 2024 — May 2025', org: 'Undisclosed Company', role: 'Fullstack Developer (remote contract)', loc: 'Remote', body: 'ReactJS and NodeJS features for an AI-powered SaaS product in a distributed team; LLM-backed features integrated end to end; code review, testing and production support.', from: '2024-05', to: '2025-05', tools: ['react', 'typescript', 'nodejs'] },
          { y: 'Mar 2023 — May 2024', org: 'akaVerse — FPT IS', role: 'Project Leader & Frontend Leader', loc: 'Hanoi', body: 'Coca-Cola AR Training (10 members): a Unity AR prototype validated with business stakeholders, then the React Native + Unity build with a PHP backend through store release. IRIS (5 engineers): React + Electron base, design system and Three.js 3D avatars with VR/AR launching.', from: '2023-03', to: '2024-05', tools: ['reactnative', 'unity', 'csharp', 'react', 'electron', 'threejs', 'jest'] },
          { y: 'Dec 2020 — Mar 2023', org: 'FPT Telecom', role: 'Software Developer & Project Manager', loc: 'Hanoi', body: 'FID: data structures and Java Spring APIs on Oracle SQL for loyalty and gamification in CRM, plus a Phaser 3 lucky-draw game. LearnR: Rust smart contracts, a ReactJS + CosmJS dApp and a NodeJS / MongoDB backend — Top 5, Aura Hackathon 2022. PM for FPT Partner (7 members).', from: '2020-12', to: '2023-03', tools: ['java', 'springboot', 'rust', 'react', 'nodejs', 'mongodb', 'flutter', 'csharp'] },
          { y: 'Oct 2019 — Nov 2020', org: 'Lumi Vietnam', role: 'Mobile Developer (React Native)', loc: 'Hanoi', body: 'IoT apps (Lumi Life, RaliSmart, Eureka) with React Native, BLE, WebSocket, MQTT and Firebase on NodeJS / PHP backends; an Electron debugging tool; store releases.', from: '2019-10', to: '2020-11', tools: ['reactnative', 'bluetooth', 'mqtt', 'firebase', 'nodejs', 'electron'] },
          { y: 'Jan 2018 — Oct 2019', org: 'DigiMed / VJ-Soft', role: 'Mobile Developer (Android + RN)', loc: 'Hanoi', body: 'React Native and Android (Java) features from Figma and Sketch designs; REST APIs, Firebase, SQLite and third-party SDKs.', from: '2018-01', to: '2019-10', tools: ['android', 'reactnative', 'java', 'firebase', 'figma'] },
          { y: 'Jan 2018 — Jun 2018', org: 'FPT Polytechnic', role: 'Teaching Assistant', loc: 'Hanoi', body: 'Mentored students in Java, SQL, JavaScript, ReactJS and React Native lab sessions.', from: '2018-01', to: '2018-06', tools: ['java', 'javascript', 'react', 'reactnative'] },
        ],
      },
      projects: {
        ...en.projects,
        featured: {
          ...en.projects.featured,
          sub: 'AI document research, summarization & citation — features I own from the UI to the cloud.',
          bullets: [
            'RAG over user documents plus Serper and Semantic Scholar search, with cited, streamed answers',
            'OpenAI, Anthropic and Gemini behind one layer, tiered standard / advanced / reasoning',
            'NodeJS APIs for sign-in (Google, Okta, Microsoft) and Stripe billing on MongoDB + PostgreSQL',
            'Runs on App Engine and Cloud Run with Cloud SQL, Storage + CDN and Secret Manager',
          ],
          stack: ['Next.js', 'Node.js', 'PostgreSQL', 'MongoDB', 'GCP', 'OpenAI', 'Anthropic', 'Gemini', 'Stripe', 'SendGrid'],
        },
        grid: [
          { name: 'Multi-Agent Delivery System', role: 'Architect', body: 'BA → Developer → Review → Tester agents with automatic feedback loops, replacing manual handoffs across the feature cycle.', chips: ['LLM', 'n8n', 'MCP', 'Orchestration'], link: { label: 'See it below', href: '#agents' } },
          { name: 'Email Automation System', role: 'Builder', body: 'A SendGrid-based system for transactional and marketing email at Logically, replacing Mailchimp / Mandrill, plus n8n LLM workflows for operations.', chips: ['Node.js', 'SendGrid', 'n8n', 'LLM'] },
          { name: 'Afforai Cite Extension', role: 'Lead engineer', body: 'Microsoft Word add-in for in-document AI chat and citation insertion. React + MUI + Tiptap + Recoil.', chips: ['MS Word', 'React', 'MUI', 'Tiptap'], link: { label: 'Microsoft AppSource', href: APPSOURCE } },
          { name: 'PeakApp AI Video Apps', role: 'Product & tech lead', body: 'AI video apps for iOS and Android: Flutter app, NodeJS backend on AWS, in-app purchase. New features validated with AI-generated prototypes first.', chips: ['Flutter', 'Node.js', 'AWS', 'Claude Design'], note: 'Current role' },
          { name: 'LearnR (Aura Hackathon)', role: 'Project lead — 5 ppl', body: 'Idea to working dApp within a hackathon: Rust smart contracts, ReactJS + CosmJS and a NodeJS backend. Top 5 finalist, 2022.', chips: ['Rust', 'React', 'Node', 'CosmJS'], link: { label: 'Hackathon recap · Aura Network', href: AURA_RECAP } },
          { name: 'IRIS 3D Web/Desktop', role: 'Frontend lead — 5 ppl', body: 'Customize 3D avatars, accessories and scenes, and launch VR/AR experiences. Web + Windows from one React + Electron codebase.', chips: ['Three.js', 'Electron', 'React'], note: 'Internal · no public shots' },
        ],
      },
      metrics: {
        ...en.metrics,
        items: [
          { v: YEARS, k: 'Years shipping', sub: 'Web, desktop, mobile, backend' },
          { v: '3', k: 'LLM providers in prod', sub: 'OpenAI · Anthropic · Gemini' },
          { v: '4', k: 'Surfaces, one product', sub: 'Web · Windows · mobile · Word' },
          { v: '10', k: 'Largest team led', sub: 'Coca-Cola AR Training' },
          { v: 'Top 5', k: 'Aura Hackathon', sub: 'Rust + React dApp, 2022' },
          { v: '9.22', k: 'GPA / 10', sub: 'Valedictorian, FPT Polytechnic' },
        ],
      },
      jd: {
        ...en.jd,
        title: 'Does my CV fit your fullstack or AI role?',
        sub: 'Drop a fullstack, AI or tech-lead job description. An AI pipeline scores it against my real experience, stage by stage.',
      },
      contact: {
        ...en.contact,
        title: 'Have an AI product idea that needs to actually ship?',
        composeLabel: 'What do you need built?',
        composePlaceholder: 'Tell me what you need built…',
        composeSubject: 'Fullstack / AI role from your portfolio',
      },
    },
    vi: {
      ...vi,
      hero: {
        ...vi.hero,
        kicker: 'Fullstack · AI · Project Lead — Hà Nội, UTC+7',
        roles: ['Fullstack Engineer', 'Project Leader', 'AI Product Builder'],
        tagline: 'Từ PRD tới production — UI, API, cloud và các feature AI ở giữa.',
        meta: [`${YEARS} năm ship sản phẩm`, '3 LLM provider trên production', 'Lead team 3–10 người'],
      },
      about: {
        ...vi.about,
        title: 'Build cả sản phẩm, dẫn cả team ship nó.',
        body: 'Tôi làm sản phẩm end-to-end: frontend React / Next.js, API NodeJS trên MongoDB và PostgreSQL, hạ tầng Google Cloud, app React Native, và feature AI trên OpenAI, Anthropic, Gemini. Ở vai project leader, tôi đặt kiến trúc, lên sprint và review code. Tôi làm việc AI-native mỗi ngày — Claude Code, Cursor, MCP, n8n — và mọi thay đổi vẫn có một engineer chịu trách nhiệm.',
        stats: [
          { k: 'Năm kinh nghiệm', v: YEARS },
          { k: 'LLM provider trên production', v: '3' },
          { k: 'Quy mô team đã dẫn', v: '3–10' },
          { k: 'Nền tảng, một sản phẩm', v: '4' },
        ],
      },
      skills: {
        ...vi.skills,
        title: 'Ba vai, một người build.',
        center: 'Một người build',
        cards: [
          { tag: 'FS', title: 'Fullstack Engineering', body: 'Từ React tới Postgres tới GCP: owner feature trên cả frontend, backend và cloud.', chips: ['React / Next.js', 'Node.js', 'PostgreSQL', 'MongoDB', 'GCP', 'Stripe & OAuth', 'React Native', 'Electron'], tips: ['Web app Logically · trang SSR', 'API Logically: LLM, search, billing', 'Logically · pgvector', 'Tầng dữ liệu của Logically', 'App Engine, Cloud Run, Cloud SQL, CDN', 'Billing Logically · đăng nhập Google/Okta/Microsoft', 'Logically mobile · Coca-Cola AR', 'App Windows của Logically'] },
          { tag: 'AI', title: 'AI Product Builder', body: 'RAG có trích dẫn, LLM nhiều provider, workflow agent và prototype AI nhanh.', chips: ['RAG', 'Streaming + trích dẫn', 'OpenAI', 'Anthropic', 'Gemini', 'Phân tầng model', 'Multi-agent', 'MCP', 'n8n', 'Claude Code'], tips: ['Truy xuất trên tài liệu người dùng trong Logically', 'Câu trả lời của Logically', 'LLM provider trên production của Logically', 'LLM provider trên production của Logically', 'LLM provider trên production của Logically', 'Dải model standard, advanced, reasoning', 'BA → Developer → Review → Tester', 'Tool và context cho agent', 'Workflow vận hành kích hoạt bằng LLM', 'Dùng hằng ngày để build và review'] },
          { tag: 'PL', title: 'Project Leadership', body: 'Delivery đi cùng chất lượng kỹ thuật: kiến trúc, sprint, review và stakeholder.', chips: ['Review kiến trúc', 'Code review', 'Sprint planning', 'PRD & AC', 'Team 3–10 người', 'Stakeholder', 'Quản lý release', 'Quản trị rủi ro', 'CI/CD', 'Agile/Scrum'], tips: ['Logically · giảm sự cố production', 'Mọi team tôi dẫn', 'Logically · PeakApp', 'Mẫu PRD của PeakApp', 'Logically 4 · Coca-Cola AR 10', 'BOD, CTO, Coca-Cola Việt Nam', 'App Store, Google Play, GCP', 'FPT Partner · Coca-Cola AR', 'GitHub Actions · EAS', 'Mọi team từ 2020'] },
        ],
      },
      tools: {
        ...vi.tools,
        languages: { title: 'Ngôn ngữ', tools: ['typescript', 'javascript', 'java', 'csharp', 'rust', 'dart'] },
        groups: [
          { id: 'web', title: 'Frontend', body: 'Giao diện web, desktop và Office.', tools: ['react', 'nextjs', 'tailwind', 'shadcn', 'mui', 'electron', 'threejs'] },
          { id: 'backend', title: 'Backend & dữ liệu', body: 'API, ORM, queue và kho dữ liệu.', tools: ['nodejs', 'express', 'nestjs', 'springboot', 'prisma', 'postgres', 'mongodb', 'redis'] },
          { id: 'ai', title: 'AI & agent', body: 'Model, nguồn truy xuất và các agent tôi dùng để build.', tools: ['claude', 'anthropic', 'openai', 'gemini', 'semanticscholar', 'n8n', 'cursor', 'copilot'] },
          { id: 'cloud', title: 'Cloud & DevOps', body: 'Nơi sản phẩm chạy và cách nó được ship.', tools: ['gcp', 'vercel', 'cloudflare', 'docker', 'actions', 'sentry', 'github'] },
          { id: 'integrations', title: 'Tích hợp', body: 'Thanh toán, đăng nhập, email và backend cho app.', tools: ['stripe', 'okta', 'sendgrid', 'firebase', 'supabase'] },
          { id: 'mobile', title: 'Mobile & Office', body: 'App trên cùng tầng domain.', tools: ['reactnative', 'expo', 'flutter', 'word'] },
        ],
      },
      exp: {
        ...vi.exp,
        items: [
          { y: '2/2026 — Nay', org: 'PeakApp', role: 'Product Owner / Product Lead', loc: 'Hà Nội', body: 'Dẫn định hướng kỹ thuật cho app Flutter và backend NodeJS trên AWS của các app AI video iOS, Android; review code và gỡ blocker cho dev. Kiểm chứng feature mới bằng prototype UI do AI tạo (Claude Design) trước khi engineering bắt tay, owner PRD, luồng in-app purchase và release store.', from: '2026-02', to: null, tools: ['flutter', 'dart', 'nodejs', 'claude', 'appstore', 'googleplay'] },
          { y: '5/2025 — Nay', org: 'Afforai (Logically)', role: 'Fullstack & Project Leader', loc: 'Remote', body: 'Owner feature end-to-end, dẫn team 4 người. API NodeJS cho điều phối LLM, tìm tài liệu (Serper, Semantic Scholar), đăng nhập và billing Stripe trên MongoDB và PostgreSQL; service trên App Engine và Cloud Run; RAG trả lời dạng stream có trích dẫn; hệ thống email automation trên SendGrid; và pipeline delivery multi-agent.', from: '2025-05', to: null, tools: ['react', 'nextjs', 'typescript', 'nodejs', 'postgres', 'mongodb', 'gcp', 'openai', 'anthropic', 'gemini', 'semanticscholar', 'stripe', 'okta', 'sendgrid', 'electron', 'reactnative', 'n8n', 'claude'] },
          { y: '5/2024 — 5/2025', org: 'Công ty ẩn danh', role: 'Fullstack Developer (hợp đồng remote)', loc: 'Remote', body: 'Feature ReactJS và NodeJS cho một sản phẩm SaaS AI trong team phân tán; tích hợp feature LLM end-to-end; code review, test và hỗ trợ production.', from: '2024-05', to: '2025-05', tools: ['react', 'typescript', 'nodejs'] },
          { y: '3/2023 — 5/2024', org: 'akaVerse — FPT IS', role: 'Project Leader & Frontend Leader', loc: 'Hà Nội', body: 'Coca-Cola AR Training (10 người): prototype Unity AR được kiểm chứng với phía nghiệp vụ, rồi bản build React Native + Unity với backend PHP tới khi lên store. IRIS (5 engineer): nền React + Electron, design system và avatar 3D bằng Three.js có mở VR/AR.', from: '2023-03', to: '2024-05', tools: ['reactnative', 'unity', 'csharp', 'react', 'electron', 'threejs', 'jest'] },
          { y: '12/2020 — 3/2023', org: 'FPT Telecom', role: 'Software Developer & Project Manager', loc: 'Hà Nội', body: 'FID: cấu trúc dữ liệu và API Java Spring trên Oracle SQL cho loyalty và gamification trong CRM, cùng game vòng quay Phaser 3. LearnR: smart contract Rust, dApp ReactJS + CosmJS và backend NodeJS / MongoDB — Top 5 Aura Hackathon 2022. PM cho FPT Partner (7 người).', from: '2020-12', to: '2023-03', tools: ['java', 'springboot', 'rust', 'react', 'nodejs', 'mongodb', 'flutter', 'csharp'] },
          { y: '10/2019 — 11/2020', org: 'Lumi Vietnam', role: 'Mobile Developer (React Native)', loc: 'Hà Nội', body: 'App IoT (Lumi Life, RaliSmart, Eureka) bằng React Native, BLE, WebSocket, MQTT và Firebase trên backend NodeJS / PHP; tool debug bằng Electron; release store.', from: '2019-10', to: '2020-11', tools: ['reactnative', 'bluetooth', 'mqtt', 'firebase', 'nodejs', 'electron'] },
          { y: '1/2018 — 10/2019', org: 'DigiMed / VJ-Soft', role: 'Mobile Developer (Android + RN)', loc: 'Hà Nội', body: 'Feature React Native và Android (Java) từ thiết kế Figma, Sketch; tích hợp REST API, Firebase, SQLite và SDK bên thứ ba.', from: '2018-01', to: '2019-10', tools: ['android', 'reactnative', 'java', 'firebase', 'figma'] },
          { y: '1/2018 — 6/2018', org: 'FPT Polytechnic', role: 'Trợ giảng', loc: 'Hà Nội', body: 'Hướng dẫn sinh viên các buổi lab Java, SQL, JavaScript, ReactJS và React Native.', from: '2018-01', to: '2018-06', tools: ['java', 'javascript', 'react', 'reactnative'] },
        ],
      },
      projects: {
        ...vi.projects,
        featured: {
          ...vi.projects.featured,
          sub: 'AI nghiên cứu, tóm tắt và trích dẫn tài liệu — các feature tôi owner từ UI tới cloud.',
          bullets: [
            'RAG trên tài liệu người dùng cùng tìm kiếm Serper, Semantic Scholar, trả lời dạng stream có trích dẫn',
            'OpenAI, Anthropic và Gemini sau một tầng chung, chia standard / advanced / reasoning',
            'API NodeJS cho đăng nhập (Google, Okta, Microsoft) và billing Stripe trên MongoDB + PostgreSQL',
            'Chạy trên App Engine và Cloud Run với Cloud SQL, Storage + CDN và Secret Manager',
          ],
          stack: ['Next.js', 'Node.js', 'PostgreSQL', 'MongoDB', 'GCP', 'OpenAI', 'Anthropic', 'Gemini', 'Stripe', 'SendGrid'],
        },
        grid: [
          { name: 'Multi-Agent Delivery System', role: 'Architect', body: 'Các agent BA → Developer → Review → Tester có feedback loop tự động, thay bàn giao thủ công trong cả vòng đời feature.', chips: ['LLM', 'n8n', 'MCP', 'Orchestration'], link: { label: 'Xem bên dưới', href: '#agents' } },
          { name: 'Email Automation System', role: 'Builder', body: 'Hệ thống email giao dịch và marketing trên SendGrid cho Logically, thay Mailchimp / Mandrill, cùng workflow n8n dùng LLM cho vận hành.', chips: ['Node.js', 'SendGrid', 'n8n', 'LLM'] },
          { name: 'Afforai Cite Extension', role: 'Lead engineer', body: 'Add-in Microsoft Word để chat AI và chèn trích dẫn ngay trong tài liệu. React + MUI + Tiptap + Recoil.', chips: ['MS Word', 'React', 'MUI', 'Tiptap'], link: { label: 'Microsoft AppSource', href: APPSOURCE } },
          { name: 'PeakApp AI Video Apps', role: 'Product & tech lead', body: 'App AI video cho iOS và Android: app Flutter, backend NodeJS trên AWS, in-app purchase. Feature mới được kiểm chứng bằng prototype AI trước.', chips: ['Flutter', 'Node.js', 'AWS', 'Claude Design'], note: 'Vai trò hiện tại' },
          { name: 'LearnR (Aura Hackathon)', role: 'Project lead — 5 người', body: 'Từ ý tưởng tới dApp chạy được trong một kỳ hackathon: smart contract Rust, ReactJS + CosmJS và backend NodeJS. Top 5 chung kết, 2022.', chips: ['Rust', 'React', 'Node', 'CosmJS'], link: { label: 'Recap hackathon · Aura Network', href: AURA_RECAP } },
          { name: 'IRIS 3D Web/Desktop', role: 'Frontend lead — 5 người', body: 'Tuỳ biến avatar 3D, phụ kiện, scene và mở trải nghiệm VR/AR. Web + Windows từ một codebase React + Electron.', chips: ['Three.js', 'Electron', 'React'], note: 'Nội bộ · không có ảnh công khai' },
        ],
      },
      metrics: {
        ...vi.metrics,
        items: [
          { v: YEARS, k: 'Năm ship sản phẩm', sub: 'Web, desktop, mobile, backend' },
          { v: '3', k: 'LLM provider trên production', sub: 'OpenAI · Anthropic · Gemini' },
          { v: '4', k: 'Nền tảng, một sản phẩm', sub: 'Web · Windows · mobile · Word' },
          { v: '10', k: 'Team lớn nhất đã dẫn', sub: 'Coca-Cola AR Training' },
          { v: 'Top 5', k: 'Aura Hackathon', sub: 'dApp Rust + React, 2022' },
          { v: '9.22', k: 'GPA / 10', sub: 'Thủ khoa FPT Polytechnic' },
        ],
      },
      jd: {
        ...vi.jd,
        title: 'CV của tôi có hợp vị trí fullstack hay AI của bạn?',
        sub: 'Thả JD fullstack, AI hoặc tech lead vào đây. Pipeline AI chấm điểm theo kinh nghiệm thật của tôi, từng bước một.',
      },
      contact: {
        ...vi.contact,
        title: 'Có ý tưởng sản phẩm AI cần ship thật?',
        composeLabel: 'Bạn cần build gì?',
        composePlaceholder: 'Kể tôi nghe bạn cần build gì…',
        composeSubject: 'Vị trí Fullstack / AI từ portfolio',
      },
    },
  },
};
