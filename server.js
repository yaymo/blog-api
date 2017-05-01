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

app.put('/posts/:id', (req, res) => {
  if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({error:'Request path id and body id must match'});
  }

  const updated = {};
  const updateableFields = ['title', 'content', 'author'];
  updateableFields.forEach(field => {
    if(field in req.body) {
      updated[field] = req.body[field];
    }
  });

  BlogPost
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new:true})
    .exec()
    .then(updatedPost => res.status(201).json(updatedPost.apiRepr()))
    .catch(err => res.status(500).json({message: 'Internal Server Error'}));

});

app.delete('/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => {
      console.log(`Deleted post with id \`${req.params.ID}\``);
      res.status(204).end();
    });
});

app.use('*', function(req, res) {
  res.status(404).json({message: 'Not found'});
});

let server;

function runServer(databaseURL=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseURL, err => {
      if(err) {
        return reject(err);
      }
      server = app.listen(port, ()=> {
        console.log(`app is listening on port ${port}`);
        resolve();
      })
      .on('error', err=> {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}


function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise(resolve, reject) => {
      console.log('close server');
      server.close(err => {
        if(err) {
          return reject(err);
        }
        resolve();
      });
    };
  });
}


if(require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {runServer, app, closeServer};
















