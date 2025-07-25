import Fastify from "fastify";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";

dotenv.config();

const PORT = process.env.PORT || 3000;

const fastify = Fastify({
  logger: true,
});

await fastify.register(fastifyCookie);

fastify.register(import("fastify-jwt"), {
  secret: process.env.JWT_SECRET,
  cookie: {
    cookieName: "token",
    signed: false,
  },
});

// fastify.register(cors, {
//   origin: process.env.CORS_ORIGIN,
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
// });

fastify.register(cors, {
  origin: "https://budget-calculator-nuxtui.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
  return reply.status(201).send({ message: "User created", result });
});

// User login

fastify.post("/api/login", async (req, reply) => {
  try {
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

    const isValidPassword = await bcrypt.compare(password, user.password);

    const payload = {
      username: user.username,
    };

    if (!isValidPassword) {
      return reply.status(401).send({ error: "Invalid username or password" });
    } else {
      const token = fastify.jwt.sign(payload, {
        expiresIn: "1h",
      });
      return reply
        .setCookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 3600,
          path: "/",
        })
        .send({ budgetList: user.budgetList });
    }
  } catch (err) {
    console.error("Unexpected error in /api/login:", err);
    return reply.status(500).send({ error: "Internal server error" });
  }
});

// Checking if user is logged in

fastify.get("/api/auth-check", async (req, reply) => {
  try {
    const user = await req.jwtVerify();
    const userDoc = await User.findOne({
      username: user.username,
    }).select("budgetList -_id");
    return { authenticated: true, user, budgetList: userDoc?.budgetList };
  } catch {
    return { authenticated: false };
  }
});

// Saving a new budget
fastify.put("/api/save-budget", async (req, reply) => {
  const { budgetList } = req.body;
  const user = await req.jwtVerify();

  const result = await User.updateOne(
    { username: user.username },
    { $set: { budgetList: budgetList } },
    { upsert: false }
  );

  if (result.matchedCount === 0) {
    return reply.status(404).send({ message: "User not found" });
  }

  console.log("Update result:", result);
  return reply.send({ message: budgetList });
});

// Logs user out

fastify.post("/api/logout", async (req, reply) => {
  return reply
    .clearCookie("token", { path: "/" })
    .send({ message: "Logged out" });
});

fastify.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) throw err;
  console.log(`Server listening at ${address}`);
});
