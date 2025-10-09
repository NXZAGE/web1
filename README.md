# web1

- Проброс портов  
  `ssh -p 2222 s466828@helios.cs.ifmo.ru -L 7616:localhost:7616`
- Запуск httpd  
  `httpd -f ~/web1/config/httpd.conf -k restart`
- Запуск fcgi jar  
  `java -jar web1/fcgi-bin/lab1.jar`
- Порт lab1.jar: `7616`
- Порт fcgi: `7615`
