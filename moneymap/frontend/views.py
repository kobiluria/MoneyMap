from flask import render_template
from flask.views import View


class Home(View):

    def dispatch_request(self):
        return render_template('frontend/home.html')
