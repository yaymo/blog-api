const chai = require('chai');

const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = require('chai').should();

chai.use(chaiHttp);

describe('blog', function() {

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should list blogs on GET', function() {
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.should.be.json;
        res.body.length.should.be.above(0);

        const expectedKeys = ['id', 'title', 'author', 'content', 'publishDate'];
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.have.all.keys(expectedKeys);
        });
      });
  });

  it('should add blog on POST', function() {
    const newItem = {
      title: 'basketball',
      author: 'jameson',
      content: 'basketball is fun',
      publishDate: '04/17/2017'
    };

    return chai.request(app)
      .post('/blog-posts')
      .send(newItem)
      .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.all.keys('id', 'title', 'author', 'content', 'publishDate');
          res.body.title.should.equal(newItem.title);

        });
    });


  it('should update blogs on PUT', function() {

    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        const updatedItem = Object.assign(res.body[0], {
          title: 'basketball is life',
          content: 'basketball is fun'
        });

        return chai.request(app)
          .put(`/blog-posts/${res.body[0].id}`)
          .send(updatedItem)
          .then(function(res) {
            res.should.have.status(204);
            res.body.should.be.a('object');
        });

      });
  });

  it('should delete blog on DELETE', function() {
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        return chai.request(app)
          .delete(`/blog-posts/${res.body[0].id}`)
      })
        .then(function(res) {
          res.should.have.status(204);
        });
  });

});
