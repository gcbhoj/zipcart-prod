from flask import Blueprint
from flasgger import swag_from


from controller.fruits_veg_identify_controller import predict_fruit_veg

fruits_veg_identify_bp = Blueprint("fruits_veg_identify_bp",__name__)

fruits_veg_identify_controller = swag_from("../swaggerdocs/fruits_veg_identify.yml")(predict_fruit_veg)
fruits_veg_identify_bp.route("/predict", methods=["POST"])(fruits_veg_identify_controller)

