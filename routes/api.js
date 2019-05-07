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

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db){
        // in case where something went wrong
        if(err) return console.log('Database error: '+err);
        // otherwise we collect all the books and send the response inside an array
        db.collection('books')
          .aggregate([
            {$match: {}}, 
            {$project: { _id: true, title: true, commentcount: { $size: "$comments"}}}])
          .toArray( (err, DBRes) => {
            if(err) return console.log('Database read err: '+err);
            res.json(DBRes);
          });
        });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      // in case where the title is not valid
      if(!title || title == '')
        return res.send('invalid title');
      
      // otherwise
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db){
        // in case where something went wrong
        if(err) return console.log('Database error: '+err);
        // otherwise
        db.collection('books')
          .insertOne({
            title: title,
            comments: []
            }, function (err, DBRes) {
              if(err) return console.log('Database insert err: '+err);
              res.json(DBRes.ops[0]);
            });
        
          });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db){
        // in case where something went wrong
        if(err) return console.log('Database error: '+err);
        // otherwise
        db.collection('books')
          .remove({}, (err, DBRes) => {
            if(err) return console.log('Database remove err: '+err);
            res.send('complete delete successful');
            console.log('complete delete of '+DBRes.result.n+' elem');
          });
        });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db){
        // in case where something went wrong
        if(err) return console.log('Database error: '+err);
        // ottherwise
        db.collection('books')
          .findOne({_id: ObjectId(bookid)}, (err, DBRes) => {
            if(err) return console.log('Database read err: '+err);
            DBRes == null ? res.send('no book exists') : res.json(DBRes);
          });
      });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      // getting the id param
      try{
        bookid = ObjectId(bookid);
      } catch(err){
        return res.send('invalid _id');
      }
      
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db){
        // in case where something went wrong
        if(err) return console.log('Database error: '+err);
        // otherwise
        db.collection('books')
          .findOneAndUpdate({
            _id: bookid
          },{
            $push: { comments: comment }
          }, (err, DBRes) => {
            if(err) return console.log('Database updete err: '+err);
            res.json(DBRes.value);
        });

      });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      try{
        bookid = ObjectId(bookid);
      } catch(err){
        return res.send('invalid _id');
      }
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db){
        // in case where something went wrong  
          if(err) return console.log('Database error: '+err);
        // otherwise  
          db.collection('books')
            .findOneAndDelete({
              _id: bookid
            }, (err, DBRes) => {
              if(err) return console.log('Database delete err: '+err);
              res.send('delete successful');
          });
      });
    
    });
  
};
