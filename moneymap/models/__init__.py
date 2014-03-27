

class APISerializer(object):

    """Returns a Python dictionary of fields for consumption in API views.

    This is very simple and naive.

    It will require more work for nested objects, etc.

    """

    api_fields = []

    @property
    def to_api(self):

        obj = {}

        for index, field in enumerate(self.api_fields):

            if field == 'id':
                obj['id'] = str(getattr(self, 'id'))
            else:
                obj[field] = getattr(self, field)

        return obj
