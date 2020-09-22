import Request from 'https';
import Axios from 'axios';
import {URLTestResult} from "../../../models/urls/tests/URLTestResult";
import URLTestResults from "../../../models/urls/tests/URLTestResults";
import {parse} from "content-disposition";

export const testUrl = async (url: string, self?: { hostname: string }): Promise<{ result: URLTestResult, headers?: any }> => {
    let parsedUrl: URL | undefined;
    try {
        parsedUrl = new URL(url);
    } catch (e) {
        return {result: URLTestResults.BAD_URL};
    }

    if (self && parsedUrl.hostname.toLowerCase() === self.hostname.toLowerCase())
        return {result: URLTestResults.SAME_HOST};

    try {
        const redirect = await testRedirection(parsedUrl);

        if (redirect === null)
            return {result: URLTestResults.NOT_EXISTING(parsedUrl)};

        if (redirect && redirect.n && new URL(redirect.url).hostname.toLowerCase() === self?.hostname.toLowerCase())
            return {result: URLTestResults.SAME_HOST};

        if (redirect && redirect.n > 5)
            return {result: URLTestResults.TOO_MANY_REDIRECTIONS(redirect)};

        const {download, headers, fileSizeKb, fileName} = await testDownload(redirect ? new URL(redirect.url) : parsedUrl);

        if (download)
            return {result: URLTestResults.DOWNLOAD({fileSizeKb, fileName}), headers};

        if (/\.[a-z]{2,3}$/.test(redirect ? redirect.url : parsedUrl.pathname))
            return {result: URLTestResults.FILE_ENDING({url: parsedUrl.toString()}), headers};

        if (redirect && redirect.n)
            return {result: URLTestResults.REDIRECTION(redirect), headers};

        return {result: URLTestResults.OKAY, headers};
    } catch (e) {
        return {result: URLTestResults.UNKNOWN};
    }
};

export const testRedirection = async (url: URL): Promise<{ url: string, n: number } | false | null> => {
    let redirect: { _redirectCount: number, _currentUrl: string };
    try {
        const result = await Axios.head(url.toString(), {timeout: 2500});
        redirect = result.request._redirectable;
    } catch (e) {
        if (e.request?._redirectable)
            redirect = e.request._redirectable;
        else if (e.errno === "ENOTFOUND")
            return null;
        else
            return false;
    }
    return {n: redirect._redirectCount, url: redirect._currentUrl};
}

export const testDownload = async (url: URL): Promise<{ download: boolean, fileName?: string, fileSizeKb?: number, headers: any }> => {
    // @ts-ignore
    const response: { headers: { [key: string]: string } } = await new Promise((res, rej) => {
        // @ts-ignore
        Request.get(url.toString(), {timeout: 2500}, res).on('error', rej);
    });

    const dispositionHeaders = Object.keys(response.headers).filter(x => x.toLowerCase() === "content-disposition");
    if (!dispositionHeaders.length) return {download: false, headers: response.headers};

    const parsedDispositionHeader = parse(response.headers[dispositionHeaders[0]]);
    if (parsedDispositionHeader.type !== "attachment") return {download: false, headers: response.headers};

    const fileName: string | undefined = parsedDispositionHeader.parameters.filename || undefined;

    let fileSizeKb: number | undefined;
    const contentLengthHeaders = Object.keys(response.headers).filter(x => x.toLowerCase() === "content-length");
    if (contentLengthHeaders.length && /^\d+$/.test(response.headers[contentLengthHeaders[0]].toString()))
        fileSizeKb = parseInt(response.headers[contentLengthHeaders[0]]) / 1000;

    return {fileName, fileSizeKb, headers: response.headers, download: true};
}
