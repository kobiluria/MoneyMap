from flask import Flask


# from celery import Celery
# from redis import StrictRedis
# queue = Celery()
# queue.config_from_object(config)
# cache = StrictRedis(host=config.REDIS['HOST'], port=config.REDIS['PORT'],
#                     db=config.REDIS['DB'])


def create_app(config):
    """A simple application factory."""

    from moneymap.models import maps
    from moneymap import core, api, frontend
    app = Flask(__name__)
    app.config.from_object(config)

    core.db.init_app(app)

    app.register_blueprint(api.blueprint)
    app.register_blueprint(frontend.blueprint)

    return app
