import os
import uuid
import threading

from flask import Flask, g, request
from flask_cors import CORS
from flasgger import Swagger


from config.logger_config import configure_logging
from config.swagger_config import SWAGGER_CONFIG, SWAGGER_TEMPLATE
# from config.image_data_set_loader import ImageDataSetLoader
from middleware.exception_handler import register_error_handlers

from routes.fruits_veg_identify_routes import fruits_veg_identify_bp


app = Flask(__name__)


# ============================================================
# LOGGING
# ============================================================

logger = configure_logging()

logger.info("Server Starting...")


# ============================================================
# CORS
# ============================================================

CORS(app)


# ============================================================
# REQUEST ID / CORRELATION ID
# ============================================================

@app.before_request
def start_request_tracking():

    # Use incoming request ID if provided.
    # Otherwise generate one.
    g.request_id = request.headers.get(
        "X-Request-ID",
        str(uuid.uuid4())[:8]
    )

    logger.info(
        "Started %s %s",
        request.method,
        request.path
    )


@app.after_request
def end_request_tracking(response):

    logger.info(
        "Finished request with Status Code: %s",
        response.status_code
    )

    response.headers["X-Request-ID"] = g.request_id

    return response


# ============================================================
# SWAGGER
# ============================================================

Swagger(
    app,
    config=SWAGGER_CONFIG,
    template=SWAGGER_TEMPLATE
)


# ============================================================
# APPLICATION CONFIG
# ============================================================

PORT = 5100
DEBUG = True

BASE_URL = "/api/v1/MLservices"

# ============================================================
# DEVELOPMENT INITIALIZATION
# ============================================================
# def sync_image_dataset():
#     logger.info(
#         "Starting image dataset sync..."
#     )

#     initializer = ImageDataSetLoader()
#     dataset = initializer.init_data_set()

#     logger.info(
#         "Dataset sync successful"
#     )

# APP_ENV = os.getenv("APP_ENV", "development")

# if APP_ENV == "development":
#     logger.info("Running development startup...")
#     sync_image_dataset()
# else:
#     logger.info("Production mode detected. Skipping dataset download.")


# ============================================================
# ROUTES
# ============================================================

@app.route("/")
def home():

    logger.info("Home endpoint called")

    return {
        "message": "Hello From Flask"
    }


app.register_blueprint(
    fruits_veg_identify_bp,
    url_prefix=BASE_URL+"/zipcart"
    
)
# ============================================================
# Global Error handler
# ============================================================
register_error_handlers(app)

# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    logger.info(
        "Starting Flask server on port %s",
        PORT
    )

    app.run(
        host="0.0.0.0",
        port=PORT,
        debug=DEBUG,
        use_reloader=True,
    )