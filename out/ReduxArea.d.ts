import { Draft, Immutable } from "immer";
import { AnyAction, Reducer } from 'redux';
declare type Func = (...args: any) => any;
declare type ReduxAction = ((...args: any) => AnyAction) & {
    name: string;
    reducer: Reducer;
};
declare const CreateReduxArea: <TState, D = Draft<TState>>(initialState: TState) => {
    add: (name: string) => {
        action: <T extends Func>(action: T) => {
            produce: (producer: (draft: Draft<TState>, action: ReturnType<T> & {
                type: string;
            }) => void) => ((...args: Parameters<T>) => ReturnType<T> & {
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
            reducer: (reducer: (state: TState, reducerAction: ReturnType<T> & {
                type: string;
            }) => any) => ((...args: Parameters<T>) => ReturnType<T> & {
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
        };
    };
    rootReducer: (state: TState | undefined, action: AnyAction) => TState;
    actions: ReduxAction[];
    initialState: TState;
};
export default CreateReduxArea;
