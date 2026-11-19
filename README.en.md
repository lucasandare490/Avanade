# Planner Comercial — Tax Split

[Português](README.md) · **English** · [Español](README.es.md)

Project by **Squad 19** of the **Grow Up 2026.2** Technology Residency (Porto Digital and Faculdade Senac de Pernambuco, Recife, Brazil), built with partner company **Avanade**.

**See it running now:** https://avanade-frontend-xi.vercel.app/ (the API on Render's free plan may take up to 1 minute to wake up on first access).

## Install and run

**Requirements:** Git, JDK 21, Node.js 20.19+ (or 22.12+), Python 3 and curl. Docker is not needed.

**Linux or macOS, one command** (starts the API with a local database and the website):

```bash
git clone https://github.com/lucasandare490/Avanade.git && cd Avanade && ./scripts/dev.sh
```

**Windows (PowerShell)**, in two terminals, in the project folder:

```powershell
.\scripts\iniciar-backend-local.ps1 -Jdk 'C:\Program Files\Eclipse Adoptium\jdk-21.0.4.7-hotspot'
```

```powershell
npm.cmd --prefix frontend ci; npm.cmd run dev
```

**Demo only, no Java** (fictitious data in the browser):

```bash
cd frontend && npm ci && VITE_MODO_DADOS=demo npm run dev
```

**How to confirm it works**

1. Open http://127.0.0.1:5173: the Planner Comercial start screen appears.
2. Click **Sign in** and then **Sign up** to create an empty store. Or sign in with `gerente1@demo.local` and the password generated in `backend/.local/demo-password`.
3. The API answers `{"status":"UP"}` at http://127.0.0.1:8080/actuator/health.

Use the menu to switch the interface to English or Spanish and the theme to light, dark or system.

## The problem

Brazil's consumption Tax Reform (Constitutional Amendment 132/2023 and Complementary Law 214/2025) creates the IBS and CBS taxes and introduces **split payment**: the tax portion is separated automatically **at the moment the customer pays**, and the merchant receives only the net amount.

Today, the tax money enters the merchant's cash together with the sale and only leaves weeks later, on the tax due date. In between, it works as **working capital**: it pays suppliers, stock and salaries. With split payment, that money no longer comes in. Small and medium merchants lose working capital all at once. That is **decapitalization**. Without planning, a business that sells well can run out of cash to pay its bills.

So the core problem **is not how to pay the tax on each sale**, since split payment already does that by itself. It is **how to keep cash healthy when the tax leaves at the moment of the sale**.

## The solution

**Planner Comercial** helps merchants see decapitalization coming and get ahead of it:

- shows, sale by sale, how much went to tax, how much went to the payment fee and how much **actually entered the cash**;
- calculates actual cash (net inflows minus paid expenses) and weekly cash;
- projects cash for the coming days and warns when the scenario points to a deficit;
- simulates sales before they happen, to understand the impact of each percentage;
- explains the numbers in plain language, with rule-based analysis, no external AI and no changes to values;
- when cash is about to get tight, offers **working capital** from a partner bank or fintech inside the app, with every cost shown before contracting.

**Real persistence in PostgreSQL. Payments, split and taxes are simulated:** no money is transferred and no tax is paid. Example percentages are not legislation. Working capital already works with a simulated partner; cancellation is future work.

## What the system has

| Area | How it works |
|---|---|
| Secure sign-in | 15-minute temporary lock after 5 wrong passwords in a row. Each error shows how many attempts are left. It also has account recovery by email, an eye button to show the password, **Remember me** and **Don't have an account yet? Sign up** |
| Theme | Light, dark or follow the system, on every screen, chosen in the menu |
| Languages | Portuguese, English and Spanish on every screen, chosen in the menu |
| Explanations | An **i** icon next to each piece of information. It shows what it means on mouse hover, with the Tab key or with a tap on mobile |
| Sales and split | Simulated payment, split into tax, fee and net, historical rule and resuming a partial failure |
| Expenses | Recording paid expenses, search and a category suggestion confirmed by the person |
| Cash | Server totals, daily breakdown, weekly cash, manual projection with a deficit warning |
| Reports | Sales, expenses and tax breakdown by period, with full CSV |
| Working capital | Inside the app, without going to the bank. **Decapitalization diagnosis** (tax withheld, 30-day cash shortfall, coverage and recommendation), **bank and fintech offers compared by CET**, responsible lending (blocks installments above 50% of inflows), **cash before and after** over 12 weeks, contracting, installment payment, **early payoff with discount**, 7-day withdrawal, contract summary and immutable history. Simulated partners today; connecting a real partner is one class and a signed webhook. [Specification and integration](documentacao/INTEGRACAO-PARCEIRO-CREDITO.md) (in Portuguese) |
| Android | Kotlin POS client, local and integrated over HTTPS. Testing on a physical device is pending |

## Team and what each person did

