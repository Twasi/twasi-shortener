import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import {connect} from "mongoose";
import {DatabaseConfig} from "../src/config/app-config";
import {DBShortenedUrlModel} from "../src/database/schemas/shortened-url.schema";
import {ArgumentParser} from "merlins-argument-parser";
import {existsSync} from "fs";

const argParser = new ArgumentParser(process.argv.slice(2));

type classification = { url: string, classification: "good" | "bad" };

(async () => {
    console.log("Using database credentials from config.json.");

    const {host, port, username, password} = DatabaseConfig;

    const connectionString = `mongodb://${username ? username + (password ? ':' + password : '') + '@' : ''}${host}:${port}`;
    await connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true, dbName: DatabaseConfig.dbName});

    console.log("Database connected.");

    const items: Array<classification> = await DBShortenedUrlModel.aggregate([
        {
            $match: {classification: {$exists: true}}
        },
        {
            $project: {url: "$redirection"}
        }
    ]);

    const testItems: Array<classification> = await DBShortenedUrlModel.aggregate([
        {
            $match: {classification: {$exists: false}}
        },
        {
            $project: {url: "$redirection", classification: {$cond: ["$classification", "good", "bad"]}}
        }
    ]);

    console.log(`Using ${items.length} items.`);

    const encodeData = (data: Array<classification>) => {
        const sentences = data.map(item => item.url.toLowerCase());
        return use.load()
            .then(model => {
                return model.embed(sentences).then(embeddings => {
                    return embeddings
                });
            })
            .catch(err => console.error('Fit Error: ' + err));
    }

    const outputData = await tf.tensor2d(items.map(item => [item.classification === 'good' ? 1 : 0, item.classification === 'bad' ? 1 : 0]));

    let model: any;

    if (!existsSync('tf.js-model') || argParser.get('forceCompile').asBool()) {
        model = tf.sequential();

        model.add(tf.layers.dense({
            inputShape: [512],
            activation: "sigmoid",
            units: 2
        }));

        model.add(tf.layers.dense({
            inputShape: [2],
            activation: "sigmoid",
            units: 2
        }));

        model.add(tf.layers.dense({
            inputShape: [2],
            activation: "sigmoid",
            units: 2
        }));

        model.compile({
            loss: 'meanSquaredError',
            optimizer: tf.train.adam(.06)
        });

        // @ts-ignore
        const history = await model.fit(await encodeData(items), outputData, {epochs: 350});
        model.save('file://tf.js-model').then();
    } else model = await tf.loadLayersModel('file://tf.js-model/model.json');
    // @ts-ignore
    const tensor: Array<[number, number]> = await model.predict(await encodeData(testItems)).array();
    console.log(tensor.map(((value, index) => ({
        url: testItems[index].url,
        accuracy: Math.max(value[0], value[1]),
        prediction: value[0] > value[1] ? 'good' : 'bad'
    }))));
})()
