#node > v14.17.3
#npx sequelize-cli model:generate --name Post --attributes uid:integer,image:string,text:string
#npx sequelize-cli model:generate --name User --attributes username:string,password:string --force

#for 80 port with root permissions
sudo apt install authbind
sudo touch /etc/authbind/byport/80
sudo chown %user% /etc/authbind/byport/80
sudo chmod 755 /etc/authbind/byport/80
#install package
npm install
sudo npm i -g pm2 cross-env
cd src/
if [ ! -f ../database.sqlite ]; then
    cross-env NODE_ENV=production npx sequelize-cli db:migrate
fi
cd ../
mkdir web
npm run build
cross-env NODE_ENV=production authbind --deep pm2 start ./bin