| Person | Role in the squad | Recorded contributions |
|---|---|---|
| **Thayná Batista da Silva** | Scrum Master; design and prototyping; research; requirements documentation; README in Portuguese, English and Spanish; testing | High-fidelity prototype in [Figma](https://www.figma.com/make/tJXFL2o4nYoZnZARUCkBLQ/Planner-Comercial-MVP-Design); research and requirements gathering for Split Pay and Planner Comercial; requirements documentation. In the final delivery: corrected core problem (decapitalization); sign-in with lock, attempts warning, email recovery, eye button, Remember me and Sign up; light, dark and system themes; PT/EN/ES languages; **i** icons with explanations; audit checkers; new backend, unit and browser tests |
| **Kássio Lima de Oliveira** | Project code and deployment | Backend–frontend integration with persistence; operation recovery; secure password recovery flow; Supabase setup; deployment on Render (API) and Vercel (website); monitoring and backup routine |
| **Lucas André Cardoso de Lima** | Front-end code | First delivery of the web and Android frontends; trend comparison; integration contracts; review of the 516 criteria with evidence; weekly cash, sign-up and reports |
| **Kleysson Teixeira da Cruz Junior** | User interviews | User interviews; MVP README review; the project's [initial repository](https://github.com/Kleyssonteixeirapf/projeto-split-tributario) |
| **Heitor Sette Couto de Melo** | Pitch | Pitch deck presentation |
| **James Bernardino da Silva Neto** | Squad member | — |

Mentor: **Eryson Moreira** (Avanade). Class: GROWUP-SENAC-N2. The authorship of every code change can be checked in the [commit history](https://github.com/lucasandare490/Avanade/commits/main) and in [CHANGELOG.md](CHANGELOG.md).

## Project documents

- [Figma prototype](https://www.figma.com/make/tJXFL2o4nYoZnZARUCkBLQ/Planner-Comercial-MVP-Design) and [design documentation, tokens and screenshots](documentacao/design/README.md)
- [Squad 19 documentation folder](https://drive.google.com/drive/folders/1_4WXflZ5LvJ3yTbEgqiSV5Qw5S6jHoYp?usp=sharing)
- [Split Pay and Planner Comercial analysis and requirements gathering](https://docs.google.com/document/d/1QoIXru-uVBmSDMy6YKjTAkVvk_0Q2kk5_WnfubFtVPU/edit?usp=sharing)
- [Requirements documentation (V2)](https://docs.google.com/document/d/13OdFEBoY3y_6TPt6pDJQwXycZW9mGdwy/edit?usp=sharing)
- [Final delivery document (PDF, in Portuguese)](documentacao/entrega-final/Entrega_Final_GrowUp_Senac_Squad19_Planner_Comercial_Avanade.pdf)
- [Partial delivery](https://docs.google.com/document/d/16FiTQW6DRE6WRpWBlSeXzVHnP-lr3DfT/edit?usp=sharing)
- [Final delivery record](documentacao/ENTREGA-FINAL-2026-11-18.md) (in Portuguese): what changed, how it was tested and what is pending
- [API contract](backend/docs/API.md) · [Supabase integration](scripts/supabase/README.md) · [Production operation](documentacao/OPERACAO-PRODUCAO.md)

## Tests and audit

| What to test | Command |
|---|---|
| Backend (Java, embedded database) | `cd backend && ./mvnw test` |
| Frontend (unit) | `cd frontend && npm test` |
| Types and build | `cd frontend && npm run build` |
| Browser: sign-in, theme, languages, **i** icons and accessibility (starts the demo by itself) | `cd frontend && npm run test:e2e:entrega` |
| Browser against the real API | with `./scripts/dev.sh` running (use `LOGIN_RATE_LIMIT_PER_MINUTE=300` on the local server, since the suite logs in many times): `cd frontend && npx playwright test` |
| Every interface phrase translated | `node scripts/auditoria/verificar-traducoes.mjs` |
| No AI credit anywhere in the project | `node scripts/auditoria/verificar-sem-credito-ia.mjs` |
| Dark theme in sync with the light theme | `cd frontend && node scripts/gerar-tema-escuro.mjs --verificar` |
| Published site and API up to date | `node scripts/auditoria/site-producao.mjs` and `node scripts/auditoria/api-producao.mjs` |

The system is auditable: every change has an authored commit, the [CHANGELOG](CHANGELOG.md) summarizes what changed and anyone can run the checkers above.

## Security and privacy

- Passwords hashed with BCrypt. The access token is opaque, revocable and expires. The password is never stored in the browser.
- The sign-in lock lives on the server, stores only a hash of the email and answers the same way for registered and unregistered emails, so nobody can find out which accounts exist.
- **Remember me** keeps the token on this device until the session expires. Do not use it on a shared computer.
- The recovery link is valid for 30 minutes and only once, and the token travels in the URL `#` fragment, which never reaches server logs. Sending the email requires SMTP configured on the server (`SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`, `PASSWORD_RESET_FROM`, `PASSWORD_RESET_LINK_BASE`). Without it, the request is accepted and nothing is sent. Step by step (in Portuguese): [set up the recovery email](documentacao/CONFIGURAR-EMAIL-RECUPERACAO.md). In the local demo, the email is simulated by a link on the screen.
- No password, key or local database goes into the repository (`.env`, `backend/.local` and similar are in `.gitignore`).

## Folders

- `frontend/`: React 19, TypeScript and Vite website. Screens in `src/telas`; theme, languages and explanations in `src/preferencias`.
- `backend/`: Java 21, Spring Boot, PostgreSQL and Flyway API (migrations V1–V10).
- `android-pos/`: Kotlin POS app.
- `scripts/`: local run, Supabase, hosting and `auditoria/`.
- `documentacao/`: status, decisions, operations and history.
