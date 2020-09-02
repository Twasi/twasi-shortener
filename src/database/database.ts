import {DatabaseConfig} from "../config/app-config";
import {connect} from "mongoose";
import {Mongoose} from "mongoose";

const {host, port, username, password} = DatabaseConfig;

export const connectDatabase = async (): Promise<Mongoose> => {
    const connectionString = `mongodb://${username ? username + (password ? ':' + password : '') + '@' : ''}${host}:${port}`;
    return connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true, dbName: DatabaseConfig.dbName});
}
