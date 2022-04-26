const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
const { MongoClient } = require('mongodb');
const fileUpload = require('express-fileupload')
require('dotenv').config()


app.use(cors());
app.use(express.json());
app.use(fileUpload())


const uri = `mongodb+srv://getdoctorADMIN:qrcj8fh6aRQP8BC@cluster0.s5ebb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
  try {
    await client.connect()
    const database = client.db('DoctorsPortal');
    const appointments = database.collection('appointments');
    const userCollection = database.collection('user')
    const doctorsCollection = database.collection('doctors')

    app.get('/', (req, res) =>{
      res.send('hello world')
    })
    
    // GET APPOINTMENTS 
    app.get('/appointment', async (req, res) =>{
      const email = req.query.email;
      const date = new Date(req.query.date).toLocaleDateString();
      const query = {email: email, date: date}
      const cursor = appointments.find(query) 
      const appointment = await cursor.toArray()
      res.json(appointment)
    })

    // POST APPOINTMENTS API
    app.post('/appointments', async (req, res) => {
      const docs = req.body;
      const result = await appointments.insertOne(docs)
      res.json(result)
    })

    app.get('/user/:email', async (req, res) =>{
      const email = req.params.email;
      const query = {email: email};
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if(user?.role === 'admin'){
        isAdmin= true
      }
      res.send({admin: isAdmin})

    }) 


    app.post('/user', async(req, res) =>{
      const user = req.body;
      const result = await userCollection.insertOne(user)
      res.json(result)
    })

    app.put('/user', async(req, res) =>{
      const user = req.body
      const filter = {email: user.email};
      const option ={upsert: true};
      const docs = {
        $set: user
      };
      const result = await userCollection.updateOne(filter, docs, option)
    })
    
    app.put('/user/admin', async(req, res)=>{
      const user = req.body
      const filter = {email: user.email};
      const updateDoc = {
        $set: {
          role: 'admin'
        }
      };
      const result = await userCollection.updateOne(filter, updateDoc)
      res.json(result)
    })


    app.post('/doctors', async(req, res) =>{
      const name = req.body.name;
      const email = req.body.email;
      const pic = req.files.image.data;
      const encodedPic = pic.toString('base64')
      const imageBuffer = Buffer.from(encodedPic, 'base64')
      const doctor = {
        name,
        email,
        image: imageBuffer 
      }
      const result = await doctorsCollection.insertOne(doctor)
      res.json(result)
    })

    app.get('/doctor', async(req, res) =>{
      const query = doctorsCollection.find({})
      const result = await query.toArray()
      res.json(result)
    })

  } finally {
    // await client.close()
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})