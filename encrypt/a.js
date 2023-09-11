const express = require("express");
const app = express();

const http = require("http").createServer(app);

const crypto = require("crypto");

const algorithm = 'aes-256-cbc';

const key = "adnan-tech-programming-computers";

var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;

app.set("view engine", "ejs");

http.listen(process.env.PORT || 5000, function () {
    console.log("Server started running...");

    MongoClient.connect("mongodb://127.0.0.1:27017", function (error, client) {
        if (error) {
            console.error(error);
            return;
        }

        db = client.db("encrypt_decrypt_string");
        console.log("Database connected");

        app.get("/decrypt/:id", async (req, res) => {
            try {
              const id = req.params.id;
          
              // Retrieve the data from the database based on the document ID
              const data = await db.collection("strings").findOne({ _id: new mongodb.ObjectID(id) });
          
              if (!data) {
                return res.status(404).json({ error: "Data not found" });
              }
          
              // Ensure that the IV and encryption key match the ones used for encryption
              const iv = Buffer.from(data.iv, "base64");
              console.log(iv,125);
              const decipher = crypto.createDecipheriv(algorithm, key, iv);
          console.log("name",data.name)
              let decryptedData = {
                name: decipher.update(data.name, 'hex',  'utf8') + decipher.final('utf8'),
                // age: decipher.update(data.age, 'hex', 'utf-8', 'utf8') + decipher.final('utf8'),
                // email: decipher.update(data.email, 'hex', 'utf-8', 'utf8') + decipher.final('utf8')
              };
        
          
              res.send(decryptedData);
              
              console.log("name=",decryptedData)

            } catch (error) {
              console.error('Error decrypting data:', error);
              res.status(500).json({ error: 'Error decrypting data' });
            }
          });
          

  
       
        app.get("/", async function (request, result) {
            const data = await db.collection("strings")
                .find({})
                .sort({
                    _id: -1
                }).toArray();

            result.render("index", {
                data: data
            });
        });

        app.use(express.urlencoded({ extended: true }));
       
    app.post('/profile', async (req, res) => {
        const profile = {
            name: req.body.name,
            email: req.body.email,
            age: req.body.age
        };
    
        const iv = crypto.randomBytes(16);
        const profileJSON = JSON.stringify(profile);
    
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        const base64data = iv.toString('base64');
    
        try {
            await db.collection("strings").insertOne({
                iv: base64data,
                name: crypto.createCipheriv(algorithm, key, iv).update(profile.name, 'utf-8', 'hex') + crypto.createCipheriv(algorithm, key, iv).final('hex'),
                age: crypto.createCipheriv(algorithm, key, iv).update(profile.age.toString(), 'utf-8', 'hex') + crypto.createCipheriv(algorithm, key, iv).final('hex'),
                email: crypto.createCipheriv(algorithm, key, iv).update(profile.email, 'utf-8', 'hex') + crypto.createCipheriv(algorithm, key, iv).final('hex')
            });
    
            console.log('Profile saved:', profile);
            res.send('Profile saved successfully');
        } catch (error) {
            console.error('Error saving profile:', error);
            res.status(500).send('Error saving profile');
        }
    });
    

     });
});
