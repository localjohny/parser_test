
1. npm i

2. в .env поменять url mysql log:pass

3. npx prisma generate --schema prisma/test_database.prisma
4. npx prisma migrate dev --name init --schema prisma/test_database.prisma

5. в ./credentials/olx.json ввести bearer token

6. node index.js