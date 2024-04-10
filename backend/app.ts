
import * as dotenv from 'dotenv';
dotenv.config();
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import multer from 'multer'
//routers
import userRouter from './routes/user.route';
import authRouter from './routes/auth.route';
import gptRouter from './routes/gpt.route';

// Create the express app and import the type of app from express;
const app: Application = express();

// Set security HTTP headers
app.use(helmet({
    contentSecurityPolicy: false
}));

// Cors
app.use(cors());

// upload

app.use(express.static("files"));

// Parse
app.use(express.json({limit: '10kb'}));
app.use(
    express.urlencoded({
        extended: true,
        limit: '10kb'
    })
);


// Test middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    // console.log('cookie', req.cookies);
    // console.log('header', req.headers);
    next();
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
    next()
  });

// Routes
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/gpt', gptRouter);

export default app;