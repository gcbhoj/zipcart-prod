import logging
import os
from flask import g, has_request_context


class RequestIdFilter(logging.Filter):

    def filter(self, record):
        if has_request_context():
            record.request_id = getattr(g, "request_id", "N/A")
        else:
            record.request_id = "N/A"

        return True


def configure_logging():

    os.makedirs("logs", exist_ok=True)

    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] "
        "[REQ-ID: %(request_id)s] %(name)s - %(message)s"
    )

    request_id_filter = RequestIdFilter()

    logger = logging.getLogger("flask_app")
    logger.setLevel(logging.INFO)
    logger.propagate = False

    if not logger.handlers:

        # Console
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(formatter)
        console_handler.addFilter(request_id_filter)

        # File
        file_handler = logging.FileHandler(
            "logs/app.log",
            mode="a",
            encoding="utf-8"
        )
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(formatter)
        file_handler.addFilter(request_id_filter)

        logger.addHandler(console_handler)
        logger.addHandler(file_handler)

    return logger