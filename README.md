# web1

- Проброс портов  
  `ssh -p 2222 s466828@helios.cs.ifmo.ru -L 6826:localhost:6828`
- Запуск httpd  
  `httpd -f ~/web1/config/httpd.conf -k restart`
- Запуск fcgi jar  
  `java -jar web1/fcgi-bin/lab1.jar`
- Порт lab1.jar: `6828`
- Порт fcgi: `6827`
