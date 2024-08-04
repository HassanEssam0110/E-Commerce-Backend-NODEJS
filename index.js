import express from 'express';
import path from 'path';
import morgan from 'morgan';
import { config } from 'dotenv';

import connection_db from './DB/connection-database.js';
import { bootstrap, ApiError } from './src/Utils/index.js';
import { globalError } from './src/Middlewares/index.js'

// Load environment variables from a .env file into process.env
config({ path: path.resolve('.env') });
// Database connection
connection_db();

const app = express();

// Middlewares
app.use(morgan('dev'));

// Mount Routers
bootstrap(app);

// Middleware Route NOT FOUND Error handler
app.use('*', (req, res, next) => {
    return next(new ApiError('Not Found!', 404, `route not found ${'url: ' + req.protocol + '://' + req.get('host') + req.originalUrl}`))
})

// Middleware Global Error handler for express
app.use(globalError);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => { console.log(`Mode:${process.env.NODE_ENV} && listening on PORT: ${PORT}`) });

//@desc   Handle rejection outside express ex: database
process.on('unhandledRejection', (err) => {
    console.error(`unhandledRejection Error:   ErrorName:${err.name}  |  ErrorMessage:${err.message}`);
    server.close(() => {
        console.error(`Shutting down...`);
        process.exit(1);
    })
});
