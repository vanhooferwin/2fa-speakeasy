// adding and loading express
const express = require('express')
const app = express();
const PORT = process.env.PORT || 5000

app.use(express.json())

// adding the speakeasy library
const speakeasy = require('speakeasy')

// adding the QRcode library
const QRCode = require('qrcode')

// adding the uuid dependacy
const uuid = require('uuid')

// adding node-json-db
const { JsonDB } = require('node-json-db')
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')

// instance of the node-json-db
const db = new JsonDB(new Config("jsondb", true, false, '/'))

// name which will be displayed in Google Authenticator
const googleAuthName = "My 2FA"

// registering a new user
app.post('/api/register', async (req, res) =>{
    try {
        const id = uuid.v4()
        const tmpSecret = speakeasy.generateSecret({name: googleAuthName})
        const qrCode = await QRCode.toDataURL(tmpSecret.otpauth_url)
        db.push(`/user/${id}`, {id, tmpSecret, qrCode})
        return res.send(`
            <h3>tmpSecret: ${tmpSecret.base32}</h3> 
            <h3>userId: ${id} </h3> 
            <img src=${qrCode}> 
        `)
    } 
    catch (error) {
        console.log(error)
        res.status(500).json({message: 'Error generating the secret'})
    }
})

// route to verify the token and make secret permanent
app.post('/api/verify', async (req, res)=> {
    // from the body pull out token and userId
    const { token, id } = req.body
    const path = `/user/${id}`
    try {
        // get user with the id
        const { tmpSecret } = await db.getData(path)
        // getting the base32 tmpSecret from database jsonDb and calling it secret
        const {base32: secret} = tmpSecret
        console.log(secret)

        // verifying the token
        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token
        });
        console.log('verified', verified)
        console.log({
            secret,
            encoding: 'base32',
            token
        })
        if (verified) {
            // change tmpSecret in our db to secret(permanent)
            db.push(path, {
                id,
                secret: tmpSecret
            })
        } 
        res.json({
            verified: !!verified
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
          message: "Error verifying and/or finding user",
        });
    }
})

 //Validate the token
 app.post('/api/validate', async (req, res) => {
    const {token, id} = req.body;   
    try {
      // Retrieve user from database
      const user = await db.getData(`/user/${id}`);
      const { base32: secret } = user.secret;
      const tokenValidate = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token, 
        window: 1 // time window
      });
      res.json({valid: !!tokenValidate})
    }catch(error) {
      console.error(error)
      res.status(500).json({ message: "Error retrieving user!"})
    };
  })

app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`);
})