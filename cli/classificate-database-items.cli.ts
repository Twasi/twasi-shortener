import {connect} from "mongoose";
import {ConfigManager} from "merlins-config-manager";
import {DefaultDatabaseConfig} from "../src/config/templates/database.config";
import {DBShortenedUrlModel} from "../src/database/schemas/shortened-url.schema";
import inquirer from 'inquirer';
import {DBShortenedUrl} from "../src/models/shortened-url.model";

const DatabaseConfig = new ConfigManager().configSection("DATABASE", DefaultDatabaseConfig);

(async () => {
    console.log("Using database credentials from config.json.");

    const {host, port, username, password} = DatabaseConfig;

    const connectionString = `mongodb://${username ? username + (password ? ':' + password : '') + '@' : ''}${host}:${port}`;
    await connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true, dbName: DatabaseConfig.dbName});

    console.log("Database connected.");

    const cursor = DBShortenedUrlModel.find({classification: {$exists: false}});
    let editedDocuments = 0;

    console.log("Starting classification.");

    for await (const element of cursor as unknown as AsyncIterable<DBShortenedUrl>) {
        const result: string = (await inquirer.prompt([{
            type: "list",
            name: "answer",
            message: "Is '" + element.redirection + "' a nice link?",
            choices: ["Yes", "No", "Skip", "Close"]
        }])).answer;
        if (["Yes", "No"].includes(result)) {
            editedDocuments++;
            element.classification = result === "Yes";
            await element.save();
            console.log("Saved.");
        } else if (result === "Close") break;
    }

    console.log("Finished. Updated " + editedDocuments + " documents.")
})()
