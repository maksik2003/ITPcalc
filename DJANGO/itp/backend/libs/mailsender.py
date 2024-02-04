import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Template

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

        msg['From'] = 'lunatic@motivtelecom.ru'
        msg['To'] = to
        msg['Subject'] = 'Тестовое письмо Subject'

        order_number = '321'
        order_number = order_number.zfill(8)

        # text = 'Привет! Тестовое письмо, отправленное с помомщью Python <h1 style="color: red;">Заголовок H1</h1>'
        template = open('./backend/libs/mailTemplates/toCompany.html', 'r', encoding='utf-8').read()
        template = Template(template)
        template = template.render(user_name='Пономарев Максим Владимирович', user_phone='+7 (953) 055-49-63', user_email='maksikponomarev2003@gmail.com', order_number=order_number)

        msg.attach(MIMEText(template, 'html'))

        self.server.sendmail('lunatic@motivtelecom.ru', to, msg.as_string())

        self.server.quit()

if __name__ == '__main__':

    mail = mail(LOGIN, PSW)
    mail.send(to='maksikponomarev2003@gmail.com')

