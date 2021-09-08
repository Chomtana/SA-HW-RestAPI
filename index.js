require('dotenv').config({path:__dirname+'/./.env'});
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectId } = require('mongodb'); // or ObjectID 

const client = new MongoClient(process.env.MONGO_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
const _ = require("lodash")

let wrapRoute = fn => async (req, res, next) => {
  try {
      // run controllers logic
      await fn(req, res, next)
  } catch (e) {
      // if an exception is raised, do not send any response
      // just continue performing the middleware chain
      next(e)
  }
}

client.connect().then(async clientDb => {
  let db = (await clientDb.connect()).db(process.env.MONGO_DB_NAME);

  const express = require('express')
  const app = express()
  const port = process.env.PORT

  app.use(express.json());

  app.get('/', wrapRoute(async (req, res) => {
    res.send(await db.collection('members').find({}).toArray())
  }));

  app.get('/:id', wrapRoute(async (req, res) => {
    res.send(await db.collection('members').findOne({
      _id: ObjectId(req.params.id)
    }))
  }));

  app.post('/', wrapRoute(async (req, res) => {
    let object = await db.collection('members').insertOne({...req.body, startDate: new Date()});
    res.send(object)
  }));

  app.put('/:id', wrapRoute(async (req, res) => {
    let object = await db.collection('members').updateOne({_id: ObjectId(req.params.id)}, {$set: req.body});
    res.send(object)
  }));

  app.delete('/:id', wrapRoute(async (req, res) => {
    await db.collection('members').deleteOne({_id: ObjectId(req.params.id)});
    res.sendStatus(204);
  }));

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
});