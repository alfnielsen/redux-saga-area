"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immer_1 = require("immer");
const SagaEffects = require("redux-saga/effects");
exports.getActionNameHelper = (action) => {
    let nameReg = (action instanceof Function) ? action() : action;
    if (typeof nameReg === "string") {
        return nameReg;
    }
    if ((typeof nameReg !== "object" && !(nameReg instanceof Function))) {
        return undefined;
    }
    if (nameReg === null) {
        return undefined;
    }
    if (hasOwnProperty(nameReg, "name") && typeof nameReg.name === "string") {
        return nameReg.name;
    }
    if (!hasOwnProperty(nameReg, "request")) {
        return undefined;
    }
    nameReg = nameReg.request;
    if (typeof nameReg !== "object" && !(nameReg instanceof Function)) {
        return undefined;
    }
    if (nameReg === null) {
        return undefined;
    }
    if (hasOwnProperty(nameReg, "name") && typeof nameReg.name === "string") {
        return nameReg.name;
    }
};
// Hack to to fix Ts missing understanding of unknown.hasOwnProperty()
function hasOwnProperty(obj, prop) {
    return obj && obj.hasOwnProperty(prop);
}
class Area {
    constructor(baseOptions, areaOptions) {
        this.baseOptions = baseOptions;
        this.areaOptions = areaOptions;
        this.actions = [];
        this.sagaRegistrations = [];
        this.produceMethod = (actionName, name, actionTags, action, producer) => {
            let [baseIntercept, areaIntercept] = this.findTagsInterceptors(actionTags);
            const baseActionIntercept = this.baseOptions.baseActionsIntercept;
            const actionCreator = (...args) => {
                let actionResult = action.apply(null, args);
                let baseActionResult = Object.assign(Object.assign({}, actionResult), { type: name });
                baseActionIntercept && (baseActionResult = Object.assign(Object.assign({}, baseActionResult), baseActionIntercept({ action: baseActionResult, actionName, actionTags })));
                return baseActionResult;
            };
            const mappedAction = actionCreator;
            Object.defineProperty(mappedAction, 'name', {
                value: name,
                writable: false
            });
            Object.defineProperty(mappedAction, 'actionName', {
                value: actionName,
                writable: false
            });
            if (baseIntercept || areaIntercept) {
                Object.defineProperty(mappedAction, 'reducer', {
                    value: (state, action) => immer_1.produce(state, draft => {
                        producer(draft, action);
                        baseIntercept && baseIntercept.forEach(inter => inter(draft, action));
                        areaIntercept && areaIntercept.forEach(inter => inter(draft, action));
                    }),
                    writable: false
                });
            }
            else {
                Object.defineProperty(mappedAction, 'reducer', {
                    value: immer_1.produce(producer),
                    writable: false
                });
            }
            Object.defineProperty(mappedAction, 'use', {
                value: (draft, action) => {
                    action.type = mappedAction.name;
                    producer(draft, action);
                },
                writable: false
            });
            return mappedAction;
        };
        this.produceMethodEmptyAction = (actionName, name, actionTags, producer) => {
            const mappedAction = () => ({}); // as () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>
            return this.produceMethod(actionName, name, actionTags, mappedAction, producer);
        };
        this.produceMethodEmptyProducer = (actionName, name, actionTags, mappedAction) => {
            const producer = () => { }; // as (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void
            return this.produceMethod(actionName, name, actionTags, mappedAction, producer);
        };
        this.produceMethodDoubleEmpty = (actionName, name, actionTags) => {
            const mappedAction = () => ({}); // as () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>
            const producer = () => { }; // as (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void
            return this.produceMethod(actionName, name, actionTags, mappedAction, producer);
        };
        this.reduceMethod = (actionName, name, actionTags, action, reducer) => {
            const baseActionIntercept = this.baseOptions.baseActionsIntercept;
            const actionCreator = (...args) => {
                let actionResult = action.apply(null, args);
                let baseActionResult = Object.assign(Object.assign({}, actionResult), { type: name });
                baseActionIntercept && (baseActionResult = Object.assign(Object.assign({}, baseActionResult), baseActionIntercept({ action: baseActionResult, actionName, actionTags })));
                return baseActionResult;
            };
            const mappedAction = actionCreator;
            Object.defineProperty(mappedAction, 'name', {
                value: name,
                writable: false
            });
            Object.defineProperty(mappedAction, 'actionName', {
                value: actionName,
                writable: false
            });
            Object.defineProperty(mappedAction, 'reducer', {
                value: reducer,
                writable: false
            });
            Object.defineProperty(mappedAction, 'use', {
                value: (draft, action) => {
                    action.type = mappedAction.name;
                    return reducer(draft, action);
                },
                writable: false
            });
            return mappedAction;
        };
        this.reduceMethodEmpty = (name, actionName, actionTags, reducer) => {
            const action = () => ({}); // as unknown as (() => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>)
            return this.reduceMethod(actionName, name, actionTags, action, reducer);
        };
        // --------- Add Flow ---------
        this.createAddChain = (actionName, tags = []) => {
            const typeName = this.getActionName(actionName);
            return ({
                /**
                 * produce (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { type }) => {
                 *    draft.startProduce = true
                 * })
                 */
                produce: (producer) => {
                    const mappedAction = this.produceMethodEmptyAction(actionName, typeName, tags, producer);
                    this.actions.push(mappedAction);
                    return mappedAction;
                },
                reducer: (reducer) => {
                    const mappedAction = this.reduceMethodEmpty(actionName, typeName, tags, reducer);
                    this.actions.push(mappedAction);
                    return mappedAction;
                },
                /**
                * actionCreator ('type' will be added automatically + props defined in AreaBase)
                * @param action ActionCreator
                * @example
                * .action((id: number) => ({ id })
                */
                action: (action) => {
                    //  MappedAction & {magic!}
                    return {
                        /**
                         * produce (props from 'action' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { id }) => {
                         *    draft.productId = id
                         * })
                         */
                        produce: (producer) => {
                            const mappedAction = this.produceMethod(actionName, typeName, tags, action, producer);
                            this.actions.push(mappedAction);
                            return mappedAction;
                        },
                        reducer: (reducer) => {
                            const mappedAction = this.reduceMethod(actionName, typeName, tags, action, reducer);
                            this.actions.push(mappedAction);
                            return mappedAction;
                        }
                    };
                }
            });
        };
        // --------- AddFetch Flow ---------
        // Request chain:
        this.createRequestChain = (actionName, tags = []) => {
            const requestName = this.getRequestName(actionName);
            const requestTags = ["Request", ...tags];
            const doubleEmptyRequestAction = this.produceMethodDoubleEmpty(actionName, requestName, requestTags);
            return (Object.assign({ 
                /**
                 * Fetch - request action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .action((id: number) => ({ id })
                 */
                action: (action) => {
                    const emptyProducer = this.produceMethodEmptyProducer(actionName, requestName, requestTags, action);
                    return Object.assign({ 
                        /**
                         * fetch - produce request (props from 'action' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { id }) => {
                         *    draft.productId = id
                         * })
                         */
                        produce: (producer) => {
                            const mappedAction = this.produceMethod(actionName, requestName, requestTags, action, producer);
                            return this.createSuccessChain(actionName, tags, mappedAction);
                        } }, this.createSuccessChain(actionName, tags, emptyProducer));
                }, 
                /**
                 * fetch - produce request (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .produce((draft, { type }) => {
                 *    draft.startProduce = true
                 * })
                 */
                produce: (producer) => {
                    const mappedAction = this.produceMethodEmptyAction(actionName, requestName, requestTags, producer);
                    return this.createSuccessChain(actionName, tags, mappedAction);
                } }, this.createSuccessChain(actionName, tags, doubleEmptyRequestAction)));
        };
        // Success chain:
        this.createSuccessChain = (actionName, tags, requestAction) => {
            const successName = this.getSuccessName(actionName);
            const successTags = ["Success", ...tags];
            const doubleEmptySuccessAction = this.produceMethodDoubleEmpty(actionName, successName, successTags);
            return (Object.assign({ 
                /**
                 * Fetch - success action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .successAction((products: IProduct[]) => ({ products })
                 */
                successAction: (successAction) => {
                    const emptyProducer = this.produceMethodEmptyProducer(actionName, successName, successTags, successAction);
                    return Object.assign({ 
                        /**
                         * fetch - produce success (props from 'successAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { products }) => {
                         *    draft.products = products
                         * })
                         */
                        successProduce: (successProducer) => {
                            let _successAction = this.produceMethod(actionName, successName, successTags, successAction, successProducer);
                            return this.createClearChain(actionName, tags, requestAction, _successAction);
                        } }, this.createClearChain(actionName, tags, requestAction, emptyProducer));
                }, 
                /**
                 * fetch - produce success (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .successProduce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                successProduce: (successProducer) => {
                    const fetchSuccessAction = this.produceMethodEmptyAction(actionName, successName, successTags, successProducer);
                    return this.createClearChain(actionName, tags, requestAction, fetchSuccessAction);
                } }, this.createClearChain(actionName, tags, requestAction, doubleEmptySuccessAction)));
        };
        // Clear chain:
        this.createClearChain = (actionName, tags, requestAction, successAction) => {
            const clearName = this.getClearName(actionName);
            const clearTags = ["Clear", ...tags];
            const doubleEmptyAction = this.produceMethodDoubleEmpty(actionName, clearName, clearTags);
            return (Object.assign({ 
                /**
                 * Fetch - clear action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .clearAction((products: IProduct[]) => ({ products })
                 */
                clearAction: (clearAction) => {
                    const emptyProducer = this.produceMethodEmptyProducer(actionName, clearName, clearTags, clearAction);
                    return Object.assign({ 
                        /**
                         * fetch - produce clear (props from 'clearAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { products }) => {
                         *    draft.products = products
                         * })
                         */
                        clearProduce: (clearProducer) => {
                            let _clearAction = this.produceMethod(actionName, clearName, clearTags, clearAction, clearProducer);
                            return this.createFailureChain(actionName, tags, requestAction, successAction, _clearAction);
                        } }, this.createFailureChain(actionName, tags, requestAction, successAction, emptyProducer));
                }, 
                /**
                 * fetch - produce clear (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .clearProduce((draft, { products }) => {
                 *    draft.products = products
                 * })
                 */
                clearProduce: (clearProducer) => {
                    const fetchClearAction = this.produceMethodEmptyAction(actionName, clearName, clearTags, clearProducer);
                    return this.createFailureChain(actionName, tags, requestAction, successAction, fetchClearAction);
                } }, this.createFailureChain(actionName, tags, requestAction, successAction, doubleEmptyAction)));
        };
        // Failure chain:
        this.createFailureChain = (actionName, tags, requestAction, successAction, clearAction) => {
            let failureName = this.getFailureName(actionName);
            const failureTags = ["Failure", ...tags];
            return ({
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
                 * @example
                 * .baseFailure()
                 */
                baseFailure: () => {
                    if (this.baseOptions.baseFailureAction && this.baseOptions.baseFailureProducer) {
                        let failureAction = this.produceMethod(actionName, failureName, failureTags, this.baseOptions.baseFailureAction, this.baseOptions.baseFailureProducer);
                        return this.finalizeChain(actionName, requestAction, successAction, clearAction, failureAction);
                    }
                    throw new Error(`redux-area fetch method: ${actionName} tried to call baseFailureAction/baseFailureReducer, but the base didn't have one. Declare it with Redux-area Base settings`);
                },
                /**
                 * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
                 * @example
                 * .baseFailure()
                 */
                areaFailure: () => {
                    if (this.areaOptions.areaFailureAction && this.areaOptions.areaFailureProducer) {
                        let failureAction = this.produceMethod(actionName, failureName, failureTags, this.areaOptions.areaFailureAction, this.areaOptions.areaFailureProducer);
                        return this.finalizeChain(actionName, requestAction, successAction, clearAction, failureAction);
                    }
                    throw new Error(`redux-area fetch method: ${actionName} tried to call areaFailureAction/areaFailureReducer, but the area didn't have one. Declare it with Redux-area area settings`);
                },
                /**
                 * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
                 * @param action ActionCreator
                 * @example
                 * .failureAction((error: Error) => ({ error })
                 */
                failureAction: (failureAction) => {
                    return {
                        /**
                         * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                         * @param producer A produce method that mutates the draft (state)
                         * @example
                         * .produce((draft, { error }) => {
                         *    draft.error = error
                         * })
                         */
                        failureProduce: (failureProducer) => {
                            const _failureAction = this.produceMethod(actionName, failureName, failureTags, failureAction, failureProducer);
                            return this.finalizeChain(actionName, requestAction, successAction, clearAction, _failureAction);
                        }
                    };
                },
                /**
                 * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
                 * @param producer A produce method that mutates the draft (state)
                 * @example
                 * .failureProduce((draft, { error }) => {
                 *    draft.error = error
                 * })
                 */
                failureProduce: (failureProducer) => {
                    const _failureAction = this.produceMethodEmptyAction(actionName, failureName, failureTags, failureProducer);
                    return this.finalizeChain(actionName, requestAction, successAction, clearAction, _failureAction);
                }
            });
        };
        this.finalizeChain = (actionName, requestAction, successAction, clearAction, failureAction) => {
            this.actions.push(requestAction);
            this.actions.push(successAction);
            this.actions.push(clearAction);
            this.actions.push(failureAction);
            return {
                request: requestAction,
                success: successAction,
                clear: clearAction,
                failure: failureAction,
                actionName
            };
        };
        // --------- Saga ---------
        this.listen = (action, saga, listenType = 'takeEvery') => {
            this.sagaRegistrations.push({ type: listenType, action, saga });
        };
        this.takeLeading = (action, saga) => {
            this.sagaRegistrations.push({ type: 'takeLeading', action, saga });
        };
        this.takeEvery = (action, saga) => {
            this.sagaRegistrations.push({ type: 'takeEvery', action, saga });
        };
        this.takeLatest = (action, saga) => {
            this.sagaRegistrations.push({ type: 'takeLatest', action, saga });
        };
        this.namePrefix = "";
        if (this.baseOptions.baseNamePrefix) {
            this.namePrefix += this.baseOptions.baseNamePrefix;
        }
        if (this.areaOptions.namePrefix) {
            if (this.baseOptions.addNameSlashes) {
                this.namePrefix += "/";
            }
            this.namePrefix += this.areaOptions.namePrefix;
        }
        if (this.baseOptions.fetchNamePostfix) {
            this.normalNamePostfix = this.baseOptions.fetchNamePostfix[0];
            this.requestNamePostfix = this.baseOptions.fetchNamePostfix[1];
            this.successNamePostfix = this.baseOptions.fetchNamePostfix[2];
            this.failureNamePostfix = this.baseOptions.fetchNamePostfix[3];
        }
        else {
            this.normalNamePostfix = 'Normal';
            this.requestNamePostfix = 'Request';
            this.successNamePostfix = 'Success';
            this.failureNamePostfix = 'Failure';
        }
        if (this.baseOptions.fetchNamePostfix && this.baseOptions.fetchNamePostfix[4]) {
            this.clearNamePostfix = this.baseOptions.fetchNamePostfix[4];
        }
        else {
            this.clearNamePostfix = 'Clear';
        }
        this.initialState = Object.assign(Object.assign({}, baseOptions.baseState), areaOptions.state);
    }
    findTagsInterceptors(tags) {
        const baseInterceptors = [];
        const areaInterceptors = [];
        const baseTagInterceptors = this.baseOptions.baseInterceptors || {};
        const tagInterceptors = this.areaOptions.areaInterceptors || {};
        tags.forEach(tag => {
            if (baseTagInterceptors[tag]) {
                baseInterceptors.push(...baseTagInterceptors[tag]);
            }
            if (tagInterceptors[tag]) {
                areaInterceptors.push(...tagInterceptors[tag]);
            }
        });
        return [baseInterceptors, areaInterceptors];
    }
    getActionName(name) {
        if (!this.namePrefix) {
            return name;
        }
        if (this.baseOptions.addNameSlashes) {
            return this.namePrefix + "/" + name;
        }
        return this.namePrefix + name;
    }
    constructActionName(name, postFix) {
        name = this.getActionName(name);
        if (this.baseOptions.addNameSlashes) {
            name += "/";
        }
        return name + postFix;
    }
    getRequestName(name) {
        return this.constructActionName(name, this.requestNamePostfix);
    }
    getSuccessName(name) {
        return this.constructActionName(name, this.successNamePostfix);
    }
    getFailureName(name) {
        return this.constructActionName(name, this.failureNamePostfix);
    }
    getClearName(name) {
        return this.constructActionName(name, this.clearNamePostfix);
    }
    getRootReducer() {
        return (state = this.initialState, action) => {
            const actionArea = this.actions.find(x => x.name === action.type);
            if (actionArea) {
                return actionArea.reducer(state, action);
            }
            return state;
        };
    }
    getSagas() {
        const allSagas = this.sagaRegistrations.map(obj => {
            let actionName = exports.getActionNameHelper(obj.action);
            if (!actionName) {
                throw new Error(`A Saga has been registered with no actionName (or action) in ${this.namePrefix}`);
            }
            else {
                const n = actionName;
                return SagaEffects[obj.type](n, obj.saga);
            }
        });
        return allSagas;
    }
    /**
     * Add a single action. \
     * Optional 'interceptNormal' in options will effect this. \
     * You can omit 'action' if its not needed. \
     * 'produce' uses [immer](https://immerjs.github.io/immer/docs/introduction) (always recommended) \
     * 'reducer' will create a normal reducer
     * @param name
     * @param tags (optional) list of tags
     */
    add(name, tags = []) {
        return this.createAddChain(name, ["All", "Normal", ...(this.areaOptions.tags || []), ...tags]);
    }
    /**
     * Add 4 action (Request, success, failure and clear). \
     * Optional 'interceptRequest', 'interceptSuccess' and 'interceptFailure' in options will effect this. \
     * You can omit any 'action' and/or 'produce' if its not needed. (expect one of the final areaFailure of produceFailure) \
     * @param name
     * @param tags (optional) list of tags
     */
    addFetch(name, tags = []) {
        return this.createRequestChain(name, ["All", "Fetch", ...(this.areaOptions.tags || []), ...tags]);
    }
}
exports.Area = Area;
class AreaBase {
    constructor(baseOptions) {
        this.baseOptions = baseOptions;
        this.areaType = this.CreateArea({ state: {} });
        this.draftType = this.areaType.initialState;
    }
    CreateArea(areaOptions) {
        const area = new Area(this.baseOptions, areaOptions);
        return area;
    }
    Create(name, state) {
        return this.CreateArea({
            namePrefix: name,
            state
        });
    }
}
exports.AreaBase = AreaBase;
exports.default = AreaBase;
//# sourceMappingURL=ReduxSagaArea.js.map