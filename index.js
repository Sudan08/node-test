
const app = require('./app');
const port =8000;

const PORT = process.env.PORT || port;

const server = app.listen(PORT, () => {
  console.log('server is running on port', server.address().port);
});