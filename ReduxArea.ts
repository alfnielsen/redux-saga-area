import produce, { Draft, Immutable, Produced } from "immer"
import { AnyAction, Reducer } from 'redux'

type Func = (...args: any) => any
type ReduxAction = ((...args: any) => AnyAction) & { name: string; reducer: Reducer }

const CreateReduxArea = <TState, D = Draft<TState>>(initialState: TState) => {
   const actions: ReduxAction[] = []
   return {
      add: (name: string) => ({
         produce: (producer: (draft: Draft<TState>, action: { type: string }) => void) => {
            const actionCreator = () => ({ type: name })
            const mappedAction = actionCreator as unknown as (() => { type: string }) & {
               name: string,
               reducer: Reducer<Immutable<TState>, { type: string }>
               type: { type: string }
            }
            Object.defineProperty(mappedAction, 'reducer', {
               value: produce(producer) as Reducer<Immutable<TState>, { type: string }>,
               writable: false
            })
            actions.push(mappedAction as unknown as ReduxAction)
            return mappedAction;
         },
         reducer: (
            reducer: (state: TState, reducerAction: { type: string }) => any | void
         ) => {
            const actionCreator = () => ({ type: name })
            const mappedAction = actionCreator as unknown as (() => { type: string }) & {
               name: string,
               reducer: Reducer<Immutable<TState>, { type: string }>
               type: { type: string }
            }
            Object.defineProperty(mappedAction, 'reducer', {
               value: reducer as Reducer<TState, { type: string }>,
               writable: false
            })
            actions.push(mappedAction as unknown as ReduxAction)
            return mappedAction;
         },
         action: <T extends Func>(action: T) => {
            const actionCreator = (...args: Parameters<typeof action>) => ({
               ...action.apply(null, args),
               type: name
            })
            const mappedAction = actionCreator as unknown as ((...args: Parameters<typeof action>) => ReturnType<T> & { type: string }) & {
               name: string,
               reducer: Reducer<Immutable<TState>, ReturnType<T> & { type: string }>
               type: ReturnType<T> & { type: string }
            }
            Object.defineProperty(mappedAction, 'name', {
               value: name,
               writable: false
            })
            return {
               produce: (producer: (draft: Draft<TState>, action: ReturnType<T> & { type: string }) => void) => {
                  Object.defineProperty(mappedAction, 'reducer', {
                     value: produce(producer) as Reducer<Immutable<TState>, ReturnType<T> & { type: string }>,
                     writable: false
                  })
                  actions.push(mappedAction as unknown as ReduxAction)
                  return mappedAction;
               },
               reducer: (
                  reducer: (state: TState, reducerAction: ReturnType<T> & { type: string }) => any | void
               ) => {
                  Object.defineProperty(mappedAction, 'reducer', {
                     value: reducer as Reducer<TState, ReturnType<T> & { type: string }>,
                     writable: false
                  })
                  actions.push(mappedAction as unknown as ReduxAction)
                  return mappedAction;
               }
            }
         }
      }),
      rootReducer: (
         state: TState = initialState,
         action: AnyAction
      ): TState => {
         const actionArea = actions.find(x => x.name === action.type)
         if (actionArea) {
            return actionArea.reducer(state, action)
         }
         return state
      },
      actions,
      initialState
   }
}

export default CreateReduxArea
