import {URLTestResult} from "./URLTestResult";

export enum URLTestResultCodes {
    OKAY = "OKAY",
    BAD_URL = "BAD_URL",
    SAME_HOST = "SAME_HOST",
    UNKNOWN = "UNKNOWN",
    REDIRECTION = "REDIRECTION",
    TOO_MANY_REDIRECTIONS = "TOO_MANY_REDIRECTIONS",
    DOWNLOAD = "DOWNLOAD",
    NOT_EXISTING = "NOT_EXISTING",
    FILE_ENDING = "FILE_ENDING"
}

export const URLTestResults = {
    OKAY: new URLTestResult({
        STATUS: URLTestResultCodes.OKAY,
        MESSAGE: "Okay."
    }),
    BAD_URL: new URLTestResult({
        STATUS: URLTestResultCodes.BAD_URL,
        MESSAGE: "Not a valid URL.",
        CRITICAL: true
    }),
    SAME_HOST: new URLTestResult({
        STATUS: URLTestResultCodes.SAME_HOST,
        MESSAGE: "Url is on same host as the shortener.",
        CRITICAL: true
    }),
    UNKNOWN: new URLTestResult({
        STATUS: URLTestResultCodes.UNKNOWN,
        MESSAGE: "Could not retrieve information about the URL.",
        CRITICAL: true
    }),

    REDIRECTION: (DATA: { n: number, url: string }) => new URLTestResult<typeof DATA>({
        STATUS: URLTestResultCodes.REDIRECTION,
        DATA,
        MESSAGE: (data) => `The host also redirects you (${data.n} times, to host '${data.url}').`
    }),
    TOO_MANY_REDIRECTIONS: (DATA: { n: number }) => new URLTestResult<typeof DATA>({
        STATUS: URLTestResultCodes.TOO_MANY_REDIRECTIONS,
        DATA,
        MESSAGE: (data) => `The target url redirects too many times (${data.n}).`,
        CRITICAL: true
    }),
    DOWNLOAD: (DATA: { fileSizeKb?: number, fileName?: string }) => new URLTestResult<typeof DATA>({
        STATUS: URLTestResultCodes.DOWNLOAD,
        DATA,
        MESSAGE: (data) => `The page your are redirected to will download a file (name: '${data.fileName}', size: ${data.fileSizeKb}kb).`,
        CRITICAL: true
    }),
    NOT_EXISTING: (DATA: { host: string }) => new URLTestResult<typeof DATA>({
        STATUS: URLTestResultCodes.NOT_EXISTING,
        DATA,
        MESSAGE: (data) => `The redirection-url seems to be offline or not existing. (${data.host})`,
        CRITICAL: true
    }),
    FILE_ENDING: (DATA: { url: string }) => new URLTestResult<typeof DATA>({
        STATUS: URLTestResultCodes.FILE_ENDING,
        MESSAGE: data => `The URL could possibly download a file (${data.url}).`,
        CRITICAL: true
    }),
};
export default URLTestResults;
