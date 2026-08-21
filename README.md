````markdown
# 💰 CashCompass — AI Voice Financial Assistant

> **A real-time AI voice financial assistant built for the Murf AI Voice for Bharat Challenge — Financial Services Track.**

CashCompass helps users navigate financial topics through natural voice conversations. It combines **real-time speech processing, LLM reasoning, consent-based memory, financial scheme discovery, tool calling, escalation, and multi-agent handoff** into a single conversational AI system.

---

## 🚀 Key Features

### 🎙️ Real-Time Voice AI
- Real-time voice interaction using **LiveKit**
- Speech-to-Text using **Deepgram**
- LLM reasoning using **Google Gemini**
- Text-to-Speech using **Murf AI**
- Conversational voice experience designed for low-latency interaction

### 🧠 Consent-Based Memory
CashCompass can remember useful user information after obtaining consent.

- User memory lookup
- User information storage
- Consent-controlled memory
- Personalized conversations

### 🏦 Financial Scheme Finder
Helps users discover relevant government financial schemes based on their requirements.

Examples:
- Atal Pension Yojana
- Pradhan Mantri Jan-Dhan Yojana
- Other supported financial schemes

### 🛠️ Tool Calling
The AI agent can invoke specialized tools instead of relying entirely on the LLM.

Implemented tools include:

- Memory lookup
- Memory storage
- Financial scheme discovery
- Escalation handling
- Specialist-agent transfer

### 👨‍💼 Multi-Agent Handoff
CashCompass uses a dedicated **Investment Specialist Agent** for investment-related conversations.

The primary agent can transfer the conversation when specialized assistance is required.

### 🚨 Escalation
The system detects situations that require additional assistance and provides an escalation workflow instead of forcing the AI to handle every situation itself.

### 📊 Call Analytics
Call information is stored using **SQLite** for tracking:

- Call outcomes
- Successful calls
- Failed calls
- Call statistics
- Usage data

---

# 🏗️ Architecture

```text
                         ┌─────────────────┐
                         │      USER       │
                         │  Voice Input    │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │     LiveKit     │
                         │ Voice Transport │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    Deepgram     │
                         │      STT        │
                         └────────┬────────┘
                                  │
                                  ▼
                   ┌────────────────────────────┐
                   │      CashCompass Agent     │
                   │                            │
                   │        Gemini LLM          │
                   └─────────────┬──────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
        ┌──────────┐      ┌──────────────┐   ┌─────────────┐
        │  Memory  │      │    Scheme    │   │ Escalation  │
        │   Tool   │      │    Finder    │   │   System    │
        └──────────┘      └──────────────┘   └─────────────┘
                                 │
                                 │ Investment Query
                                 ▼
                         ┌─────────────────┐
                         │   Investment    │
                         │   Specialist    │
                         │      Agent      │
                         └─────────────────┘
                                 │
                                 ▼
                         ┌─────────────────┐
                         │     Murf AI     │
                         │       TTS       │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │      USER       │
                         │  Voice Output   │
                         └─────────────────┘
````

---

# 🧰 Tech Stack

| Category        | Technology         |
| --------------- | ------------------ |
| Language        | Python             |
| Voice Transport | LiveKit            |
| Speech-to-Text  | Deepgram           |
| LLM             | Google Gemini      |
| Text-to-Speech  | Murf AI            |
| Agent Framework | LiveKit Agents     |
| Database        | SQLite             |
| Memory          | JSON-based storage |
| Version Control | Git & GitHub       |

---

# 🔄 Conversation Flow

```text
User speaks
    ↓
LiveKit receives audio
    ↓
Deepgram converts speech → text
    ↓
Gemini processes the request
    ↓
Agent determines required action
    ↓
┌────────────────────────────────────┐
│                                    │
│  Memory                            │
│  Financial Scheme Finder           │
│  Escalation                        │
│  Investment Specialist             │
│                                    │
└──────────────────┬─────────────────┘
                   ↓
            Gemini generates
              response
                   ↓
            Murf AI converts
             text → speech
                   ↓
              User hears
              response
```

---

# 🧠 Multi-Agent Workflow

```text
                       CashCompass
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
      General Financial            Investment Query
         Assistance                       │
                                          ▼
                               Investment Specialist
                                      Agent
```

The **CashCompass Agent** handles general financial conversations.

Investment-related queries can be transferred to the **Investment Specialist Agent** for more specialized handling.

---

# 📊 Analytics

CashCompass uses SQLite to record call analytics.

```text
Call
 │
 ├── Call ID
 ├── Outcome
 ├── Success / Failure
 └── Usage Statistics
```

These records can be used by the dashboard to monitor call activity and agent performance.

---

# 📂 Project Structure

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
├── .env.example
├── .gitignore
└── README.md
```

---

# ⚙️ Setup

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd cashcompass
```

## 2. Create a Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python -m venv venv
source venv/bin/activate
```

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## 4. Configure Environment Variables

Create a `.env` file using `.env.example`:

```env
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

DEEPGRAM_API_KEY=your_deepgram_api_key

GOOGLE_API_KEY=your_google_api_key

MURF_API_KEY=your_murf_api_key
```

> ⚠️ **Never commit API keys or `.env` files to GitHub.**

Example `.gitignore`:

```gitignore
.env
venv/
__pycache__/
*.pyc
```

---

# ▶️ Run the Agent

After configuring the environment:

```bash
python agent.py
```

The agent connects to the configured LiveKit environment and handles voice conversations.

---

# 🔐 Responsible AI

CashCompass is designed as a **financial education and guidance assistant**, not a replacement for a qualified financial advisor.

The system includes:

* Consent-based memory
* Escalation workflows
* Specialist-agent handoff
* Context-aware responses
* Tool-based financial information retrieval

Users should verify important financial decisions using official sources or qualified financial professionals.

---

# 🎯 What This Project Demonstrates

CashCompass demonstrates practical implementation of:

* Voice AI
* Generative AI
* AI Agents
* Multi-Agent Systems
* Tool Calling
* Conversational Memory
* Real-Time Speech Processing
* Financial AI
* AI Safety and Escalation

---

# 🏆 Built For

**Murf AI — Voice for Bharat Challenge**

**Track:** Financial Services

CashCompass explores how conversational voice AI can make financial guidance more accessible and natural for users.

---

# 🔮 Future Improvements

* Multilingual voice conversations
* Expanded financial scheme database
* RAG-based financial document retrieval
* Improved long-term memory
* Additional specialist agents
* Verified real-time financial APIs
* Enhanced analytics dashboard
* User authentication and personalized financial profiles

---

# 👩‍💻 Author

**Advaita Singh**

B.Tech Computer Science & Engineering
Birla Institute of Applied Sciences

[LinkedIn](https://www.linkedin.com/in/advaita-singh-41a81b257/)

---

## 📄 License

This project is intended for educational and demonstration purposes.

```
```
