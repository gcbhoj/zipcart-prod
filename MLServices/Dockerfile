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


# Copy requirements
COPY requirements_prod.txt .

# Install Python dependencies
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements_prod.txt

# Copy your app code
COPY . /app

# Make sure MLModels folder is included
# COPY MLMODELS /app/MLMODELS

# If you need test images, copy them too
COPY ./scripts/prodstart.sh /prodstart.sh
RUN sed -i 's/\r$//' /prodstart.sh && \
    chmod +x /prodstart.sh

ENV PYTHONPATH=/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 7860

CMD ["/prodstart.sh"]