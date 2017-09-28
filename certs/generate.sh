openssl genrsa -out selfsigned.key 2048
openssl rsa -in selfsigned.key -out server.key
openssl req -sha256 -new -key server.key -out server.csr -subj '/CN=localhost'
openssl x509 -req -sha256 -in server.csr -signkey server.key -out selfsigned.crt
