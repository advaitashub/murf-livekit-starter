````markdown
# 💰 CashCompass — AI Voice Financial Assistant

CashCompass is a real-time **AI voice financial assistant** designed to help users understand financial topics through natural voice conversations.

The project combines speech recognition, an LLM, text-to-speech, persistent user memory, financial scheme discovery, analytics, and multi-agent escalation into a single conversational system.

---

## 🚀 Features

### 🎙️ Real-Time Voice Conversation
- Real-time voice interaction using **LiveKit**
- Speech-to-Text using **Deepgram**
- LLM-based reasoning using **Google Gemini**
- Natural Text-to-Speech using **Murf AI**
- Designed for conversational, low-latency interactions

### 🧠 Consent-Based Memory
CashCompass can remember useful user information with user consent.

- User memory lookup
- User information storage
- Consent-based memory
- Personalized responses based on approved information

### 🏦 Financial Scheme Finder
The assistant can help users discover relevant government financial schemes based on their requirements.

Examples include:
- Atal Pension Yojana
- Pradhan Mantri Jan-Dhan Yojana
- Other relevant financial schemes

### 🛠️ Tool Calling
CashCompass uses tools to extend the capabilities of the AI agent beyond normal LLM responses.

Implemented tools include:
- Memory lookup
- Memory storage
- Financial scheme discovery
- Escalation handling
- Specialist-agent transfer

### 👨‍💼 Specialist Agent Handoff
When a conversation requires more specialized assistance, the main agent can transfer the interaction to an **Investment Specialist Agent**.

This creates a multi-agent workflow instead of relying on a single general-purpose agent.

### 🚨 Human Escalation
The system includes escalation detection and workflows for situations where the user requires additional assistance.

### 📊 Call Analytics
CashCompass records call information using **SQLite** and provides analytics such as:

- Total calls
- Successful calls
- Failed calls
- Call outcomes
- Usage statistics

---

## 🏗️ Architecture

```text
                    ┌──────────────────┐
                    │      User        │
                    │   Voice Input    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │     LiveKit      │
                    │ Voice Transport  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    Deepgram      │
                    │      STT         │
                    └────────┬─────────┘
                             │
                             ▼
              ┌────────────────────────────┐
              │       CashCompass Agent    │
              │                            │
              │       Gemini LLM           │
              └─────────────┬──────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
     ┌─────────┐      ┌─────────────┐   ┌────────────┐
     │ Memory  │      │    Scheme   │   │ Escalation │
     │  Tools  │      │    Finder   │   │   System   │
     └─────────┘      └─────────────┘   └────────────┘
                            │
                            ▼
                 ┌────────────────────┐
                 │ Investment          │
                 │ Specialist Agent    │
                 └────────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │     Murf AI      │
                    │       TTS        │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │      User        │
                    │   Voice Output   │
                    └──────────────────┘
````

---

## 🧰 Tech Stack

| Category         | Technology            |
| ---------------- | --------------------- |
| Language         | Python                |
| Voice Transport  | LiveKit               |
| Speech-to-Text   | Deepgram              |
| LLM              | Google Gemini         |
| Text-to-Speech   | Murf AI               |
| Database         | SQLite                |
| Agent Framework  | LiveKit Agents        |
| Embeddings / NLP | Sentence Transformers |
| Version Control  | Git & GitHub          |

---

## 📂 Project Structure

```text
cashcompass/
│
├── agent.py
├── memory_db.json
│
├── tools/
│   ├── scheme_finder.py
│   └── ...
│
├── agents/
│   └── investment_specialist.py
│
├── analytics/
│   └── ...
│
├── dashboard/
│   └── ...
│
├── requirements.txt
├── .env
└── README.md
```

> The exact structure may differ depending on the current version of the project.

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd cashcompass
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it:

**Windows**

```bash
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file:

```env
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

DEEPGRAM_API_KEY=your_deepgram_api_key

GOOGLE_API_KEY=your_google_api_key

MURF_API_KEY=your_murf_api_key
```

**Never commit your `.env` file or API keys to GitHub.**

Add this to `.gitignore`:

```gitignore
.env
venv/
__pycache__/
*.pyc
```

---

## ▶️ Running the Agent

After configuring the environment:

```bash
python agent.py
```

Depending on the LiveKit configuration, the agent can then connect to the LiveKit room and handle voice conversations.

---

## 🔄 Conversation Flow

```text
User speaks
     ↓
LiveKit receives audio
     ↓
Deepgram converts speech → text
     ↓
Gemini processes the request
     ↓
Agent decides whether a tool is required
     ↓
┌─────────────────────────────────┐
│ Memory / Scheme Finder /        │
│ Escalation / Specialist Agent   │
└─────────────────────────────────┘
     ↓
Gemini generates response
     ↓
Murf converts text → speech
     ↓
User hears response
```

---

## 🧠 Multi-Agent Workflow

CashCompass uses a primary financial assistant along with a specialist agent.

```text
                    CashCompass
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
       General Financial      Investment Query
          Assistance                │
                                    ▼
                         Investment Specialist
```

The primary agent handles general financial conversations, while investment-related requests can be transferred to the specialist agent.

---

## 📊 Analytics

CashCompass uses SQLite to store call analytics.

The analytics system can track:

```text
Call
 │
 ├── Call ID
 ├── Outcome
 ├── Success / Failure
 └── Usage Statistics
```

This data can be used by the dashboard to monitor agent performance and call activity.

---

## 🔐 Safety & Responsible AI

CashCompass is designed as a **financial education and guidance assistant**, not a replacement for a qualified financial advisor.

The system includes:

* Consent-based memory
* Escalation workflows
* Specialist-agent handoff
* Context-aware responses
* Tool-based financial information retrieval

Users should independently verify important financial decisions using official sources or qualified professionals.

---

## 🎯 Project Goals

CashCompass was developed to explore practical applications of:

* Voice AI
* Generative AI
* AI Agents
* Multi-Agent Systems
* Tool Calling
* Conversational Memory
* Financial AI
* Real-Time Speech Processing
* AI Safety and Escalation

---

## 🏆 Challenge

Built as part of the **Murf AI Voice for Bharat Challenge**, focusing on applying conversational voice AI to the **Financial Services** domain.

---

## 🔮 Future Improvements

Potential future improvements include:

* Multilingual financial conversations
* More comprehensive financial scheme database
* Better financial-document retrieval using RAG
* Improved conversation memory
* More specialized financial agents
* Real-time market information through verified APIs
* Improved analytics dashboard
* User authentication and personalized financial profiles

---

## 👩‍💻 Author

**Advaita Singh**

B.Tech Computer Science & Engineering
Birla Institute of Applied Sciences

* GitHub: YOUR_GITHUB_PROFILE
* LinkedIn: YOUR_LINKEDIN_PROFILE

---

## 📄 License

This project is intended for educational and demonstration purposes.

```
```
