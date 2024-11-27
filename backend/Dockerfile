FROM python:3.10

# Instala el compilador de C++
RUN apt-get update && apt-get install -y g++

WORKDIR /app

COPY app.py .
COPY requirements.txt .

RUN pip install -r requirements.txt
RUN pip install flask-cors

#EXPOSE 5000 #puerto 5000 para que Flask sea accesible desde fuera del contenedor?
EXPOSE 4321

CMD ["python", "app.py"]
