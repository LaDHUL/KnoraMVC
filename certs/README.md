`https` requires a certificate, here is how the `selfsigned` certificate was created:

```bash
openssl req -x509 -newkey rsa:4096 -keyout selfsigned.key -out selfsigned.pem -subj "/C=EU/ST=Vaud/L=Lausanne/O=Company/OU=Org/CN=www.example.com"
```

