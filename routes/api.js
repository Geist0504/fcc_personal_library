/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

const db_collection = 'books'

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        let collection = db.collection(db_collection)
        collection.find().toArray((err,docs) => {          res.json(docs)})
      });
    })
    
    .post(function (req, res){
      if(!req.body.title){
        res.send('missing title')
      } else{
        let book = {title: req.body.title}
        MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          let collection = db.collection(db_collection)
          collection.insertOne(book, (err, data) => {
            book._id = data.insertedId;
            res.json(book)
          })
        })
      }  
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
    //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        let collection = db.collection(db_collection)
        collection.remove({}, (err, data) => {
          err ? res.send(err) : res.send('complete delete successful')
        })
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      if(!req.params.id){
        res.send('missing id')
      } else{
        var bookid = req.params.id;
        MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          let collection = db.collection(db_collection)
          collection.findOne({_id: new ObjectId(bookid)} ,(err,book) => {
            res.json(book)})
        });
      }
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
  
};
