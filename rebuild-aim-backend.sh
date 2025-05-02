#!/bin/bash

set -e

# --- Color Codes for Readable Output ---
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# --- Define Directories and Files ---
PROJECT_DIR="$HOME/Documents/projects/aim-backend"
DATA_DIR="$PROJECT_DIR/data/db"
MONGO_LOG="$PROJECT_DIR/mongod.log"
BACKUP_DIR="/tmp/aim-backend-data-backup-$(date +%s)"
ERROR_LOG="$PROJECT_DIR/error.log"
SERVER_LOG="$PROJECT_DIR/server.log"

# --- Check for No-Prompt Flag ---
NO_PROMPT=false
if [ "$1" = "--no-prompt" ]; then
  NO_PROMPT=true
  echo "Running in no-prompt mode..."
fi

# --- Function to Check MongoDB Status ---
check_mongo_status() {
  local pid=$(pgrep mongod 2>/dev/null)
  local port_check=$(lsof -i :27017 | grep LISTEN 2>/dev/null)
  if [ -n "$pid" ] && [ -n "$port_check" ]; then
    echo "MongoDB running (PID: $pid, Port: 27017)"
    if mongosh --host localhost --port 27017 --quiet --eval "db.runCommand({ ping: 1 })" > /dev/null 2>&1; then
      echo "MongoDB responding to pings"
      return 0
    else
      echo -e "${RED}MongoDB not responding${NC}" | tee -a "$ERROR_LOG"
      return 1
    fi
  else
    echo "MongoDB not running"
    return 1
  fi
}

# --- Setup Git Repository ---
echo "Setting up Git repository..."
if [ -d "$PROJECT_DIR/.git" ]; then
  cd "$PROJECT_DIR"
  git fetch origin 2>/dev/null
  git stash 2>/dev/null || echo "No changes to stash"
  git pull origin main --rebase || {
    echo -e "${RED}Failed to pull from remote. Resolve conflicts manually.${NC}" | tee -a "$ERROR_LOG"
    exit 1
  }
else
  rm -rf "$PROJECT_DIR"
  git clone git@github.com:MotivMIA/aim-backend.git "$PROJECT_DIR" 2>/dev/null || {
    echo -e "${RED}Failed to clone repository. Initializing new one.${NC}" | tee -a "$ERROR_LOG"
    mkdir -p "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    git init -b main
    git remote add origin git@github.com:MotivMIA/aim-backend.git 2>/dev/null || echo -e "${RED}Failed to set remote${NC}" | tee -a "$ERROR_LOG"
  }
fi
cd "$PROJECT_DIR" || { echo -e "${RED}Failed to cd to $PROJECT_DIR${NC}" | tee -a "$ERROR_LOG"; exit 1; }

# --- Backup Current Project ---
echo "Backing up existing project..."
if [ -d "$PROJECT_DIR" ]; then
  tar -czf ~/aim-backend-backup-$(date +%F-%H%M%S).tar.gz -C "$PROJECT_DIR" . 2>/dev/null || {
    echo -e "${RED}Backup failed, proceeding...${NC}" | tee -a "$ERROR_LOG"
  }
fi

# --- Preserve MongoDB Data Directory ---
echo "Preserving MongoDB data directory..."
if [ -d "$DATA_DIR" ]; then
  rm -rf "$BACKUP_DIR" 2>/dev/null
  mkdir -p "$BACKUP_DIR"
  mv "$DATA_DIR" "$BACKUP_DIR/db" && echo "Backed up to $BACKUP_DIR/db" || {
    echo -e "${RED}Failed to back up data directory${NC}" | tee -a "$ERROR_LOG"
  }
else
  echo "No MongoDB data directory found, skipping backup"
fi

# --- Create Directory Structure ---
echo "Creating directory structure..."
mkdir -p src/@types src/controllers src/middleware src/models src/routes src/utils src/tests data/db

