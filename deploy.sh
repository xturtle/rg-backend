#node > v14.17.3
#npx sequelize-cli model:generate --name Post --attributes uid:integer,image:string,text:string
#npx sequelize-cli model:generate --name User --attributes username:string,password:string --force

sudo npm i -g pm2 cross-env
cross-env NODE_ENV=production npx sequelize-cli db:migrate:undo:all && npm run migrate
mkdir web
npm run build
cross-env NODE_ENV=production pm2 start ./bin