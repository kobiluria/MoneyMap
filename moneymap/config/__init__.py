import os


DEBUG = True

SECRET_KEY = 'super-secret-random-string-here'

CONF_ROOT = os.path.abspath(os.path.dirname(__file__))

APP_ROOT = os.path.abspath(os.path.dirname(CONF_ROOT))

WORK_ROOT = os.path.abspath(os.path.dirname(APP_ROOT))

TEMPLATE_ROOT = os.path.join(APP_ROOT, 'templates')

STATIC_ROOT = os.path.join(APP_ROOT, 'static')

STATIC_URL = '/static/'

REDIS = {
    'SCHEME': 'redis://',
    'HOST': '127.0.0.1',
    'PORT': 6379,
    'DB': 0,
}

REDIS_URL = '{scheme}{host}{port}/{db}'.format(scheme=REDIS['SCHEME'],
                                               host=REDIS['HOST'],
                                               port=REDIS['PORT'],
                                               db=REDIS['DB'])


REDIS_KEY_PREFIX = 'moneymap::'


# queue config
BROKER_URL = REDIS_URL

# db config
MONGODB_SETTINGS = {
    'DB': 'moneymap',
    'USERNAME': 'robot',
    'PASSWORD': '',
    'HOST': '127.0.0.1',
    'PORT': 27017
}


# if we are on production, we should have a conf.deploy module to load.
# conf.deploy is generated via fabric for production environments.
try:
    from .deploy import *
except ImportError:
    # if we are on local, we accept overrides in a conf.local module.
    # For safety, we only try to load conf.local if conf.production
    # does not exist.
    try:
        from .local import *
    except ImportError:
        pass
