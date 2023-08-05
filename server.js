require("dotenv").config() // Load ENV Variables
const express = require("express") // import express
const morgan = require("morgan") //import morgan
const methodOverride = require("method-override")
const mongoose = require("mongoose")


const DATABASE_URL = process.env.DATABASE_URL
const CONFIG = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }

// Establish Connection
mongoose.connect(DATABASE_URL, CONFIG)

// Events for when connection opens/disconnects/errors
mongoose.connection
.on("open", () => console.log("Connected to Mongoose"))
.on("close", () => console.log("Disconnected from Mongoose"))
.on("error", (error) => console.log(error))

const {Schema, model} = mongoose

// make animals schema
const animalsSchema = new Schema({
    species: String,
    location: String,
    extinct: Boolean,
    lifeExpectancy: Number
})

// make fruit model
const Animal = model("Animal", animalsSchema)

const app = express()

app.use(morgan("tiny")) //logging
app.use(methodOverride("_method")) // override for put and delete requests from forms
app.use(express.urlencoded({extended: true})) // parse urlencoded request bodies
app.use(express.static("public")) // serve files from public statically

app.get("/", (req, res) => {
  res.send("your server is running... better catch it.")
})

app.get("/animals/initialize", async(req, res) => {
  // array of starter fruits
  const startAnimals = [
    { species: "Tiger", location: "Asia", extinct: false, lifeExpectancy: 15 },
    { species: "Elephant", location: "Africa", extinct: false, lifeExpectancy: 60 },
    { species: "Panda", location: "China", extinct: false, lifeExpectancy: 20 },
    // Add more animal objects as needed
  ];
  

  await Animal.deleteMany({})
  const createdAnimals = await Animal.create(startAnimals)
  res.json(createdAnimals)
})

app.get("/animals", async (req, res) => {
  const allanimals = await Animal.find({})
  res.render("animals/index.ejs", {animals: allanimals})
})

app.get("/animals/new", (req, res) => {
  res.render("animals/new.ejs")
})

app.get("/animals/:id", async (req, res) => {
  const id = req.params.id
  const allanimals = await Animal.findById(id)

  res.render("animals/show.ejs", {animal: allanimals})
})

app.post("/animals", async (req, res) => {
  req.body.extinct = req.body.extinct === "on" ? true : false
  await Animal.create(req.body)
  res.redirect("/animals")
})

app.get("/animals/:id/edit", async (req, res) => {
  const id = req.params.id
  const animal = await Animal.findById(id)

  res.render("animals/edit.ejs", {animal})
})

app.put("/animals/:id", async (req, res) => {
  const id = req.params.id
  req.body.extinct = req.body.extinct === "on" ? true : false
  await Animal.findByIdAndUpdate(id, req.body, {new: true})
  res.redirect(`/animals`)
})

app.delete("/animals/:id", async (req, res) => {
  const id = req.params.id
  await Animal.findByIdAndRemove(id)
  res.redirect("/animals")
})

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Now Listening on port ${PORT}`))