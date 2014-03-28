from flask import jsonify
from flask.views import MethodView
from .helpers import api_prepared
from moneymap.models import maps


class EntityMap(MethodView):

    def get(self):
        objects = maps.EntityMap.objects
        return jsonify(results=api_prepared(objects))

    def post(self):
        # logic for post requests
        # REMOVE it if you won't accept post
        pass

    def put(self):
        # logic for put requests
        # REMOVE it if you won't accept put
        pass

    def patch(self):
        # logic for patch requests
        # REMOVE it if you won't accept patch
        pass
