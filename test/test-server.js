const chai = require('chai');

const chaiHttp = require('chai-Http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use('chaiHttp');

describe('blog', function() {

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should list blogs on GET', function() {
    return chai.request(app)
      .get('/BlogPosts')
      .then(function(res) {
        res.body.should.be.a('array');
        res.should.be.json;
        res.body.length.should.be.at.least(1);
        res.should.have.status(200);

        const expectedKeys = ['id', 'title', 'author', 'content', 'publishDate'];
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });
      });
  });

  it('should add blog on POST', function() {
    const newItem = {title: 'basketball', author: 'jameson', content: 'basketball is fun',
    publishDate: '4/17/2017'}

    return chai.request(app)
      .post('/BlogPosts')
      .send(newItem);

  })
  .then(function(res) {
    res.status.should.be(201);
    res.should.be.json;
    res.body.should.be.a('object');
    res.should.include.keys('id', 'title', 'author', 'content', 'publishDate');
    res.body.title.should.equal(newItem.title);
    res.body.author.should.equal(newItem.author);
    res.body.id.should.not.be.null;
    res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id}));
  });

  it('should update blogs on PUT', function() {
    const updatedItem = {
      title: 'Sports - Basketball and golf',
      author: 'Jameson Hill',
      content: 'Basketball is fun. Golf too.',
      publishDate: '4/17/2017'
    }
    return chai.request(app)
      .get('/BlogPosts')
      .then(function(res) {
        updatedItem.id = res.body[0].id;

        return chai.request(app)
          .put(`/BlogPosts/${updatedItem.id}`)
          .send(updatedItem);
      })

      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.title.should.equal(updatedItem.title);
        res.body.author.should.equal(updatedItem.author);
        res.body.content.should.equal(updatedItem.content);
        res.body.publishDate.should.equal(updatedItem.publishDate);
        res.body.should.be.a('object');
      });
  });

  it('should delete blog on DELETE', function() {
    return chai.request(app)
      .get('/BlogPosts')
      .then(function(res) {
        return chai.request(app)
          .delete(`/BlogPosts/${res.body[0].id}`)
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });

});
