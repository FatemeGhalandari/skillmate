from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs

import httpx
import os
from dotenv import load_dotenv

#env for the api key
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

app = FastAPI()

# Allow frontend requests (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5173"] for stricter setup
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "SkillMate backend running"}

# Function to extract video ID from YouTube URL
def extract_video_id(youtube_url: str) -> str | None:
    parsed_url = urlparse(youtube_url)

    # Case 1: https://www.youtube.com/watch?v=VIDEO_ID
    if "youtube.com" in parsed_url.netloc:
        return parse_qs(parsed_url.query).get("v", [None])[0]

    # Case 2: https://youtu.be/VIDEO_ID
    elif "youtu.be" in parsed_url.netloc:
        return parsed_url.path.lstrip("/")

    return None

# Function to ask OpenRouter API for course generation
async def ask_openrouter(prompt: str, model: str ="mistralai/mistral-7b-instruct") -> str:
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a helpful course-building assistant."},
            {"role": "user", "content": prompt}
        ]
    }
    print("Sending prompt length:", len(prompt))
    print("Prompt (preview):", prompt[:200])
    print("Headers:", headers)
    print("Payload:", payload)


    async with httpx.AsyncClient() as client:
        response = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


@app.post("/generate")
async def generate_course(request: Request):
    data = await request.json()
    youtube_url = data.get("url")
    try:
        # Extract the video ID
        # parsed_url = urlparse(youtube_url)
        # video_id = parse_qs(parsed_url.query).get("v", [None])[0]

        video_id = extract_video_id(youtube_url)
        if not video_id:
            return {"error": "Invalid YouTube URL"}

        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        full_text = " ".join([entry["text"] for entry in transcript])
        MAX_CHARS = 3000  # or ~1000–1500 words
        truncated = full_text[:MAX_CHARS]

        prompt = (
            f"Summarize this YouTube transcript into a mini course.\n"
            f"Break it into 3–5 modules with titles, learning objectives, and descriptions:\n"
            f"Then generate 5 flashcards as Q&A pairs in this format:\n"
            f"Q: ...\nA: ...\n\nUse clear and complete questions and answers based on the transcript.\n\nTranscript:\n{truncated}"
        )
        llm_response = await ask_openrouter(prompt)


        return {
            "video_id": video_id,
            "transcript": full_text[:1000] + "...",
            "summary": llm_response.strip()
        }

    except Exception as e:
        return {"error": str(e)}