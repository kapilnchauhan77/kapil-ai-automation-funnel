"""Generate per-client case-study draft pages from case/_template.html.

For each case in CASES below, the script:
  1. Reads case/_template.html
  2. Replaces every {{PLACEHOLDER}} with the case-specific value
  3. Removes the optional <section class="case-quote"> block if QUOTE_TEXT
     is empty
  4. Prepends a <!-- VERIFY: ... --> HTML comment listing the specific
     numeric claims that need spot-checking before publishing
  5. Writes the result to case/_drafts/<slug>.html

Drafts live in case/_drafts/ (a subfolder) so the deploy workflow doesn't
ship them — the workflow only globs case/*.html at top level. To publish
a draft, move it up one level:

    mv case/_drafts/<slug>.html case/<slug>.html
    git add case/<slug>.html && git commit && git push

Run from the repo root:

    python3 case/_drafts/_generate.py
"""
from __future__ import annotations

import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
TEMPLATE = HERE.parent / "_template.html"
OUT_DIR = HERE


def case(
    slug, client, industry, year, engagement, role,
    publish_date, meta_desc,
    headline_html, headline_plain, subtitle,
    metrics,         # list of 3 (value, label) tuples
    problem,         # list of 2 paragraphs
    solution_intro,
    solution_bullets,  # list of 4
    outcome,           # list of 2 paragraphs
    tech,              # list of up to 6 strings
    verify,            # list of strings — claims that need spot-checking
    quote=None,        # optional (text, author, role_str) tuple
):
    return {
        "slug": slug,
        "fields": {
            "CASE_SLUG": slug,
            "CLIENT_NAME": client,
            "INDUSTRY": industry,
            "YEAR": year,
            "ENGAGEMENT_TYPE": engagement,
            "ROLE": role,
            "PUBLISH_DATE": publish_date,
            "META_DESCRIPTION": meta_desc,
            "HEADLINE_HTML": headline_html,
            "HEADLINE_PLAIN": headline_plain,
            "SUBTITLE": subtitle,
            "METRIC_1_VALUE": metrics[0][0],
            "METRIC_1_LABEL": metrics[0][1],
            "METRIC_2_VALUE": metrics[1][0],
            "METRIC_2_LABEL": metrics[1][1],
            "METRIC_3_VALUE": metrics[2][0],
            "METRIC_3_LABEL": metrics[2][1],
            "PROBLEM_P1": problem[0],
            "PROBLEM_P2": problem[1],
            "SOLUTION_P1": solution_intro,
            "SOLUTION_BULLET_1": solution_bullets[0],
            "SOLUTION_BULLET_2": solution_bullets[1],
            "SOLUTION_BULLET_3": solution_bullets[2],
            "SOLUTION_BULLET_4": solution_bullets[3],
            "OUTCOME_P1": outcome[0],
            "OUTCOME_P2": outcome[1],
            "TECH_1": tech[0] if len(tech) > 0 else "",
            "TECH_2": tech[1] if len(tech) > 1 else "",
            "TECH_3": tech[2] if len(tech) > 2 else "",
            "TECH_4": tech[3] if len(tech) > 3 else "",
            "TECH_5": tech[4] if len(tech) > 4 else "",
            "TECH_6": tech[5] if len(tech) > 5 else "",
            "QUOTE_TEXT": quote[0] if quote else "",
            "QUOTE_AUTHOR": quote[1] if quote else "",
            "QUOTE_ROLE": quote[2] if quote else "",
        },
        "verify": verify,
        "has_quote": quote is not None,
    }


# ─── CASES ────────────────────────────────────────────────────────────────────

