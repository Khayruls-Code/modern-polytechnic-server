const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
app.use(cors())
const { json, query } = require('express');
const port = process.env.PORT || '5000'
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
  res.send('Modern Polytechnic Institute server')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xfro9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect()
    const database = client.db('modern-polytechnic')
    const courseCollection = database.collection('courses')
    const teacherCollection = database.collection('teachers')
    const reviewsCollection = database.collection('reviews')
    const orderCollection = database.collection('orders')
    const studentCollection = database.collection('students')
    const userCollection = database.collection('users')

    //course api
    app.get('/courses', async (req, res) => {
      const cursor = courseCollection.find({})
      const result = await cursor.toArray()
      res.json(result)
    })

    app.get('/courses/:id', async (req, res) => {
      const id = req.params.id
      const query = { '_id': ObjectId(id) }
      const result = await courseCollection.findOne(query)
      res.json(result)
    })

    //teacher api
    app.get('/teachers', async (req, res) => {
      const cursor = teacherCollection.find({})
      const result = await cursor.toArray()
      res.json(result)
    })

    //reviews api
    app.get('/reviews', async (req, res) => {
      const cursor = reviewsCollection.find({})
      const result = await cursor.toArray()
      res.json(result)
    })
    //post review api
    app.post('/reviews', async (req, res) => {
      const data = req.body
      const result = await reviewsCollection.insertOne(data)
      res.json(result)
    })

    //courses ordered
    app.post('/orders', async (req, res) => {
      const data = req.body
      const result = await orderCollection.insertOne(data)
      res.json(result)
    })
    //find specific order
    app.get('/orders', async (req, res) => {
      const email = req.query.email
      const query = { 'email': email }
      let cursor;
      if (email) {
        cursor = orderCollection.find(query)
      } else {
        cursor = orderCollection.find({})
      }
      const result = await cursor.toArray()
      res.json(result)
    })
    //update status api
    app.put('/orders/:id', async (req, res) => {
      const id = req.params.id
      const status = req.body.status
      const query = { "_id": ObjectId(id) }
      console.log(status)
      const updateDoc = {
        $set: {
          status: status
        },
      };
      const result = await orderCollection.updateOne(query, updateDoc)
      res.json(result)
    })
    //delete order api
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id
      console.log(id)
      const query = { "_id": ObjectId(id) }
      const result = await orderCollection.deleteOne(query)
      res.json(result)
    })

    //add student api
    app.post('/students', async (req, res) => {
      const data = req.body
      const result = await studentCollection.insertOne(data)
      res.json(result)
    })
    //get student api
    app.get('/students', async (req, res) => {
      const email = req.query.email
      const query = { 'email': email }
      let cursor;
      if (email) {
        cursor = studentCollection.find(query)
      } else {
        cursor = studentCollection.find({})
      }
      const result = await cursor.toArray()
      res.json(result)
    })
    //delete api student
    app.delete('/students/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const result = await studentCollection.deleteOne(query)
      res.json(result)
    })

    //make user api
    app.post('/users', async (req, res) => {
      const data = req.body;
      const result = await userCollection.insertOne(data)
      res.json(result)
    })
    app.put('/users', async (req, res) => {
      const user = req.body
      const filter = { email: user.email }
      const options = { upsert: true };
      const updateDoc = {
        $set: user
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result)
    })

    app.put('/users/teacher', async (req, res) => {
      const email = req.body.email;
      const filter = { "email": email }
      const updateDoc = {
        $set: {
          role: "teacher"
        }
      }
      const result = await userCollection.updateOne(filter, updateDoc)
      res.json(result)
    })

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { "email": email }
      const user = await userCollection.findOne(filter)
      let isTeacher = false;
      if (user?.role) {
        isTeacher = true;
      }
      res.json({ teacher: isTeacher })
    })

  }
  finally {
    // await client.close()
  }
}

run().catch(console.dir)

app.listen(port, () => {
  console.log('College Website Running')
})