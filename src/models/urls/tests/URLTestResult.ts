import {URLTestResultCodes} from "./URLTestResults";

export interface IURLTestResult<T = any> {
    STATUS: URLTestResultCodes,
    MESSAGE: string | ((props: T) => string),
    CRITICAL?: boolean,
    DATA?: any
}

export class URLTestResult<T = any> implements IURLTestResult<T> {
    private readonly _status: URLTestResultCodes;
    private readonly _message: string | ((props: T) => string);
    private readonly _critical?: boolean;
    private readonly _data: T;

    get STATUS() {
        return this._status;
    }

    get MESSAGE(): string {
        return typeof this._message === "function" ?
            this._message(this._data) :
            this._message;
    }

    get CRITICAL() {
        return this._critical === true;
    }

    get DATA() {
        return this._data;
    }

    constructor(props: IURLTestResult<T>) {
        this._status = props.STATUS;
        this._message = props.MESSAGE;
        this._critical = props.CRITICAL;
        this._data = props.DATA;
    }

}
