# MASTER PROMPT — TRANSFORM EKALAYA 3D VIRTUAL OFFICE INTO A PROFITABLE AI SaaS

## 1. ROLE AND MISSION

Act as a senior SaaS product architect, full-stack engineer, 3D web developer, AI automation engineer, UI/UX designer, cybersecurity engineer, and SaaS growth strategist.

Your mission is to transform the existing project:

https://ekalaya-office.vercel.app/

into a commercially viable, production-oriented SaaS platform named **Ekalaya AI Business Office**.

The product must combine:
- An immersive, realistic 3D virtual office.
- AI agents that perform useful business tasks.
- A business CRM and sales follow-up workspace.
- Subscription plans and usage limits.
- Secure customer accounts and an administrative dashboard.
- A scalable architecture for multiple companies and teams.

The goal is to create a product that customers are willing to pay for every month.

IMPORTANT: Do not merely create a beautiful landing page or a nonfunctional prototype. Prioritize working features, real data persistence, secure backend operations, measurable business value, and a clear path to revenue.

## 2. NON-NEGOTIABLE RULES

Before changing any code:

1. Inspect the complete existing codebase and understand its architecture.
2. Identify the current framework, routing, 3D engine, authentication, database, API integrations, and deployment configuration.
3. Preserve working features and existing project identity.
4. Identify the cause of any infinite loading state, especially a screen showing "MEMERIKSA AKSES KANTOR...".
5. Create an implementation plan based on the actual code.
6. Fix existing critical errors before introducing new features.
7. Avoid replacing the project with a generic template.
8. Never expose API keys, service-role credentials, or private secrets in browser code.
9. Never fake authentication, AI responses, payments, database records, or successful operations.
10. Never claim a feature is production-ready without verifying it.
11. Do not delete existing database tables or user data without explicit authorization and a verified migration plan.
12. Do not ask me to paste private production credentials into source code or chat.

Work incrementally. Implement the highest-value features first, test them, and then proceed to the next phase.

## 3. PRODUCT POSITIONING

Brand: Ekalaya AI Business Office.

Positioning:
"Your virtual office, powered by AI employees."

Target customers:
- Small and medium-sized businesses.
- Laptop and electronics retailers.
- Digital agencies and web development studios.
- Service businesses.
- Small startup teams.

Primary problem to solve:
Businesses lose time handling repetitive customer questions, forgetting to follow up with prospects, and preparing routine reports.

Primary value proposition:
Ekalaya provides one workspace to manage prospects, organize sales activities, and use AI assistance to complete repetitive business tasks.

The 3D office must be a functional interface to business tools, not just decoration.

Primary language: Indonesian.
Secondary language: English, if practical.
Currency: IDR.
Timezone: Asia/Jakarta.

## 4. DESIGN DIRECTION

Create a premium, realistic, immersive virtual office experience.

Visual direction:
- Modern technology startup headquarters.
- Realistic 3D architecture and materials.
- Warm natural lighting with premium neutral colors.
- Glass partitions, wood, concrete, plants, desks, and monitors.
- Professional typography.
- Clean SaaS dashboard components.
- Smooth but restrained animations.
- Responsive design for desktop, laptop, tablet, and Android phones.

The product should feel like a real digital workplace, not a cartoon game.

Preserve and improve the existing 3D scene if it already works.

Optimize 3D assets, lighting, draw calls, loading, and memory usage. Support a lightweight interface or reduced-motion mode for lower-end devices.

On mobile, provide touch controls and accessible alternatives to walking through the office.

## 5. PUBLIC WEBSITE AND SALES LANDING PAGE

Create a conversion-focused public landing page with:

- Hero section explaining the product in plain language.
- Primary CTA: "Mulai Gratis".
- Secondary CTA: "Lihat Demo Kantor 3D".
- Interactive preview of the virtual office.
- Clear explanations of available AI agents.
- Business use cases and example workflows.
- Pricing comparison.
- Frequently asked questions.
- Contact and support information.
- Terms of service and privacy policy.
- Clear explanation of free-plan limitations.

Do not invent customer testimonials, company logos, revenue figures, or performance statistics.

Use a real interactive demo or an explicitly labeled sample environment.

Track meaningful conversion events, subject to appropriate privacy and consent requirements.

