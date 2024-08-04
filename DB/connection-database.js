
import { connect } from "mongoose"

/**
 * Connects to the database using the provided URI from environment variables.
 * Logs the connection status or errors if connection fails.
 * @returns {Promise<void>}
 */
const connection_db = async () => {
    connect(process.env.CONNECTION_DB_URI)
        .then((conn) => {
            console.log(`Database connected: ${conn.connection.host}`)
        })
        .catch(error => {
            console.log("Error connecting to database", error)
        })
};

export default connection_db;