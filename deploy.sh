#node > v14.17.3
npx sequelize-cli model:generate --name Post --attributes uid:integer,image:string,text:string --force
npx sequelize-cli model:generate --name User --attributes username:string,password:string --force