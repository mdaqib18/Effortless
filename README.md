🤖 Effort-Less — AI Automation Dashboard

Effort-Less is a modern AI-powered automation orchestration platform that allows users to plan, execute, and monitor intelligent workflows through a single, intuitive dashboard.

🚀 Overview

Effort-Less connects multiple backend services to create a full automation ecosystem:

ServiceDescriptionAI PlannerConverts user text into structured JSON automation plans using an LLM (Gemini).Automation OrchestratorExecutes step-by-step workflows from the planner.Playwright ServerExecutes real browser-based tasks using Playwright.Frontend DashboardNext.js-based UI for managing and visualizing automation. 

✨ Features

🧠 AI Planning — Natural language → structured JSON automation.

⚙ Dynamic Orchestration — Executes automation steps via browser or API.

🎨 Next.js Dashboard — Elegant, fast, and fully interactive UI.

💾 Replit Database — Simple persistent storage for task logs.

🔐 Secure Communication — Uses Bearer token-based service authentication.

🧩 Microservice Design — Decoupled services for scalability.

🧱 Tech Stack

LayerTechnologiesFrontendNext.js 14, TailwindCSS, ShadCN/UI, Zustand, Replit DatabaseBackendNode.js, Express, AxiosExecutorPlaywright on AWS EC2StorageReplit DatabaseLLMGemini (Google Generative AI) 

⚙ Setup Instructions

1️⃣ Clone the Repository

git clone https://github.com/mdaqib18/Effortless.git cd Effortless 

2️⃣ Install Dependencies

npm install 

3️⃣ Configure Environment Variables

Create a .env.local file in the project root:

NEXT_PUBLIC_API_PLANNER_URL=<your-ai-planner-url> NEXT_PUBLIC_API_ORCHESTRATOR_URL=<your-orchestrator-url> NEXT_PUBLIC_PLAYWRIGHT_URL=<your-playwright-server-url> 

4️⃣ Run Locally

npm run dev 

Then open http://localhost:3000 in your browser.

🧩 API Summary

AI Planner

MethodEndpointDescriptionPOST/planConverts user text into an automation plan.GET/healthReturns health status. 

Orchestrator

MethodEndpointDescriptionPOST/run-planExecutes automation plans step-by-step. 

Playwright Server

MethodEndpointDescriptionPOST/runExecutes a browser automation task.GET/healthHealth check for executor. 

📊 Example Workflow

User types:
“Order my weekly groceries from Zepto every Saturday morning.”

AI Planner creates structured automation JSON.

Orchestrator executes the plan via API & Playwright.

Dashboard shows execution logs and screenshots.

🧠 Architecture Diagram

User (Frontend Dashboard) ↓ AI Planner (LLM) ↓ Automation Orchestrator ↓ Playwright Server (EC2) ↓ External APIs / Services 

🩺 Health Endpoints

ServiceEndpointExample ResponseFrontend/api/health{ok: true}Planner/health{ok: true}Orchestrator/health{ok: true}Playwright/health{ok: true} 

⚡ Developer Commands

CommandDescriptionnpm run devStart development servernpm run buildBuild production versionnpm run startStart production servernpm run lintRun linter checks 


🪄 License

MIT License © 2025 Code Cartels
