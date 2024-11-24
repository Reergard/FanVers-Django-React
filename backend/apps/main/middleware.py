from django.utils.cache import patch_cache_control


def no_cache_middleware(get_response):  # запобігає кешуванню
    def middleware(request):
        response = get_response(request)
        patch_cache_control(response, no_cache=True, no_store=True, must_revalidate=True)
        return response
    return middleware
