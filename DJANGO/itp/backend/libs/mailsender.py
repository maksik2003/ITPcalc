import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Template
from random import randint

LOGIN = 'it_lunatic'
PSW = '1020Love))'

class mail:

    def __init__(self, log, pas) -> None:

        self.login = log
        self.password = pas

        self.server = smtplib.SMTP('excas.corp.motiv', 587)
        self.server.starttls()
        self.server.login(self.login, self.password)

    def send(self, to: str) -> None:

        msg = MIMEMultipart()
        order_number = str(randint(1, 1000))
        order_number = order_number.zfill(8)

        msg['From'] = 'lunatic@motivtelecom.ru'
        msg['To'] = to
        msg['Subject'] = order_number + ' | Поступил новый заказ'


        # text = 'Привет! Тестовое письмо, отправленное с помомщью Python <h1 style="color: red;">Заголовок H1</h1>'
        template = open('./backend/libs/mailTemplates/toCompany.html', 'r', encoding='utf-8').read()
        template = Template(template)
        p = {
            'user_name': 'Пономарев Максим Владимирович',
            'user_phone': '+7 (000) 000-00-00',
            'user_email': 'maksikponomarev2003@gmail.com',
            'order_number': order_number,
            'service': [
                {'service_name': 'Облачный сервер (x2)', 'params': [{'name': 'Количество vCPU', 'value': 'x2'}, {'name': 'RAM', 'value': 'x2'}, {'name': 'Загрузочный SSD', 'value': 'x50'}]},
                {'service_name': 'Веб-хостинг (x1)', 'params': [{'name': 'Количество vCPU', 'value': 'x1'}, {'name': 'RAM', 'value': 'x2'}, {'name': 'Загрузочный SSD', 'value': 'x20'}, {'name': 'Резервное копирование дискового пространства', 'value': 'x1'}, {'name': 'Публичный IP', 'value': 'x1'}, {'name': 'Хостинг DNS записи', 'value': 'x1'}]}
            ],
            'ticket_summary': '4659.83'
        }
        template = template.render(p)

        msg.attach(MIMEText(template, 'html'))

        self.server.sendmail('lunatic@motivtelecom.ru', to, msg.as_string())

    def close(self) -> None:
        self.server.quit()

if __name__ == '__main__':

    mail = mail(LOGIN, PSW)
    mail.send(to='lunatic@motivtelecom.ru')
    mail.send(to='tomilis@motivtelecom.ru')
    mail.send(to='dizelevmaksim@gmail.com')
    # mail.send(to='volodeev.e.o@motivtelecom.ru')

    mail.close()

