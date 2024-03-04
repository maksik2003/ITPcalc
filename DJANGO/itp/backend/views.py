from django.shortcuts import render, redirect
from django.http import FileResponse, JsonResponse, HttpResponseRedirect, HttpResponseBadRequest, HttpResponse, HttpResponseServerError
from .models import *

from backend.libs import mailsender

import json
from traceback import format_exc

# Create your views here.
def index(request):
    return render(request, 'index.html')

def loadCalcPage(request) -> list:
    """Загрузка всех данных для калькулятора путем единственного запроса"""

    # Получаем данные из БД
    service_list = serviceList.objects.all()

    # В случае, если данные не были получены, то выдаем ошибку сервера
    if not service_list:
        return HttpResponseServerError()
    
    # Собираем данные в нужный вид, а так же подгружаем данные из других таблиц
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

def createOrder(request):
    """Для создания заказа"""

    # Получение данных из тела запроса и перефомирование их в JSON
    recieved_data = json.loads(request.body.decode('utf-8'))    

    services = recieved_data['order_params']
    # т.к. данные, которые передаются с фронта передаются не в том виде в котором нам это надо, необходимо их сейчас переделать в нужный вид
    new_ar = []
    for ar in services:

        # Если множитель пустой, то его не надо выводить
        if not services[ar]['multiply']:
            new_ar.append({
                'service_name': ar,
                'params': services[ar]['ticket_config'] + services[ar]['ticket_additionalService'] + services[ar]['ticket_gift']
            })
            continue
        
        new_ar.append({
            'service_name': ar + ' (x' + str(services[ar]['multiply']) + ')',
            'params': services[ar]['ticket_config'] + services[ar]['ticket_additionalService'] + services[ar]['ticket_gift']
        })
    
    services = new_ar

    # Формируем заказ в БД
    new_order = orders.objects.create(
        username = recieved_data['name'],
        phone = recieved_data['phone'],
        email = recieved_data['email'],
        services = {'services': services},
        ticket_summary = recieved_data['ticket_sum']
    )
    
    # Начинаем рассылку информационных писем. В первую очередь на почту компании
    # Дополнительно все логируем на всякий случай
    logging.objects.create(
        log = 'Создание письма на почту компании',
        parameters = new_order.id
    )
    
    parameters = mailServerOptions.objects.filter()
    if not parameters:
        logging.objects.create(
            log = 'В таблице с параметрами не найдено записей о параметрах'
        )
        raise ValueError('Нету данных для использования в авторизации на почтовом сервере')
    
    parameters = parameters[len(parameters) - 1]
    mail = mailsender.mail(parameters.user_login, parameters.user_password, parameters.server, parameters.port, parameters.message_from)
    try:
        mail.sendToCorpMail(
            to = parameters.companyMail,
            order_number = new_order.id,
            username = new_order.username,
            phone = new_order.phone,
            email = new_order.email,
            service = services,
            ticket_summary = new_order.ticket_summary
        )

        logging.objects.create(
            log = 'Письмо на корпоративную почту успешно отправлено',
            parameters = new_order.id
        )

    except Exception as e:
        logging.objects.create(
            log = 'Во время отправки письма на корпоративную почту возникла ошибка',
            parameters = format_exc()
        )

    logging.objects.create(
        log = 'Создание письма на почту клиента',
        parameters = new_order.id
    )

    try:
        mail.sendToUser(
            order_number = new_order.id,
            username = new_order.username,
            phone = new_order.phone,
            email = new_order.email,
            service = services,
            ticket_summary = new_order.ticket_summary
        )

        logging.objects.create(
            log = 'Письмо на клиентскую почту успешно отправлено',
            parameters = new_order.id
        )

    except Exception as e:
        logging.objects.create(
            log = 'Во время отправки письма на клиентскую почту возникла ошибка',
            parameters = format_exc()
        )

    # Закрываем соединение с почтовым сервером
    mail.close()

    return HttpResponse()
