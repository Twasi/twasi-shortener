import Inquirer from 'inquirer';
import {testUrl} from "../src/routines/urls/tests/test-url.routine";

(async () => {
    console.log("You can set a fake hostname to test the entered URLs for the 'SAME_HOST'-error.");

    const host: string | null = (await Inquirer.prompt([{
        type: "list",
        message: "Set fake hostname?",
        choices: ["Yes", "No"],
        name: "response"
    }])).response !== 'Yes' ? null :
        (await Inquirer.prompt([{
            type: "input",
            message: "Specify fake hostname:",
            name: "response",
            validate(input: string): boolean {
                try {
                    new URL(input);
                    return true;
                } catch (e) {
                    return false;
                }
            }
        }])).response;

    while (true) {
        const urlToTest: string = (await Inquirer.prompt([{
            type: "input",
            message: "Enter a URL to test:",
            name: "response"
        }])).response;

        if (urlToTest === "") break;

        const {result} = await testUrl(urlToTest, host ? new URL(host) : undefined);
        console.log(`Result: (${result.STATUS}) ${result.MESSAGE}`);
    }

    console.log("Quitting.");
})()
