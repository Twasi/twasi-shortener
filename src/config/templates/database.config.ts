export type DatabaseConfig = {
    host: string,
    port: number,
    username: string,
    password: string,
    dbName: string
}

export const DefaultDatabaseConfig: DatabaseConfig = {
    dbName: 'twasi-shortener',
    host: 'localhost',
    port: 27017,
    username: '',
    password: ''
}
