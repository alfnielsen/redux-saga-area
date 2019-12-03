"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immer_1 = require("immer");
const actionMethod = (name, action) => {
    const actionCreator = (...args) => (Object.assign(Object.assign({}, action.apply(null, args)), { type: name }));
    const mappedAction = actionCreator;
    Object.defineProperty(mappedAction, 'name', {
        value: name,
        writable: false
    });
    return mappedAction;
};
const produceMethod = (mappedAction, producer) => {
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
    return mappedAction;
};
const produceMethodEmpty = (name, producer) => {
    const mappedAction = (() => ({ type: name }));
    Object.defineProperty(mappedAction, 'reducer', {
        value: immer_1.default(producer),
        writable: false
    });
    Object.defineProperty(mappedAction, 'name', {
        value: name,
        writable: false
    });
    return mappedAction;
};
const reduceMethod = (mappedAction, reducer) => {
    Object.defineProperty(mappedAction, 'reducer', {
        value: reducer,
        writable: false
    });
    return mappedAction;
};
const reduceMethodEmpty = (name, reducer) => {
    const mappedAction = (() => ({ type: name }));
    Object.defineProperty(mappedAction, 'reducer', {
        value: reducer,
        writable: false
    });
    Object.defineProperty(mappedAction, 'name', {
        value: name,
        writable: false
    });
    return mappedAction;
};
const CreateReduxArea = (initialState) => {
    const actions = [];
    const area = {
        namePrefix: '',
        fetchPostfix: ['Request', 'Success', 'Failure'],
        options: (options) => {
            if (options.namePrefix !== undefined) {
                area.namePrefix = options.namePrefix;
            }
            if (options.fetchPostfix !== undefined) {
                area.fetchPostfix = options.fetchPostfix;
            }
            return area;
        },
        add: (name) => ({
            produce: (producer) => {
                const mappedAction = produceMethodEmpty(area.namePrefix + name, producer);
                actions.push(mappedAction);
                return mappedAction;
            },
            reducer: (reducer) => {
                const mappedAction = reduceMethodEmpty(area.namePrefix + name, reducer);
                actions.push(mappedAction);
                return mappedAction;
            },
            action: (action) => {
                let mappedAction = actionMethod(area.namePrefix + name, action);
                return {
                    produce: (producer) => {
                        mappedAction = produceMethod(mappedAction, producer);
                        actions.push(mappedAction);
                        return mappedAction;
                    },
                    reducer: (reducer) => {
                        mappedAction = reduceMethod(mappedAction, reducer);
                        actions.push(mappedAction);
                        return mappedAction;
                    }
                };
            }
        }),
        addFetch: (name) => {
            const addFetchObject = {
                produce: (producer) => { addFetchObject.action(() => { }).produce(producer); },
                action: (action) => {
                    let mappedAction = actionMethod(area.namePrefix + name + area.fetchPostfix[0], action);
                    return {
                        produce: (producer) => {
                            mappedAction = produceMethod(mappedAction, producer);
                            actions.push(mappedAction);
                            return {
                                successAction: (successAction) => {
                                    let mappedSuccessAction = actionMethod(area.namePrefix + name + area.fetchPostfix[1], successAction);
                                    return {
                                        successProduce: (successProducer) => {
                                            mappedSuccessAction = produceMethod(mappedSuccessAction, successProducer);
                                            actions.push(mappedSuccessAction);
                                            return {
                                                failureAction: (failureAction) => {
                                                    let mappedFailureAction = actionMethod(area.namePrefix + name + area.fetchPostfix[2], failureAction);
                                                    return {
                                                        failureProduce: (failureProducer) => {
                                                            mappedFailureAction = produceMethod(mappedFailureAction, failureProducer);
                                                            actions.push(mappedFailureAction);
                                                            return {
                                                                request: mappedAction,
                                                                success: mappedSuccessAction,
                                                                failure: mappedFailureAction
                                                            };
                                                        }
                                                    };
                                                }
                                            };
                                        }
                                    };
                                }
                            };
                        }
                    };
                }
            };
            return addFetchObject;
        },
        rootReducer: (state = initialState, action) => {
            const actionArea = actions.find(x => x.name === action.type);
            if (actionArea) {
                return actionArea.reducer(state, action);
            }
            return state;
        },
        actions,
        initialState
    };
    return area;
};
exports.default = CreateReduxArea;
//# sourceMappingURL=ReduxArea.js.map