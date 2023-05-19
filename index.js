const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware code
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zbcvy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const db = client.db('carToy');
        const toyCollection = db.collection('alltoy');
        console.log("database connected");

        //search all toys by name code 
        const indexKeys = { name: 1 };
        const indexOptions = { name: "nameSearch" };

        const result = await toyCollection.createIndex(indexKeys, indexOptions);

        app.get('/toySearchByName/:text', async (req, res) => {
            const searchText = req.params.text;

            const result = await toyCollection.find(
                {
                    $or: [
                        { name: { $regex: searchText, $options: "i" } }
                    ],
                }
            ).toArray()

            res.send(result)
        })



        //add a toy
        app.post('/postToy', async (req, res) => {
            const body = req.body;
            const result = await toyCollection.insertOne(body);
            res.send(result)
            console.log(result);
        });

        //get all toy
        app.get("/alltoys", async (req, res) => {
            const result = await toyCollection.find({}).toArray();
            res.send(result);
        })
        //get category toy
        app.get("/alltoys/:text", async (req, res) => {
            // console.log(req.params.text);
            if (req.params.text == "bus" || req.params.text == "car" || req.params.text == "truck") {
                const result = await toyCollection.find({ category: req.params.text }).toArray();
                return res.send(result)
            }
            const result = await toyCollection.find({}).toArray();
            res.send(result);
        })

        //get only my toy list
        app.get("/mytoys/:email", async (req, res) => {
            console.log(req.params.email);
            const result = await toyCollection.find({ email: req.params.email }).toArray()
            res.send(result)
        })

        //delete data
        app.delete('/mytoys/:id', async (req, res) => {
            const id = req.params.id
            const result = await toyCollection.deleteOne({ _id: new ObjectId(id) })
            res.send(result)

        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running')
})
app.listen(port, () => {
    console.log('server is running succesfully on port: ' + port);
})