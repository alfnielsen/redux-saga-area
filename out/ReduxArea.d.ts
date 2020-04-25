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
export declare type FetchAreaAction<TBaseState, TAreaState, TFetchAction extends Func, TSuccessAction extends Func, TClearAction extends Func, TFailureAction extends Func, AreaActionType> = {
    request: AreaAction<TBaseState, TAreaState, TFetchAction, AreaActionType>;
    success: AreaAction<TBaseState, TAreaState, TSuccessAction, AreaActionType>;
    clear: AreaAction<TBaseState, TAreaState, TClearAction, AreaActionType>;
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
    clearNamePostfix: string;
    constructor(baseOptions: IAreaBaseOptions<TBaseState, TBaseFailureAction, TBaseActionTypeInterceptor>, areaOptions: IAreaOptions<TBaseState, TAreaState, TAreaFailureAction, TBaseActionTypeInterceptor>);
    findTagsInterceptors(tags: string[]): [TIntercept<TBaseState, ReturnType<TBaseActionTypeInterceptor>>[], TIntercept<TBaseState & TAreaState, ReturnType<TBaseActionTypeInterceptor>>[]];
    getActionName(name: string): string;
    constructActionName(name: string, postFix: string): string;
    getRequestName(name: string): string;
    getSuccessName(name: string): string;
    getFailureName(name: string): string;
    getClearName(name: string): string;
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
        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
        /**
         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
         * @example
         * .baseFailure()
         */
        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
        };
        /**
         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
         * @param producer A produce method that mutates the draft (state)
         * @example
         * .failureProduce((draft, { error }) => {
         *    draft.error = error
         * })
         */
        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
        /**
         * Fetch - clear action - actionCreator ('type' will be added automatically + props defined in AreaBase)
         * @param action ActionCreator
         * @example
         * .clearAction((products: IProduct[]) => ({ products })
         */
        clearAction: <TClearAction extends Func>(clearAction: TClearAction) => {
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
             * @example
             * .baseFailure()
             */
            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
             * @example
             * .baseFailure()
             */
            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction, TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .failureProduce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * fetch - produce clear (props from 'clearAction' method, plus auto generated 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .produce((draft, { products }) => {
             *    draft.products = products
             * })
             */
            clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TClearAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction, TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            };
        };
        /**
         * fetch - produce clear (without action defined / auto generated action with 'type' and props from AreaBase)
         * @param producer A produce method that mutates the draft (state)
         * @example
         * .clearProduce((draft, { products }) => {
         *    draft.products = products
         * })
         */
        clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
             * @example
             * .baseFailure()
             */
            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
             * @example
             * .baseFailure()
             */
            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .failureProduce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
        };
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
            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
             * @example
             * .baseFailure()
             */
            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .failureProduce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - clear action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .clearAction((products: IProduct[]) => ({ products })
             */
            clearAction: <TClearAction_1 extends Func>(clearAction: TClearAction_1) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TClearAction_1, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TClearAction_1, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TClearAction_1, TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TClearAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * fetch - produce clear (props from 'clearAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TClearAction_1, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TClearAction_1, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TClearAction_1, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TClearAction_1, TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TClearAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                };
            };
            /**
             * fetch - produce clear (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .clearProduce((draft, { products }) => {
             *    draft.products = products
             * })
             */
            clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            };
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
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - clear action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .clearAction((products: IProduct[]) => ({ products })
                 */
                clearAction: <TClearAction_1 extends Func>(clearAction: TClearAction_1) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TClearAction_1, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TClearAction_1, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TClearAction_1, TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TClearAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * fetch - produce clear (props from 'clearAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { products }) => {
                     *    draft.products = products
                     * })
                     */
                    clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TClearAction_1, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                         * @example
                         * .baseFailure()
                         */
                        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TClearAction_1, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                         * @example
                         * .baseFailure()
                         */
                        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TClearAction_1, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TClearAction_1, TFailureAction_3, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                        /**
                         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .failureProduce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, TClearAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                };
                /**
                 * fetch - produce clear (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .clearProduce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_2, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                };
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
            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
             * @example
             * .baseFailure()
             */
            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .failureProduce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - clear action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .clearAction((products: IProduct[]) => ({ products })
             */
            clearAction: <TClearAction extends Func>(clearAction: TClearAction) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction, TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * fetch - produce clear (props from 'clearAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TClearAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction, TFailureAction_1, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                };
            };
            /**
             * fetch - produce clear (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .clearProduce((draft, { products }) => {
             *    draft.products = products
             * })
             */
            clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            };
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
            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
             * @example
             * .baseFailure()
             */
            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .failureProduce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - clear action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .clearAction((products: IProduct[]) => ({ products })
             */
            clearAction: <TClearAction_2 extends Func>(clearAction: TClearAction_2) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * fetch - produce clear (props from 'clearAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TClearAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                };
            };
            /**
             * fetch - produce clear (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .clearProduce((draft, { products }) => {
             *    draft.products = products
             * })
             */
            clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            };
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
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_6 extends Func>(failureAction: TFailureAction_6) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_6, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_6, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - clear action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .clearAction((products: IProduct[]) => ({ products })
                 */
                clearAction: <TClearAction_3 extends Func>(clearAction: TClearAction_3) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_7 extends Func>(failureAction: TFailureAction_7) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_7, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TFailureAction_7, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * fetch - produce clear (props from 'clearAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { products }) => {
                     *    draft.products = products
                     * })
                     */
                    clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TClearAction_3, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                         * @example
                         * .baseFailure()
                         */
                        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                         * @example
                         * .baseFailure()
                         */
                        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                         * @param action ActionCreator
                         * @example
                         * .failureAction((error: Error) => ({ error })
                         */
                        failureAction: <TFailureAction_7 extends Func>(failureAction: TFailureAction_7) => {
                            /**
                             * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .produce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_7, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TFailureAction_7, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                        /**
                         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .failureProduce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                };
                /**
                 * fetch - produce clear (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .clearProduce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_6 extends Func>(failureAction: TFailureAction_6) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_6, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_6, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                };
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
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_6 extends Func>(failureAction: TFailureAction_6) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_6, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_6, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - clear action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .clearAction((products: IProduct[]) => ({ products })
                     */
                    clearAction: <TClearAction_3 extends Func>(clearAction: TClearAction_3) => {
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                         * @example
                         * .baseFailure()
                         */
                        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                         * @example
                         * .baseFailure()
                         */
                        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                         * @param action ActionCreator
                         * @example
                         * .failureAction((error: Error) => ({ error })
                         */
                        failureAction: <TFailureAction_7 extends Func>(failureAction: TFailureAction_7) => {
                            /**
                             * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .produce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_7, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TFailureAction_7, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                        /**
                         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .failureProduce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * fetch - produce clear (props from 'clearAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { products }) => {
                         *    draft.products = products
                         * })
                         */
                        clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TClearAction_3, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                            /**
                             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                             * @example
                             * .baseFailure()
                             */
                            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                            /**
                             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                             * @example
                             * .baseFailure()
                             */
                            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                            /**
                             * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                             * @param action ActionCreator
                             * @example
                             * .failureAction((error: Error) => ({ error })
                             */
                            failureAction: <TFailureAction_7 extends Func>(failureAction: TFailureAction_7) => {
                                /**
                                 * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                                 * @param producer A produce method that mutates the draft (state)
                                 * @example
                                 * .produce((draft, { error }) => {
                                 *    draft.error = error
                                 * })
                                 */
                                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_7, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TFailureAction_7, ReturnType<TBaseActionTypeInterceptor>>;
                            };
                            /**
                             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .failureProduce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                    };
                    /**
                     * fetch - produce clear (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .clearProduce((draft, { products }) => {
                     *    draft.products = products
                     * })
                     */
                    clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                         * @example
                         * .baseFailure()
                         */
                        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                         * @example
                         * .baseFailure()
                         */
                        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                         * @param action ActionCreator
                         * @example
                         * .failureAction((error: Error) => ({ error })
                         */
                        failureAction: <TFailureAction_6 extends Func>(failureAction: TFailureAction_6) => {
                            /**
                             * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .produce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_6, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_6, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                        /**
                         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .failureProduce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    };
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
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - clear action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .clearAction((products: IProduct[]) => ({ products })
                 */
                clearAction: <TClearAction_2 extends Func>(clearAction: TClearAction_2) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * fetch - produce clear (props from 'clearAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { products }) => {
                     *    draft.products = products
                     * })
                     */
                    clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TClearAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                         * @example
                         * .baseFailure()
                         */
                        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                         * @example
                         * .baseFailure()
                         */
                        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                        /**
                         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .failureProduce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                };
                /**
                 * fetch - produce clear (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .clearProduce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                };
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
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - clear action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .clearAction((products: IProduct[]) => ({ products })
                 */
                clearAction: <TClearAction_2 extends Func>(clearAction: TClearAction_2) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * fetch - produce clear (props from 'clearAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { products }) => {
                     *    draft.products = products
                     * })
                     */
                    clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TClearAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                         * @example
                         * .baseFailure()
                         */
                        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                         * @example
                         * .baseFailure()
                         */
                        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                        /**
                         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .failureProduce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                };
                /**
                 * fetch - produce clear (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .clearProduce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                };
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
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_6 extends Func>(failureAction: TFailureAction_6) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_6, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_6, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - clear action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .clearAction((products: IProduct[]) => ({ products })
                     */
                    clearAction: <TClearAction_3 extends Func>(clearAction: TClearAction_3) => {
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                         * @example
                         * .baseFailure()
                         */
                        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                         * @example
                         * .baseFailure()
                         */
                        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                         * @param action ActionCreator
                         * @example
                         * .failureAction((error: Error) => ({ error })
                         */
                        failureAction: <TFailureAction_7 extends Func>(failureAction: TFailureAction_7) => {
                            /**
                             * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .produce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_7, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TFailureAction_7, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                        /**
                         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .failureProduce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * fetch - produce clear (props from 'clearAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { products }) => {
                         *    draft.products = products
                         * })
                         */
                        clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TClearAction_3, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                            /**
                             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                             * @example
                             * .baseFailure()
                             */
                            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                            /**
                             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                             * @example
                             * .baseFailure()
                             */
                            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                            /**
                             * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                             * @param action ActionCreator
                             * @example
                             * .failureAction((error: Error) => ({ error })
                             */
                            failureAction: <TFailureAction_7 extends Func>(failureAction: TFailureAction_7) => {
                                /**
                                 * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                                 * @param producer A produce method that mutates the draft (state)
                                 * @example
                                 * .produce((draft, { error }) => {
                                 *    draft.error = error
                                 * })
                                 */
                                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_7, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TFailureAction_7, ReturnType<TBaseActionTypeInterceptor>>;
                            };
                            /**
                             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .failureProduce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                    };
                    /**
                     * fetch - produce clear (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .clearProduce((draft, { products }) => {
                     *    draft.products = products
                     * })
                     */
                    clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                         * @example
                         * .baseFailure()
                         */
                        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                         * @example
                         * .baseFailure()
                         */
                        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                         * @param action ActionCreator
                         * @example
                         * .failureAction((error: Error) => ({ error })
                         */
                        failureAction: <TFailureAction_6 extends Func>(failureAction: TFailureAction_6) => {
                            /**
                             * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .produce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_6, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_6, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                        /**
                         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .failureProduce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    };
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
                        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                         * @example
                         * .baseFailure()
                         */
                        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                         * @param action ActionCreator
                         * @example
                         * .failureAction((error: Error) => ({ error })
                         */
                        failureAction: <TFailureAction_6 extends Func>(failureAction: TFailureAction_6) => {
                            /**
                             * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .produce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_6, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_6, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                        /**
                         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .failureProduce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Fetch - clear action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                         * @param action ActionCreator
                         * @example
                         * .clearAction((products: IProduct[]) => ({ products })
                         */
                        clearAction: <TClearAction_3 extends Func>(clearAction: TClearAction_3) => {
                            /**
                             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                             * @example
                             * .baseFailure()
                             */
                            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                            /**
                             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                             * @example
                             * .baseFailure()
                             */
                            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                            /**
                             * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                             * @param action ActionCreator
                             * @example
                             * .failureAction((error: Error) => ({ error })
                             */
                            failureAction: <TFailureAction_7 extends Func>(failureAction: TFailureAction_7) => {
                                /**
                                 * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                                 * @param producer A produce method that mutates the draft (state)
                                 * @example
                                 * .produce((draft, { error }) => {
                                 *    draft.error = error
                                 * })
                                 */
                                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_7, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TFailureAction_7, ReturnType<TBaseActionTypeInterceptor>>;
                            };
                            /**
                             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .failureProduce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                            /**
                             * fetch - produce clear (props from 'clearAction' method, plus auto generated 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .produce((draft, { products }) => {
                             *    draft.products = products
                             * })
                             */
                            clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TClearAction_3, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                                /**
                                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                                 * @example
                                 * .baseFailure()
                                 */
                                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                                /**
                                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                                 * @example
                                 * .baseFailure()
                                 */
                                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                                /**
                                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                                 * @param action ActionCreator
                                 * @example
                                 * .failureAction((error: Error) => ({ error })
                                 */
                                failureAction: <TFailureAction_7 extends Func>(failureAction: TFailureAction_7) => {
                                    /**
                                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                                     * @param producer A produce method that mutates the draft (state)
                                     * @example
                                     * .produce((draft, { error }) => {
                                     *    draft.error = error
                                     * })
                                     */
                                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_7, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, TFailureAction_7, ReturnType<TBaseActionTypeInterceptor>>;
                                };
                                /**
                                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                                 * @param producer A produce method that mutates the draft (state)
                                 * @example
                                 * .failureProduce((draft, { error }) => {
                                 *    draft.error = error
                                 * })
                                 */
                                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, TClearAction_3, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                            };
                        };
                        /**
                         * fetch - produce clear (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .clearProduce((draft, { products }) => {
                         *    draft.products = products
                         * })
                         */
                        clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                            /**
                             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                             * @example
                             * .baseFailure()
                             */
                            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                            /**
                             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                             * @example
                             * .baseFailure()
                             */
                            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                            /**
                             * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                             * @param action ActionCreator
                             * @example
                             * .failureAction((error: Error) => ({ error })
                             */
                            failureAction: <TFailureAction_6 extends Func>(failureAction: TFailureAction_6) => {
                                /**
                                 * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                                 * @param producer A produce method that mutates the draft (state)
                                 * @example
                                 * .produce((draft, { error }) => {
                                 *    draft.error = error
                                 * })
                                 */
                                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_6, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_6, ReturnType<TBaseActionTypeInterceptor>>;
                            };
                            /**
                             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .failureProduce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, TSuccessAction_1, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                        };
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
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - clear action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .clearAction((products: IProduct[]) => ({ products })
                     */
                    clearAction: <TClearAction_2 extends Func>(clearAction: TClearAction_2) => {
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                         * @example
                         * .baseFailure()
                         */
                        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                         * @example
                         * .baseFailure()
                         */
                        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                        /**
                         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .failureProduce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * fetch - produce clear (props from 'clearAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { products }) => {
                         *    draft.products = products
                         * })
                         */
                        clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TClearAction_2, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                            /**
                             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                             * @example
                             * .baseFailure()
                             */
                            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                            /**
                             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                             * @example
                             * .baseFailure()
                             */
                            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, TFailureAction_5, ReturnType<TBaseActionTypeInterceptor>>;
                            };
                            /**
                             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .failureProduce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                    };
                    /**
                     * fetch - produce clear (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .clearProduce((draft, { products }) => {
                     *    draft.products = products
                     * })
                     */
                    clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                         * @example
                         * .baseFailure()
                         */
                        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                         * @example
                         * .baseFailure()
                         */
                        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
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
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_4, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                        /**
                         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .failureProduce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    };
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
            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
             * @example
             * .baseFailure()
             */
            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .failureAction((error: Error) => ({ error })
             */
            failureAction: <TFailureAction_8 extends Func>(failureAction: TFailureAction_8) => {
                /**
                 * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_8, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_8, ReturnType<TBaseActionTypeInterceptor>>;
            };
            /**
             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .failureProduce((draft, { error }) => {
             *    draft.error = error
             * })
             */
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            /**
             * Fetch - clear action - actionCreator ('type' will be added automatically + props defined in AreaBase)
             * @param action ActionCreator
             * @example
             * .clearAction((products: IProduct[]) => ({ products })
             */
            clearAction: <TClearAction_4 extends Func>(clearAction: TClearAction_4) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_4, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_4, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_9 extends Func>(failureAction: TFailureAction_9) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_9, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_4, TFailureAction_9, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_4, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * fetch - produce clear (props from 'clearAction' method, plus auto generated 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TClearAction_4, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_4, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_4, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_9 extends Func>(failureAction: TFailureAction_9) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_9, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_4, TFailureAction_9, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_4, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                };
            };
            /**
             * fetch - produce clear (without action defined / auto generated action with 'type' and props from AreaBase)
             * @param producer A produce method that mutates the draft (state)
             * @example
             * .clearProduce((draft, { products }) => {
             *    draft.products = products
             * })
             */
            clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_8 extends Func>(failureAction: TFailureAction_8) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_8, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_8, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
            };
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
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_10 extends Func>(failureAction: TFailureAction_10) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_10, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_10, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - clear action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .clearAction((products: IProduct[]) => ({ products })
                 */
                clearAction: <TClearAction_5 extends Func>(clearAction: TClearAction_5) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TClearAction_5, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TClearAction_5, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_11 extends Func>(failureAction: TFailureAction_11) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_11, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TClearAction_5, TFailureAction_11, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TClearAction_5, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * fetch - produce clear (props from 'clearAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { products }) => {
                     *    draft.products = products
                     * })
                     */
                    clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TClearAction_5, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                         * @example
                         * .baseFailure()
                         */
                        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TClearAction_5, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                         * @example
                         * .baseFailure()
                         */
                        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TClearAction_5, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                         * @param action ActionCreator
                         * @example
                         * .failureAction((error: Error) => ({ error })
                         */
                        failureAction: <TFailureAction_11 extends Func>(failureAction: TFailureAction_11) => {
                            /**
                             * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .produce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_11, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TClearAction_5, TFailureAction_11, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                        /**
                         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .failureProduce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TClearAction_5, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                };
                /**
                 * fetch - produce clear (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .clearProduce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_10 extends Func>(failureAction: TFailureAction_10) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_10, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_10, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                };
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
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_10 extends Func>(failureAction: TFailureAction_10) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_10, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_10, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - clear action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .clearAction((products: IProduct[]) => ({ products })
                     */
                    clearAction: <TClearAction_5 extends Func>(clearAction: TClearAction_5) => {
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                         * @example
                         * .baseFailure()
                         */
                        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TClearAction_5, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                         * @example
                         * .baseFailure()
                         */
                        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TClearAction_5, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                         * @param action ActionCreator
                         * @example
                         * .failureAction((error: Error) => ({ error })
                         */
                        failureAction: <TFailureAction_11 extends Func>(failureAction: TFailureAction_11) => {
                            /**
                             * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .produce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_11, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TClearAction_5, TFailureAction_11, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                        /**
                         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .failureProduce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TClearAction_5, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * fetch - produce clear (props from 'clearAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { products }) => {
                         *    draft.products = products
                         * })
                         */
                        clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TClearAction_5, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                            /**
                             * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                             * @example
                             * .baseFailure()
                             */
                            baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TClearAction_5, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                            /**
                             * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                             * @example
                             * .baseFailure()
                             */
                            areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TClearAction_5, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                            /**
                             * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                             * @param action ActionCreator
                             * @example
                             * .failureAction((error: Error) => ({ error })
                             */
                            failureAction: <TFailureAction_11 extends Func>(failureAction: TFailureAction_11) => {
                                /**
                                 * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                                 * @param producer A produce method that mutates the draft (state)
                                 * @example
                                 * .produce((draft, { error }) => {
                                 *    draft.error = error
                                 * })
                                 */
                                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_11, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TClearAction_5, TFailureAction_11, ReturnType<TBaseActionTypeInterceptor>>;
                            };
                            /**
                             * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .failureProduce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, TClearAction_5, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                    };
                    /**
                     * fetch - produce clear (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .clearProduce((draft, { products }) => {
                     *    draft.products = products
                     * })
                     */
                    clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                         * @example
                         * .baseFailure()
                         */
                        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                         * @example
                         * .baseFailure()
                         */
                        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                         * @param action ActionCreator
                         * @example
                         * .failureAction((error: Error) => ({ error })
                         */
                        failureAction: <TFailureAction_10 extends Func>(failureAction: TFailureAction_10) => {
                            /**
                             * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .produce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_10, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_10, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                        /**
                         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .failureProduce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, TSuccessAction_2, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    };
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
                baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: <TFailureAction_8 extends Func>(failureAction: TFailureAction_8) => {
                    /**
                     * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_8, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_8, ReturnType<TBaseActionTypeInterceptor>>;
                };
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                /**
                 * Fetch - clear action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .clearAction((products: IProduct[]) => ({ products })
                 */
                clearAction: <TClearAction_4 extends Func>(clearAction: TClearAction_4) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_4, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_4, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_9 extends Func>(failureAction: TFailureAction_9) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_9, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_4, TFailureAction_9, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_4, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * fetch - produce clear (props from 'clearAction' method, plus auto generated 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .produce((draft, { products }) => {
                     *    draft.products = products
                     * })
                     */
                    clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TClearAction_4, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                         * @example
                         * .baseFailure()
                         */
                        baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_4, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                         * @example
                         * .baseFailure()
                         */
                        areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_4, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                        /**
                         * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                         * @param action ActionCreator
                         * @example
                         * .failureAction((error: Error) => ({ error })
                         */
                        failureAction: <TFailureAction_9 extends Func>(failureAction: TFailureAction_9) => {
                            /**
                             * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                             * @param producer A produce method that mutates the draft (state)
                             * @example
                             * .produce((draft, { error }) => {
                             *    draft.error = error
                             * })
                             */
                            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_9, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_4, TFailureAction_9, ReturnType<TBaseActionTypeInterceptor>>;
                        };
                        /**
                         * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .failureProduce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TClearAction_4, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                };
                /**
                 * fetch - produce clear (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .clearProduce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                clearProduce: (clearProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                     * @example
                     * .baseFailure()
                     */
                    baseFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TBaseFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                     * @example
                     * .baseFailure()
                     */
                    areaFailure: () => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TAreaFailureAction, ReturnType<TBaseActionTypeInterceptor>>;
                    /**
                     * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                     * @param action ActionCreator
                     * @example
                     * .failureAction((error: Error) => ({ error })
                     */
                    failureAction: <TFailureAction_8 extends Func>(failureAction: TFailureAction_8) => {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction_8, ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, TFailureAction_8, ReturnType<TBaseActionTypeInterceptor>>;
                    };
                    /**
                     * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                     * @param producer A produce method that mutates the draft (state)
                     * @example
                     * .failureProduce((draft, { error }) => {
                     *    draft.error = error
                     * })
                     */
                    failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => FetchAreaAction<TBaseState, TAreaState, () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, ReturnType<TBaseActionTypeInterceptor>>;
                };
            };
        };
    };
    private produceMethod;
    private produceMethodEmptyAction;
    private produceMethodEmptyProducer;
    private produceMethodDoubleEmpty;
    private reduceMethod;
    private reduceMethodEmpty;
    private createAddChain;
    private createRequestChain;
    private createSuccessChain;
    private createClearChain;
    private createFailureChain;
    private finalizeChain;
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
