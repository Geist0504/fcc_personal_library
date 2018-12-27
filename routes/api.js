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
        collection.find().toArray((err,docs) => {
          console.log(docs.comments)
          if(docs.comments){console.log('comments')
            docs.commentcount = docs.comments.length
          }else{
            docs.commentcount = 0}
          res.json(docs)
        })
      });
    })
    
    .post(function (req, res){
      if(!req.body.title){
        res.send('missing title')
      } else{
        let book = {
          title: req.body.title,
          comments: [],
          commentcount: 0
        }
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
            err ? res.send('no book exists') : res.json(book)})
        });
      }
    })
    
    .post(function(req, res){
      if(!req.params.id || !req.body.comment ){
          res.send('missing input')
        }else{
          let bookid = new ObjectId(req.params.id);
          let comment = req.body.comment;
          MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          let collection = db.collection(db_collection)
          collection.findAndModify({_id: bookid},[['_id', 1]],{$push: {comments: comment}, $inc: {commentcount: 1}}, {new: true}, (err, data) => {
            if(err){res.send('could not update ' + bookid)} 
            else {res.json({_id: data.value._id, title: data.value.title, comments: data.value.comments})}
            })
          })
        }
          //json res format same as .get
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        let collection = db.collection(db_collection)
        collection.deleteOne({_id: new ObjectId(bookid)}, (err, data) => {
          err ? res.send(err) : res.send('delete successful')
        })
      })
    });
  
};
