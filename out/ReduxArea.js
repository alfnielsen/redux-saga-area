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
    Object.defineProperty(mappedAction, 'use', {
        value: (draft) => {
            const action = { type: mappedAction.name };
            producer(draft, action);
        },
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
// --------- Add Flow ---------
const createAddFunc = (area) => {
    return (name) => ({
        produce: (producer) => {
            const mappedAction = produceMethodEmpty(area.namePrefix + name, producer);
            area.actions.push(mappedAction);
            return mappedAction;
        },
        reducer: (reducer) => {
            const mappedAction = reduceMethodEmpty(area.namePrefix + name, reducer);
            area.actions.push(mappedAction);
            return mappedAction;
        },
        action: (action) => {
            let mappedAction = actionMethod(area.namePrefix + name, action);
            return {
                produce: (producer) => {
                    mappedAction = produceMethod(mappedAction, producer);
                    area.actions.push(mappedAction);
                    return mappedAction;
                },
                reducer: (reducer) => {
                    mappedAction = reduceMethod(mappedAction, reducer);
                    area.actions.push(mappedAction);
                    return mappedAction;
                }
            };
        }
    });
};
// --------- AddFetch Flow ---------
const createAddFetchRequestFunc = (area) => {
    return (name) => ({
        action: (action) => {
            let mappedAction = actionMethod(area.namePrefix + name + area.fetchPostfix[0], action);
            return {
                produce: (producer) => {
                    mappedAction = produceMethod(mappedAction, producer);
                    area.actions.push(mappedAction);
                    return {
                        successAction: createAddFetchSuccessFunc(area, name, mappedAction)
                    };
                }
            };
        },
        produce: (producer) => {
            const mappedAction = produceMethodEmpty(area.namePrefix + name, producer);
            area.actions.push(mappedAction);
            return {
                successAction: createAddFetchSuccessFunc(area, name, mappedAction)
            };
        }
    });
};
const createAddFetchSuccessFunc = (area, name, requestAction) => {
    return (successAction) => {
        let fetchSuccessAction = actionMethod(area.namePrefix + name + area.fetchPostfix[1], successAction);
        return {
            successProduce: (successProducer) => {
                fetchSuccessAction = produceMethod(fetchSuccessAction, successProducer);
                area.actions.push(fetchSuccessAction);
                return {
                    failureAction: createAddFetchFailureFunc(area, name, requestAction, fetchSuccessAction)
                };
            }
        };
    };
};
const createAddFetchFailureFunc = (area, name, requestAction, fetchSuccessAction) => {
    return (failureAction) => {
        let fetchFailureAction = actionMethod(area.namePrefix + name + area.fetchPostfix[2], failureAction);
        return {
            failureProduce: (failureProducer) => {
                fetchFailureAction = produceMethod(fetchFailureAction, failureProducer);
                area.actions.push(fetchFailureAction);
                return {
                    request: requestAction,
                    success: fetchSuccessAction,
                    failure: fetchFailureAction
                };
            }
        };
    };
};
// --------- Add Standard Fetch Flow ---------
const createAddStandardFetchRequestFunc = (area, failureAction, failureProducer) => {
    return (name) => ({
        action: (action) => {
            let mappedAction = actionMethod(area.namePrefix + name + area.fetchPostfix[0], action);
            return {
                produce: (producer) => {
                    mappedAction = produceMethod(mappedAction, producer);
                    area.actions.push(mappedAction);
                    return createAddStandardFetchSuccessFunc(area, name, mappedAction, failureAction, failureProducer);
                }
            };
        },
        produce: (producer) => {
            const mappedAction = produceMethodEmpty(area.namePrefix + name + area.fetchPostfix[0], producer);
            area.actions.push(mappedAction);
            return createAddStandardFetchSuccessFunc(area, name, mappedAction, failureAction, failureProducer);
        }
    });
};
const createAddStandardFetchSuccessFunc = (area, name, requestAction, failureAction, failureProducer) => {
    return {
        successAction: (action) => {
            let successAction = actionMethod(area.namePrefix + name + area.fetchPostfix[1], action);
            return {
                successProduce: (successProducer) => {
                    successAction = produceMethod(successAction, successProducer);
                    area.actions.push(successAction);
                    return {
                        failureAction: createAddFetchFailureFunc(area, name, requestAction, successAction),
                        standardFailure: createAddStandardFetchFailureFunc(area, name, requestAction, successAction, failureAction, failureProducer)
                    };
                }
            };
        },
        successProduce: (successProducer) => {
            const successAction = produceMethodEmpty(area.namePrefix + name + area.fetchPostfix[1], successProducer);
            area.actions.push(successAction);
            return {
                failureAction: createAddFetchFailureFunc(area, name, requestAction, successAction),
                standardFailure: createAddStandardFetchFailureFunc(area, name, requestAction, successAction, failureAction, failureProducer)
            };
        }
    };
};
const createAddStandardFetchFailureFunc = (area, name, requestAction, successAction, failureAction, failureProducer) => {
    return () => {
        let mappedFailureAction = actionMethod(area.namePrefix + name + area.fetchPostfix[2], failureAction);
        mappedFailureAction = produceMethod(mappedFailureAction, failureProducer);
        area.actions.push(mappedFailureAction);
        return {
            request: requestAction,
            success: successAction,
            failure: mappedFailureAction
        };
    };
};
// ----------- 
const CreateReduxArea = (initialState) => {
    const area = {
        namePrefix: '',
        fetchPostfix: ['Request', 'Success', 'Failure'],
        actions: [],
        initialState,
        rootReducer: (state = initialState, action) => {
            const actionArea = area.actions.find(x => x.name === action.type);
            if (actionArea) {
                return actionArea.reducer(state, action);
            }
            return state;
        },
        options: (options) => {
            if (options.namePrefix !== undefined) {
                area.namePrefix = options.namePrefix;
            }
            if (options.fetchPostfix !== undefined) {
                area.fetchPostfix = options.fetchPostfix;
            }
            return area;
        },
    };
    const returner = Object.assign(Object.assign({}, area), { add: createAddFunc(area), addFetch: createAddFetchRequestFunc(area), options: (options) => {
            area.options(options);
            return returner;
        }, setStandardFetchFailure: (action, producer) => {
            const returnerExp = Object.assign(Object.assign({}, returner), { addFetch: createAddStandardFetchRequestFunc(area, action, producer), options: (options) => {
                    area.options(options);
                    return returnerExp;
                } });
            delete returnerExp.setStandardFetchFailure;
            return returnerExp;
        } });
    return returner;
};
exports.default = CreateReduxArea;
//# sourceMappingURL=ReduxArea.js.map