# --- Restore MongoDB Data Directory ---
echo "Restoring MongoDB data directory..."
if [ -d "$BACKUP_DIR/db" ]; then
  mv "$BACKUP_DIR/db" "$DATA_DIR" && echo "Restored data directory" || {
    echo -e "${RED}Failed to restore data, creating new directory${NC}" | tee -a "$ERROR_LOG"
    mkdir -p "$DATA_DIR"
  }
else
  echo "No backup data found, creating new directory..."
  mkdir -p "$DATA_DIR"
fi
chmod -R 755 "$DATA_DIR" 2>/dev/null || echo -e "${RED}Failed to set permissions${NC}" | tee -a "$ERROR_LOG"

# --- Create .gitignore ---
echo "Creating .gitignore..."
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
*.log
data/
EOF

# --- Create README.md ---
echo "Creating README.md..."
cat > README.md << 'EOF'
# AIM Backend

Backend for the AIM Crypto project.

## Setup
Run `./rebuild-aim-backend.sh [--no-prompt]` to set up the project.

## Run
- Development: `npm run dev`
- API Docs: `http://localhost:5001/api-docs`

## Features
- JWT & 2FA Authentication
- Transaction Management
- Rate Limiting
- MongoDB with AWS Secrets Manager
EOF

# --- Create .env ---
echo "Creating .env..."
cat > .env << EOF
MONGO_USER=admin
MONGO_PASSWORD=securepassword
MONGO_HOST=localhost:27017
MONGO_DB=aim-backend
MONGO_URI=mongodb://admin:securepassword@localhost:27017/aim-backend?authSource=admin
JWT_SECRET=$(openssl rand -base64 48)
PORT=5001
FRONTEND_URL=http://localhost:5173
AWS_REGION=us-east-1
SECRETS_ID=aim-backend-secrets
EOF

# --- Create package.json with Corrected Versions ---
echo "Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "aim-backend",
  "version": "1.0.0",
  "description": "Backend for AIM Crypto project",
  "main": "dist/server.js",
  "type": "module",
  "scripts": {
    "dev": "npx tsx src/server.ts",
    "build": "npx tsc",
    "start": "node dist/server.js",
    "test": "npx jest"
  },
  "dependencies": {
    "aws-sdk": "^2.1690.0",
    "bcrypt": "^5.1.1",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.1",
    "express-rate-limit": "^7.4.1",
    "express-validator": "^7.2.1",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.7.2",
    "speakeasy": "^2.0.0",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cookie-parser": "^1.4.7",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.14",
    "@types/jsonwebtoken": "^9.0.9",
    "@types/node": "^22.8.7",
    "@types/speakeasy": "^2.0.10",
    "@types/supertest": "^6.0.2",
    "@types/swagger-jsdoc": "^6.0.4",
    "@types/swagger-ui-express": "^4.1.6",
    "jest": "^29.7.0",
    "mongodb-memory-server": "^10.1.4",
    "rimraf": "^6.0.1",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.5",
    "tsx": "^4.19.1",
    "typescript": "^5.6.3"
  }
}
EOF

# --- Create tsconfig.json ---
echo "Creating tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "typeRoots": ["./node_modules/@types", "./src/@types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# --- Create jest.config.mjs ---
echo "Creating jest.config.mjs..."
cat > jest.config.mjs << 'EOF'
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  transform: { "^.+\\.ts$": "ts-jest" },
  testMatch: ["**/src/tests/**/*.test.ts"]
};
EOF

# --- Create src/@types/express.d.ts ---
echo "Creating src/@types/express.d.ts..."
cat > src/@types/express.d.ts << 'EOF'
import { Request } from 'express';
declare module 'express-serve-static-core' {
  interface Request {
    user?: { userId: string };
  }
}
EOF

# --- Create src/server.ts ---
echo "Creating src/server.ts..."
cat > src/server.ts << 'EOF'
import dotenv from "dotenv";
import AWS from "aws-sdk";
import app from "./app";
import connectDB from "./db";

dotenv.config();

const secretsManager = new AWS.SecretsManager({ region: process.env.AWS_REGION || "us-east-1" });

