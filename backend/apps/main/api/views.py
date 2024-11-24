from django.shortcuts import render
from django.http import JsonResponse


def index(request):
    return render(request, "main/index.html")


def home_data(request):
    data = {
        "title": "Ласкаво просимо до UAtranslate",
        "description": "Місце де ви знайдете фанфік або новелу на свій смак. ",
    }
    return JsonResponse(data)
