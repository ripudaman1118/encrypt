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

        app.get("/decrypt/:encrypted", async function (request, result) {
            const encrypted = request.params.encrypted;

            const obj = await db.collection("strings").findOne({
                encryptedData: encrypted,
               
            });

            if (obj == null) {
                result.status(404).send("Not found");
                return;
            }

            const origionalData = Buffer.from(obj.iv, 'base64')

            const decipher = crypto.createDecipheriv(algorithm, key, origionalData);
            let decryptedData = decipher.update(obj.encryptedData, "hex", "utf-8");
            decryptedData += decipher.final("utf8");

            result.send(decryptedData);
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
        let encryptedData = cipher.update(profileJSON, 'utf-8', 'hex');
        encryptedData += cipher.final('hex');
        const base64data = iv.toString('base64');
    
        try {
            await db.collection("strings").insertOne({
                iv: base64data,
                encryptedData: encryptedData,
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