async function getSecrets() {
  try {
    const data = await secretsManager.getSecretValue({ SecretId: process.env.SECRETS_ID || "aim-backend-secrets" }).promise();
    if (data.SecretString) {
      const secrets = JSON.parse(data.SecretString);
      Object.assign(process.env, secrets);
    }
  } catch (err) {
    console.error("Using local env vars; secrets fetch failed:", err);
  }
}

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?authSource=admin`;

(async () => {
  await getSecrets();
  if (!MONGO_URI) throw new Error("MongoDB URI not provided");
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})().catch(err => {
  console.error("Startup failed:", err);
  process.exit(1);
});
EOF

# --- Create src/app.ts ---
echo "Creating src/app.ts..."
cat > src/app.ts << 'EOF'
import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import { setupSwagger } from "./swagger";

const app: Express = express();

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/transactions", transactionRoutes);

setupSwagger(app);

export default app;
EOF

# --- Create src/db.ts ---
echo "Creating src/db.ts..."
cat > src/db.ts << 'EOF'
import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error(" AGR: MONGO_URI not defined");
  await mongoose.connect(uri);
  console.log("MongoDB connected");
};

export default connectDB;
EOF

# --- Create src/controllers/authController.ts ---
echo "Creating src/controllers/authController.ts..."
cat > src/controllers/authController.ts << 'EOF'
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import User from "../models/User";
import { sendError } from "../utils/response";
import { validationResult } from "express-validator";

export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { email, password } = req.body;
  if (!email || !password) return sendError(res, 400, { message: "Email and password required" });

  const userExists = await User.findOne({ email });
  if (userExists) return sendError(res, 400, { message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 3600000 });
  res.status(201).json({ message: "Registration successful" });
};

export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) return sendError(res, 401, { message: "Invalid credentials" });

  if (user.isTwoFactorEnabled) {
    const token = jwt.sign({ userId: user._id, requiresTwoFactor: true }, process.env.JWT_SECRET!, { expiresIn: "5m" });
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 300000 });
    return res.json({ requiresTwoFactor: true });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 3600000 });
  res.json({ message: "Login successful" });
};

export const setupTwoFactor = async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const user = await User.findById(userId);
  if (!user) return sendError(res, 404, { message: "User not found" });

  const secret = speakeasy.generateSecret({ name: `AimCrypto:${user.email}` });
  user.twoFactorSecret = secret.base32;
  user.isTwoFactorEnabled = true;
  await user.save();

  res.json({ qrCode: secret.otpauth_url });
};

export const verifyTwoFactor = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { userId, twoFactorCode } = req.body;
  const user = await User.findById(userId);
  if (!user || !user.isTwoFactorEnabled) return sendError(res, 400, { message: "2FA not enabled" });

  const verified = speakeasy.totp.verify({ secret: user.twoFactorSecret!, encoding: "base32", token: twoFactorCode });
  if (!verified) return sendError(res, 401, { message: "Invalid 2FA code" });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
  res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 3600000 });
  res.json({ message: "2FA verified" });
};
EOF

# --- Create src/controllers/userController.ts ---
echo "Creating src/controllers/userController.ts..."
cat > src/controllers/userController.ts << 'EOF'
import { Request, Response } from "express";

export const getProfile = async (req: Request, res: Response) => {
  res.json({ message: "User profile", userId: req.user!.userId });
};
EOF

# --- Create src/controllers/transactionController.ts ---
echo "Creating src/controllers/transactionController.ts..."
cat > src/controllers/transactionController.ts << 'EOF'
import { Request, Response } from "express";
import Transaction from "../models/Transaction";
import { sendError } from "../utils/response";
import { validationResult } from "express-validator";

export const createTransaction = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, 400, { message: errors.array()[0].msg });

  const { userId } = req.user!;
  const { amount, type, category, description } = req.body;

  const transaction = new Transaction({ userId, amount, type, category, description, status: "Pending", date: new Date() });
  await transaction.save();
  res.status(201).json({ message: "Transaction created", transaction });
};

export const getTransactions = async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const { startDate, endDate, category, status } = req.query;

  const query: any = { userId };
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate as string);
    if (endDate) query.date.$lte = new Date(endDate as string);
  }
  if (category) query.category = category;
  if (status) query.status = status;

  const transactions = await Transaction.find(query).sort({ date: -1 });
  res.json({ transactions });
};

export const exportTransactions = async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const transactions = await Transaction.find({ userId }).lean();
  const csv = transactions.map(t => `${t.date.toISOString()},${t.type},${t.amount},${t.category || ''},${t.status},${t.description || ''}`).join('\n');
  res.header('Content-Type', 'text/csv');
  res.attachment('transactions.csv');
  res.send(`Date,Type,Amount,Category,Status,Description\n${csv}`);
};
EOF

# --- Create src/middleware/authMiddleware.ts ---
echo "Creating src/middleware/authMiddleware.ts..."
cat > src/middleware/authMiddleware.ts << 'EOF'
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/response";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) return sendError(res, 401, { message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, requiresTwoFactor?: boolean };
    if (decoded.requiresTwoFactor) return sendError(res, 401, { message: "2FA required" });
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    sendError(res, 401, { message: "Invalid token" });
  }
};
EOF

# --- Create src/middleware/validationMiddleware.ts ---
echo "Creating src/middleware/validationMiddleware.ts..."
cat > src/middleware/validationMiddleware.ts << 'EOF'
import { body } from "express-validator";

export const validateRegister = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
];

export const validateLogin = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password required")
];

export const validateTwoFactor = [
  body("userId").notEmpty().withMessage("User ID required"),
  body("twoFactorCode").isLength({ min: 6, max: 6 }).withMessage("2FA code must be 6 digits")
];
EOF

# --- Create src/models/User.ts ---
echo "Creating src/models/User.ts..."
cat > src/models/User.ts << 'EOF'
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  isTwoFactorEnabled: boolean;
  twoFactorSecret?: string;
}

const userSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isTwoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String }
});

export default mongoose.model<IUser>("User", userSchema);
EOF

# --- Create src/models/Transaction.ts ---
echo "Creating src/models/Transaction.ts..."
cat > src/models/Transaction.ts << 'EOF'
import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  userId: string;
  amount: number;
  type: string;
  date: Date;
  category?: string;
  status: string;
  description?: string;
}

const transactionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  date: { type: Date, default: Date.now },
  category: { type: String },
  status: { type: String, default: "Pending" },
  description: { type: String }
});

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
EOF

# --- Create src/routes/authRoutes.ts ---
echo "Creating src/routes/authRoutes.ts..."
cat > src/routes/authRoutes.ts << 'EOF'
import { Router } from "express";
import { register, login, setupTwoFactor, verifyTwoFactor } from "../controllers/authController";
import { validateRegister, validateLogin, validateTwoFactor } from "../middleware/validationMiddleware";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/two-factor/setup", authenticate, setupTwoFactor);
router.post("/two-factor/verify", validateTwoFactor, verifyTwoFactor);

export default router;
EOF

# --- Create src/routes/userRoutes.ts ---
echo "Creating src/routes/userRoutes.ts..."
cat > src/routes/userRoutes.ts << 'EOF'
import { Router } from "express";
import { getProfile } from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/profile", authenticate, getProfile);

export default router;
EOF

# --- Create src/routes/transactionRoutes.ts ---
echo "Creating src/routes/transactionRoutes.ts..."
cat > src/routes/transactionRoutes.ts << 'EOF'
import { Router } from "express";
import { createTransaction, getTransactions, exportTransactions } from "../controllers/transactionController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticate, createTransaction);
router.get("/", authenticate, getTransactions);
router.get("/export", authenticate, exportTransactions);

export default router;
EOF

# --- Create src/utils/response.ts ---
echo "Creating src/utils/response.ts..."
cat > src/utils/response.ts << 'EOF'
import { Response } from "express";

export const sendError = (res: Response, status: number, error: any) => {
  res.status(status).json(error);
};
EOF

# --- Create src/swagger.ts ---
echo "Creating src/swagger.ts..."
cat > src/swagger.ts << 'EOF'
import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "AIM Backend API", version: "1.0.0", description: "API for AIM Crypto" },
    servers: [{ url: "http://localhost:5001" }]
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"]
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
EOF

# --- Create src/tests/auth.test.ts ---
echo "Creating src/tests/auth.test.ts..."
cat > src/tests/auth.test.ts << 'EOF'
import request from "supertest";
import app from "../app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("POST /api/auth/register", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "password123" });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Registration successful");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should fail if email is invalid", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "invalid", password: "password123" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid email");
  });
});
EOF

# --- Install Dependencies ---
echo "Installing dependencies..."
for i in {1..3}; do
  npm install && break || {
    echo -e "${RED}Attempt $i: Failed to install dependencies${NC}" | tee -a "$ERROR_LOG"
    [ "$i" -eq 3 ] && { echo -e "${RED}All attempts failed. Check $ERROR_LOG${NC}"; exit 1; }
    sleep 2
  }
done

# --- Start MongoDB with Retry ---
echo "Starting MongoDB..."
if ! check_mongo_status > /dev/null 2>&1; then
  for i in {1..3}; do
    mongod --dbpath "$DATA_DIR" --auth --logpath "$MONGO_LOG" --quiet --fork && break || {
      echo -e "${RED}Attempt $i: Failed to start MongoDB${NC}" | tee -a "$ERROR_LOG"
      [ "$i" -eq 3 ] && { echo -e "${RED}MongoDB failed to start${NC}"; exit 1; }
      sleep 2
    }
  done
  sleep 2
fi
check_mongo_status

# --- Create MongoDB Admin User ---
echo "Creating MongoDB admin user..."
for i in {1..3}; do
  mongosh --host localhost --port 27017 --quiet << 'MONGOSH_EOF' && break
use admin
db.createUser({ user: "admin", pwd: "securepassword", roles: [{ role: "root", db: "admin" }] })
exit
MONGOSH_EOF
  echo -e "${RED}Attempt $i: Failed to create admin user${NC}" | tee -a "$ERROR_LOG"
  [ "$i" -eq 3 ] && echo -e "${RED}Admin user creation failed${NC}" | tee -a "$ERROR_LOG"
  sleep 2
done

# --- Test Compilation ---
echo "Testing TypeScript compilation..."
npx tsc --noEmit || echo -e "${RED}Compilation failed${NC}" | tee -a "$ERROR_LOG"

# --- Commit Changes ---
echo "Committing changes..."
git add .
git commit -m "Rebuild AIM backend setup" || echo "No changes to commit"
git push origin main 2>/dev/null || echo -e "${RED}Push failed; resolve manually${NC}" | tee -a "$ERROR_LOG"

# --- Verification ---
echo -e "${GREEN}Rebuild complete!${NC}"
echo "Starting verification..."

# -cleanup-
echo "Checking for existing server processes on port 5001..."
EXISTING_PIDS=$(lsof -i :5001 -t 2>/dev/null || true)
if [ -n "$EXISTING_PIDS" ]; then
  for PID in $EXISTING_PIDS; do
    echo "Stopping existing server (PID: $PID)..."
    kill $PID 2>/dev/null || kill -9 $PID 2>/dev/null || true
  done
  # Verify port is free
  if lsof -i :5001 > /dev/null 2>/dev/null; then
    echo -e "${RED}Failed to free port 5001. Another process may still be using it.${NC}" | tee -a "$ERROR_LOG"
  else
    echo "Port 5001 is now free."
  fi
else
  echo "No existing server process found on port 5001."
fi
echo "Cleanup complete, proceeding to start server..."

# Debug: Checking .env file
echo "Debug: Checking .env file..."
if [ -f "$PROJECT_DIR/.env" ]; then
  echo ".env file exists"
  ls -l "$PROJECT_DIR/.env"
  cat "$PROJECT_DIR/.env" | grep -E 'MONGO_URI|MONGO_USER|MONGO_PASSWORD|MONGO_HOST|MONGO_DB|JWT_SECRET' || echo "No MongoDB or JWT variables in .env"
else
  echo -e "${RED}.env file not found at $PROJECT_DIR/.env${NC}" | tee -a "$ERROR_LOG"
fi

# Debug: Checking environment variables after sourcing .env
echo "Debug: Checking environment variables after sourcing .env..."
. "$PROJECT_DIR/.env"
env | grep -E 'MONGO_URI|MONGO_USER|MONGO_PASSWORD|MONGO_HOST|MONGO_DB|JWT_SECRET' || echo "No MongoDB or JWT environment variables found"

# Start Server
echo "Starting server..."
cd "$PROJECT_DIR" && . ./.env && node -r dotenv/config node_modules/.bin/tsx src/server.ts > "$SERVER_LOG" 2>&1 &
SERVER_PID=$!
sleep 5
if ps -p $SERVER_PID > /dev/null; then
  echo "Server started (PID: $SERVER_PID)"
else
  echo -e "${RED}Server failed to start${NC}" | tee -a "$ERROR_LOG"
  cat "$SERVER_LOG"
fi

# Test Register Endpoint
echo "Testing register endpoint..."
REGISTER_OUTPUT=$(curl -s --max-time 10 -X POST http://localhost:5001/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}')
echo "Debug: Register endpoint response: $REGISTER_OUTPUT"
if echo "$REGISTER_OUTPUT" | grep -q "Registration successful"; then
  echo -e "${GREEN}Register endpoint passed${NC}"
  TOKEN=$(echo "$REGISTER_OUTPUT" | grep -o '"token":"[^"]*"' | sed 's/"token":"\(.*\)"/\1/')
else
  echo -e "${RED}Register endpoint failed: $REGISTER_OUTPUT${NC}" | tee -a "$ERROR_LOG"
fi

# Test Profile Endpoint
if [ -n "$TOKEN" ]; then
  echo "Testing profile endpoint..."
  PROFILE_OUTPUT=$(curl -s --max-time 10 http://localhost:5001/api/user/profile -H "Cookie: token=$TOKEN")
  if echo "$PROFILE_OUTPUT" | grep -q "User profile"; then
    echo -e "${GREEN}Profile endpoint passed${NC}"
  else
    echo -e "${RED}Profile endpoint failed: $PROFILE_OUTPUT${NC}" | tee -a "$ERROR_LOG"
  fi
else
  echo "Skipping profile endpoint test: No token available."
fi

# Stop Server
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null && echo "Server stopped" || echo "Server already stopped"

# Run Tests
echo "Running Jest tests..."
cd "$PROJECT_DIR" && . ./.env && npx jest && echo -e "${GREEN}Tests passed${NC}" || echo -e "${RED}Tests failed${NC}" | tee -a "$ERROR_LOG"

# Prompt for Pushing Changes
if [ "$NO_PROMPT" = true ]; then
  push_choice="y"
else
  read -p "Push changes to remote repository? (y/n): " push_choice
fi

if [ "$push_choice" = "y" ] || [ "$push_choice" = "Y" ]; then
  echo "Pushing changes to remote repository..."
  git add . && git commit -m "Verified setup" || echo "No changes to commit"
  git push origin main || echo -e "${RED}Push failed${NC}" | tee -a "$ERROR_LOG"
else
  echo "Skipping push to remote repository."
fi

# --- Final Messages ---
echo -e "${GREEN}Script complete!${NC}"
[ -f "$ERROR_LOG" ] && echo "Check $ERROR_LOG for errors"
echo "Start server: cd $PROJECT_DIR && npx tsx src/server.ts"
echo "API Docs: http://localhost:5001/api-docs"
echo "Use '--no-prompt' flag to skip interactive prompts"