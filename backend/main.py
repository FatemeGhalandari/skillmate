from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs

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


def extract_video_id(youtube_url: str) -> str | None:
    parsed_url = urlparse(youtube_url)

    # Case 1: https://www.youtube.com/watch?v=VIDEO_ID
    if "youtube.com" in parsed_url.netloc:
        return parse_qs(parsed_url.query).get("v", [None])[0]

    # Case 2: https://youtu.be/VIDEO_ID
    elif "youtu.be" in parsed_url.netloc:
        return parsed_url.path.lstrip("/")

    return None

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

        return {
            "video_id": video_id,
            "transcript": full_text[:1000] + "..."
        }

    except Exception as e:
        return {"error": str(e)}