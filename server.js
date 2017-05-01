const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const {BlogPost} = require('./models');
const {DATABASE_URL, PORT} = require('./config');

const app = express();

app.use(morgan('common'));
app.user(bodyParser.json());

mongoose.Promise = global.Promise;

app.get('/posts', (req, res) => {
  BlogPost
    .find()
    .exec()
    .then(posts => {
      res.json(posts.map(post=> post.apiRepr()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Internal Server Error'});
    });
});

app.get('/post/:id', (req, res) => {
  BlogPost
    .findById(req.params.id)
    .exec()
    .then(post => res.json(post.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Internal Server Error'});
    });
});

app.post('/posts', (req, res) => {
  const reqFields = ['title', 'content', 'author'];
  for(let i=0; i<reqFields.length; i++){
    const field = reqFields[i];
    if(!(field in reqFields)){
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      res.status(400).send(message);
    }
  }

  BlogPost
    .create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author
    })
    .then(blogPost => res.status(201).json(blogPost.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Internal Server Error'});
    });
});

app.delete('/posts/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => {
      res.status(204).json({message:'successfully deleted'});
    });
});

















