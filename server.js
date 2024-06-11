const app = require('./app')
const {db} = require('./database')


db.authenticate().then(() => {
      app.listen(3000);
      console.log("Database connection successful");
      console.log("Server running. Use our API on port: 3000");
    }).catch((error) => {
      console.log(error.message);
      process.exit(1);
    });
