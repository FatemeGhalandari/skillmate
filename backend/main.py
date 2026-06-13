from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.proxies import WebshareProxyConfig, GenericProxyConfig
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv
import httpx
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "SkillMate backend running"}


def extract_video_id(youtube_url: str) -> str | None:
    parsed_url = urlparse(youtube_url)

    if "youtube.com" in parsed_url.netloc:
        return parse_qs(parsed_url.query).get("v", [None])[0]

    if "youtu.be" in parsed_url.netloc:
        return parsed_url.path.lstrip("/")

    return None

def get_youtube_transcript_api():
    webshare_username = os.getenv("WEBSHARE_PROXY_USERNAME")
    webshare_password = os.getenv("WEBSHARE_PROXY_PASSWORD")

    if webshare_username and webshare_password:
        return YouTubeTranscriptApi(
            proxy_config=WebshareProxyConfig(
                proxy_username=webshare_username,
                proxy_password=webshare_password,
                filter_ip_locations=["us", "ca"],
            )
        )

    generic_proxy_url = os.getenv("YOUTUBE_PROXY_URL")

    if generic_proxy_url:
        return YouTubeTranscriptApi(
            proxy_config=GenericProxyConfig(
                http_url=generic_proxy_url,
                https_url=generic_proxy_url,
            )
        )

    return YouTubeTranscriptApi()

async def ask_groq(prompt: str) -> str:
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise Exception("GROQ_API_KEY is missing")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful course-building assistant."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 800,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
        )

        if response.status_code != 200:
            raise Exception(f"Groq error {response.status_code}: {response.text}")

        data = response.json()
        return data["choices"][0]["message"]["content"]


@app.post("/generate")
async def generate_course(request: Request):
    data = await request.json()
    youtube_url = data.get("url")

    video_id = extract_video_id(youtube_url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    try:
        ytt_api = get_youtube_transcript_api()
        fetched_transcript = ytt_api.fetch(video_id, languages=["en"])
        full_text = " ".join(snippet.text for snippet in fetched_transcript)
    except Exception as e:
        return JSONResponse(
            status_code=502,
            content={"error": f"Transcript fetch failed: {str(e)}"},
        )

    try:
        truncated = full_text[:3000]

        prompt = f"""
Summarize this YouTube transcript into a mini course.
Break it into 3 to 5 modules with titles, learning objectives, and a short description for each.

Then generate a section titled Flashcards:
List 4 to 6 clearly formatted flashcards like this:

Flashcards:
1. Q: ...
A: ...

Here is the transcript:
{truncated}
"""

        llm_response = await ask_groq(prompt)

        return {
            "video_id": video_id,
            "transcript": full_text[:1000] + "...",
            "summary": llm_response.strip(),
        }

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"LLM generation failed: {str(e)}"},
        )
