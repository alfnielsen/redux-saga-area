import { Draft, Immutable } from "immer";
import { AnyAction, Reducer } from 'redux';
export declare type Func = (...args: any) => any;
export declare type ReduxAction = ((...args: any) => AnyAction) & {
    name: string;
    reducer: Reducer;
};
export declare type AnyActionBase = {
    type: string;
};
export declare type EmptyActionType<AreaActionType> = {
    type: string;
} & AreaActionType;
export declare type EmptyAction<AreaActionType> = () => EmptyActionType<AreaActionType>;
export declare type ReturnTypeAction<TAction extends Func, AreaActionType> = ReturnType<TAction> & EmptyActionType<AreaActionType>;
export declare type ActionCreatorInterceptorOptions = {
    action: {
        type: string;
    };
    actionName: string;
    actionTags: string[];
};
export declare type ActionCreatorInterceptor = (options: ActionCreatorInterceptorOptions) => any;
export declare type FetchAreaAction<TBaseState, TAreaState, TFetchAction extends Func, TSuccessAction extends Func, TFailureAction extends Func, AreaActionType> = {
    request: AreaAction<TBaseState, TAreaState, TFetchAction, AreaActionType>;
    success: AreaAction<TBaseState, TAreaState, TSuccessAction, AreaActionType>;
    failure: AreaAction<TBaseState, TAreaState, TFailureAction, AreaActionType>;
    actionName: string;
};
export declare type TIntercept<TState, AreaActionType> = (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void;
export declare type TActionIntercept<TState> = (draft: Draft<TState>, action: ActionCreatorInterceptorOptions) => void;
export declare type AreaAction<TBaseState, TAreaState, TAction extends Func, AreaActionType> = ((...args: Parameters<TAction>) => ReturnTypeAction<TAction, AreaActionType>) & {
    name: string;
    actionName: string;
    reducer: Reducer<Immutable<TBaseState & TAreaState>, ReturnTypeAction<TAction, AreaActionType>>;
    use: (draft: Draft<TBaseState & TAreaState>, action: ReturnType<TAction>) => void;
    type: ReturnTypeAction<TAction, AreaActionType>;
};
declare class Area<TBaseState, TAreaState, TBaseFailureAction extends Func, TAreaFailureAction extends Func, TBaseActionTypeInterceptor extends ActionCreatorInterceptor> {
    baseOptions: IAreaBaseOptions<TBaseState, TBaseFailureAction, TBaseActionTypeInterceptor>;
    areaOptions: IAreaOptions<TBaseState, TAreaState, TAreaFailureAction, TBaseActionTypeInterceptor>;
    actions: ReduxAction[];
    initialState: TBaseState & TAreaState;
    namePrefix: string;
    normalNamePostfix: string;
    requestNamePostfix: string;
    successNamePostfix: string;
    failureNamePostfix: string;
    constructor(baseOptions: IAreaBaseOptions<TBaseState, TBaseFailureAction, TBaseActionTypeInterceptor>, areaOptions: IAreaOptions<TBaseState, TAreaState, TAreaFailureAction, TBaseActionTypeInterceptor>);
    findTagsInterceptors(tags: string[]): [TIntercept<TBaseState, ReturnType<TBaseActionTypeInterceptor>>[], TIntercept<TBaseState & TAreaState, ReturnType<TBaseActionTypeInterceptor>>[]];
    getActionName(name: string): string;
    getRequestName(name: string): string;
    getSuccessName(name: string): string;
    getFailureName(name: string): string;
    rootReducer(): (state: TAreaState | undefined, action: AnyAction) => any;
    /**
     * Add a single action. \
     * Optional 'interceptNormal' in options will effect this. \
     * You can omit 'action' if its not needed. \
     * 'produce' uses [immer](https://immerjs.github.io/immer/docs/introduction) (always recommended) \
     * 'reducer' will create a normal reducer
     * @param name
     * @param tags (optional) list of tags
     */
    add(name: string, tags?: string[]): {
        /**
         * produce (without action defined / auto generated action with 'type' and props from AreaBase)
         * @param producer A produce method that mutates the draft (state)
         * @example
         * .produce((draft, { type }) => {
         *    draft.startProduce = true
         * })
         */
        produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => AreaAction<TBaseState, TAreaState, () => {}, ReturnType<TBaseActionTypeInterceptor>>;
        reducer: (reducer: (state: TAreaState & TBaseState, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => any) => AreaAction<TBaseState, TAreaState, () => {}, ReturnType<TBaseActionTypeInterceptor>>;
        /**
        * actionCreator ('type' will be added automatically + props defined in AreaBase)
        * @param action ActionCreator
        * @example
        * .action((id: number) => ({ id })
        */
        action: <TAction extends Func>(action: TAction) => {
            /**
             * produce (props from 'action' method, plus auto generated 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .produce((draft, { id }) => {
             *    draft.productId = id
             * })
             */
            produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => AreaAction<TBaseState, TAreaState, TAction, ReturnType<TBaseActionTypeInterceptor>>;
            reducer: (reducer: (state: TAreaState & TBaseState, action: ReturnTypeAction<TAction, ReturnType<TBaseActionTypeInterceptor>>) => any) => AreaAction<TBaseState, TAreaState, TAction, ReturnType<TBaseActionTypeInterceptor>>;
        };
    };
    /**
     * Add 3 action (Request, success and failure). \
     * Optional 'interceptRequest', 'interceptSuccess' and 'interceptFailure' in options will effect this. \
     * You can omit any 'action' and/or 'produce' if its not needed. (expect one of the final areaFailure of produceFailure) \
     * @param name
     * @param tags (optional) list of tags
     */
    addFetch(name: string, tags?: string[]): {
        /**
         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
         * @example
         * .baseFailure()
         */
        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
        /**
         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
         * @example
         * .baseFailure()
         */
        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
        /**
         * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
         * @param action ActionCreator
         * @example
         * .failureAction((error: Error) => ({ error })
         */
        failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
            /**
             * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .produce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
        };
        /**
         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
         * @param producer A produce method that mutates the draft (state)
         * @example
         * .failureProduce((draft, { error }) => {
         *    draft.error = error
         * })
         */
        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
        /**
         * Fetch - success action - actionCreator ('type' will be added automatically + props defined in AreaBase)
         * @param action ActionCreator
         * @example
         * .successAction((products: IProduct[]) => ({ products })
         */
        successAction: <TSuccessAction extends Func>(successAction: TSuccessAction) => {
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
             * @example
             * .baseFailure()
             */
            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
             * @example
             * .baseFailure()
             */
            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .failureAction((error: Error) => ({ error })
             */
            failureAction: <TFailureAction_1 extends Func>(failureAction: TFailureAction_1) => {
                /**
                 * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .failureProduce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * fetch - produce success (props from 'successAction' method, plus auto generated 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .produce((draft, { products }) => {
             *    draft.products = products
             * })
             */
            successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TSuccessAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_1 extends Func>(failureAction: TFailureAction_1) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            };
        };
        /**
         * fetch - produce success (without action defined / auto generated action with 'type' and props from AreaBase)
         * @param producer A produce method that mutates the draft (state)
         * @example
         * .successProduce((draft, { products }) => {
         *    draft.products = products
         * })
         */
        successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
             * @example
             * .baseFailure()
             */
            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
             * @example
             * .baseFailure()
             */
            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .failureAction((error: Error) => ({ error })
             */
            failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
                /**
                 * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .failureProduce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
        };
        /**
         * Fetch - request action - actionCreator ('type' will be added automatically + props defined in AreaBase)
         * @param action ActionCreator
         * @example
         * .action((id: number) => ({ id })
         */
        action: <TFetchAction extends Func>(action: TFetchAction) => {
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
             * @example
             * .baseFailure()
             */
            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
             * @example
             * .baseFailure()
             */
            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .failureAction((error: Error) => ({ error })
             */
            failureAction: <TFailureAction_2 extends Func>(failureAction: TFailureAction_2) => {
                /**
                 * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .failureProduce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - success action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .successAction((products: IProduct[]) => ({ products })
             */
            successAction: <TSuccessAction_1 extends Func>(successAction: TSuccessAction_1) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_3 extends Func>(failureAction: TFailureAction_3) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * fetch - produce success (props from 'successAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TSuccessAction_1, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_3 extends Func>(failureAction: TFailureAction_3) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                };
            };
            /**
             * fetch - produce success (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .successProduce((draft, { products }) => {
             *    draft.products = products
             * })
             */
            successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_2 extends Func>(failureAction: TFailureAction_2) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce request (props from 'action' method, plus auto generated 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .produce((draft, { id }) => {
             *    draft.productId = id
             * })
             */
            produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFetchAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_2 extends Func>(failureAction: TFailureAction_2) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - success action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .successAction((products: IProduct[]) => ({ products })
                 */
                successAction: <TSuccessAction_1 extends Func>(successAction: TSuccessAction_1) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_3 extends Func>(failureAction: TFailureAction_3) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * fetch - produce success (props from 'successAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { products }) => {
                     *    draft.products = products
                     * })
                     */
                    successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TSuccessAction_1, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                         * @example
                         * .baseFailure()
                         */
                        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                         * @example
                         * .baseFailure()
                         */
                        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                         * @param action ActionCreator
                         * @example
                         * .failureAction((error: Error) => ({ error })
                         */
                        failureAction: <TFailureAction_3 extends Func>(failureAction: TFailureAction_3) => {
                            /**
                             * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .produce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                        /**
                         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .failureProduce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                };
                /**
                 * fetch - produce success (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .successProduce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_2 extends Func>(failureAction: TFailureAction_2) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                };
            };
        };
        /**
         * fetch - produce request (without action defined / auto generated action with 'type' and props from AreaBase)
         * @param producer A produce method that mutates the draft (state)
         * @example
         * .produce((draft, { type }) => {
         *    draft.startProduce = true
         * })
         */
        produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
             * @example
             * .baseFailure()
             */
            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
             * @example
             * .baseFailure()
             */
            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .failureAction((error: Error) => ({ error })
             */
            failureAction: <TFailureAction_4 extends Func>(failureAction: TFailureAction_4) => {
                /**
                 * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .failureProduce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - success action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .successAction((products: IProduct[]) => ({ products })
             */
            successAction: <TSuccessAction_2 extends Func>(successAction: TSuccessAction_2) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_5 extends Func>(failureAction: TFailureAction_5) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * fetch - produce success (props from 'successAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TSuccessAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_5 extends Func>(failureAction: TFailureAction_5) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                };
            };
            /**
             * fetch - produce success (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .successProduce((draft, { products }) => {
             *    draft.products = products
             * })
             */
            successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_4 extends Func>(failureAction: TFailureAction_4) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            };
        };
    };
    protected produceMethod: <TAction extends Func>(actionName: string, name: string, actionTags: string[], action: TAction, producer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => AreaAction<TBaseState, TAreaState, TAction, ReturnType<TBaseActionTypeInterceptor>>;
    protected produceMethodEmptyAction: (actionName: string, name: string, actionTags: string[], producer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => AreaAction<TBaseState, TAreaState, () => {}, ReturnType<TBaseActionTypeInterceptor>>;
    protected produceMethodEmptyProducer: <TAction extends Func>(actionName: string, name: string, actionTags: string[], mappedAction: TAction) => AreaAction<TBaseState, TAreaState, TAction, ReturnType<TBaseActionTypeInterceptor>>;
    protected produceMethodDoubleEmpty: (actionName: string, name: string, actionTags: string[]) => AreaAction<TBaseState, TAreaState, () => {}, ReturnType<TBaseActionTypeInterceptor>>;
    protected reduceMethod: <TAction extends Func>(actionName: string, name: string, actionTags: string[], action: TAction, reducer: (state: TBaseState & TAreaState, action: ReturnTypeAction<TAction, ReturnType<TBaseActionTypeInterceptor>>) => any) => AreaAction<TBaseState, TAreaState, TAction, ReturnType<TBaseActionTypeInterceptor>>;
    protected reduceMethodEmpty: (name: string, actionName: string, actionTags: string[], reducer: (state: TBaseState & TAreaState, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => TBaseState & TAreaState) => AreaAction<TBaseState, TAreaState, () => {}, ReturnType<TBaseActionTypeInterceptor>>;
    protected createAddChain: (actionName: string, tags?: string[]) => {
        /**
         * produce (without action defined / auto generated action with 'type' and props from AreaBase)
         * @param producer A produce method that mutates the draft (state)
         * @example
         * .produce((draft, { type }) => {
         *    draft.startProduce = true
         * })
         */
        produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => AreaAction<TBaseState, TAreaState, () => {}, ReturnType<TBaseActionTypeInterceptor>>;
        reducer: (reducer: (state: TAreaState & TBaseState, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => any) => AreaAction<TBaseState, TAreaState, () => {}, ReturnType<TBaseActionTypeInterceptor>>;
        /**
        * actionCreator ('type' will be added automatically + props defined in AreaBase)
        * @param action ActionCreator
        * @example
        * .action((id: number) => ({ id })
        */
        action: <TAction extends Func>(action: TAction) => {
            /**
             * produce (props from 'action' method, plus auto generated 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .produce((draft, { id }) => {
             *    draft.productId = id
             * })
             */
            produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => AreaAction<TBaseState, TAreaState, TAction, ReturnType<TBaseActionTypeInterceptor>>;
            reducer: (reducer: (state: TAreaState & TBaseState, action: ReturnTypeAction<TAction, ReturnType<TBaseActionTypeInterceptor>>) => any) => AreaAction<TBaseState, TAreaState, TAction, ReturnType<TBaseActionTypeInterceptor>>;
        };
    };
    protected createRequestChain: (actionName: string, tags?: string[]) => {
        /**
         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
         * @example
         * .baseFailure()
         */
        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
        /**
         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
         * @example
         * .baseFailure()
         */
        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
        /**
         * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
         * @param action ActionCreator
         * @example
         * .failureAction((error: Error) => ({ error })
         */
        failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
            /**
             * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .produce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
        };
        /**
         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
         * @param producer A produce method that mutates the draft (state)
         * @example
         * .failureProduce((draft, { error }) => {
         *    draft.error = error
         * })
         */
        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
        /**
         * Fetch - success action - actionCreator ('type' will be added automatically + props defined in AreaBase)
         * @param action ActionCreator
         * @example
         * .successAction((products: IProduct[]) => ({ products })
         */
        successAction: <TSuccessAction extends Func>(successAction: TSuccessAction) => {
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
             * @example
             * .baseFailure()
             */
            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
             * @example
             * .baseFailure()
             */
            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .failureAction((error: Error) => ({ error })
             */
            failureAction: <TFailureAction_1 extends Func>(failureAction: TFailureAction_1) => {
                /**
                 * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .failureProduce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * fetch - produce success (props from 'successAction' method, plus auto generated 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .produce((draft, { products }) => {
             *    draft.products = products
             * })
             */
            successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TSuccessAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_1 extends Func>(failureAction: TFailureAction_1) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            };
        };
        /**
         * fetch - produce success (without action defined / auto generated action with 'type' and props from AreaBase)
         * @param producer A produce method that mutates the draft (state)
         * @example
         * .successProduce((draft, { products }) => {
         *    draft.products = products
         * })
         */
        successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
             * @example
             * .baseFailure()
             */
            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
             * @example
             * .baseFailure()
             */
            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .failureAction((error: Error) => ({ error })
             */
            failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
                /**
                 * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .failureProduce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
        };
        /**
         * Fetch - request action - actionCreator ('type' will be added automatically + props defined in AreaBase)
         * @param action ActionCreator
         * @example
         * .action((id: number) => ({ id })
         */
        action: <TFetchAction extends Func>(action: TFetchAction) => {
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
             * @example
             * .baseFailure()
             */
            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
             * @example
             * .baseFailure()
             */
            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .failureAction((error: Error) => ({ error })
             */
            failureAction: <TFailureAction_2 extends Func>(failureAction: TFailureAction_2) => {
                /**
                 * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .failureProduce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - success action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .successAction((products: IProduct[]) => ({ products })
             */
            successAction: <TSuccessAction_1 extends Func>(successAction: TSuccessAction_1) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_3 extends Func>(failureAction: TFailureAction_3) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * fetch - produce success (props from 'successAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TSuccessAction_1, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_3 extends Func>(failureAction: TFailureAction_3) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                };
            };
            /**
             * fetch - produce success (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .successProduce((draft, { products }) => {
             *    draft.products = products
             * })
             */
            successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_2 extends Func>(failureAction: TFailureAction_2) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce request (props from 'action' method, plus auto generated 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .produce((draft, { id }) => {
             *    draft.productId = id
             * })
             */
            produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFetchAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_2 extends Func>(failureAction: TFailureAction_2) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - success action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .successAction((products: IProduct[]) => ({ products })
                 */
                successAction: <TSuccessAction_1 extends Func>(successAction: TSuccessAction_1) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_3 extends Func>(failureAction: TFailureAction_3) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * fetch - produce success (props from 'successAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { products }) => {
                     *    draft.products = products
                     * })
                     */
                    successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TSuccessAction_1, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                         * @example
                         * .baseFailure()
                         */
                        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                         * @example
                         * .baseFailure()
                         */
                        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                         * @param action ActionCreator
                         * @example
                         * .failureAction((error: Error) => ({ error })
                         */
                        failureAction: <TFailureAction_3 extends Func>(failureAction: TFailureAction_3) => {
                            /**
                             * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .produce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                        /**
                         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .failureProduce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                };
                /**
                 * fetch - produce success (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .successProduce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_2 extends Func>(failureAction: TFailureAction_2) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                };
            };
        };
        /**
         * fetch - produce request (without action defined / auto generated action with 'type' and props from AreaBase)
         * @param producer A produce method that mutates the draft (state)
         * @example
         * .produce((draft, { type }) => {
         *    draft.startProduce = true
         * })
         */
        produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
             * @example
             * .baseFailure()
             */
            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
             * @example
             * .baseFailure()
             */
            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .failureAction((error: Error) => ({ error })
             */
            failureAction: <TFailureAction_4 extends Func>(failureAction: TFailureAction_4) => {
                /**
                 * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .failureProduce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - success action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .successAction((products: IProduct[]) => ({ products })
             */
            successAction: <TSuccessAction_2 extends Func>(successAction: TSuccessAction_2) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_5 extends Func>(failureAction: TFailureAction_5) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * fetch - produce success (props from 'successAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TSuccessAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_5 extends Func>(failureAction: TFailureAction_5) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                };
            };
            /**
             * fetch - produce success (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .successProduce((draft, { products }) => {
             *    draft.products = products
             * })
             */
            successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_4 extends Func>(failureAction: TFailureAction_4) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            };
        };
    };
    protected createSuccessChain: <TFetchRequestAction extends Func>(actionName: string, tags: string[], requestAction: AreaAction<TBaseState, TAreaState, TFetchRequestAction, ReturnType<TBaseActionTypeInterceptor>>) => {
        /**
         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
         * @example
         * .baseFailure()
         */
        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
        /**
         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
         * @example
         * .baseFailure()
         */
        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
        /**
         * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
         * @param action ActionCreator
         * @example
         * .failureAction((error: Error) => ({ error })
         */
        failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
            /**
             * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .produce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
        };
        /**
         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
         * @param producer A produce method that mutates the draft (state)
         * @example
         * .failureProduce((draft, { error }) => {
         *    draft.error = error
         * })
         */
        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
        /**
         * Fetch - success action - actionCreator ('type' will be added automatically + props defined in AreaBase)
         * @param action ActionCreator
         * @example
         * .successAction((products: IProduct[]) => ({ products })
         */
        successAction: <TSuccessAction extends Func>(successAction: TSuccessAction) => {
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
             * @example
             * .baseFailure()
             */
            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, TSuccessAction, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
             * @example
             * .baseFailure()
             */
            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, TSuccessAction, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .failureAction((error: Error) => ({ error })
             */
            failureAction: <TFailureAction_1 extends Func>(failureAction: TFailureAction_1) => {
                /**
                 * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, TSuccessAction, TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .failureProduce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * fetch - produce success (props from 'successAction' method, plus auto generated 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .produce((draft, { products }) => {
             *    draft.products = products
             * })
             */
            successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TSuccessAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, TSuccessAction, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, TSuccessAction, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_1 extends Func>(failureAction: TFailureAction_1) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, TSuccessAction, TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            };
        };
        /**
         * fetch - produce success (without action defined / auto generated action with 'type' and props from AreaBase)
         * @param producer A produce method that mutates the draft (state)
         * @example
         * .successProduce((draft, { products }) => {
         *    draft.products = products
         * })
         */
        successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
             * @example
             * .baseFailure()
             */
            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
             * @example
             * .baseFailure()
             */
            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .failureAction((error: Error) => ({ error })
             */
            failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
                /**
                 * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .failureProduce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
        };
    };
    protected createFailureChain: <TFetchRequestAction extends Func, TFetchSuccessAction extends Func>(actionName: string, tags: string[], requestAction: AreaAction<TBaseState, TAreaState, TFetchRequestAction, ReturnType<TBaseActionTypeInterceptor>>, successAction: AreaAction<TBaseState, TAreaState, TFetchSuccessAction, ReturnType<TBaseActionTypeInterceptor>>) => {
        /**
         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
         * @example
         * .baseFailure()
         */
        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, TFetchSuccessAction, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
        /**
         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
         * @example
         * .baseFailure()
         */
        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, TFetchSuccessAction, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
        /**
         * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
         * @param action ActionCreator
         * @example
         * .failureAction((error: Error) => ({ error })
         */
        failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
            /**
             * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .produce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, TFetchSuccessAction, TFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
        };
        /**
         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
         * @param producer A produce method that mutates the draft (state)
         * @example
         * .failureProduce((draft, { error }) => {
         *    draft.error = error
         * })
         */
        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, TFetchSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
    };
    protected finalizeChain: <TFetchRequestAction extends Func, TFetchSuccessAction extends Func, TFetchFailureAction extends Func>(actionName: string, requestAction: AreaAction<TBaseState, TAreaState, TFetchRequestAction, ReturnType<TBaseActionTypeInterceptor>>, successAction: AreaAction<TBaseState, TAreaState, TFetchSuccessAction, ReturnType<TBaseActionTypeInterceptor>>, failureAction: AreaAction<TBaseState, TAreaState, TFetchFailureAction, ReturnType<TBaseActionTypeInterceptor>>) => FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, TFetchSuccessAction, TFetchFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
}
export interface IAreaBaseOptions<TBaseState, TBaseStandardFailure extends Func, TBaseActionsIntercept extends ActionCreatorInterceptor> {
    baseState: TBaseState;
    baseActionsIntercept: TBaseActionsIntercept;
    baseNamePrefix?: string;
    fetchNamePostfix?: string[];
    addNameSlashes?: boolean;
    addShortNameSlashes?: boolean;
    baseFailureAction?: TBaseStandardFailure;
    baseFailureProducer?: (draft: Draft<TBaseState>, action: ReturnTypeAction<TBaseStandardFailure, ReturnType<TBaseActionsIntercept>>) => void;
    baseInterceptors?: {
        [tag: string]: TIntercept<TBaseState, ReturnType<TBaseActionsIntercept>>[];
    };
}
export interface IAreaOptions<TBaseState, TAreaState, TAreaFailureAction extends Func, TBaseActionTypeInterceptor extends ActionCreatorInterceptor> {
    state: TAreaState;
    namePrefix?: string;
    tags?: string[];
    areaFailureAction?: TAreaFailureAction;
    areaFailureProducer?: (draft: Draft<TBaseState & TAreaState>, action: ReturnType<TAreaFailureAction>) => void;
    areaInterceptors?: {
        [tag: string]: TIntercept<TBaseState & TAreaState, ReturnType<TBaseActionTypeInterceptor>>[];
    };
}
declare class AreaBase<TBaseState, TBaseStandardFailure extends Func, TBaseActionsIntercept extends Func> {
    baseOptions: IAreaBaseOptions<TBaseState, TBaseStandardFailure, TBaseActionsIntercept>;
    constructor(baseOptions: IAreaBaseOptions<TBaseState, TBaseStandardFailure, TBaseActionsIntercept>);
    CreateArea<TAreaState, TAreaStandardFailure extends Func>(areaOptions: IAreaOptions<TBaseState, TAreaState, TAreaStandardFailure, TBaseActionsIntercept>): Area<TBaseState, TAreaState, TBaseStandardFailure, TAreaStandardFailure, TBaseActionsIntercept>;
}
export interface IFetchAreaBaseState {
    loading: boolean;
    loadingMap: {
        [key: string]: boolean;
    };
    error?: Error;
    errorMessage: string;
    errorMap: {
        [key: string]: {
            error: Error;
            message: string;
            count: number;
            currentCount: number;
        };
    };
}
export declare var SimpleAreaBase: (baseName?: string) => AreaBase<{}, Func, () => {}>;
export declare var FetchAreaBase: (baseName?: string) => AreaBase<IFetchAreaBaseState, (error: Error) => {
    error: Error;
}, ({ actionName }: ActionCreatorInterceptorOptions) => {
    actionName: string;
}>;
export default AreaBase;
