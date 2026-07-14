# Evanđelje dana

Jednostavna web aplikacija koja prikazuje evanđelje za tekući dan. Tekst se
automatski dohvaća sa stranice [hilp.hr/liturgija-dana](https://hilp.hr/liturgija-dana/)
(Hrvatski institut za liturgijski pastoral).

## Kako radi

- `index.html` — statična stranica (naslov, izreka, tekst evanđelja, poveznice).
- `api/evandjelje.js` — serverless funkcija (Vercel) koja dohvati stranicu
  hilp.hr, izvuče evanđelje i vrati ga kao JSON. Odgovor se kešira 15–30 minuta.
- `dev/server.mjs` — mali lokalni poslužitelj za razvoj i testiranje
  (namjerno u podmapi: Vercel bi `server.mjs` u korijenu prepoznao kao
  Node aplikaciju i prestao koristiti funkcije iz `api/`).

## Lokalno pokretanje

```
node dev/server.mjs
```

Zatim otvori http://localhost:8788

## Objava na Vercel

U ovom direktoriju pokreni:

```
npx vercel --prod
```

Pri prvom pokretanju prijavi se svojim Vercel računom i potvrdi ponuđene
postavke (nema build koraka — sve ostavi kako jest). Aplikacija dobiva adresu
poput `https://evandjelje-dana.vercel.app`.

Alternativa: poveži direktorij s GitHub repozitorijem pa na vercel.com odaberi
*Add New → Project* i uveži repozitorij.

## Napomene

- Ako hilp.hr promijeni strukturu stranice, funkcija će vratiti grešku, a
  stranica će prikazati poveznicu na hilp.hr kao zamjenu.
- Tekst lekcionara autorsko je djelo; aplikacija je namijenjena osobnoj upotrebi,
  a kao izvor je uvijek navedena poveznica na hilp.hr.
