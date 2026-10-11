from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_GET
from dj_rest_auth.views import LoginView, LogoutView


@require_GET
def csrf_token(request):
    response = JsonResponse({"csrfToken": get_token(request)})
    response["Cache-Control"] = "no-store"
    return response


@method_decorator(csrf_protect, name="dispatch")
class WebLoginView(LoginView):
    authentication_classes = []


@method_decorator(csrf_protect, name="dispatch")
class WebLogoutView(LogoutView):
    authentication_classes = []