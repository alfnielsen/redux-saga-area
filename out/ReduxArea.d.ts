import { Draft, Immutable } from "immer";
import { AnyAction, Reducer } from 'redux';
declare type Func = (...args: any) => any;
declare type ReduxAction = ((...args: any) => AnyAction) & {
    name: string;
    reducer: Reducer;
};
export declare type FetchAreaAction<TState, TFetchAction extends Func, TSuccessAction extends Func, TFailureAction extends Func> = {
    request: AreaAction<TState, TFetchAction>;
    success: AreaAction<TState, TSuccessAction>;
    failure: AreaAction<TState, TFailureAction>;
};
export declare type AreaAction<TState, T extends Func> = ((...args: Parameters<T>) => ReturnType<T> & {
    type: string;
}) & {
    name: string;
    reducer: Reducer<Immutable<TState>, ReturnType<T> & {
        type: string;
    }>;
    use: (draft: Draft<TState>, action: ReturnType<T>) => void;
    type: ReturnType<T> & {
        type: string;
    };
};
interface ICreateReduxAreaOptions {
    namePrefix?: string;
    fetchPostfix?: string[];
}
declare const CreateReduxArea: <TState>(initialState: TState) => {
    add: (name: string) => {
        produce: (producer: (draft: Draft<TState>, action: {
            type: string;
        }) => void) => AreaAction<TState, () => TState>;
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
                            }) => void) => FetchAreaAction<TState, TFetchAction, TSuccessAction, TFailureAction>;
                        };
                    };
                };
            };
        };
        produce: (producer: (draft: Draft<TState>, action: {
            type: string;
        }) => void) => {
            successAction: <TSuccessAction_1 extends Func>(successAction: TSuccessAction_1) => {
                successProduce: (successProducer: (draft: Draft<TState>, action: ReturnType<TSuccessAction_1> & {
                    type: string;
                }) => void) => {
                    failureAction: <TFailureAction_1 extends Func>(failureAction: TFailureAction_1) => {
                        failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnType<TFailureAction_1> & {
                            type: string;
                        }) => void) => FetchAreaAction<TState, () => TState, TSuccessAction_1, TFailureAction_1>;
                    };
                };
            };
        };
    };
    options: (options: ICreateReduxAreaOptions) => any;
    setStandardFetchFailure: <TStandardFetchFailureAction extends Func>(action: TStandardFetchFailureAction, producer: (draft: Draft<TState>, action: ReturnType<TStandardFetchFailureAction> & {
        type: string;
    }) => void) => {
        addFetch: (name: string) => {
            action: <TFetchAction_1 extends Func>(action: TFetchAction_1) => {
                produce: (producer: (draft: Draft<TState>, action: ReturnType<TFetchAction_1> & {
                    type: string;
                }) => void) => {
                    successAction: <TSuccessAction_2 extends Func>(action: TSuccessAction_2) => {
                        successProduce: (successProducer: (draft: Draft<TState>, action: ReturnType<TSuccessAction_2> & {
                            type: string;
                        }) => void) => {
                            failureAction: <TFailureAction_2 extends Func>(failureAction: TFailureAction_2) => {
                                failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnType<TFailureAction_2> & {
                                    type: string;
                                }) => void) => FetchAreaAction<TState, TFetchAction_1, TSuccessAction_2, TFailureAction_2>;
                            };
                            standardFailure: () => FetchAreaAction<TState, TFetchAction_1, TSuccessAction_2, TStandardFetchFailureAction>;
                        };
                    };
                    successProduce: (successProducer: (draft: Draft<TState>, action: {
                        type: string;
                    }) => void) => {
                        failureAction: <TFailureAction_3 extends Func>(failureAction: TFailureAction_3) => {
                            failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnType<TFailureAction_3> & {
                                type: string;
                            }) => void) => FetchAreaAction<TState, TFetchAction_1, () => TState, TFailureAction_3>;
                        };
                        standardFailure: () => FetchAreaAction<TState, TFetchAction_1, () => TState, TStandardFetchFailureAction>;
                    };
                };
            };
            produce: (producer: (draft: Draft<TState>, action: {
                type: string;
            }) => void) => {
                successAction: <TSuccessAction_3 extends Func>(action: TSuccessAction_3) => {
                    successProduce: (successProducer: (draft: Draft<TState>, action: ReturnType<TSuccessAction_3> & {
                        type: string;
                    }) => void) => {
                        failureAction: <TFailureAction_4 extends Func>(failureAction: TFailureAction_4) => {
                            failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnType<TFailureAction_4> & {
                                type: string;
                            }) => void) => FetchAreaAction<TState, () => TState, TSuccessAction_3, TFailureAction_4>;
                        };
                        standardFailure: () => FetchAreaAction<TState, () => TState, TSuccessAction_3, TStandardFetchFailureAction>;
                    };
                };
                successProduce: (successProducer: (draft: Draft<TState>, action: {
                    type: string;
                }) => void) => {
                    failureAction: <TFailureAction_5 extends Func>(failureAction: TFailureAction_5) => {
                        failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnType<TFailureAction_5> & {
                            type: string;
                        }) => void) => FetchAreaAction<TState, () => TState, () => TState, TFailureAction_5>;
                    };
                    standardFailure: () => FetchAreaAction<TState, () => TState, () => TState, TStandardFetchFailureAction>;
                };
            };
        };
        options: (options: ICreateReduxAreaOptions) => any;
        add: (name: string) => {
            produce: (producer: (draft: Draft<TState>, action: {
                type: string;
            }) => void) => AreaAction<TState, () => TState>;
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
        setStandardFetchFailure: any;
        initialState: TState;
        namePrefix: string;
        fetchPostfix: string[];
        actions: ReduxAction[];
        rootReducer: Reducer<TState, AnyAction>;
    };
    initialState: TState;
    namePrefix: string;
    fetchPostfix: string[];
    actions: ReduxAction[];
    rootReducer: Reducer<TState, AnyAction>;
};
export default CreateReduxArea;
