# Certificats SSL pour le développement

Ce dossier contiendra les certificats SSL pour le développement local.

Pour générer les certificats :

1. Installer mkcert :
```powershell
choco install mkcert
```

2. Installer l'autorité de certification locale :
```powershell
mkcert -install
```

3. Générer les certificats pour localhost :
```powershell
mkcert localhost 127.0.0.1 ::1
```

Les certificats générés (localhost+2.pem et localhost+2-key.pem) doivent être placés dans ce dossier.
