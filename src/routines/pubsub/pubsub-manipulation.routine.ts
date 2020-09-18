import {$$asyncIterator} from 'iterall';

export const manipulateAsyncIterator = <T>(asyncIterator: AsyncIterator<T>, manipulator: (input: any) => any): AsyncIterator<T> => ({
    next(...args: [] | [undefined]): Promise<IteratorResult<any, any>> {
        return asyncIterator.next().then(({value, done}) => ({
            value: manipulator(value),
            done
        }));
    },

    return(value: any) {
        return Promise.resolve({value: undefined, done: true});
    },

    throw(e: any) {
        return Promise.reject(e)
    },

    // @ts-ignore
    [$$asyncIterator]() {
        return this;
    },
})
