from flask.ext.script import Manager
from moneymap.factories import create_app
from moneymap import config
from moneymap.manage import data


manager = Manager(create_app(config))
manager.add_command("seed", data.Seed())


if __name__ == "__main__":
    manager.run()
