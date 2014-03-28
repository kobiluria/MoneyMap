from flask import Blueprint
from . import views


blueprint = Blueprint('api', __name__, url_prefix='/api')

blueprint.add_url_rule('/', view_func=views.EntityMap.as_view('entity_map'))
