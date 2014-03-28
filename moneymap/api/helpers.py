

def api_prepared(queryset):
    """Prepares API results by calling each object's to_api method."""

    api_prepared = [o.to_api for o in queryset]

    return api_prepared
