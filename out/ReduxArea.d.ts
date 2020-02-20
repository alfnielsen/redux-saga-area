import { Draft, Immutable } from "immer";
import { AnyAction, Reducer } from 'redux';
declare type Func = (...args: any) => any;
declare type ReduxAction = ((...args: any) => AnyAction) & {
    name: string;
    reducer: Reducer;
    intercept?: Reducer;
};
declare type EmptyActionType = {
    type: string;
};
declare type EmptyAction = () => EmptyActionType;
declare type ReturnTypeAction<T extends Func> = ReturnType<T> & EmptyActionType;
export declare type FetchAreaAction<TState, TFetchAction extends Func, TSuccessAction extends Func, TFailureAction extends Func> = {
    request: AreaAction<TState, TFetchAction>;
    success: AreaAction<TState, TSuccessAction>;
    failure: AreaAction<TState, TFailureAction>;
};
export declare type TIntercept<TState> = (draft: Draft<TState>, action: EmptyActionType) => void;
export declare type AreaAction<TState, T extends Func> = ((...args: Parameters<T>) => ReturnTypeAction<T>) & {
    name: string;
    reducer: Reducer<Immutable<TState>, ReturnTypeAction<T>>;
    intercept?: (draft: Draft<TState>, action: EmptyActionType) => void;
    use: (draft: Draft<TState>, action: ReturnType<T>) => void;
    type: ReturnTypeAction<T>;
};
interface ICreateReduxAreaOptions<TState> {
    namePrefix?: string;
    fetchPostfix?: string[];
    interceptNormal?: (draft: Draft<TState>, action: EmptyActionType) => void;
    interceptRequest?: (draft: Draft<TState>, action: EmptyActionType) => void;
    interceptSuccess?: (draft: Draft<TState>, action: EmptyActionType) => void;
    interceptFailure?: (draft: Draft<TState>, action: EmptyActionType) => void;
}
declare class Area<TState, TStandardFailureAction extends Func> {
    initialState: TState;
    standardFailureAction?: TStandardFailureAction | undefined;
    standardFailureReducer?: ((draft: Draft<TState>, action: ReturnTypeAction<TStandardFailureAction>) => void) | undefined;
    namePrefix: string;
    fetchPostfix: string[];
    interceptNormal?: TIntercept<TState>;
    interceptRequest?: TIntercept<TState>;
    interceptSuccess?: TIntercept<TState>;
    interceptFailure?: TIntercept<TState>;
    actions: ReduxAction[];
    constructor(initialState: TState, standardFailureAction?: TStandardFailureAction | undefined, standardFailureReducer?: ((draft: Draft<TState>, action: ReturnTypeAction<TStandardFailureAction>) => void) | undefined);
    rootReducer(): (state: TState | undefined, action: AnyAction) => any;
    /**
     * Add a single action. \
     * Optional 'interceptNormal' in options will effect this. \
     * You can omit 'action' if its not needed. \
     * 'produce' uses [immer](https://immerjs.github.io/immer/docs/introduction) (always recommended) \
     * 'reducer' will create a normal reducer
     * @param name
     */
    add(name: string): {
        produce: (producer: (draft: Draft<TState>, action: EmptyActionType) => void) => AreaAction<TState, () => EmptyActionType>;
        reducer: (reducer: (state: TState, reducerAction: EmptyActionType) => any) => (() => EmptyActionType) & {
            name: string;
            reducer: Reducer<Immutable<TState>, EmptyActionType>;
            type: EmptyActionType;
        };
        action: <TAction extends Func>(action: TAction) => {
            produce: (producer: (draft: Draft<TState>, action: ReturnTypeAction<TAction>) => void) => AreaAction<TState, TAction>;
            reducer: (reducer: (state: TState, reducerAction: ReturnTypeAction<TAction>) => any) => TAction;
        };
    };
    /**
     * Add 3 action (Request, success and failure). \
     * Optional 'interceptRequest', 'interceptSuccess' and 'interceptFailure' in options will effect this. \
     * You can omit any 'action' and/or 'produce' if its not needed. (expect one of the final standardFailure of produceFailure) \
     * @param name
     */
    addFetch(name: string): {
        standardFailure: () => FetchAreaAction<TState, EmptyAction, EmptyAction, TStandardFailureAction>;
        failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
            failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction>) => void) => FetchAreaAction<TState, EmptyAction, EmptyAction, TFailureAction>;
        };
        failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => FetchAreaAction<TState, EmptyAction, EmptyAction, EmptyAction>;
        successAction: <TSuccessAction extends Func>(successAction: TSuccessAction) => {
            standardFailure: () => FetchAreaAction<TState, EmptyAction, TSuccessAction, TStandardFailureAction>;
            failureAction: <TFailureAction_1 extends Func>(failureAction: TFailureAction_1) => {
                failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction_1>) => void) => FetchAreaAction<TState, EmptyAction, TSuccessAction, TFailureAction_1>;
            };
            failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => FetchAreaAction<TState, EmptyAction, TSuccessAction, EmptyAction>;
            successProduce: (successProducer: (draft: Draft<TState>, action: ReturnTypeAction<TSuccessAction>) => void) => {
                standardFailure: () => FetchAreaAction<TState, EmptyAction, TSuccessAction, TStandardFailureAction>;
                failureAction: <TFailureAction_1 extends Func>(failureAction: TFailureAction_1) => {
                    failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction_1>) => void) => FetchAreaAction<TState, EmptyAction, TSuccessAction, TFailureAction_1>;
                };
                failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => FetchAreaAction<TState, EmptyAction, TSuccessAction, EmptyAction>;
            };
        };
        successProduce: (successProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => {
            standardFailure: () => FetchAreaAction<TState, EmptyAction, EmptyAction, TStandardFailureAction>;
            failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
                failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction>) => void) => FetchAreaAction<TState, EmptyAction, EmptyAction, TFailureAction>;
            };
            failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => FetchAreaAction<TState, EmptyAction, EmptyAction, EmptyAction>;
        };
        action: <TFetchAction extends Func>(action: TFetchAction) => {
            standardFailure: () => FetchAreaAction<TState, TFetchAction, EmptyAction, TStandardFailureAction>;
            failureAction: <TFailureAction_2 extends Func>(failureAction: TFailureAction_2) => {
                failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction_2>) => void) => FetchAreaAction<TState, TFetchAction, EmptyAction, TFailureAction_2>;
            };
            failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => FetchAreaAction<TState, TFetchAction, EmptyAction, EmptyAction>;
            successAction: <TSuccessAction_1 extends Func>(successAction: TSuccessAction_1) => {
                standardFailure: () => FetchAreaAction<TState, TFetchAction, TSuccessAction_1, TStandardFailureAction>;
                failureAction: <TFailureAction_3 extends Func>(failureAction: TFailureAction_3) => {
                    failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction_3>) => void) => FetchAreaAction<TState, TFetchAction, TSuccessAction_1, TFailureAction_3>;
                };
                failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => FetchAreaAction<TState, TFetchAction, TSuccessAction_1, EmptyAction>;
                successProduce: (successProducer: (draft: Draft<TState>, action: ReturnTypeAction<TSuccessAction_1>) => void) => {
                    standardFailure: () => FetchAreaAction<TState, TFetchAction, TSuccessAction_1, TStandardFailureAction>;
                    failureAction: <TFailureAction_3 extends Func>(failureAction: TFailureAction_3) => {
                        failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction_3>) => void) => FetchAreaAction<TState, TFetchAction, TSuccessAction_1, TFailureAction_3>;
                    };
                    failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => FetchAreaAction<TState, TFetchAction, TSuccessAction_1, EmptyAction>;
                };
            };
            successProduce: (successProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => {
                standardFailure: () => FetchAreaAction<TState, TFetchAction, EmptyAction, TStandardFailureAction>;
                failureAction: <TFailureAction_2 extends Func>(failureAction: TFailureAction_2) => {
                    failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction_2>) => void) => FetchAreaAction<TState, TFetchAction, EmptyAction, TFailureAction_2>;
                };
                failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => FetchAreaAction<TState, TFetchAction, EmptyAction, EmptyAction>;
            };
            produce: (producer: (draft: Draft<TState>, action: ReturnTypeAction<TFetchAction>) => void) => {
                standardFailure: () => FetchAreaAction<TState, TFetchAction, EmptyAction, TStandardFailureAction>;
                failureAction: <TFailureAction_2 extends Func>(failureAction: TFailureAction_2) => {
                    failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction_2>) => void) => FetchAreaAction<TState, TFetchAction, EmptyAction, TFailureAction_2>;
                };
                failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => FetchAreaAction<TState, TFetchAction, EmptyAction, EmptyAction>;
                successAction: <TSuccessAction_1 extends Func>(successAction: TSuccessAction_1) => {
                    standardFailure: () => FetchAreaAction<TState, TFetchAction, TSuccessAction_1, TStandardFailureAction>;
                    failureAction: <TFailureAction_3 extends Func>(failureAction: TFailureAction_3) => {
                        failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction_3>) => void) => FetchAreaAction<TState, TFetchAction, TSuccessAction_1, TFailureAction_3>;
                    };
                    failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => FetchAreaAction<TState, TFetchAction, TSuccessAction_1, EmptyAction>;
                    successProduce: (successProducer: (draft: Draft<TState>, action: ReturnTypeAction<TSuccessAction_1>) => void) => {
                        standardFailure: () => FetchAreaAction<TState, TFetchAction, TSuccessAction_1, TStandardFailureAction>;
                        failureAction: <TFailureAction_3 extends Func>(failureAction: TFailureAction_3) => {
                            failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction_3>) => void) => FetchAreaAction<TState, TFetchAction, TSuccessAction_1, TFailureAction_3>;
                        };
                        failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => FetchAreaAction<TState, TFetchAction, TSuccessAction_1, EmptyAction>;
                    };
                };
                successProduce: (successProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => {
                    standardFailure: () => FetchAreaAction<TState, TFetchAction, EmptyAction, TStandardFailureAction>;
                    failureAction: <TFailureAction_2 extends Func>(failureAction: TFailureAction_2) => {
                        failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction_2>) => void) => FetchAreaAction<TState, TFetchAction, EmptyAction, TFailureAction_2>;
                    };
                    failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => FetchAreaAction<TState, TFetchAction, EmptyAction, EmptyAction>;
                };
            };
        };
        produce: (producer: (draft: Draft<TState>, action: EmptyActionType) => void) => {
            standardFailure: () => FetchAreaAction<TState, () => EmptyActionType, EmptyAction, TStandardFailureAction>;
            failureAction: <TFailureAction_4 extends Func>(failureAction: TFailureAction_4) => {
                failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction_4>) => void) => FetchAreaAction<TState, () => EmptyActionType, EmptyAction, TFailureAction_4>;
            };
            failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => FetchAreaAction<TState, () => EmptyActionType, EmptyAction, EmptyAction>;
            successAction: <TSuccessAction_2 extends Func>(successAction: TSuccessAction_2) => {
                standardFailure: () => FetchAreaAction<TState, () => EmptyActionType, TSuccessAction_2, TStandardFailureAction>;
                failureAction: <TFailureAction_5 extends Func>(failureAction: TFailureAction_5) => {
                    failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction_5>) => void) => FetchAreaAction<TState, () => EmptyActionType, TSuccessAction_2, TFailureAction_5>;
                };
                failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => FetchAreaAction<TState, () => EmptyActionType, TSuccessAction_2, EmptyAction>;
                successProduce: (successProducer: (draft: Draft<TState>, action: ReturnTypeAction<TSuccessAction_2>) => void) => {
                    standardFailure: () => FetchAreaAction<TState, () => EmptyActionType, TSuccessAction_2, TStandardFailureAction>;
                    failureAction: <TFailureAction_5 extends Func>(failureAction: TFailureAction_5) => {
                        failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction_5>) => void) => FetchAreaAction<TState, () => EmptyActionType, TSuccessAction_2, TFailureAction_5>;
                    };
                    failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => FetchAreaAction<TState, () => EmptyActionType, TSuccessAction_2, EmptyAction>;
                };
            };
            successProduce: (successProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => {
                standardFailure: () => FetchAreaAction<TState, () => EmptyActionType, EmptyAction, TStandardFailureAction>;
                failureAction: <TFailureAction_4 extends Func>(failureAction: TFailureAction_4) => {
                    failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction_4>) => void) => FetchAreaAction<TState, () => EmptyActionType, EmptyAction, TFailureAction_4>;
                };
                failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => FetchAreaAction<TState, () => EmptyActionType, EmptyAction, EmptyAction>;
            };
        };
    };
    options(options: ICreateReduxAreaOptions<TState>): this;
    /**
     * Add StandardFailure method. \
     * Is set the standardFailure for 'addFetch' will be enabled. \
     * Not this method must be chain directly on the CreateReduxArea to work correct. \
     * (Due to the way typescript calculate interfaces) \
     * @example
     * const area = CreateReduxArea({ loading: true })
     *    .option({...})
     *    .setStandardFetchFailure(action, producer);
     * // OR
     * const area = CreateReduxArea({ loading: true })
     *    .setStandardFetchFailure(action, producer);
     * // DON'T DO:
     * area.setStandardFetchFailure(action, producer); // Will NOT work
     * area = area.setStandardFetchFailure(action, producer); // Will NOT work
     * @param action
     * @param producer
     */
    setStandardFetchFailure<TFetchAction extends Func>(action: TFetchAction, producer: (draft: Draft<TState>, action: ReturnTypeAction<TFetchAction>) => void): Area<TState, TFetchAction>;
}
declare const CreateReduxArea: <TState>(initialState: TState) => Area<TState, Func>;
export default CreateReduxArea;
