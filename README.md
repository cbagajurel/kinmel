# Kinmel

# nx setup:

npx create-nx-workplace@latest kinmel

nx add @nx/express
nx g @nx/express:app api-gateway -directory=apps/api-gateway --e2eTestRunner=none

// package.json script setup
"scripts":{
"dev": "npx nx run-many --target=serve --all"
}

# packages

express-http-proxy cors morgan express-rate-limit swagger-ui-express axios cookie-parser ioredis nodemailer dotenv ejs

prisma: npm i prisma @prisma/client

# prisma setup

npm i -d prisma
npx prisma init

# sync model

npx prisma db push

if address already in use  
 do `npx kill-port portnumber`
