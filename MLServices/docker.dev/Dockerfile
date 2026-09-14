FROM python:3.11-slim

# Install system dependencies for dlib, face_recognition, AND pyzbar
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    libboost-all-dev \
    libzbar0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN mkdir -p /app/jupyter_notebook

# Copy requirements
COPY requirements_dev.txt .

# Install Python dependencies
RUN pip install --upgrade pip setuptools wheel
RUN pip install notebook ipykernel
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements_dev.txt
RUN pip install --no-cache-dir -U huggingface_hub
# Copy your app code
COPY . /app

# Make sure MLModels folder is included
# COPY data/fruits_data /app/fruits_data
COPY ML_models /app/ML_models

# If you need test images, copy them too
COPY ./scripts/start.sh /start.sh
RUN chmod +x /start.sh

ENV PYTHONPATH=/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 5100

CMD ["/start.sh"]