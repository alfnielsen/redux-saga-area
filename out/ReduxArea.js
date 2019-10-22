"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immer_1 = require("immer");
const CreateReduxArea = (initialState) => {
    const actions = [];
    return {
        add: (name) => ({
            action: (action) => {
                const actionCreator = (...args) => (Object.assign({}, action.apply(null, args), { type: name }));
                const mappedAction = actionCreator;
                Object.defineProperty(mappedAction, 'name', {
                    value: name,
                    writable: false
                });
                return {
                    produce: (producer) => {
                        Object.defineProperty(mappedAction, 'reducer', {
                            value: immer_1.default(producer),
                            writable: false
                        });
                        actions.push(mappedAction);
                        return mappedAction;
                    },
                    reducer: (reducer) => {
                        Object.defineProperty(mappedAction, 'reducer', {
                            value: reducer,
                            writable: false
                        });
                        actions.push(mappedAction);
                        return mappedAction;
                    }
                };
            }
        }),
        rootReducer: () => (state = initialState, action) => {
            const actionArea = actions.find(x => x.name === action.type);
            if (actionArea) {
                return actionArea.reducer(state, action);
            }
            return state;
        },
        actions,
        initialState
    };
};
exports.default = CreateReduxArea;
//# sourceMappingURL=ReduxArea.js.map