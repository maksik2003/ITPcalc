FROM python:3.11.3

WORKDIR /

COPY ./requirements.txt /requirements.txt
RUN pip install -r /requirements.txt

COPY . /.

WORKDIR /itp

EXPOSE 8000
CMD ["python", "manage.py", "runserver_plus", "0.0.0.0:8000"]