## 6. 3D VIRTUAL OFFICE

The office should contain interactive workstations:

A. Reception
- Welcome screen.
- Account and organization information.
- Quick navigation.

B. Sales Department
- Sales AI agent.
- Prospect list.
- Follow-up queue.
- Sales activity summary.

C. Customer Service Department
- AI-assisted customer responses.
- Knowledge base.
- Conversation history.

D. Operations Department
- Task management.
- Document generation.
- Routine reports.

E. Meeting Room
- Team workspace.
- Meeting notes.
- AI meeting summaries if a real meeting/transcription integration is configured.

F. Administration Room
- Subscription information.
- Usage limits.
- Organization settings.

Every interactive workstation must open a real application panel or dashboard.

Implement:
- Keyboard and mouse navigation.
- Touch navigation for mobile.
- Clear interaction prompts.
- A conventional navigation menu.
- A loading indicator with timeout and recoverable errors.
- A fallback dashboard if the 3D engine fails.
- Persistent user settings where appropriate.

Do not force users to navigate a 3D environment just to access essential business functions.

## 7. AI AGENTS — CORE REVENUE FEATURE

Build the first useful agent before building many agents.

### Agent 1: AI Sales Assistant

Capabilities:
- Draft responses to customer inquiries.
- Organize leads and sales opportunities.
- Generate personalized follow-up messages using approved customer information.
- Suggest follow-up schedules.
- Summarize sales activity.
- Recommend next steps based on lead status.
- Answer product questions using a configured knowledge base.

The agent must not invent product specifications, prices, stock availability, discounts, or policies.

If information is missing, it must say so.

### Agent 2: AI Customer Service Assistant

Capabilities:
- Search an approved FAQ and product knowledge base.
- Draft customer service responses.
- Classify incoming questions.
- Identify questions requiring human assistance.
- Summarize conversation history.

### Agent 3: AI Operations Assistant

Capabilities:
- Create task drafts.
- Summarize business documents.
- Prepare routine reports.
- Convert instructions into structured task lists.

### AI execution requirements

Use a real AI provider through a secure server-side integration.

- Keep provider API keys server-side.
- Use environment variables and server-side API routes.
- Apply authentication, authorization, rate limits, and usage quotas.
- Log task status and relevant usage metadata without unnecessarily storing sensitive content.
- Provide loading, success, retry, and failure states.
- Handle provider errors and timeouts.
- Provide a user-configurable knowledge base.
- Prevent unauthorized cross-tenant data access.
- Require confirmation before sending messages externally, spending money, modifying important records, or performing irreversible actions.

Do not present a simulated answer as an actual AI operation.

If API credentials are unavailable, create a clearly labeled setup screen and a testable integration interface. Do not fabricate a successful provider response.

## 8. CRM AND SALES WORKSPACE

Implement a real CRM with persistent database storage.

Core entities:
- Organizations.
- Organization memberships.
- Leads.
- Customers.
- Products.
- Sales activities.
- Follow-up tasks.
- Notes.
- AI task history.

Lead fields:
- Name.
- Contact information.
- Source.
- Interest or product.
- Lead status.
- Assigned team member.
- Last contact.
- Next follow-up date.
- Notes.
- Creation timestamp.

Lead statuses:
- New.
- Contacted.
- Interested.
- Negotiation.
- Won.
- Lost.

Required features:
- Add, edit, view, search, and archive leads.
- Filter and sort lead lists.
- View lead activity history.
- Generate AI follow-up drafts.
- Copy messages for manual sending.
- Mark follow-up tasks complete.
- View simple sales pipeline statistics.

Never automatically send marketing messages without the required authorization, appropriate consent, and configured integration.

For WhatsApp, use an officially supported WhatsApp Business Platform integration where applicable. If it is not configured, provide copy-and-send functionality instead of pretending messages were sent.

## 9. SAAS SUBSCRIPTIONS AND MONETIZATION

Implement a subscription-ready architecture with configurable plans.

Suggested initial pricing for validation:

### Free
- One user.
- Limited CRM records.
- Limited AI requests.
- Access to the basic office and demo agents.
- No expensive automated workflows.

