FROM python:3.8.0
WORKDIR /code
COPY . .
ENV FLASK_APP main.py
ENV FLASK_ENV production
RUN pip install -r requirements.txt
CMD ["flask", "run", "-h", "0.0.0.0", "-p", "8000"]
