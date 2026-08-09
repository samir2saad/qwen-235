# Varari AI Chat — Project README

Customer-service chatbot prototype for **Varari Global Laundry & Steam Pressing Co. W.L.L** (Kuwait). The assistant persona is **"Lara."** This README documents every component in the repo and how to wire in a RAG (Retrieval-Augmented Generation) system.

## 1. Repository Layout

```
d:\demos\qwen 235\                     (repo root)
├── varari-ai-chat/                    ← the runnable app (see §2)
├── varari prompt.txt                  ← early draft of the system prompt
├── varari_prompt_v2.txt               ← later draft; describes a file-based KB pattern that was never implemented
├── varari_api_examples.md             ← curl examples for calling OpenRouter directly
├── varari_api_collection.sh           ← same examples as a shell script
├── curl.txt                           ← raw curl/JSON payload sample
├── varari_branches (1).txt            ← source list of the 24 branch locations (used to hand-build the prompt)
└── README.md                          ← this file
```

> **Note:** `Varari_aboutUs.txt`, `laundry_prices.txt`, and `varrari faqs.txt` were deleted from the working tree but still exist in git history (`git show HEAD:<path>`). They were the original source material for the About Us, pricing, and FAQ sections that got hand-copied into `server.js`'s system prompt — nothing in the app ever read them at runtime.

The root-level `.txt`/`.md`/`.sh` files are **authoring artifacts** (prompt drafts, API call examples) — not code the running app touches. All actual logic lives in `varari-ai-chat/`.

## 2. Application Components (`varari-ai-chat/`)

| Component | File | Purpose |
|---|---|---|
| Server / API | [server.js](varari-ai-chat/server.js) | Express app: config, system prompt, `/api/chat`, `/api/health` |
| Dependency manifest | [package.json](varari-ai-chat/package.json) | Declares `express`, `axios`, `cors`, `dotenv` |
| Env config | `.env` / `.env.example` | `OPENROUTER_API_KEY`, `PORT`, `NODE_ENV` |
| Frontend markup | [public/index.html](varari-ai-chat/public/index.html) | Chat widget page |
| Frontend logic | [public/script.js](varari-ai-chat/public/script.js) | Sends messages to `/api/chat`, renders replies |
| Frontend styling | [public/style.css](varari-ai-chat/public/style.css) | Chat UI look & feel |
| Launch helpers | `run-server.bat`, `start-server.bat` | Double-click launch on Windows |
| Docs | [README.md](varari-ai-chat/README.md), `HOW-TO-RUN.txt` | App-specific setup/run instructions |

### `server.js` breakdown

| Section | Lines |
|---|---|
| Express setup & middleware (cors, json, static) | 1–12 |
| OpenRouter config (API key, URL) | 14–16 |
| Hardcoded system prompt (identity, pricing, 24 branches, FAQs, formatting rules) | 18–312 |
| `POST /api/chat` — builds messages array, calls OpenRouter, returns reply | 315–365 |
| `GET /api/health` | 368–370 |
| Server start (`app.listen`) | 372–375 |

**Run it:** `cd varari-ai-chat && npm install && npm start` → serves on `http://localhost:3000`. Full instructions in [varari-ai-chat/README.md](varari-ai-chat/README.md).

## 3. Current Knowledge Architecture (no retrieval)

Every chat turn sends the model:

```
[ full static systemPrompt (server.js:18-312) ] + [ conversationHistory from client ] + [ latest user message ]
```

The entire pricing table, all 24 branches, About Us, and FAQs are included on **every single request**, regardless of what the user actually asked (`server.js:324-334`). There's no file reading at runtime, no chunking, no embeddings, no vector store, no tool-calling, and no multi-step agent loop — one chat-completion call per turn via `axios.post` to OpenRouter (`server.js:337-349`), model `qwen/qwen3-235b-a22b-07-25:free`.

This is the piece a RAG system replaces: instead of always sending everything, retrieve only the chunks relevant to the user's question.

## 4. Adding a RAG System

There are two integration shapes depending on what you already have:

- **§4.1 In-process (build it into this Node app)** — good if you don't have a RAG system yet and want to keep everything in one deployable.
- **§4.2 External service (plug in an existing RAG system)** — good if your RAG system already exists as its own API (e.g. a Python service backed by Chroma/Qdrant/Pinecone) and you just want this chatbot to call it.

