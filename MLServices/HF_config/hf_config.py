import os
from dotenv import load_dotenv
from huggingface_hub import HfApi
import logging

logger = logging.getLogger("flask_app")

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

if not HF_TOKEN:
    raise ValueError("HF_TOKEN is missing from environment variables.")

BASE_BUCKET = os.getenv("HF_BASE_BUCKET")

if not BASE_BUCKET:
    raise ValueError("HF_BASE_BUCKET is missing from environment variables.")

# Convert the web URL to the HF CLI bucket URI
if BASE_BUCKET.startswith("https://huggingface.co/buckets/"):
    BUCKET_URI = BASE_BUCKET.replace(
        "https://huggingface.co/buckets/",
        "hf://buckets/"
    )
else:
    BUCKET_URI = BASE_BUCKET

hf_api = HfApi(token=HF_TOKEN)

LOGS_DIR = f"{BUCKET_URI}/logs"
IMAGE_UPLOADS = f"{BUCKET_URI}/image_uploads"
FRUITS_VEG_DATASET = f"{BUCKET_URI}/fruits_veg_data"
ML_MODELS = f"{BUCKET_URI}/ml_models"