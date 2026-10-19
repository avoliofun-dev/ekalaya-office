# IMPLEMENTATION TASK — CONNECT AN EKALAYA 3D CHARACTER TO AI AND N8N

Inspect and extend the existing Ekalaya 3D Virtual Office project. Do not rebuild the project from scratch.

## Objective

Turn one existing 3D character into a functional AI employee named Luna, the AI Sales Assistant.

When a user interacts with Luna inside the 3D office, the user must be able to send a message, receive an AI response, and request supported business tasks.

## Step 1: Inspect the existing project

- Identify the framework, 3D engine, character asset, animation system, routing, authentication, backend, and database.
- Locate the existing character model and interaction mechanism.
- Reuse the existing character and animation assets.
- Do not replace the current office or break working features.
- Diagnose any existing loading or authentication issues before implementing the integration.

## Step 2: Character interaction

Implement:
- A clear interaction prompt when a user approaches or selects Luna.
- A chat panel that works on desktop and mobile.
- Conversation history and loading indicators.
- Error, retry, and empty states.
- Character states: idle, listening, thinking, speaking, working, completed, and error.
- A task result panel for structured actions such as opening the lead list.
- Keyboard and touch support.

Use the existing animation system. If suitable animations do not exist, provide graceful fallbacks.

## Step 3: Secure application backend

Create or extend a server-side endpoint such as:

POST /api/ai/character

Responsibilities:
- Authenticate the user using the existing authentication system.
- Validate organization membership and permissions.
- Validate and limit message size.
- Apply rate limits and AI usage quotas.
- Validate conversation ownership.
- Forward only the necessary information to the n8n workflow.
- Keep webhook secrets and provider API keys server-side.
- Validate the workflow response before returning it to the frontend.
- Return structured errors and request IDs.
- Never trust a user-supplied organization ID without verifying membership.
- Do not expose unrestricted CRM data or administrative operations to the AI.

Use the existing backend architecture. Do not introduce a second authentication system unnecessarily.

## Step 4: n8n integration

Read the n8n webhook endpoint from a server-side environment variable:

N8N_LUNA_WEBHOOK_URL

Use a separate secret or supported authentication method to protect the webhook.

Send a validated request containing:
- Character ID.
- User message.
- Authenticated user context.
- Authorized organization context.
- Conversation ID.
- Request ID.

Do not accept role permissions, payment status, or trusted identity directly from the browser.

Configure the n8n workflow:
1. Webhook trigger.
2. Input validation.
3. AI Agent or model node.
4. Approved tools for CRM and knowledge-base access.
5. Output validation.
6. Respond to Webhook.

Use the official n8n webhook and response configuration supported by the installed version.

Return a consistent response schema:
- success
- message
- character
- conversationId
- optional action
- optional requestId

Set timeouts and handle workflow failures without leaving the character in an endless thinking state.

## Step 5: Business tools

Start with read-only CRM functionality:
- Search authorized leads.
- Retrieve lead summaries.
- Retrieve approved product information.
- Draft follow-up messages.

Add write operations only after the read-only workflow passes tests.

For external messages or consequential changes:
- Show a preview.
- Require explicit user confirmation.
- Verify authorization again on the server.
- Record the operation in an audit log.

Do not allow arbitrary SQL, unrestricted URLs, arbitrary code execution, or unrestricted tool access from AI instructions.

## Step 6: Character animation integration

Map backend task status to existing animation states.

- Idle: default animation.
- Listening: attentive pose.
- Thinking: thinking animation.
- Working: working animation.
- Speaking: speaking animation when supported.
- Completed: success animation.
- Error: recoverable error state.

Use a safe fallback if any animation is unavailable.

Do not make the animation system dependent on the AI provider being online.

## Step 7: Configuration and deployment

Document the required environment variable names without exposing secret values.

Do not commit `.env` files or secrets to GitHub.

If the n8n workflow is unavailable, show a clear connection error. Never return a fabricated AI response.

Keep the webhook inaccessible to unauthorized users and validate all requests on the server.

## Step 8: Testing

Verify:
1. An authenticated user can open Luna's chat.
2. A real request reaches n8n.
3. A real AI response returns to the UI.
4. The character transitions through the correct states.
5. Unauthorized users cannot access the endpoint.
6. One organization cannot access another organization's CRM records.
7. Invalid requests and timeouts produce recoverable errors.
8. AI usage quotas are enforced.
9. Consequential actions require confirmation.
10. The interface works on mobile.
11. No secrets are exposed in the browser bundle.
12. The existing office remains functional if n8n is offline.

Implement the smallest working end-to-end integration first. Report modified files, configuration steps, test results, and anything that still requires manual setup. Do not claim success until the integration has been tested against a real n8n workflow and AI provider.