export type DatabaseConfig = {
    host: string,
    port: number,
    username: string,
    password: string
}

export const DefaultDatabaseConfig: DatabaseConfig = {
    host: 'localhost',
    port: 27017,
    username: '',
    password: ''
}
