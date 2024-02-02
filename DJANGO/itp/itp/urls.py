from django.urls import path
from backend import views

urlpatterns = [
    # path('api/params', views.params, name = 'params'),
    # path('api/services', views.services, name = 'services'),
    path('api/loadCalc', views.loadCalcPage, name = 'loadCalc'),
    path('', views.index, name = 'index')
]
