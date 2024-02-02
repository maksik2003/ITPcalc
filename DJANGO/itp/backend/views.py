from django.shortcuts import render, redirect
from django.http import FileResponse, JsonResponse, HttpResponseRedirect, HttpResponseBadRequest, HttpResponse, HttpResponseServerError

from .models import *

# Либы для БД
import sqlite3
import psycopg2, psycopg2.pool

DB_PATH = r'E:/ИТП/database.db'

PG_URL          = 'it-db-test.corp.motiv'
PG_PORT         = '1521'
PG_DB_NAME      = 'itprsp'
PG_USER         = 'itprsp_user'
PG_PSW          = 'v64)2PXz'

# Соединение с БД SQLite
class database:
    def __init__(self):
        try:
            self.connect = sqlite3.connect(DB_PATH, check_same_thread=False)
            self.cursor = self.connect.cursor()
        except Exception as e:
            print(e)

# Create your views here.
def index(request):
    return render(request, 'index.html')

def old_loadCalcPage(request) -> list:
    """Загрузка всех данных для калькулятора путем единственного запроса"""
    db = database()
    service_list = db.cursor.execute('SELECT name, description, id FROM service_list ORDER BY id ASC').fetchall()

    if not service_list:
        return HttpResponseServerError()
    
    result = {}
    for sl in service_list:
        name = sl[0]
        desc = sl[1]

        # Проверка наличия шаблонов
        templates = []
        _q = db.cursor.execute('SELECT id, template_name FROM templates WHERE id_service = {id_service}'.format(id_service = sl[2])).fetchall()
        for i in _q:
            _q2 = db.cursor.execute(f'SELECT id_text_param, value FROM template_params WHERE id_template = {i[0]}').fetchall()
            z = {'name': i[1], 'params': []}
            for y in _q2:
                z['params'].append({'id_text_param': y[0], 'value': y[1]})
            templates.append(z)

        result[name] = {
            'name': name,
            'description': desc,
            'params': [],
            'templates': templates
        }

    params = db.cursor.execute('SELECT * FROM view_params').fetchall()
    for line in params:

        _list = []
        if line[3] == 'named_slider':
            _list = [int(x) for x in line[14].split(',')]

        if line[3] == 'list':
            _q = db.cursor.execute('SELECT value, price FROM parameters_list WHERE id_param = {id_param}'.format(id_param = line[12])).fetchall()
            for x in _q:
                _list.append({'value': x[0], 'price': x[1]})

        if line[3] == 'static':
            _list = line[14]

        result[line[0]]['params'].append({
            'id': line[1],
            'name': line[2],
            'type': line[3],
            'step': line[4],
            'min_value': line[5],
            'max_value': line[6],
            'price': line[7],
            'description': line[8],
            'two_by_one': False if not line[9] else True,
            'two_by_one_value': line[10],
            'inherit_by': line[11],
            'isOneGetService': False if not line[13] else True,
            'value': _list,
            'isAdditionalService': False if not line[16] else True,
            'is_two_by_one': False if not line[17] else True,
            'is_two_by_one_value': line[18],

        })

    finnaly_result = [result[i] for i in result]
        
    return JsonResponse({'result': finnaly_result})

def loadCalcPage(request) -> list:
    """Загрузка всех данных для калькулятора путем единственного запроса"""
    service_list = serviceList.objects.all()

    if not service_list:
        return HttpResponseServerError()
    
    result = {}
    for sl in service_list:

        # Проверка наличия шаблонов
        t = []
        _q = templates.objects.filter(id_service=sl.id)
        for i in _q:
            _q2 = templateParams.objects.filter(id_template=i.id)
            z = {'name': i.template_name, 'params': []}
            for y in _q2:
                z['params'].append({'id_text_param': y.id_text_param.id_text, 'value': y.value})
            t.append(z)

        result[sl.name] = {
            'name': sl.name,
            'description': sl.description,
            'params': [],
            'templates': t
        }

    params = parameters.objects.all()
    for line in params:

        _list = []
        if line.type == 'named_slider':
            _list = [int(x) for x in line.value.split(',')]

        if line.type == 'list':
            _q = parametersList.objects.filter(id_param=line.id)
            for x in _q:
                _list.append({'value': x.value, 'price': x.price})

        if line.type == 'static':
            _list = line.value

        result[line.id_service.name]['params'].append({
            'id': line.id_text,
            'name': line.name,
            'type': line.type,
            'step': line.step,
            'min_value': line.min_value,
            'max_value': line.max_value,
            'price': line.price,
            'description': line.description,
            'two_by_one': line.twoByOne,
            'two_by_one_value': line.twoByOneValue,
            'inherit_by': line.inherit_by,
            'isOneGetService': line.isOneGetService,
            'value': _list,
            'isAdditionalService': line.isAdditionalService,
            'is_two_by_one': line.twoByOne,
            'is_two_by_one_value': line.twoByOneValue,

        })

    finnaly_result = [result[i] for i in result]
        
    return JsonResponse({'result': finnaly_result})
