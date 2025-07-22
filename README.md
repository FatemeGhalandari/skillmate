# SkillMate 🎓🤖

SkillMate is an AI-powered tool that transforms **YouTube videos** into **mini courses** with:

- 📚 Summaries
- 💡 Course Modules
- 💬 Flashcards (interactive, scrollable, and flippable)

Designed as a personal learning assistant, it helps users quickly turn long-form video content into structured, digestible knowledge using **LLMs (Large Language Models)**.

---

## 🧠 AI-Powered Features

SkillMate uses an open-source LLM (via **OpenRouter**) to analyze YouTube transcripts and generate:

- ✅ A brief summary of the content
- ✅ 3–5 structured learning modules (with objectives and descriptions)
- ✅ Flashcards with Q&A for self-testing

**Model in use**: [`moonshotai/kimi-k2:free`](https://openrouter.ai/moonshotai/kimi-k2:free) (via OpenRouter API)

---

## 🛠 Tech Stack

### Frontend:

- **React.js** + **Vite**
- **Tailwind CSS** (v4)
- Interactive UI with:
  - Custom flashcard flip animations
  - Scrollable flashcard carousel
  - Clean responsive layout

### Backend:

- **Python 3.10**
- **FastAPI**: Serves as the backend for handling:
  - YouTube URL processing
  - Transcript extraction via `youtube-transcript-api`
  - Requesting and parsing LLM completions

### AI:

- **OpenRouter**: Proxy API for open-source LLMs
- **Model**: `moonshotai/kimi-k2:free`

---

## 📸 Screenshots

### 🏠 Homepage

A clean and simple UI for users to enter a YouTube URL and generate an AI-powered course.

**Desktop View**  
![Homepage Desktop](/assets/1.png)  
**Mobile View**  
<img src="/assets/7.png" alt="Homepage Mobile" width="250"/>

---

### 🧠 AI Summary

Summarized content from the video, broken into digestible learning modules.  
**Desktop View**  
![Summary](/assets/6.png)  
**Mobile View**  
<img src="/assets/9.png" alt="Homepage Mobile" width="250"/>

---

### 💡 Flashcards

Interactive flashcards auto-generated from video content, designed to reinforce learning.
**Desktop View**  
![Flashcards](/assets/3.png)  
**Mobile View**  
<img src="/assets/8.png" alt="Homepage Mobile" width="250"/>
