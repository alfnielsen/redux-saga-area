import { Draft, Immutable } from "immer";
import { AnyAction, Reducer } from 'redux';
declare type Func = (...args: any) => any;
declare type ReduxAction = ((...args: any) => AnyAction) & {
    name: string;
    reducer: Reducer;
};
declare type AreaAction<TState, T extends Func> = ((...args: Parameters<T>) => ReturnType<T> & {
    type: string;
}) & {
    name: string;
    reducer: Reducer<Immutable<TState>, ReturnType<T> & {
        type: string;
    }>;
    type: ReturnType<T> & {
        type: string;
    };
};
declare type AreaActionEmpty<TState> = (() => {
    type: string;
}) & {
    name: string;
    reducer: Reducer<Immutable<TState>, {
        type: string;
    }>;
    type: {
        type: string;
    };
};
interface ICreateReduxAreaOptions {
    namePrefix?: string;
    fetchPostfix?: string[];
}
declare const CreateReduxArea: <TState>(initialState: TState) => {
    namePrefix: string;
    fetchPostfix: string[];
    options: (options: ICreateReduxAreaOptions) => any;
    add: (name: string) => {
        produce: (producer: (draft: Draft<TState>, action: {
            type: string;
        }) => void) => AreaActionEmpty<TState>;
        reducer: (reducer: (state: TState, reducerAction: {
            type: string;
        }) => any) => (() => {
            type: string;
        }) & {
            name: string;
            reducer: Reducer<Immutable<TState>, {
                type: string;
            }>;
            type: {
                type: string;
            };
        };
        action: <TAction extends Func>(action: TAction) => {
            produce: (producer: (draft: Draft<TState>, action: ReturnType<TAction> & {
                type: string;
            }) => void) => AreaAction<TState, TAction>;
            reducer: (reducer: (state: TState, reducerAction: ReturnType<TAction> & {
                type: string;
            }) => any) => AreaAction<TState, TAction>;
        };
    };
    addFetch: (name: string) => {
        produce: (producer: (draft: Draft<TState>, action: {
            type: string;
        }) => void) => any;
        action: <TFetchAction extends Func>(action: TFetchAction) => {
            produce: (producer: (draft: Draft<TState>, action: ReturnType<TFetchAction> & {
                type: string;
            }) => void) => {
                successAction: <TSuccessAction extends Func>(successAction: TSuccessAction) => {
                    successProduce: (successProducer: (draft: Draft<TState>, action: ReturnType<TSuccessAction> & {
                        type: string;
                    }) => void) => {
                        failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
                            failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnType<TFailureAction> & {
                                type: string;
                            }) => void) => {
                                request: AreaAction<TState, TFetchAction>;
                                success: AreaAction<TState, TSuccessAction>;
                                failure: AreaAction<TState, TFailureAction>;
                            };
                        };
                    };
                };
            };
        };
    };
    rootReducer: (state: TState | undefined, action: AnyAction) => TState;
    actions: ReduxAction[];
    initialState: TState;
};
export default CreateReduxArea;
