#node > v14.17.3
#npx sequelize-cli model:generate --name Post --attributes uid:integer,image:string,text:string
#npx sequelize-cli model:generate --name User --attributes username:string,password:string --force

npm install
sudo npm i -g pm2 cross-env
cd src/
if [ ! -f ../database.sqlite ]; then
    cross-env NODE_ENV=production npx sequelize-cli db:migrate
fi
cd ../
mkdir web
npm run build
cross-env NODE_ENV=production pm2 start ./bin