"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immer_1 = require("immer");
const produceMethod = (name, action, producer, intercept) => {
    const actionCreator = (...args) => (Object.assign(Object.assign({}, action.apply(null, args)), { type: name }));
    const mappedAction = actionCreator;
    Object.defineProperty(mappedAction, 'name', {
        value: name,
        writable: false
    });
    Object.defineProperty(mappedAction, 'reducer', {
        value: immer_1.default(producer),
        writable: false
    });
    Object.defineProperty(mappedAction, 'use', {
        value: (draft, action) => {
            action.type = mappedAction.name;
            producer(draft, action);
        },
        writable: false
    });
    if (intercept) {
        Object.defineProperty(mappedAction, 'intercept', {
            value: immer_1.default(intercept),
            writable: false
        });
    }
    return mappedAction;
};
const produceMethodEmptyAction = (name, producer, intercept) => {
    const mappedAction = (() => ({}));
    return produceMethod(name, mappedAction, producer, intercept);
};
const produceMethodEmptyProducer = (name, mappedAction, intercept) => {
    const producer = ((draft, action) => { });
    return produceMethod(name, mappedAction, producer, intercept);
};
const produceMethodDoubleEmpty = (name, intercept) => {
    const mappedAction = (() => ({}));
    const producer = ((draft, action) => { });
    return produceMethod(name, mappedAction, producer, intercept);
};
const reduceMethod = (mappedAction, reducer, intercept) => {
    Object.defineProperty(mappedAction, 'reducer', {
        value: reducer,
        writable: false
    });
    if (intercept) {
        Object.defineProperty(mappedAction, 'intercept', {
            value: immer_1.default(intercept),
            writable: false
        });
    }
    return mappedAction;
};
const reduceMethodEmpty = (name, reducer, intercept) => {
    const mappedAction = (() => ({ type: name }));
    if (!mappedAction.reducer) {
        Object.defineProperty(mappedAction, 'reducer', {
            value: reducer,
            writable: false
        });
    }
    Object.defineProperty(mappedAction, 'name', {
        value: name,
        writable: false
    });
    if (intercept) {
        Object.defineProperty(mappedAction, 'intercept', {
            value: immer_1.default(intercept),
            writable: false
        });
    }
    return mappedAction;
};
// --------- AddFetch Flow ---------
// Request chain:
const createRequestChain = (area, name) => {
    const requestName = area.namePrefix + name + area.fetchPostfix[0];
    const successName = area.namePrefix + name + area.fetchPostfix[1];
    const doubleEmptyRequestAction = produceMethodDoubleEmpty(requestName, area.interceptRequest);
    const doubleEmptySuccessAction = produceMethodDoubleEmpty(successName, area.interceptRequest);
    return (Object.assign(Object.assign({ action: (action) => {
            const emptyProducer = produceMethodEmptyProducer(requestName, action, area.interceptRequest);
            return Object.assign(Object.assign({ produce: (producer) => {
                    const mappedAction = produceMethod(requestName, action, producer, area.interceptRequest);
                    return createSuccessChain(area, name, mappedAction);
                } }, createSuccessChain(area, name, emptyProducer)), createFailureChain(area, name, emptyProducer, doubleEmptySuccessAction));
        }, produce: (producer) => {
            const mappedAction = produceMethodEmptyAction(area.namePrefix + name + area.fetchPostfix[0], producer, area.interceptRequest);
            return createSuccessChain(area, name, mappedAction);
        } }, createSuccessChain(area, name, doubleEmptyRequestAction)), createFailureChain(area, name, doubleEmptyRequestAction, doubleEmptySuccessAction)));
};
// Success chain:
const createSuccessChain = (area, name, requestAction) => {
    const successName = area.namePrefix + name + area.fetchPostfix[1];
    const failureName = area.namePrefix + name + area.fetchPostfix[2];
    const doubleFailureEmptyAction = produceMethodDoubleEmpty(failureName, area.interceptRequest);
    return (Object.assign({ successAction: (successAction) => {
            const emptyProducer = produceMethodEmptyProducer(successName, successAction, area.interceptRequest);
            return Object.assign({ successProduce: (successProducer) => {
                    let _successAction = produceMethod(successName, successAction, successProducer, area.interceptSuccess);
                    return createFailureChain(area, name, requestAction, _successAction);
                } }, createFailureChain(area, name, requestAction, emptyProducer));
        }, successProduce: (successProducer) => {
            const fetchSuccessAction = produceMethodEmptyAction(successName, successProducer, area.interceptRequest);
            return createFailureChain(area, name, requestAction, fetchSuccessAction);
        } }, createFailureChain(area, name, requestAction, doubleFailureEmptyAction)));
};
// Failure chain:
const createFailureChain = (area, name, requestAction, successAction) => {
    let _name = area.namePrefix + name + area.fetchPostfix[2];
    return ({
        standardFailure: () => {
            if (area.standardFailureAction && area.standardFailureReducer) {
                let failureAction = produceMethod(_name, area.standardFailureAction, area.standardFailureReducer, area.interceptFailure);
                return finalizeChain(area, requestAction, successAction, failureAction);
            }
            throw new Error(`redux-area fetch method: ${name} tried to call standardFailureAction/standardFailureReducer, but the area didn't have one. Declare it with area.setStandardFetchFailure(action, producer)!`);
        },
        failureAction: (failureAction) => {
            return {
                failureProduce: (failureProducer) => {
                    const _failureAction = produceMethod(_name, failureAction, failureProducer, area.interceptFailure);
                    return finalizeChain(area, requestAction, successAction, _failureAction);
                }
            };
        },
        failureProduce: (failureProducer) => {
            const _name = area.namePrefix + name + area.fetchPostfix[2];
            const _failureAction = produceMethodEmptyAction(_name, failureProducer, area.interceptFailure);
            return finalizeChain(area, requestAction, successAction, _failureAction);
        }
    });
};
const finalizeChain = (area, requestAction, successAction, failureAction) => {
    area.actions.push(requestAction);
    area.actions.push(successAction);
    area.actions.push(failureAction);
    return {
        request: requestAction,
        success: successAction,
        failure: failureAction
    };
};
class Area {
    constructor(initialState, standardFailureAction, standardFailureReducer) {
        this.initialState = initialState;
        this.standardFailureAction = standardFailureAction;
        this.standardFailureReducer = standardFailureReducer;
        this.namePrefix = '';
        this.fetchPostfix = ['Request', 'Success', 'Failure'];
        this.interceptNormal = undefined;
        this.interceptRequest = undefined;
        this.interceptSuccess = undefined;
        this.interceptFailure = undefined;
        this.actions = [];
    }
    rootReducer() {
        return (state = this.initialState, action) => {
            const actionArea = this.actions.find(x => x.name === action.type);
            if (actionArea) {
                if (actionArea.intercept) {
                    state = actionArea.intercept(state, action);
                }
                return actionArea.reducer(state, action);
            }
            return state;
        };
    }
    /**
     * Add a single action. \
     * Optional 'interceptNormal' in options will effect this. \
     * You can omit 'action' if its not needed. \
     * 'produce' uses [immer](https://immerjs.github.io/immer/docs/introduction) (always recommended) \
     * 'reducer' will create a normal reducer
     * @param name
     */
    add(name) {
        const _name = this.namePrefix + name;
        return ({
            produce: (producer) => {
                const mappedAction = produceMethodEmptyAction(_name, producer, this.interceptNormal);
                this.actions.push(mappedAction);
                return mappedAction;
            },
            reducer: (reducer) => {
                const mappedAction = reduceMethodEmpty(_name, reducer, this.interceptNormal);
                this.actions.push(mappedAction);
                return mappedAction;
            },
            action: (action) => {
                return {
                    produce: (producer) => {
                        const mappedAction = produceMethod(_name, action, producer, this.interceptNormal);
                        this.actions.push(mappedAction);
                        return mappedAction;
                    },
                    reducer: (reducer) => {
                        const mappedAction = reduceMethod(action, reducer, this.interceptNormal);
                        this.actions.push(mappedAction);
                        return mappedAction;
                    }
                };
            }
        });
    }
    /**
     * Add 3 action (Request, success and failure). \
     * Optional 'interceptRequest', 'interceptSuccess' and 'interceptFailure' in options will effect this. \
     * You can omit any 'action' and/or 'produce' if its not needed. (expect one of the final standardFailure of produceFailure) \
     * @param name
     */
    addFetch(name) {
        return createRequestChain(this, name);
    }
    options(options) {
        if (options.namePrefix !== undefined) {
            this.namePrefix = options.namePrefix;
        }
        if (options.fetchPostfix !== undefined) {
            this.fetchPostfix = options.fetchPostfix;
        }
        if (options.interceptNormal !== undefined) {
            this.interceptNormal = options.interceptNormal;
        }
        if (options.interceptRequest !== undefined) {
            this.interceptRequest = options.interceptRequest;
        }
        if (options.interceptSuccess !== undefined) {
            this.interceptSuccess = options.interceptSuccess;
        }
        if (options.interceptFailure !== undefined) {
            this.interceptFailure = options.interceptFailure;
        }
        return this;
    }
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
    setStandardFetchFailure(action, producer) {
        const a = new Area(this.initialState, action, producer);
        a.interceptNormal = this.interceptNormal;
        a.interceptFailure = this.interceptFailure;
        a.interceptRequest = this.interceptRequest;
        a.interceptSuccess = this.interceptSuccess;
        a.namePrefix = this.namePrefix;
        a.fetchPostfix = [...this.fetchPostfix];
        return a;
    }
}
// -----------
const CreateReduxArea = (initialState) => {
    return new Area(initialState);
};
exports.default = CreateReduxArea;
//# sourceMappingURL=ReduxArea.js.map