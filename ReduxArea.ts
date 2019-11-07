import produce, { Draft, Immutable } from "immer"
import { AnyAction, Reducer } from 'redux'

type Func = (...args: any) => any
type ReduxAction = ((...args: any) => AnyAction) & { name: string; reducer: Reducer }
type AreaAction<TState, T extends Func> = ((...args: Parameters<T>) => ReturnType<T> & { type: string }) & {
   name: string,
   reducer: Reducer<Immutable<TState>, ReturnType<T> & { type: string }>
   type: ReturnType<T> & { type: string }
}

type AreaActionEmpty<TState> = (() => { type: string }) & {
   name: string,
   reducer: Reducer<Immutable<TState>, { type: string }>
   type: { type: string }
}

const actionMethod = <TState, T extends Func>(name: string, action: T) => {
   const actionCreator = (...args: Parameters<typeof action>) => ({
      ...action.apply(null, args),
      type: name
   })
   const mappedAction = actionCreator as AreaAction<TState, T>
   Object.defineProperty(mappedAction, 'name', {
      value: name,
      writable: false
   })
   return mappedAction
}

const produceMethod = <TState, T extends Func>(
   mappedAction: AreaAction<TState, T>,
   producer: (draft: Draft<TState>, action: ReturnType<T> & { type: string }) => void,
) => {
   Object.defineProperty(mappedAction, 'reducer', {
      value: produce(producer) as Reducer<Immutable<TState>, ReturnType<T> & { type: string }>,
      writable: false
   })
   return mappedAction;
}

const produceMethodEmpty = <TState>(
   name: string,
   producer: (draft: Draft<TState>, action: { type: string }) => void
) => {
   const mappedAction = (() => ({ type: name })) as AreaActionEmpty<TState>
   Object.defineProperty(mappedAction, 'reducer', {
      value: produce(producer) as Reducer<Immutable<TState>, { type: string }>,
      writable: false
   })
   Object.defineProperty(mappedAction, 'name', {
      value: name,
      writable: false
   })
   return mappedAction
}

const reduceMethod = <TState, T extends Func, TAction>(
   mappedAction: AreaAction<TState, T>,
   reducer: (state: TState, reducerAction: TAction) => TState
) => {
   Object.defineProperty(mappedAction, 'reducer', {
      value: reducer as Reducer<TState, ReturnType<T> & { type: string }>,
      writable: false
   })
   return mappedAction;
}

const reduceMethodEmpty = <TState>(
   name: string,
   reducer: (state: TState, reducerAction: { type: string }) => TState
) => {
   const mappedAction = (() => ({ type: name })) as unknown as (() => { type: string }) & {
      name: string,
      reducer: Reducer<Immutable<TState>, { type: string }>
      type: { type: string }
   }
   Object.defineProperty(mappedAction, 'reducer', {
      value: reducer as Reducer<TState, { type: string }>,
      writable: false
   })
   Object.defineProperty(mappedAction, 'name', {
      value: name,
      writable: false
   })
   return mappedAction;
}
interface ICreateReduxAreaOptions {
   namePrefix?: string,
   fetchPostfix?: string[]
}

const CreateReduxArea = <TState>(initialState: TState) => {
   const actions: ReduxAction[] = []
   const area = {
      namePrefix: '',
      fetchPostfix: ['Fetch', 'Success', 'Failure'],
      options: (options: ICreateReduxAreaOptions) => {
         if (options.namePrefix !== undefined) {
            area.namePrefix = options.namePrefix
         }
         if (options.fetchPostfix !== undefined) {
            area.fetchPostfix = options.fetchPostfix
         }
         return area;
      },
      add: (name: string) => ({
         produce: (producer: (draft: Draft<TState>, action: { type: string }) => void) => {
            const mappedAction = produceMethodEmpty(area.namePrefix + name, producer)
            actions.push(mappedAction as unknown as ReduxAction)
            return mappedAction;
         },
         reducer: (
            reducer: (state: TState, reducerAction: { type: string }) => any | void
         ) => {
            const mappedAction = reduceMethodEmpty(area.namePrefix + name, reducer)
            actions.push(mappedAction as ReduxAction)
            return mappedAction;
         },
         action: <TAction extends Func>(action: TAction) => {
            let mappedAction = actionMethod<TState, TAction>(area.namePrefix + name, action)
            type MappedAction = ReturnType<TAction> & { type: string }
            return {
               produce: (producer: (draft: Draft<TState>, action: MappedAction) => void) => {
                  mappedAction = produceMethod(mappedAction, producer)
                  actions.push(mappedAction as unknown as ReduxAction)
                  return mappedAction;
               },
               reducer: (
                  reducer: (state: TState, reducerAction: MappedAction) => any | void
               ) => {
                  mappedAction = reduceMethod(mappedAction, reducer)
                  actions.push(mappedAction as unknown as ReduxAction)
                  return mappedAction;
               }
            }
         }
      }),
      addFetch: (name: string) => {
         const addFetchObject = {
            produce: (producer: (draft: Draft<TState>, action: { type: string }) => void): any => { addFetchObject.action(() => { }).produce(producer) },
            action: <TFetchAction extends Func>(action: TFetchAction) => {
               let mappedAction = actionMethod<TState, TFetchAction>(area.namePrefix + name + area.fetchPostfix[0], action)
               return {
                  produce: (producer: (draft: Draft<TState>, action: ReturnType<TFetchAction> & { type: string }) => void) => {
                     mappedAction = produceMethod(mappedAction, producer)
                     actions.push(mappedAction as unknown as ReduxAction)
                     return {
                        successAction: <TSuccessAction extends Func>(successAction: TSuccessAction) => {
                           let mappedSuccessAction = actionMethod<TState, TSuccessAction>(area.namePrefix + name + area.fetchPostfix[1], successAction)
                           return {
                              successProduce: (successProducer: (draft: Draft<TState>, action: ReturnType<TSuccessAction> & { type: string }) => void) => {
                                 mappedSuccessAction = produceMethod(mappedSuccessAction, successProducer)
                                 actions.push(mappedSuccessAction as unknown as ReduxAction)
                                 return {
                                    failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
                                       let mappedFailureAction = actionMethod<TState, TFailureAction>(area.namePrefix + name + area.fetchPostfix[2], failureAction)
                                       return {
                                          failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnType<TFailureAction> & { type: string }) => void) => {
                                             mappedFailureAction = produceMethod(mappedFailureAction, failureProducer)
                                             actions.push(mappedFailureAction as unknown as ReduxAction)
                                             return {
                                                fetch: mappedAction,
                                                success: mappedSuccessAction,
                                                failure: mappedFailureAction
                                             };
                                          }
                                       }
                                    }
                                 };
                              }
                           }
                        }
                     };
                  }
               }
            }
         }
         return addFetchObject
      },
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
   return area
}

export default CreateReduxArea