Either way, the hook point in `server.js` is the same: **right before the `messages` array is built, at line 324**, replace the static `systemPrompt` content with retrieved, query-relevant context.

### 4.1 In-process integration

Steps:

1. **Chunk the knowledge base.** The 4 domains already map to source material: About Us, Pricing, Branches, FAQs (currently flattened into `systemPrompt`). Split each into small chunks (e.g. one chunk per garment category, one per branch, one per FAQ item).
2. **Embed the chunks** with an embeddings model. OpenRouter's free chat models don't necessarily include embeddings — use a dedicated embeddings provider (OpenAI `text-embedding-3-small`, Cohere, Voyage) or a fully local model (`@xenova/transformers` in Node) if you want to avoid a second API key.
3. **Store vectors in a local vector index.** For a project this size, a lightweight file-based index is enough — no need to stand up a server. Options: `vectra` (local, file-based, npm, zero infra) or `hnswlib-node`. Only reach for Chroma/Qdrant/Pinecone/pgvector if you expect this to grow well beyond a single laundry business's data.
4. **Add a retriever module**, e.g. `varari-ai-chat/retrieval/retriever.js`, exposing `retrieveContext(query, k)` that returns the top-k relevant chunks as text.
5. **Wire it into `server.js`** at the hook point:

```js
// server.js — inside app.post('/api/chat', ...), replacing the static systemPrompt usage
const { retrieveContext } = require('./retrieval/retriever');

const relevantContext = await retrieveContext(message, 5); // top-5 chunks for this query

const messages = [
    {
        role: "system",
        content: `${corePersonaPrompt}\n\n## RELEVANT CONTEXT\n${relevantContext}`
    },
    ...conversationHistory,
    { role: "user", content: message }
];
```

Keep a small **static core prompt** (persona, greeting protocol, formatting rules, strict "Varari-only" boundary — none of this needs retrieval) separate from the **retrieved factual context** (pricing/branches/FAQs — this is what gets swapped per query). Splitting `systemPrompt` into `corePersonaPrompt` + retrieved chunks is the main refactor.

### 4.2 Plugging in an existing external RAG system

If the RAG system already runs elsewhere (its own API, its own vector DB), treat it as just another HTTP call before OpenRouter:

```js
// server.js — call your existing RAG service, then call OpenRouter as before
const ragResponse = await axios.post(process.env.RAG_SERVICE_URL, {
    query: message,
    top_k: 5
});
const relevantContext = ragResponse.data.chunks.join('\n\n');

const messages = [
    { role: "system", content: `${corePersonaPrompt}\n\n## RELEVANT CONTEXT\n${relevantContext}` },
    ...conversationHistory,
    { role: "user", content: message }
];
```

Add `RAG_SERVICE_URL` (and any auth token it needs) to `.env` / `.env.example` alongside `OPENROUTER_API_KEY`.

### 4.3 Where a second LLM/agent would sit

If instead of (or in addition to) retrieval you want a **second LLM/agent** — e.g. a lightweight classifier/router model that decides intent before the main Lara persona responds, or a separate agent that handles a specific task (like quote calculation) — it plugs in at the same point: run it before the `messages` array is built at line 324, feed its output into the system/context message, then proceed with the existing OpenRouter call unchanged. The current code has no orchestration layer, so a second agent needs its own module (e.g. `varari-ai-chat/agents/router.js`) rather than being bolted onto `server.js` directly.

### 4.4 Vector DB quick comparison

| Option | Infra needed | Fit for this project |
|---|---|---|
| `vectra` (local, file-based) | None | ✅ Best fit — tiny dataset (4 knowledge domains), no server to run |
| `hnswlib-node` | None | ✅ Also fine, slightly more manual setup |
| Chroma | Local/self-hosted server | Overkill unless the KB grows a lot |
| Qdrant / Pinecone / pgvector | Hosted service or own infra | Only if scaling to many businesses/tenants, not just Varari |

## 5. Known Housekeeping

- **Hardcoded API key fallback**: `server.js:15` falls back to a literal OpenRouter key in source if the env var is missing. Remove before wider sharing/deployment.
- **Dependency drift**: `package.json` declares Express `^4.18.2` but the installed/locked version is Express `5.x`. Reconcile before adding new middleware.
- **No persistence**: conversation history is passed in from the client on every request; there's no server-side session store or database.