### Starter — Rp99,000/month
- One organization.
- Small team or individual workspace.
- Basic CRM.
- Limited AI usage.
- Sales follow-up drafts.
- Basic reports.

### Business — Rp299,000/month
- Multiple team members within configured limits.
- Expanded CRM.
- Higher AI quotas.
- Team task management.
- Sales reports.
- Shared knowledge base.

### Pro — Rp699,000/month
- Higher configurable limits.
- Advanced reports.
- Expanded agent capabilities.
- More team seats.
- Priority support, if actually available.

Treat these amounts as test prices, not validated market prices.

Make plan features, quotas, and prices configurable from the backend.

Show the total price and billing period clearly. Explain renewal, cancellation, and any applicable taxes.

### Payment integration

Design a secure payment abstraction that can support an Indonesian payment provider such as Midtrans or Xendit, subject to account approval and actual integration availability.

Requirements:
- Use the provider's official server-side SDK or API.
- Create payment requests on the server.
- Verify webhook signatures.
- Make webhook processing idempotent.
- Store transaction status and provider references.
- Activate paid entitlements only after verified payment confirmation.
- Handle pending, successful, failed, expired, refunded, and canceled transactions where supported.
- Never trust a payment-success redirect alone.
- Never store raw payment card credentials.
- Do not claim that payment integration is live until sandbox tests pass and production credentials are configured.

If payment credentials are missing, implement a clearly labeled sandbox or pending-integration state without charging users.

## 10. AUTHENTICATION AND MULTI-TENANT ARCHITECTURE

Support:
- Registration.
- Login.
- Logout.
- Password recovery.
- Email verification when supported.
- Organization creation.
- Organization invitations if implemented.
- Membership roles.
- Account and organization settings.

Suggested roles:
- Platform Owner.
- Platform Administrator.
- Organization Owner.
- Organization Admin.
- Manager.
- Member.

Enforce role permissions on the server and database.

Users must only access data belonging to their authorized organization.

Never rely exclusively on hidden buttons or frontend role checks.

If the project uses Supabase:
- Inspect the existing schema before modifying it.
- Review Row Level Security policies.
- Review authentication triggers and profile creation.
- Ensure organization membership is validated.
- Avoid permissive policies such as unrestricted access to all authenticated users.
- Keep service-role keys server-side.
- Create reversible, versioned SQL migrations.
- Preserve existing user records.
- Test both authorized and unauthorized access.

Do not introduce a second authentication system if the existing one can be repaired and reused.

## 11. ADMIN DASHBOARD

Build a secure platform administration dashboard with:

- User and organization management.
- Subscription and entitlement status.
- Payment and transaction history.
- AI usage and estimated provider costs.
- Active and inactive accounts.
- Failed background jobs.
- Error monitoring.
- Configurable plans and quotas.
- Support requests.
- Audit logs.
- Feature flags.
- Basic revenue reporting.

Separate platform administration from organization-level administration.

Only authorized platform administrators can access platform-wide data.

Never expose passwords, private keys, or unrestricted sensitive customer information in dashboard tables.

Revenue reports must use actual verified transaction records. Distinguish gross revenue from refunds, payment fees, operating costs, and estimated profit.

## 12. DATABASE AND BACKEND

Inspect and reuse the existing database where appropriate.

Create a normalized, migration-based schema for:
- Profiles.
- Organizations.
- Organization memberships.
- Leads.
- Products and knowledge base entries.
- Follow-up tasks.
- AI task records.
- Plans and entitlements.
- Subscription records.
- Payment transactions.
- Usage records.
- Audit logs.

Requirements:
- Appropriate foreign keys and indexes.
- Timestamps and ownership fields.
- Server-side input validation.
- Consistent error responses.
- Pagination for large lists.
- Safe handling of concurrent updates.
- Database access restrictions.
- Backups and a documented recovery strategy.

Avoid storing unnecessary personal data.

Define retention and deletion policies for customer data.

## 13. TECHNICAL QUALITY AND PERFORMANCE

Preserve the current technology stack unless a documented technical reason justifies changing it.

Inspect package versions, routes, components, API endpoints, and deployment setup.

