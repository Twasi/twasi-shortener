import {connect} from "mongoose";
import {DBShortenedUrlModel} from "../src/database/schemas/shortened-url.schema";
import inquirer from 'inquirer';
import {redirectionToSameHostQuery} from "../src/routines/urls/find-same-host.routine";
import {DatabaseConfig} from "../src/config/app-config";

(async () => {
    console.log("Using database credentials from config.json.");

    const {host, port, username, password} = DatabaseConfig;

    const connectionString = `mongodb://${username ? username + (password ? ':' + password : '') + '@' : ''}${host}:${port}`;
    await connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true, dbName: DatabaseConfig.dbName});

    console.log("Database connected.");
    let editedDocuments = 0;
    let skip = 0;

    console.log("Starting classification.");

    let element = await DBShortenedUrlModel.findOne({classification: {$exists: false}});
    while (element) {
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

            const host = new URL(element.redirection).origin;
            const filterQuery = {
                ...redirectionToSameHostQuery(element.redirection),
                classification: {$exists: false}
            };
            const othersAmount = await DBShortenedUrlModel.countDocuments(filterQuery);

            if (othersAmount === 0) console.log(`No other redirection to host '${host}' found.`);
            else {
                console.log(`There ${othersAmount === 1 ? 'is' : 'are'} ${othersAmount} other redirections to this host (${host}).`);
                const updateAll = (await inquirer.prompt([{
                    type: "list",
                    name: "answer",
                    message: "Approve all of them?",
                    choices: ["Yes", "No"]
                }])).answer;
                if (updateAll === "Yes") {
                    const updated = await DBShortenedUrlModel.updateMany(filterQuery, {classification: result === "Yes"});
                    console.log(`${updated.n} documents updated.`)
                }
            }

            console.log("Saved.");
        } else if (result === "Close") break;
        if (result === "Skip") skip++;
        element = await DBShortenedUrlModel.findOne({classification: {$exists: false}}).setOptions({skip});
    }

    console.log("Finished. Updated " + editedDocuments + " documents.")
})()
