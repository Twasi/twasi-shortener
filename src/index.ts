import {connectDatabase} from "./database/database";
import {startWebServer} from "./webserver/webserver";

connectDatabase().then(() => console.log('Database connected.')).catch(e => {
    console.log('Could not connect database.')
    console.error(e);
});

startWebServer();
