import type { PageConfig } from '../types';
import { AURA_RECAP, CONTENT } from '../content';
import { yearsShipping } from '../yearsShipping';

/** "8+" or "9": counted from CAREER_START, recomputed on every load (see yearsShipping.ts). */
const YEARS = yearsShipping();
const { en, vi } = CONTENT;

const COKE = 'https://www.coca-cola.com/vn/vi';

/** /product — Product Owner and Project Manager. Same sections as the main page. */
export const PRODUCT_PAGE: PageConfig = {
  orbit: {
    outer: [
      'logically', 'sprint', 'jira', 'figma', 'coke', 'linear', 'rag', 'notion', 'appstore', 'claude', 'lumi', 'googleplay', 'confluence',
      'n8n', 'openai', 'trello',
    ],
    inner: ['flutter', 'reactnative', 'nodejs', 'gemini', 'firebase', 'gcp'],
    marquee: ['logically', 'sprint', 'jira', 'figma', 'coke', 'linear', 'notion', 'appstore', 'googleplay', 'claude', 'n8n', 'rag', 'trello', 'flutter'],
  },
  content: {
    en: {
      ...en,
      hero: {
        ...en.hero,
        kicker: 'Product Owner · Project Manager — Hanoi, UTC+7',
        roles: ['Product Owner', 'Project Manager', 'Product Lead'],
        tagline: 'From the board’s direction to the store release — and back into the backlog.',
        meta: [`${YEARS} yrs in software products`, '5+ yrs leading delivery', 'Teams of up to 10'],
      },
      about: {
        ...en.about,
        title: 'An engineer who owns the product.',
        body: 'I own products from idea to release: the PRD, user stories and acceptance criteria, a prioritised backlog, sprints across Design, Development and QA, and the App Store and Google Play release. Then I read the tickets and the feedback, and start the next round. Years of building React, React Native, Flutter and NodeJS apps keep my trade-offs realistic.',
        stats: [
          { k: 'Years in software', v: YEARS },
          { k: 'Years leading delivery', v: '5+' },
          { k: 'Largest team led', v: '10' },
          { k: 'Parallel workstreams', v: '6' },
        ],
      },
      skills: {
        ...en.skills,
        title: 'Three hats, one owner.',
        center: 'One owner',
        cards: [
          { tag: 'PO', title: 'Product Ownership', body: 'Direction to backlog: PRDs, stories and acceptance criteria, with priorities agreed with the board and engineering.', chips: ['PRDs', 'User stories & ACs', 'Roadmap', 'Backlog priorities', 'Feature definition', 'In-app purchase', 'Feedback loop', 'Stakeholder alignment'], tips: ['PeakApp · every feature starts with one', 'PeakApp · Logically', 'PeakApp with the BOD · Logically with the CTO', 'PeakApp · Logically', 'PeakApp AI video features', 'PeakApp plans, offers, upgrades', 'Logically tickets → user stories', 'BOD, CTO, Coca-Cola Vietnam'] },
          { tag: 'PM', title: 'Project & Delivery', body: 'Scope, milestones, resourcing and risk; Agile/Scrum for teams of up to 10, with honest status reporting.', chips: ['Agile/Scrum', 'Sprint planning', 'Milestones', 'Risk & issue logs', 'Resourcing', 'Status reporting', 'Release management', 'Kanban', 'Jira / Linear', 'Retrospectives'], tips: ['Every team since 2020', 'PeakApp · Logically · Coca-Cola AR', 'FPT Partner · Coca-Cola AR', 'Kept across FPT projects', 'Coca-Cola AR · mobile, Unity, backend', 'Stakeholders and management', 'App Store Connect · Play Console', 'Ops and support work', 'Daily tracking', 'FPT Telecom · akaVerse'] },
          { tag: 'AI', title: 'AI & Technical Depth', body: 'A hands-on background in mobile, web and AI, so estimates hold and blockers clear fast.', chips: ['AI video apps', 'LLM features', 'Multi-agent pipeline', 'n8n automation', 'React / Next.js', 'React Native', 'Flutter', 'Node.js', 'AWS / GCP', 'Code review'], tips: ['PeakApp', 'OpenAI, Anthropic, Gemini in Logically', 'BA → Developer → Review → Tester', 'Logically ops workflows', 'Logically web app', 'Logically mobile · Coca-Cola AR · Lumi', 'PeakApp mobile app', 'PeakApp & Logically backends', 'PeakApp on AWS · Logically on GCP', 'PeakApp · Logically · Coca-Cola AR'] },
        ],
      },
      tools: {
        ...en.tools,
        title: 'The product toolbox.',
        sub: 'Where I plan, write, track and release — and the stacks I review with engineers.',
        languages: { title: 'Languages', tools: ['typescript', 'javascript', 'dart', 'java'] },
        groups: [
          { id: 'plan', title: 'Planning & tracking', body: 'Roadmaps, backlogs and sprints.', tools: ['jira', 'linear', 'trello', 'notion'] },
          { id: 'docs', title: 'Specs & design hand-off', body: 'PRDs, flows and the screens behind them.', tools: ['confluence', 'figma', 'word'] },
          { id: 'release', title: 'Stores & monetisation', body: 'Getting it to users, and getting paid.', tools: ['appstore', 'googleplay', 'stripe', 'firebase'] },
          { id: 'ai', title: 'AI & automation', body: 'Models and agents the products and the team run on.', tools: ['claude', 'openai', 'anthropic', 'gemini', 'n8n', 'cursor'] },
          { id: 'eng', title: 'Engineering background', body: 'The stacks I review code in.', tools: ['react', 'nextjs', 'reactnative', 'flutter', 'nodejs', 'postgres', 'mongodb'] },
          { id: 'cloud', title: 'Cloud & delivery', body: 'Where it runs and how it ships.', tools: ['gcp', 'vercel', 'github', 'actions'] },
        ],
      },
      exp: {
        ...en.exp,
        items: [
          { y: 'Feb 2026 — Now', org: 'PeakApp', role: 'Product Owner / Product Lead', loc: 'Hanoi', body: 'Own AI video apps for iOS and Android, monetised through in-app purchase, from idea to release with the BOD: PRDs, user flows, stories and acceptance criteria, a prioritised backlog, sprints across Design, Dev and QA, subscription flows, and release cycles on App Store Connect and Google Play Console. Introduced a standard PRD template and release checklist.', from: '2026-02', to: null, tools: ['flutter', 'nodejs', 'appstore', 'googleplay', 'figma', 'claude'] },
          { y: 'May 2025 — Now', org: 'Afforai (Logically)', role: 'Project Leader / Frontend Leader', loc: 'Remote', body: 'Turn direction from the BOD and CTO into roadmaps, epics and sprint backlogs across six workstreams — web, Windows desktop, React Native mobile, Word add-in, email automation and GCP infrastructure. Lead a remote team of 4, turn tickets and feedback into user stories, and own production escalation.', from: '2025-05', to: null, tools: ['jira', 'linear', 'notion', 'figma', 'react', 'reactnative', 'nodejs', 'gcp', 'openai', 'anthropic', 'gemini', 'n8n', 'claude'] },
          { y: 'May 2024 — May 2025', org: 'Undisclosed Company', role: 'Software Engineer · AI SaaS (remote contract)', loc: 'Remote', body: 'Delivered features for an AI-powered web product in a distributed team — from user stories through sprint planning, estimates, code review and production support.', from: '2024-05', to: '2025-05', tools: ['react', 'typescript', 'nodejs'] },
          { y: 'Mar 2023 — May 2024', org: 'akaVerse — FPT IS', role: 'Project Leader & Frontend Leader', loc: 'Hanoi', body: 'Coca-Cola AR Training (acting PO / Project Leader, 10 members): from business requirements through UX specs to production release — scope, plans, resourcing, stakeholder reporting and conflict resolution. IRIS (5 engineers): aligned design and development on a consistent UX and release quality.', from: '2023-03', to: '2024-05', tools: ['reactnative', 'unity', 'react', 'electron', 'threejs', 'jira', 'figma'] },
          { y: 'Dec 2020 — Mar 2023', org: 'FPT Telecom', role: 'Project Manager & Software Developer', loc: 'Hanoi', body: 'FPT Partner (PM, 7 members): goals, success criteria, milestones and roadmap for a partner ordering and revenue-tracking platform, with blockers escalated early. LearnR (Project Lead, 5): researched the idea and wrote the proposal — Top 5, Aura Hackathon 2022. Scrum ceremonies and risk logs in Jira, Trello and Redmine.', from: '2020-12', to: '2023-03', tools: ['jira', 'trello', 'flutter', 'react', 'csharp', 'java'] },
          { y: 'Oct 2019 — Nov 2020', org: 'Lumi Vietnam', role: 'Mobile Developer (React Native)', loc: 'Hanoi', body: 'Built smart-home IoT apps (Lumi Life, RaliSmart, Eureka) with React Native, BLE, MQTT and Firebase, and managed App Store and Google Play releases.', from: '2019-10', to: '2020-11', tools: ['reactnative', 'bluetooth', 'mqtt', 'firebase', 'appstore', 'googleplay'] },
          { y: 'Jan 2018 — Oct 2019', org: 'DigiMed / VJ-Soft', role: 'Mobile Developer (Android + RN)', loc: 'Hanoi', body: 'Built mobile features from Figma and Sketch designs with REST APIs, Firebase and SQLite.', from: '2018-01', to: '2019-10', tools: ['android', 'reactnative', 'firebase', 'figma'] },
          { y: 'Jan 2018 — Jun 2018', org: 'FPT Polytechnic', role: 'Teaching Assistant', loc: 'Hanoi', body: 'Mentored students in Java, SQL, JavaScript, ReactJS and React Native lab sessions.', from: '2018-01', to: '2018-06', tools: ['java', 'javascript', 'react', 'reactnative'] },
        ],
      },
      projects: {
        ...en.projects,
        featured: {
          ...en.projects.featured,
          sub: 'AI research platform for searching, summarising and citing documents — delivered across six parallel workstreams.',
          bullets: [
            'Roadmaps, epics and sprint backlogs from BOD and CTO direction',
            'Six workstreams: web, Windows, mobile, Word add-in, email automation, GCP',
            'User feedback and support tickets turned into stories with acceptance criteria',
            'Architecture review and code-quality process to cut production incidents',
          ],
          stack: ['Roadmap', 'Sprints', 'Jira', 'Linear', 'Notion', 'Figma', 'React', 'React Native', 'Node.js', 'GCP'],
        },
        grid: [
          { name: 'PeakApp AI Video Apps', role: 'Product owner', body: 'AI video apps for iOS and Android, monetised through in-app purchase. PRDs, backlog, sprints and store releases with the BOD.', chips: ['PRD', 'In-app purchase', 'Flutter', 'App Store'], note: 'Current role' },
          { name: 'Coca-Cola AR Training', role: 'Acting PO / project lead — 10 ppl', body: 'Mobile AR sales training for Coca-Cola Vietnam, from business requirements and UX specs to production release.', chips: ['Scope', 'Stakeholders', 'React Native', 'Unity'], link: { label: 'Client · Coca-Cola Vietnam', href: COKE } },
          { name: 'FPT Partner Platform', role: 'Project manager — 7 ppl', body: 'Partner ordering and revenue-tracking platform. Goals, milestones, roadmap and early blocker escalation.', chips: ['Scrum', 'Roadmap', 'Flutter', '.NET'], note: 'Internal · no public shots' },
          { name: 'Email Automation System', role: 'Scoped & delivered', body: 'An internal system for transactional and marketing email at Logically, replacing Mailchimp.', chips: ['Scoping', 'SendGrid', 'Node.js', 'Logically'] },
          { name: 'LearnR (Aura Hackathon)', role: 'Project lead — 5 ppl', body: 'Researched the idea, wrote and presented the proposal, and led the build of a Learn-to-Earn dApp. Top 5 finalist, 2022.', chips: ['Proposal', 'Pitch', 'Rust', 'React'], link: { label: 'Hackathon recap · Aura Network', href: AURA_RECAP } },
          { name: 'Multi-Agent Delivery System', role: 'Architect', body: 'BA → Developer → Review → Tester agents with feedback loops, replacing manual handoffs across the feature cycle.', chips: ['LLM', 'n8n', 'Orchestration', 'Delivery'], link: { label: 'See it below', href: '#agents' } },
        ],
      },
      metrics: {
        ...en.metrics,
        items: [
          { v: YEARS, k: 'Years in software products', sub: 'Mobile, SaaS, IoT, AR' },
          { v: '5+', k: 'Years leading delivery', sub: 'Product and project' },
          { v: '10', k: 'Largest team led', sub: 'Coca-Cola AR Training' },
          { v: '6', k: 'Parallel workstreams', sub: 'Logically' },
          { v: '2', k: 'App stores released to', sub: 'App Store · Google Play' },
          { v: 'Top 5', k: 'Aura Hackathon', sub: 'Led a 5-person team, 2022' },
        ],
      },
      awards: {
        ...en.awards,
        awards: [
          { y: '2022', t: 'Top 5 — Aura Network Hackathon', s: 'Led a 5-person team building LearnR' },
          { y: '2019', t: 'Valedictorian — FPT Polytechnic', s: 'Ranked 1st in graduating cohort' },
          { y: '2018', t: 'Best Student — Agile Software Project Management', s: 'FPT Polytechnic' },
          { y: '2018', t: 'Best Student — Database', s: 'FPT Polytechnic' },
        ],
      },
      jd: {
        ...en.jd,
        title: 'Does my CV fit your product role?',
        sub: 'Drop a Product Owner or Project Manager job description. An AI pipeline scores it against my real experience, stage by stage.',
      },
      contact: {
        ...en.contact,
        title: 'Need someone to own the backlog and the release date?',
        composeLabel: 'What product do you need owned?',
        composePlaceholder: 'Tell me about the product, the team and the timeline…',
        composeSubject: 'Product role from your portfolio',
      },
    },
    vi: {
      ...vi,
      hero: {
        ...vi.hero,
        kicker: 'Product Owner · Project Manager — Hà Nội, UTC+7',
        roles: ['Product Owner', 'Project Manager', 'Product Lead'],
        tagline: 'Từ định hướng của ban lãnh đạo tới bản release trên store — rồi quay lại backlog.',
        meta: [`${YEARS} năm làm sản phẩm phần mềm`, '5+ năm dẫn delivery', 'Team tới 10 người'],
      },
      about: {
        ...vi.about,
        title: 'Một engineer làm chủ sản phẩm.',
        body: 'Tôi owner sản phẩm từ ý tưởng tới release: PRD, user story và acceptance criteria, backlog đã ưu tiên, sprint giữa Design, Development và QA, rồi release trên App Store và Google Play. Sau đó tôi đọc ticket và feedback để bắt đầu vòng tiếp theo. Nhiều năm build app React, React Native, Flutter và NodeJS giúp các trade-off của tôi luôn thực tế.',
        stats: [
          { k: 'Năm làm phần mềm', v: YEARS },
          { k: 'Năm dẫn delivery', v: '5+' },
          { k: 'Team lớn nhất đã dẫn', v: '10' },
          { k: 'Luồng việc song song', v: '6' },
        ],
      },
      skills: {
        ...vi.skills,
        title: 'Ba vai, một người làm chủ.',
        center: 'Một người làm chủ',
        cards: [
          { tag: 'PO', title: 'Product Ownership', body: 'Từ định hướng tới backlog: PRD, story và acceptance criteria, ưu tiên thống nhất với ban lãnh đạo và engineering.', chips: ['PRD', 'User story & AC', 'Roadmap', 'Ưu tiên backlog', 'Định nghĩa feature', 'In-app purchase', 'Vòng feedback', 'Thống nhất stakeholder'], tips: ['PeakApp · mọi feature bắt đầu từ PRD', 'PeakApp · Logically', 'PeakApp cùng BOD · Logically cùng CTO', 'PeakApp · Logically', 'Feature AI video của PeakApp', 'Gói, ưu đãi, nâng cấp của PeakApp', 'Ticket Logically → user story', 'BOD, CTO, Coca-Cola Việt Nam'] },
          { tag: 'PM', title: 'Dự án & Delivery', body: 'Scope, milestone, nguồn lực và rủi ro; Agile/Scrum cho team tới 10 người, báo cáo tiến độ trung thực.', chips: ['Agile/Scrum', 'Sprint planning', 'Milestone', 'Log rủi ro & issue', 'Phân bổ nguồn lực', 'Báo cáo tiến độ', 'Quản lý release', 'Kanban', 'Jira / Linear', 'Retrospective'], tips: ['Mọi team từ 2020', 'PeakApp · Logically · Coca-Cola AR', 'FPT Partner · Coca-Cola AR', 'Duy trì trong các dự án FPT', 'Coca-Cola AR · mobile, Unity, backend', 'Stakeholder và ban quản lý', 'App Store Connect · Play Console', 'Việc vận hành và hỗ trợ', 'Theo dõi hằng ngày', 'FPT Telecom · akaVerse'] },
          { tag: 'AI', title: 'AI & Chiều sâu kỹ thuật', body: 'Nền tảng thực chiến về mobile, web và AI, nên estimate đứng vững và blocker được gỡ nhanh.', chips: ['App AI video', 'Feature LLM', 'Pipeline multi-agent', 'Tự động hoá n8n', 'React / Next.js', 'React Native', 'Flutter', 'Node.js', 'AWS / GCP', 'Code review'], tips: ['PeakApp', 'OpenAI, Anthropic, Gemini trong Logically', 'BA → Developer → Review → Tester', 'Workflow vận hành của Logically', 'Web app Logically', 'Logically mobile · Coca-Cola AR · Lumi', 'App mobile PeakApp', 'Backend PeakApp & Logically', 'PeakApp trên AWS · Logically trên GCP', 'PeakApp · Logically · Coca-Cola AR'] },
        ],
      },
      tools: {
        ...vi.tools,
        title: 'Bộ công cụ sản phẩm.',
        sub: 'Nơi tôi lên kế hoạch, viết, theo dõi và release — và các stack tôi review cùng engineer.',
        languages: { title: 'Ngôn ngữ', tools: ['typescript', 'javascript', 'dart', 'java'] },
        groups: [
          { id: 'plan', title: 'Lập kế hoạch & theo dõi', body: 'Roadmap, backlog và sprint.', tools: ['jira', 'linear', 'trello', 'notion'] },
          { id: 'docs', title: 'Spec & bàn giao thiết kế', body: 'PRD, user flow và các màn hình đi kèm.', tools: ['confluence', 'figma', 'word'] },
          { id: 'release', title: 'Store & doanh thu', body: 'Đưa sản phẩm tới người dùng, và thu tiền.', tools: ['appstore', 'googleplay', 'stripe', 'firebase'] },
          { id: 'ai', title: 'AI & tự động hoá', body: 'Model và agent mà sản phẩm và team vận hành trên đó.', tools: ['claude', 'openai', 'anthropic', 'gemini', 'n8n', 'cursor'] },
          { id: 'eng', title: 'Nền tảng engineering', body: 'Các stack tôi review code.', tools: ['react', 'nextjs', 'reactnative', 'flutter', 'nodejs', 'postgres', 'mongodb'] },
          { id: 'cloud', title: 'Cloud & delivery', body: 'Nơi sản phẩm chạy và cách nó được ship.', tools: ['gcp', 'vercel', 'github', 'actions'] },
        ],
      },
      exp: {
        ...vi.exp,
        items: [
          { y: '2/2026 — Nay', org: 'PeakApp', role: 'Product Owner / Product Lead', loc: 'Hà Nội', body: 'Owner các app AI video cho iOS và Android, kiếm tiền qua in-app purchase, từ ý tưởng tới release cùng BOD: PRD, user flow, story và acceptance criteria, backlog đã ưu tiên, sprint giữa Design, Dev và QA, luồng subscription, và chu kỳ release trên App Store Connect và Google Play Console. Đưa vào mẫu PRD và checklist release chuẩn.', from: '2026-02', to: null, tools: ['flutter', 'nodejs', 'appstore', 'googleplay', 'figma', 'claude'] },
          { y: '5/2025 — Nay', org: 'Afforai (Logically)', role: 'Project Leader / Frontend Leader', loc: 'Remote', body: 'Biến định hướng từ BOD và CTO thành roadmap, epic và sprint backlog cho sáu luồng việc — web, desktop Windows, mobile React Native, add-in Word, email automation và hạ tầng GCP. Dẫn team remote 4 người, biến ticket và feedback thành user story, owner việc escalate sự cố production.', from: '2025-05', to: null, tools: ['jira', 'linear', 'notion', 'figma', 'react', 'reactnative', 'nodejs', 'gcp', 'openai', 'anthropic', 'gemini', 'n8n', 'claude'] },
          { y: '5/2024 — 5/2025', org: 'Công ty ẩn danh', role: 'Software Engineer · AI SaaS (hợp đồng remote)', loc: 'Remote', body: 'Bàn giao feature cho một sản phẩm web AI trong team phân tán — từ user story qua sprint planning, estimate, code review tới hỗ trợ production.', from: '2024-05', to: '2025-05', tools: ['react', 'typescript', 'nodejs'] },
          { y: '3/2023 — 5/2024', org: 'akaVerse — FPT IS', role: 'Project Leader & Frontend Leader', loc: 'Hà Nội', body: 'Coca-Cola AR Training (acting PO / Project Leader, 10 người): từ yêu cầu nghiệp vụ qua spec UX tới release production — scope, kế hoạch, nguồn lực, báo cáo stakeholder và xử lý xung đột. IRIS (5 engineer): thống nhất design và dev để UX và chất lượng release nhất quán.', from: '2023-03', to: '2024-05', tools: ['reactnative', 'unity', 'react', 'electron', 'threejs', 'jira', 'figma'] },
          { y: '12/2020 — 3/2023', org: 'FPT Telecom', role: 'Project Manager & Software Developer', loc: 'Hà Nội', body: 'FPT Partner (PM, 7 người): mục tiêu, tiêu chí thành công, milestone và roadmap cho nền tảng đặt hàng và theo dõi doanh thu đối tác, escalate blocker sớm. LearnR (Project Lead, 5 người): nghiên cứu ý tưởng và viết proposal — Top 5 Aura Hackathon 2022. Chạy Scrum và log rủi ro trên Jira, Trello, Redmine.', from: '2020-12', to: '2023-03', tools: ['jira', 'trello', 'flutter', 'react', 'csharp', 'java'] },
          { y: '10/2019 — 11/2020', org: 'Lumi Vietnam', role: 'Mobile Developer (React Native)', loc: 'Hà Nội', body: 'Build app IoT nhà thông minh (Lumi Life, RaliSmart, Eureka) bằng React Native, BLE, MQTT và Firebase, quản lý release App Store và Google Play.', from: '2019-10', to: '2020-11', tools: ['reactnative', 'bluetooth', 'mqtt', 'firebase', 'appstore', 'googleplay'] },
          { y: '1/2018 — 10/2019', org: 'DigiMed / VJ-Soft', role: 'Mobile Developer (Android + RN)', loc: 'Hà Nội', body: 'Build feature mobile từ thiết kế Figma, Sketch với REST API, Firebase và SQLite.', from: '2018-01', to: '2019-10', tools: ['android', 'reactnative', 'firebase', 'figma'] },
          { y: '1/2018 — 6/2018', org: 'FPT Polytechnic', role: 'Trợ giảng', loc: 'Hà Nội', body: 'Hướng dẫn sinh viên các buổi lab Java, SQL, JavaScript, ReactJS và React Native.', from: '2018-01', to: '2018-06', tools: ['java', 'javascript', 'react', 'reactnative'] },
        ],
      },
      projects: {
        ...vi.projects,
        featured: {
          ...vi.projects.featured,
          sub: 'Nền tảng AI tìm kiếm, tóm tắt và trích dẫn tài liệu — bàn giao trên sáu luồng việc song song.',
          bullets: [
            'Roadmap, epic và sprint backlog từ định hướng của BOD và CTO',
            'Sáu luồng việc: web, Windows, mobile, add-in Word, email automation, GCP',
            'Feedback người dùng và ticket hỗ trợ thành story có acceptance criteria',
            'Quy trình review kiến trúc và chất lượng code để giảm sự cố production',
          ],
          stack: ['Roadmap', 'Sprint', 'Jira', 'Linear', 'Notion', 'Figma', 'React', 'React Native', 'Node.js', 'GCP'],
        },
        grid: [
          { name: 'PeakApp AI Video Apps', role: 'Product owner', body: 'App AI video cho iOS và Android, kiếm tiền qua in-app purchase. PRD, backlog, sprint và release store cùng BOD.', chips: ['PRD', 'In-app purchase', 'Flutter', 'App Store'], note: 'Vai trò hiện tại' },
          { name: 'Coca-Cola AR Training', role: 'Acting PO / project lead — 10 người', body: 'Đào tạo sales bằng AR trên mobile cho Coca-Cola Việt Nam, từ yêu cầu nghiệp vụ và spec UX tới release production.', chips: ['Scope', 'Stakeholder', 'React Native', 'Unity'], link: { label: 'Khách hàng · Coca-Cola Việt Nam', href: COKE } },
          { name: 'FPT Partner Platform', role: 'Project manager — 7 người', body: 'Nền tảng đặt hàng và theo dõi doanh thu cho đối tác. Mục tiêu, milestone, roadmap và escalate blocker sớm.', chips: ['Scrum', 'Roadmap', 'Flutter', '.NET'], note: 'Nội bộ · không có ảnh công khai' },
          { name: 'Email Automation System', role: 'Scope & bàn giao', body: 'Hệ thống nội bộ gửi email giao dịch và marketing cho Logically, thay thế Mailchimp.', chips: ['Scoping', 'SendGrid', 'Node.js', 'Logically'] },
          { name: 'LearnR (Aura Hackathon)', role: 'Project lead — 5 người', body: 'Nghiên cứu ý tưởng, viết và thuyết trình proposal, dẫn team build dApp Learn-to-Earn. Top 5 chung kết, 2022.', chips: ['Proposal', 'Pitch', 'Rust', 'React'], link: { label: 'Recap hackathon · Aura Network', href: AURA_RECAP } },
          { name: 'Multi-Agent Delivery System', role: 'Architect', body: 'Các agent BA → Developer → Review → Tester có feedback loop, thay bàn giao thủ công trong cả vòng đời feature.', chips: ['LLM', 'n8n', 'Orchestration', 'Delivery'], link: { label: 'Xem bên dưới', href: '#agents' } },
        ],
      },
      metrics: {
        ...vi.metrics,
        items: [
          { v: YEARS, k: 'Năm làm sản phẩm phần mềm', sub: 'Mobile, SaaS, IoT, AR' },
          { v: '5+', k: 'Năm dẫn delivery', sub: 'Product và project' },
          { v: '10', k: 'Team lớn nhất đã dẫn', sub: 'Coca-Cola AR Training' },
          { v: '6', k: 'Luồng việc song song', sub: 'Logically' },
          { v: '2', k: 'Kho ứng dụng đã release', sub: 'App Store · Google Play' },
          { v: 'Top 5', k: 'Aura Hackathon', sub: 'Dẫn team 5 người, 2022' },
        ],
      },
      awards: {
        ...vi.awards,
        awards: [
          { y: '2022', t: 'Top 5 — Aura Network Hackathon', s: 'Dẫn team 5 người build LearnR' },
          { y: '2019', t: 'Thủ khoa — FPT Polytechnic', s: 'Xếp thứ 1 toàn khoá tốt nghiệp' },
          { y: '2018', t: 'Best Student — Agile Software Project Management', s: 'FPT Polytechnic' },
          { y: '2018', t: 'Best Student — Database', s: 'FPT Polytechnic' },
        ],
      },
      jd: {
        ...vi.jd,
        title: 'CV của tôi có hợp vị trí product của bạn?',
        sub: 'Thả JD Product Owner hoặc Project Manager vào đây. Pipeline AI chấm điểm theo kinh nghiệm thật của tôi, từng bước một.',
      },
      contact: {
        ...vi.contact,
        title: 'Cần người làm chủ backlog và cả ngày release?',
        composeLabel: 'Bạn cần người owner sản phẩm nào?',
        composePlaceholder: 'Kể tôi nghe về sản phẩm, team và timeline…',
        composeSubject: 'Vị trí Product từ portfolio',
      },
    },
  },
};
