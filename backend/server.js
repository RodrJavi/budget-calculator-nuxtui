import Fastify from "fastify";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

dotenv.config();

const fastify = Fastify({
  logger: true,
});

fastify.register(import("fastify-jwt"), {
  secret: process.env.JWT_SECRET, // use a strong secret in env
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB!"))
  .catch((err) => console.error("❌ Connection error:", err));

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  budgetList: {
    incomeList: [
      {
        title: String,
        amount: Number,
      },
    ],
    expenseList: [
      {
        title: String,
        amount: Number,
        importance: String,
      },
    ],
  },
});

const User = mongoose.model("Profile", UserSchema, "profiles");

// Get all users
fastify.get("/api/users", async (req, reply) => {
  try {
    const users = await User.find();
    return users;
  } catch (err) {
    reply.code(500).send({ error: "Failed to fetch users" });
  }
});

// Get user by username
fastify.get("/api/users/:id", async (req, reply) => {
  try {
    const user = await User.findOne({ username: req.params.id });
    return user;
  } catch (err) {
    reply.code(500).send({ error: "Failed to fetch user" });
  }
});

// Creating a new user
fastify.post("/api/users", async (req, reply) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return reply
      .status(400)
      .send({ error: "Username and password are required" });
  }

  const existing = await User.findOne({ username: username });
  if (existing) {
    return reply.status(400).send({ error: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  console.log("Hashed password:", hashedPassword);

  const result = User.insertOne({ username, password: hashedPassword });
  return reply.status(201).send({ userId: result.insertedId });
});

// User login

fastify.post("/api/login", async (req, reply) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return reply
      .status(400)
      .send({ error: "Username and password are required" });
  }

  const user = await User.findOne({ username: username });
  if (!user) {
    return reply.status(401).send({ error: "Invalid username or password" });
  }

  const isValidPassword = bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return reply.status(401).send({ error: "Invalid username or password" });
  }

  return reply.send({ message: "Login successful" });
});

// Saving a new budget
fastify.put("/api/save-budget", async (req, reply) => {
  const { username, budgetList } = req.body;

  const result = await User.updateOne(
    { username },
    { $set: { budgetList: budgetList } },
    { upsert: false }
  );

  if (result.matchedCount === 0) {
    return reply.status(404).send({ message: "User not found" });
  }

  console.log("Update result:", result);
  return reply.send({ message: budgetList });
});

fastify.listen({ port: 4000 }, (err, address) => {
  if (err) throw err;
  console.log(`Server listening at ${address}`);
});
