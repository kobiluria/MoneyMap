from ..core import db
from . import APISerializer


class EntityMap(db.Document, APISerializer):

    api_fields = ['id', 'entity_key']

    entity_key = db.StringField()
    # whatever fields you need
