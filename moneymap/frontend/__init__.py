from flask import Blueprint
from . import views


blueprint = Blueprint('frontend', __name__, url_prefix='',
                      template_folder='templates')

blueprint.add_url_rule('/', view_func=views.Home.as_view('home'))
