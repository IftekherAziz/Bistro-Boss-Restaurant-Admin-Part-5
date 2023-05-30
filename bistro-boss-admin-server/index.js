const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// Middleware:
app.use(cors());
app.use(express.json());

// MongoDB Connection:
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zw8zgdm.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();


        const userCollection = client.db("bistroDB").collection("users");
        const menuCollection = client.db("bistroDB").collection("menu");
        const reviewCollection = client.db("bistroDB").collection("reviews");
        const cartCollection = client.db("bistroDB").collection("carts");

        // GET users data from MongoDB:
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        })


        // POST users data on MongoDB:
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ success: false, message: 'Email already exists' });
            }
            else {
                const result = await userCollection.insertOne(user);
                res.send(result);
            }
        })

        // Update user role:
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: { role: 'admin' },
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);

        })

        // Delete user:
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        // GET menu data from MongoDB:
        app.get('/menu', async (req, res) => {
            const result = await menuCollection.find().toArray();
            res.send(result);
        })

        // GET reviews data from MongoDB:
        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().toArray();
            res.send(result);
        })

        // GET carts data from MongoDB:
        app.get('/carts', async (req, res) => {
            const email = req.query.email;

            if (!email) {
                res.send([]);
            }
            const query = { email: email };
            const result = await cartCollection.find(query).toArray();
            res.send(result);
        });

        // POST carts data on MongoDB:
        app.post('/carts', async (req, res) => {
            const item = req.body;
            const result = await cartCollection.insertOne(item);
            res.send(result);
        })

        // DELETE carts data from MongoDB:
        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result);
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


app.get("/", (req, res) => {
    res.send("Bistro Boss is running");
})

app.listen(port, () => {
    console.log(`Bistro Boss server is running on port: ${port}`);
})