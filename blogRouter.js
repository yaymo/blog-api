const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {BlogPosts} = require('./models');


BlogPosts.create('Hello World', 'Jameson Hill', 'Lorem Ipsum', '4/3/2017');
BlogPosts.create('Goodbye Universe', 'John Smith', 'BYE BYE BYE BYE', '4/2/2017');

router.get('/', (req, res) =>{
  res.json(BlogPosts.get());
});


router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['title', 'author', 'content', 'publishDate'];
  for(let i=0; i<requiredFields.length; i++){
    const field = requiredFields[i];
    if(!(field in requiredFields)){
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const item = BlogPosts.create(req.body.title, req.body.author, req.body.content, req.body.publishDate);
  res.status(201).json(item);
});


router.delete('/:id', (req, res) =>{
  BlogPosts.delete(req.params.id);
  console.log(`Deleted blog post \`${req.params.id}\``);
  res.status(204).end();
});


router.put('/:id', jsonParser, (req, res) => {
  const requiredFields = ['title', 'author', 'content', 'publishDate'];
  for(let i=0; i<requiredFields.length; i++){
    const field = requiredFields[i];
    if(! (field in requiredFields)){
      const message = `Missing \`${field}\` in the request body`
      console.error(message);
      res.status(400).send(message);
    }
  }

  if(req.params.id !== req.body.id) {
    const message = (
      `Request path id (${req.params.id}) and request body id `
      `(${req.body.id}) must match`);
    console.error(message);
    res.status(400).send(message);
  }
  const updatedBlog = BlogPosts.update({
    id: req.params.id,
    title: req.body.title,
    author: req.body.author,
    content: req.body.content,
    publishDate: req.body.publishDate
  });
  res.status(204).json(updatedBlog);
})

module.exports = router;
