import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Template
from random import randint

# Параметры для УЗ, которая будет использоваться для отправки почты
LOGIN = ''
PSW = ''

class mail:


    def __init__(self, log, pas, server, port, message_from) -> None:

        self.login = log
        self.password = pas
        self.message_from = message_from

        self.server = smtplib.SMTP(server, port)
        self.server.starttls()
        self.server.login(self.login, self.password)

    def sendToCorpMail(self, to: str, order_number, username: str, phone: str, email: str, service: list, ticket_summary: str) -> None:
        """Выслать сообщение на корпоративную почту"""

        order_number = str(order_number).zfill(8)

        # Формируем сообщение
        
        # Загружаем шаблон
        template = open('./backend/libs/mailTemplates/toCompany.html', 'r', encoding='utf-8').read()
        template = Template(template)

        # Формируем сообщение
        msg = MIMEMultipart()

        msg['From'] = self.message_from
        msg['To'] = to
        msg['Subject'] = order_number + ' | Поступил новый заказ'

        p = {
            'user_name': username,
            'user_phone': phone,
            'user_email': email,
            'order_number': order_number,
            'service': service,
            'ticket_summary': ticket_summary
        }
        template = template.render(p)

        msg.attach(MIMEText(template, 'html'))

        # Отправляем сообщение адресату
        self.server.sendmail(self.message_from, to, msg.as_string())

    def sendToUser(self, order_number, username: str, phone: str, email: str, service: list, ticket_summary: str) -> None:
        """Выслать сообщение на почту пользователя"""

        order_number = str(order_number).zfill(8)

        # Формируем сообщение
        
        # Загружаем шаблон
        template = open('./backend/libs/mailTemplates/toUser.html', 'r', encoding='utf-8').read()
        template = Template(template)

        # Формируем сообщение
        msg = MIMEMultipart()

        msg['From'] = self.message_from
        msg['To'] = email
        msg['Subject'] = order_number + ' | Вы оформили заказ'

        p = {
            'user_name': username,
            'user_phone': phone,
            'user_email': email,
            'order_number': order_number,
            'service': service,
            'ticket_summary': ticket_summary
        }
        template = template.render(p)

        msg.attach(MIMEText(template, 'html'))

        # Отправляем сообщение адресату
        self.server.sendmail(self.message_from, email, msg.as_string())

    def close(self) -> None:
        self.server.quit()

if __name__ == '__main__':

    if not (LOGIN or PSW):
        raise '[!] LOGIN or PASSWORD is empty '
    
    mail = mail(LOGIN, PSW)
    mail.sendToCorpMail(to='lunatic@motivtelecom.ru')
    mail.sendToCorpMail(to='dizelevmaksim@gmail.com')

    mail.close()