CASES = [
    case(
        slug="procys",
        client="Procys",
        industry="Document intelligence",
        year="2024",
        engagement="Custom build",
        role="AI/ML Solution Architect",
        publish_date="2026-05-26",
        meta_desc="How Procys cut per-invoice handling time from 12 minutes to under 3 with a context-aware AI document intelligence pipeline — invoice extraction, validation, and identity cross-checks.",
        headline_html="How Procys cut <em>per-invoice handling time</em> from 12 minutes to under 3.",
        headline_plain="How Procys cut per-invoice handling time from 12 minutes to under 3.",
        subtitle="A context-aware narrow-AI pipeline for invoice extraction, line-item validation, and identity cross-checks across thousands of documents a day.",
        metrics=[("12 → 2.5 min", "per-invoice handling time"),
                 ("97%", "field-level extraction accuracy"),
                 ("5×", "throughput per reviewer")],
        problem=[
            "Procys was handling thousands of supplier invoices a day across procurement and finance teams. The pipeline depended on humans reading PDFs, copying line items into a structured system, and cross-checking supplier and customer details on every entry. The same step ran twelve to fifteen minutes per invoice, on every invoice, in every workflow.",
            "Off-the-shelf OCR could read the text. It couldn't tell which numbers belonged to which line, validate against a purchase order, or flag a counterparty mismatch with the confidence needed to skip human review.",
        ],
        solution_intro="I built a context-aware narrow-AI pipeline combining OCR, LLM-driven layout reasoning, and deterministic validation. The system extracts header fields, line items, and tax breakdowns in a single pass, then runs CrossCheck — a validation step that compares supplier and customer identity data against the platform's historical records before anything is committed.",
        solution_bullets=[
            "OCR + LLM layout reasoning that handles unstructured invoice formats without per-vendor templates.",
            "Line-item extraction with per-field confidence scores, so reviewers see only what needs human eyes.",
            "CrossCheck identity validation comparing supplier / customer details against historical platform records.",
            "Exception routing — anything below the confidence threshold goes to a fast human-review queue with context attached.",
        ],
        outcome=[
            "Per-invoice handling time dropped from twelve minutes to two and a half. Reviewers stopped reading every line and started reading exceptions only — same headcount, five times the throughput.",
            "Extraction accuracy at the field level landed at 97% with confidence-scored exception handling for the rest. CrossCheck caught counterparty mismatches that manual reviewers had been missing under volume pressure.",
        ],
        tech=["Python", "FastAPI", "OpenAI", "AWS Textract", "PostgreSQL", "Docker"],
        verify=[
            "12 → 2.5 min per-invoice handling — confirm against real before/after timings",
            "97% field-level extraction accuracy — confirm the evaluation set",
            "5× throughput per reviewer — confirm against the headcount-vs-volume math",
        ],
    ),

    case(
        slug="openprovider",
        client="Openprovider",
        industry="Domain billing & reconciliation",
        year="2023",
        engagement="Custom build",
        role="AI/ML Solution Architect",
        publish_date="2026-05-26",
        meta_desc="How Openprovider reconciled 100k+ invoice lines a month across supplier and customer billing with CrossCheck — a multi-source matching engine on top of MySQL ETL + WHMCS data.",
        headline_html="How Openprovider reconciled <em>100k+ invoice lines</em> a month across supplier and customer billing.",
        headline_plain="How Openprovider reconciled 100k+ invoice lines a month across supplier and customer billing.",
        subtitle="A multi-source invoice-reconciliation engine that matches supplier billing, customer invoices, WHMCS data, and domain provisioning events in a single pass.",
        metrics=[("100k+", "invoice lines reconciled / month"),
                 ("92%", "auto-match rate"),
                 ("days → minutes", "reconciliation cycle")],
        problem=[
            "Openprovider's billing stretches across supplier invoices, customer invoices, WHMCS, and the MySQL ETL layer behind domain registrar operations. Each month the accounting team reconciled thousands of supplier invoice lines against customer invoices, domain renewals, and registrar billing — a manual process that took days and quietly let late catches slip through.",
            "The complication wasn't volume alone. It was that supplier and customer line items rarely matched exactly. Names varied, currencies converted at different points, dates shifted by days. Off-the-shelf reconciliation tools assumed clean keys; the real data didn't have them.",
        ],
        solution_intro="I built CrossCheck — a multi-source reconciliation engine that ingests supplier invoices, customer invoices, WHMCS billing, domain provisioning events, and the MySQL ETL layer, then matches lines using a tiered strategy: exact key → semantic + numeric tolerance → context-aware fallback → human-routed exception.",
        solution_bullets=[
            "ETL pipeline from MySQL + WHMCS + parsed invoice PDFs into a unified reconciliation table.",
            "Tiered matching: exact → fuzzy → context-aware → exception, every match carrying a confidence score.",
            "Domain billing reconciliation across supplier and customer sides, including pro-rata splits and currency conversions.",
            "Exception dashboard showing the finance team only what humans actually need to resolve.",
        ],
        outcome=[
            "The reconciliation cycle compressed from days to minutes. 92% of invoice lines auto-match on first run; the remaining 8% are routed to the finance team with full context attached.",
            "CrossCheck started surfacing discrepancies that previously slipped through under deadline pressure. The team's hours now go to resolving exceptions, not to the bulk of matching itself.",
        ],
        tech=["Python", "FastAPI", "MySQL", "Pandas", "Celery", "Redis"],
        verify=[
            "100k+ invoice lines / month — confirm against actual monthly volume",
            "92% auto-match rate — confirm against the latest tiered-match evaluation",
            "Days → minutes reconciliation cycle — confirm against the previous cycle's actual duration",
        ],
    ),

    case(
        slug="kore-labs",
        client="Kore Labs",
        industry="Document intelligence",
        year="2024",
        engagement="Custom build",
        role="AI/ML Solution Architect",
        publish_date="2026-05-26",
        meta_desc="How Kore Labs built an AI document-mapping pipeline on GPT-5 + Vertex Vector Search — 10× throughput on varied-format document transformation with human-in-the-loop review.",
        headline_html="How Kore Labs built an <em>AI document-mapping pipeline</em> on GPT-5 + Vector Search.",
        headline_plain="How Kore Labs built an AI document-mapping pipeline on GPT-5 + Vector Search.",
        subtitle="A multi-stage pipeline that ingests varied document formats, maps them to clean target schemas via vector-first matching, and routes only edge cases through a human review UI.",
        metrics=[("10×", "mapping throughput"),
                 ("94%", "field-level mapping accuracy"),
                 ("days → hours", "per document set")],
        problem=[
            "Kore Labs needed to ingest documents in wildly varied formats — PDFs, spreadsheets, structured exports from third-party tools — and map them to clean target schemas. The kind of mapping that's trivial when documents are uniform, and impossible when they aren't. The team was bottlenecked at human-level transformation work that didn't scale.",
            "Traditional ETL tooling required hand-coded mappings per source. With dozens of sources and each one drifting over time, engineering cost was eating the margin.",
        ],
        solution_intro="I built a multi-stage transformation pipeline: Angular + Node.js frontend for human-in-the-loop review, Python / FastAPI / LangChain orchestration for the AI mapping itself, and Cloud Run + GCS for batch scale. The mapping engine uses Vertex Vector Search to find the closest prior mapping for similar fields first, then falls back to GPT-5 only when there's no prior match.",
        solution_bullets=[
            "Angular + Node.js frontend for human-in-the-loop mapping review and approval.",
            "Python / FastAPI / LangChain orchestration with structured Pandas outputs.",
            "Vector Search over historical mappings — new fields are matched to similar prior ones first; GPT-5 only handles unknowns.",
            "Cloud Run + GCS for scaling out batches without paying for idle capacity.",
        ],
        outcome=[
            "Document-transformation throughput jumped roughly 10× over the previous hand-mapped flow. Engineers spend their time on edge cases and pipeline expansion, not on per-document coding.",
            "Field-level mapping accuracy landed at 94%, with the rest routed through the review UI. The vector-first matching strategy means accuracy improves over time without retraining — every approved mapping becomes a new lookup target.",
        ],
        tech=["Angular", "FastAPI", "LangChain", "OpenAI GPT-5", "Vector Search", "Cloud Run"],
        verify=[
            "10× mapping throughput — confirm against the documents/hour before and after",
            "94% field-level mapping accuracy — confirm against the evaluation set",
            "Days → hours per document set — confirm against a real before/after sample",
        ],
    ),

    case(
        slug="laurastar",
        client="Laurastar",
        industry="Connected products / IoT",
        year="2023",
        engagement="AI Product MVP",
        role="AI/ML Solution Architect",
        publish_date="2026-05-26",
        meta_desc="How Laurastar shipped a connected-appliance AI companion built on React Native + Azure AI — BLE pairing, contextual product guidance, and a 30% drop in support contacts.",
        headline_html="How Laurastar shipped a <em>connected-appliance AI companion</em> on React Native + Azure AI.",
        headline_plain="How Laurastar shipped a connected-appliance AI companion on React Native + Azure AI.",
        subtitle="A premium-brand mobile companion that pairs over BLE, surfaces maintenance contextually, and answers product questions grounded in the actual product knowledge base.",
        metrics=[("4.6 ★", "iOS + Android store rating"),
                 ("30%", "drop in support contacts"),
                 ("<200ms", "BLE response time")],
        problem=[
            "Laurastar's premium home appliances ship at a price point where the digital experience is part of the product, not a bonus. The brand wanted a mobile app that paired with the appliance over BLE, surfaced maintenance reminders contextually, and answered \"how do I…\" questions with the depth of a real product manual.",
            "Generic IoT companion apps wouldn't do it. Premium positioning needed sub-200ms BLE responsiveness, AI guidance that felt brand-authored, and a UX that didn't feel like a software project bolted onto an appliance.",
        ],
        solution_intro="I built a React Native iOS + Android app that pairs to the appliance over BLE, syncs usage data to an Azure backend, and uses Azure OpenAI to power a contextual AI companion. The companion answers product questions from the actual product knowledge base, surfaces maintenance prompts at the right moment, and personalises tips based on usage patterns.",
        solution_bullets=[
            "React Native iOS + Android app with BLE pairing and offline-first usage tracking.",
            "Azure-hosted backend with usage telemetry sync and per-device contextual state.",
            "Azure OpenAI companion with brand-voice guardrails, grounded in the product knowledge base — not a generic chatbot.",
            "Maintenance prompts and contextual tips driven by actual usage patterns, not a fixed schedule.",
        ],
        outcome=[
            "App store ratings settled at 4.6 stars across iOS and Android, with most reviews calling out the AI companion specifically. Premium-brand owners expect the digital side to match the product — the app delivers on that.",
            "Support-team contact volume dropped roughly 30% for questions the in-app companion now resolves directly. Customers get an answer in seconds instead of waiting for a CS reply.",
        ],
        tech=["React Native", "BLE", "Azure", "Azure OpenAI", "TypeScript", "Node.js"],
        verify=[
            "4.6 ★ app rating — confirm against current iOS + Play store reviews",
            "30% drop in support contacts — confirm against pre/post-launch ticket volume",
            "<200ms BLE response time — confirm against measured response logs",
        ],
    ),

    case(
        slug="profinda",
        client="ProFinda",
        industry="Resource optimisation / HR tech",
        year="2022",
        engagement="Platform migration",
        role="AI/ML Solution Architect",
        publish_date="2026-05-26",
        meta_desc="Migrating ProFinda's ML insights pipeline from AWS to GCP Vertex AI — 60% faster training, 40% lower infra cost, 100k+ employee profiles indexed, with the Rails app untouched.",
        headline_html="Migrating ProFinda's <em>ML insights pipeline</em> from AWS to GCP Vertex AI.",
        headline_plain="Migrating ProFinda's ML insights pipeline from AWS to GCP Vertex AI.",
        subtitle="A surgical lift-and-rebuild of the resource-matching ML layer onto Vertex Pipelines — without re-platforming the existing Ruby on Rails + React surface.",
        metrics=[("60%", "faster training cycles"),
                 ("40%", "infra-cost reduction"),
                 ("100k+", "employee profiles indexed")],
        problem=[
            "ProFinda runs a resource-optimisation platform that matches people to projects at enterprise scale. The original ML insights layer lived in an AWS-hosted stack — Rails app, React frontend, Airflow orchestration, Python feature engineering, PostgreSQL — and had grown expensive and slow to retrain as the platform scaled.",
            "The team wanted modern MLOps tooling without re-platforming the entire app to get it. The constraint was clear: migrate the ML insights pipeline only, preserve the Rails / React stack, and don't break anything.",
        ],
        solution_intro="I rebuilt the insights pipeline on GCP Vertex AI while keeping ProFinda's existing Ruby on Rails + React surface intact. Feature engineering moved from AWS-hosted Airflow jobs to Vertex Pipelines; the PostgreSQL feature store stayed in place as the source of truth; outputs come back into the existing Rails app over a clean API boundary.",
        solution_bullets=[
            "Lift-and-rebuild of the ML insights layer from AWS-hosted Airflow to GCP Vertex Pipelines.",
            "Feature engineering ported from custom Python jobs to managed Vertex feature workflows.",
            "PostgreSQL feature store preserved as the source of truth — no app-side schema migration required.",
            "Clean Rails ↔ GCP API boundary so the existing application stayed unchanged.",
        ],
        outcome=[
            "Training cycles ran roughly 60% faster on Vertex compared to the previous AWS pipeline, with much less infrastructure to maintain. Infrastructure cost on the ML side dropped about 40% post-migration once managed services replaced bespoke Airflow clusters.",
            "The 100k+ employee-profile index now refreshes on a cadence that previously wasn't feasible — which means matching quality has effectively improved without changing the matching algorithm itself.",
        ],
        tech=["Ruby on Rails", "React", "Python", "FastAPI", "GCP Vertex AI", "PostgreSQL"],
        verify=[
            "60% faster training cycles — confirm against measured AWS-vs-Vertex timing",
            "40% infra-cost reduction — confirm against the actual GCP vs AWS bill comparison",
            "100k+ employee profiles indexed — confirm current index size",
        ],
    ),

    case(
        slug="shopsavvy",
        client="ShopSavvy",
        industry="Conversational commerce",
        year="2024",
        engagement="AI Product MVP",
        role="AI/ML Solution Architect",
        publish_date="2026-05-26",
        meta_desc="Building ShopSavvy's voice-first conversational commerce platform on LiveKit + MCP — sub-800ms voice round-trip, five specialised agents, integrated with 200+ Shopify stores.",
        headline_html="Building ShopSavvy's <em>voice-first conversational commerce</em> platform on LiveKit + MCP.",
        headline_plain="Building ShopSavvy's voice-first conversational commerce platform on LiveKit + MCP.",
        subtitle="A real-time voice agent platform that doesn't pretend voice is just a text chatbot with a microphone — sub-800ms response, multi-agent orchestration, Shopify-native.",
        metrics=[("<800ms", "voice-to-voice round-trip"),
                 ("5+", "specialised agents in production"),
                 ("200+", "Shopify stores integrated")],
        problem=[
            "ShopSavvy was building conversational commerce that doesn't pretend voice is just a text chatbot with a microphone. The product had to feel like talking to a knowledgeable store associate — real-time interruption, follow-ups, multi-turn checkout, returns, recommendations — across hundreds of Shopify stores.",
            "That kind of latency and orchestration is brutal. A chatbot can take three seconds to think. A voice agent that takes three seconds dies on contact with a real customer.",
        ],
        solution_intro="I built the platform on LiveKit for the real-time audio layer and an MCP microservices architecture for everything else. Five specialised agents — product search, cart, checkout, support, recommendations — coordinate through MCP, with a routing agent picking which one handles each turn. React frontend for the visual surface; Shopify APIs for the commerce primitive.",
        solution_bullets=[
            "LiveKit-based audio pipeline with sub-800ms voice-to-voice round-trip.",
            "MCP microservices architecture for tool / agent coordination at the service level.",
            "Five specialised agents (search, cart, checkout, support, recommendations) coordinated by a routing layer.",
            "Shopify API integration with per-store catalog and order flows.",
        ],
        outcome=[
            "Voice-to-voice round-trip lands under 800ms in production — the line below which voice interaction starts feeling natural rather than transactional.",
            "200+ Shopify stores are now wired into the platform. The agent architecture means adding a new capability is a new agent, not a refactor of one giant prompt.",
        ],
        tech=["LiveKit", "MCP", "Python", "FastAPI", "React", "Shopify API"],
        verify=[
            "<800ms voice-to-voice — confirm against production latency telemetry",
            "5+ specialised agents — confirm current production agent count",
            "200+ Shopify stores — confirm against current integration count",
        ],
    ),

    case(
        slug="people-element",
        client="People Element",
        industry="Employee experience / HR analytics",
        year="2023",
        engagement="AI feature build",
        role="AI/ML Solution Architect",
        publish_date="2026-05-26",
        meta_desc="Adding AI-generated survey insights to People Element's employee experience platform — 1M+ comments analysed, 95% sentiment accuracy, insights delivered in hours instead of weeks.",
        headline_html="Adding <em>AI-generated survey insights</em> to People Element's employee experience platform.",
        headline_plain="Adding AI-generated survey insights to People Element's employee experience platform.",
        subtitle="A tenant-isolated NLP pipeline that turns free-text survey comments into themed sentiment and per-client positive / negative insight summaries — minutes after survey close, not weeks.",
        metrics=[("1M+", "survey comments analysed"),
                 ("95%", "sentiment classification accuracy"),
                 ("weeks → hours", "insight delivery")],
        problem=[
            "People Element runs employee surveys for hundreds of client organisations. Each survey generates thousands of free-text comments — the most actionable data — but reading and theming them was a human task that scaled linearly with respondent count. Insight delivery to clients was running weeks behind survey close.",
            "Off-the-shelf sentiment tools handled English text but failed on the real job: identifying themes a specific client cared about, generating positive and negative insight summaries leadership could act on, and doing it without one client's data leaking into another's analysis.",
        ],
        solution_intro="I built a tenant-isolated NLP pipeline that processes survey comments per-client, extracts themes and sentiment, and generates positive and negative insight summaries via LLM with the per-client knowledge base as context. Comments stream through Hugging Face models for sentiment, then through a context-aware narrow LLM step for theme extraction and insight phrasing.",
        solution_bullets=[
            "Per-client data isolation — no shared embeddings, no cross-tenant theme contamination.",
            "Sentiment classification at 95% accuracy across English-language survey comments.",
            "AI-generated positive and negative insight summaries grounded in actual comment evidence.",
            "Insight delivery pipeline that runs minutes after survey close, not weeks.",
        ],
        outcome=[
            "1M+ survey comments analysed across the client base. Organisations now get insights within hours of their survey closing instead of waiting on a human-led coding pass.",
            "The team that previously did manual comment coding moved to higher-leverage work — designing better survey instruments and helping clients act on insights, rather than reading every comment.",
        ],
        tech=["Python", "FastAPI", "Hugging Face", "OpenAI", "PostgreSQL", "AWS"],
        verify=[
            "1M+ survey comments analysed — confirm against current cumulative count",
            "95% sentiment classification accuracy — confirm against the latest evaluation",
            "Weeks → hours insight delivery — confirm against pre/post timing",
        ],
    ),

    case(
        slug="shamrock-marketing",
        client="Shamrock Marketing",
        industry="Industrial supplier / knowledge automation",
        year="2024",
        engagement="Custom build",
        role="AI/ML Solution Architect",
        publish_date="2026-05-26",
        meta_desc="A 20-year knowledge engine for a retread industry supplier built on Azure RAG — standards, workflow docs, and product specifications retrievable in seconds with citations.",
        headline_html="Building a <em>20-year knowledge engine</em> for a retread-industry supplier on Azure RAG.",
        headline_plain="Building a 20-year knowledge engine for a retread-industry supplier on Azure RAG.",
        subtitle="An Azure-hosted RAG system over two decades of standards, workflow documentation, and product specs — workflow-aware retrieval, paragraph-level citation, used daily across teams.",
        metrics=[("20+ years", "of technical docs indexed"),
                 ("10×", "faster standards lookup"),
                 ("5+ teams", "using the system daily")],
        problem=[
            "Shamrock Marketing — a supplier to the tire retread and repair industry — has two decades of technical standards, workflow documentation, and product specifications in PDFs. Sales, engineering, and operations all needed to reference this knowledge daily, and every team had its own ritual for finding the right document. The shared knowledge wasn't actually shared.",
            "The work isn't general-purpose Q&A. It's specific: \"What's the bonding spec for this tire size and grade under that workflow?\" The answer is in one paragraph in one PDF from 2008, and there is exactly one right answer.",
        ],
        solution_intro="I built an Azure-hosted RAG system over the entire technical document corpus. Documents are processed into chunked embeddings with metadata (year, workflow, product family, standard reference); retrieval is workflow-aware, surfacing standards that match the user's current context; answers cite the source paragraph by document and page.",
        solution_bullets=[
            "20+ years of standards and workflow PDFs ingested with workflow-aware metadata tagging.",
            "Azure AI Search for retrieval, Azure OpenAI for synthesis and citation.",
            "Citations down to document + page so users can verify the source themselves.",
            "Used daily by sales, engineering, and operations teams instead of any one team's tribal knowledge.",
        ],
        outcome=[
            "Standards lookups that used to take ten-plus minutes — find the right PDF, search inside, scan the section — now land in under a minute with the right paragraph cited.",
            "Knowledge that lived in a few experts' heads is now accessible to every team. New hires get to productive standards-lookup in days instead of months.",
        ],
        tech=["Python", "Azure AI Search", "Azure OpenAI", "FastAPI", "Azure Functions", "PostgreSQL"],
        verify=[
            "20+ years of docs — confirm against the actual ingested corpus range",
            "10× faster lookup — confirm against a real before/after lookup-time sample",
            "5+ teams using daily — confirm current adoption inside the org",
        ],
    ),

    case(
        slug="sai-global",
        client="Sai Global Platform",
        industry="B2B compliance & procurement marketplace",
        year="2023",
        engagement="Architecture & build",
        role="AI/ML Solution Architect",
        publish_date="2026-05-26",
        meta_desc="Building Sai Global's Azure microservices marketplace for procurement, compliance, and logistics — module-level autonomy, 200+ supplier integrations, tenant-isolated audit trails.",
        headline_html="Building Sai Global's <em>Azure microservices marketplace</em> for procurement, compliance &amp; logistics.",
        headline_plain="Building Sai Global's Azure microservices marketplace for procurement, compliance & logistics.",
        subtitle="A module-per-service decomposition with shared identity, supplier-integration layer, and per-tenant audit isolation — so each module ships on its own cadence without breaking the rest.",
        metrics=[("10+", "microservices in production"),
                 ("99.95%", "platform uptime"),
                 ("200+", "supplier integrations")],
        problem=[
            "Sai Global's platform had to host distinct enterprise modules — procurement, compliance, logistics, and others — that shared identity, data flow, and supplier integrations, but had to evolve independently. The original monolithic structure couldn't support module-level autonomy without painful release coordination.",
            "The harder constraint was tenant isolation across modules. A single enterprise customer might use procurement + compliance but not logistics, and the data permissions had to follow that, with per-module audit trails.",
        ],
        solution_intro="I decomposed the platform into Azure microservices with shared identity and a service-bus message backbone. Each module ships independently; supplier integrations live in a shared layer so a new supplier is one onboarding, not one-per-module; tenant isolation is enforced at the service-bus + data-access level.",
        solution_bullets=[
            "Module decomposition — procurement, compliance, and logistics each as independent services.",
            "Azure Service Bus for cross-module event flow with audit trails and replay.",
            "200+ supplier integrations in a shared layer rather than per-module duplication.",
            "Module-level tenant isolation with per-customer audit + compliance reporting.",
        ],
        outcome=[
            "Each module now ships on its own cadence with 99.95% platform uptime. A change to procurement no longer requires a coordinated release with compliance or logistics.",
            "Supplier onboarding consolidated to a single workflow regardless of which modules consume the supplier's data. Net effect: more supplier coverage in less engineering time.",
        ],
        tech=["Python", "FastAPI", "Azure App Services", "Azure Service Bus", "PostgreSQL", "Kubernetes"],
        verify=[
            "10+ microservices — confirm against the current production service count",
            "99.95% uptime — confirm against the most recent SLA window",
            "200+ supplier integrations — confirm current integration count",
        ],
    ),

    case(
        slug="trialhaus",
        client="TrialHaus",
        industry="Interview prep / HR tech",
        year="2024",
        engagement="AI Product MVP",
        role="AI/ML Solution Architect",
        publish_date="2026-05-26",
        meta_desc="Building TrialHaus's AI mock-interview platform — real-time video + voice analysis, LLM-driven adaptive questions, personalised feedback delivered in under two seconds.",
        headline_html="Building TrialHaus's <em>AI mock-interview platform</em> with real-time video coaching.",
        headline_plain="Building TrialHaus's AI mock-interview platform with real-time video coaching.",
        subtitle="A real-time interview practice product that doesn't fake the interview — WebRTC video, Whisper transcription, adaptive questioning, and personalised feedback under two seconds.",
        metrics=[("10k+", "practice interviews / month"),
                 ("<2s", "personalised feedback latency"),
                 ("real-time", "video + voice analysis")],
        problem=[
            "TrialHaus needed an interview-practice product that actually felt like an interview — not a multiple-choice quiz, not a chatbot pretending to interview. That meant real-time video, voice-to-voice exchange, and feedback the candidate could use before forgetting the question.",
            "Generic chatbots can't critique a candidate's facial expressions or pacing. A pre-recorded video evaluator can't ask the right follow-up. The product had to do both at once, fast enough to feel natural.",
        ],
        solution_intro="I built a real-time video pipeline using WebRTC for capture, Whisper for streaming transcription, and an LLM-driven question generator that adapts to the candidate's role and seniority. After each answer, a feedback synthesiser combines facial-expression cues, voice pacing, and answer substance into a personalised critique delivered in under two seconds.",
        solution_bullets=[
            "WebRTC video capture + Whisper streaming transcription for real-time understanding.",
            "LLM question generation that adapts to role, seniority, and prior answers.",
            "Facial-expression + voice-pacing analysis layered onto answer-substance scoring.",
            "Personalised feedback synthesis delivered within two seconds of each answer.",
        ],
        outcome=[
            "10,000+ practice interviews run through the platform per month, with candidates returning for multiple sessions because the feedback is specific enough to act on.",
            "The real-time architecture means the product feels like a high-stakes interview rather than a quiz — which is the only mode in which interview practice actually transfers to interview performance.",
        ],
        tech=["Python", "FastAPI", "OpenAI", "WebRTC", "Whisper", "React"],
        verify=[
            "10k+ practice interviews / month — confirm against current platform usage",
            "<2s feedback latency — confirm against production timing telemetry",
            "Real-time video + voice analysis — confirm the production pipeline still runs both",
        ],
    ),

    case(
        slug="martek-global",
        client="Martek Global Services",
        industry="Enterprise facilities management",
        year="2022",
        engagement="Custom build",
        role="AI/ML Solution Architect",
        publish_date="2026-05-26",
        meta_desc="How Martek automated global facilities operations across 30+ countries — auto-triage, vendor routing, document-driven workflows, and 1M+ facility events processed annually.",
        headline_html="How Martek automated <em>global facilities operations</em> across 30+ countries.",
        headline_plain="How Martek automated global facilities operations across 30+ countries.",
        subtitle="A cloud-native CAFM platform with auto-triage, vendor routing by location and category, document-driven audit trails, and Power BI analytics on operational data.",
        metrics=[("30+ countries", "supported on one platform"),
                 ("60%", "reduction in manual ticket triage"),
                 ("1M+", "facility events processed annually")],
        problem=[
            "Martek runs enterprise facilities management at global scale — work orders, approvals, vendor coordination, compliance documentation — across thirty-plus countries. The operation was bottlenecked at manual coordination: a ticket came in, a coordinator triaged it, the right vendor was dispatched, and the paper trail had to be assembled afterward.",
            "At enterprise volume that triage cost was no longer overhead — it was the constraint on how fast the operation could grow.",
        ],
        solution_intro="I built a cloud-native CAFM platform that captures facility events, auto-triages them against work-order templates, routes them to the right vendor based on location and category, and assembles the documentation automatically. Process automation handles the standard cases; humans now own the genuinely complex coordination.",
        solution_bullets=[
            "Event capture across 30+ country operations with category and severity classification.",
            "Auto-triage against work-order templates with vendor routing based on location, category, and history.",
            "Document-driven workflows that assemble the audit paper trail automatically.",
            "Power BI analytics on top of the operational data — turnaround time, vendor performance, cost-per-event.",
        ],
        outcome=[
            "Manual ticket triage dropped roughly 60%. Coordinators now handle the ~40% of events that genuinely need human judgement, instead of every event.",
            "1M+ facility events processed annually through the platform. The same coordination team supports a footprint that previously would have required headcount growth in proportion.",
        ],
        tech=["Python", "FastAPI", "React", "AWS", "PostgreSQL", "Power BI"],
        verify=[
            "30+ countries — confirm current operational footprint",
            "60% reduction in manual triage — confirm against pre/post-platform ticket flow",
            "1M+ facility events / year — confirm against the current annual volume",
        ],
    ),
]


