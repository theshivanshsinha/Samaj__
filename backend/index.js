import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";

const _dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(bodyParser.urlencoded({ limit: '50mb',extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors({
  origin: 'http://localhost:3000', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

mongoose.connect("mongodb://127.0.0.1:27017/samaajDb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phoneNumber: String,
  username: String,
  profile:String,
  friends:Array,
});
const User = mongoose.model("User", userSchema);


const postSchema = new mongoose.Schema({
  email:String,
  name:String,
  date: Date,
  location: String,
  index: Number,
  description: String,
  likes: Number,
  comment:Array,
  username: String,
  phoneNumber:String,
  password:String,
  profile:String,
  post:String
});
const Post = mongoose.model("Post", postSchema);



app.post("/Signup", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    const user = new User({
      name: req.body.name,
      email: req.body.email + '@gmail.com',
      password: req.body.password,
      phoneNumber: req.body.phoneNumber,
      username: req.body.username,
      profile:req.body.profile
    });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const logUser = await User.findOne({
      $and: [{ email: req.body.email + '@gmail.com' }, { password: req.body.password }],
    });

    if (logUser) {
      console.log(logUser);
      return res.status(200).json(logUser); // Sending only user data, not the entire object
    } else {
      return res.status(403).send('Incorrect username or password');
    }
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).send('Internal server error');
  }
});

app.post("/Edit", async (req, res) => {
  try {
    // Update the user's data based on the provided email
    const email = req.body.email;
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          username: req.body.username,
          phoneNumber: req.body.phoneNumber,
          password: req.body.password,
          profile:req.body.profile
        },
      },
      { new: true } // Get the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error during user edit:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/Friend", async (req, res) => {
  try {
    // Get the email of the logged-in user from the request body
    const loggedInUserEmail = req.body.email;

    // Find all users except the logged-in user
    const otherUsers = await User.find({ email: { $ne: loggedInUserEmail } });

    if (otherUsers.length > 0) {
      // If other users are found, send them as a response
      res.status(200).json(otherUsers);
    } else {
      // If no other users are found, send an appropriate message
      res.status(404).json({ message: "No other users found" });
    }
  } catch (error) {
    console.error("Error while finding other users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


//for posts
app.post("/Profile",async(req,res)=>{
  console.log(req.body);
  const data = await Post.find({email:req.body["email"]}).exec();
  console.log(data);
  res.status(201).json(data);
});

app.post("/createPost", async (req, res) => {
  //console.log(req.body);
  const check = User.findOne({username:req.body["username"]});
  if (check) {
    const post = new Post({
      name:req.body["name"],
      email:req.body["email"],
      date:req.body["date"],
      location:req.body["location"],
      index:0,
      description:req.body["description"],
      likes:0,
      comment:[],
      username:req.body["username"],
      password:req.body["password"],
      phoneNumber:req.body["phoneNumber"],
      profile:req.body["profile"],
      post:req.body["post"]
    });
    await post.save();
    res.status(201).json(post);
  }
  else{
    console.log("not found!");
  }
});


app.post("/Home",async(req,res)=>{
  //console.log(req.body);
  const allpostdata =await Post.find().exec();
  res.status(201).json(allpostdata);
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

