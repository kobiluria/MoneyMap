from flask.ext.script import Command
from ..models import maps


class Seed(Command):

    def run(self):

        # I use this to initial data into the database.
        # Write whatever logic you need, and invoke with:
        # `python manage.py seed`

        return True
