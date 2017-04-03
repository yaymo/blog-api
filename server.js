const express = require('express');
const morgan = require('morgan');

const app = express();

const blogRouter = require('./blogRouter');

app.use(morgan('common'));

app.use('/blog-post', blogRouter);

app.listen(process.env.PORT || 8080, () => {
  console.log(`your app is listenting on port ${process.env.PORT || 8080}`);
});
