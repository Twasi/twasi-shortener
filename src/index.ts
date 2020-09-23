import {join} from "path";
import {connectDatabase} from "./database/database";
import {startWebServer} from "./webserver/webserver";

process.env.WORKING_DIR = join(__dirname, '..');

connectDatabase().then(() => console.log('Database connected.')).catch(e => {
    console.log('Could not connect database.')
    console.error(e);
});

startWebServer();