Requirements:
- No infinite loading states.
- No unhandled promise rejections.
- No secrets committed to source control.
- No fake production data mixed with real customer data.
- No nonfunctional buttons.
- No public admin bypass.
- No unrestricted database access.
- No hardcoded payment success.
- No AI quota bypass.
- No cross-tenant information leakage.

Add:
- Error boundaries.
- Meaningful logs.
- Input validation.
- Rate limiting.
- Appropriate security headers.
- Accessible forms and keyboard navigation.
- Responsive layouts.
- Production build checks.

Optimize 3D assets and lazy-load nonessential resources.

Keep the dashboard usable if 3D rendering fails.

## 14. ANALYTICS AND GROWTH

Track meaningful product events:
- Registration completed.
- First organization created.
- First lead created.
- First AI task completed.
- First follow-up draft generated.
- Pricing page viewed.
- Checkout initiated.
- Payment verified.
- Subscription canceled.

Use privacy-conscious analytics and avoid collecting unnecessary personal information.

Provide a basic funnel report so the owner can identify where users abandon onboarding.

Do not use fake urgency, deceptive subscription flows, or hidden cancellation mechanisms.

## 15. IMPLEMENTATION PHASES

### Phase 1 — Audit and repair
- Inspect the repository.
- Diagnose the access-check loading issue.
- Verify the current application build.
- Identify broken integrations and security risks.
- Produce a prioritized report.

### Phase 2 — Minimum viable product
- Stabilize authentication.
- Implement organization isolation.
- Build functional CRM.
- Build the first AI Sales Assistant.
- Integrate the agent with the approved knowledge base.
- Add usage quotas.
- Make the office's interactive objects open real features.

### Phase 3 — Monetization
- Add pricing and entitlements.
- Integrate payment sandbox.
- Verify webhook handling.
- Test subscription activation and expiration.
- Add usage tracking and cost monitoring.

### Phase 4 — Administration and polish
- Build admin dashboard.
- Improve mobile controls.
- Optimize 3D performance.
- Add logs, error monitoring, and recovery documentation.

### Phase 5 — Production verification
- Run automated tests.
- Test account isolation.
- Test role permissions.
- Test AI provider failures and quotas.
- Test payment webhook scenarios.
- Verify the production build.
- Document remaining limitations.

Do not attempt to build every phase simultaneously if it risks breaking the existing application. Deliver a working and tested increment at each phase.

## 16. TESTING AND ACCEPTANCE CRITERIA

The project is not complete merely because it compiles.

Verify these end-to-end scenarios:

1. A new user can register and log in.
2. The user can create an organization.
3. The user can create and edit a lead.
4. The AI can generate a response grounded in approved business information.
5. AI usage is recorded and quotas are enforced.
6. A user cannot access another organization's leads by changing an ID.
7. An unauthorized user cannot access platform administration.
8. Payment sandbox events update transaction status correctly.
9. Invalid or duplicate webhooks do not activate duplicate entitlements.
10. A canceled or expired subscription is handled according to the entitlement policy.
11. The application remains usable when the AI provider is unavailable.
12. The application remains usable when 3D rendering fails.
13. Mobile navigation and essential actions work on a narrow screen.
14. No secrets are exposed in client bundles or committed configuration files.
15. The production build and relevant automated tests pass.

For each test, report:
- Pass, fail, or blocked.
- Evidence or test output.
- Root cause of failures.
- Remaining risks.
- Recommended next action.

## 17. REQUIRED DELIVERABLES

At the end of implementation, provide:

1. A summary of the original project architecture.
2. A list of existing bugs and security findings.
3. A list of files changed and why.
4. Database migrations and deployment instructions.
5. Required environment variable NAMES, without secret values.
6. AI and payment provider setup instructions.
7. A list of verified features.
8. A list of unverified or incomplete features.
9. Automated test results.
10. Deployment and rollback instructions.
11. A cost-control checklist for AI usage.
12. A practical launch plan for acquiring the first three paying customers.

## FINAL INSTRUCTION

Start by auditing the existing Ekalaya repository and fixing the highest-priority real problem.

Then implement the smallest valuable, secure, testable version of Ekalaya AI Business Office that can be demonstrated to a real business customer.

Prioritize actual customer value, recurring revenue, data security, and operational reliability over decorative features.

Do not fabricate success. Report what actually works, what is blocked, and what still needs to be done.