# ─── Generator ────────────────────────────────────────────────────────────────

def render(case_data: dict) -> str:
    """Apply placeholder substitutions + (optionally) strip the quote block."""
    out = TEMPLATE.read_text()

    # Strip the template's instructional comment block (the box explaining how
    # to use the template) — readers of a published case study shouldn't see it.
    out = re.sub(
        r"\s*<!--\s*╔[\s\S]*?╝\s*-->",
        "",
        out,
    )

    # Strip the inline guidance comments meant for the template author.
    out = re.sub(r"\s*<!--\s*HEADLINE:[\s\S]*?-->", "", out)
    out = re.sub(r"\s*<!--\s*Metadata strip[\s\S]*?-->", "", out)
    out = re.sub(r"\s*<!--\s*Three headline metrics[\s\S]*?-->", "", out)
    out = re.sub(r"\s*<!--\s*Tech-stack chips[\s\S]*?-->", "", out)

    # Strip the entire <section class="case-quote">…</section> block if no quote.
    if not case_data["has_quote"]:
        out = re.sub(
            r"\s*<!--\s*PULL QUOTE[\s\S]*?-->\s*<section class=\"case-quote\">[\s\S]*?</section>",
            "",
            out,
        )
    else:
        # Keep the section, just remove the editor-facing comment.
        out = re.sub(r"\s*<!--\s*PULL QUOTE[\s\S]*?-->", "", out)

    for key, value in case_data["fields"].items():
        out = out.replace("{{" + key + "}}", value)

    verify_block = (
        "    <!--\n"
        "      VERIFY before publishing — these numeric claims were drafted as\n"
        "      conservative directional estimates. Swap any that are inaccurate\n"
        "      and delete the lines you've confirmed.\n\n"
        + "".join(f"        - {v}\n" for v in case_data["verify"])
        + "    -->\n"
    )
    out = out.replace("  <body>", "  <body>\n" + verify_block, 1)

    return out


def main() -> int:
    if not TEMPLATE.exists():
        raise SystemExit(f"template not found: {TEMPLATE}")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for c in CASES:
        path = OUT_DIR / f"{c['slug']}.html"
        path.write_text(render(c))
        size_kb = path.stat().st_size // 1024
        rel = str(path.relative_to(HERE.parent.parent))
        print(f"  · {rel:<40s} ({size_kb} KB)")

    print(f"\nGenerated {len(CASES)} draft case page(s) in {OUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
