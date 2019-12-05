import produce, { Draft, Immutable } from "immer"
import { AnyAction, Reducer } from 'redux'

type Func = (...args: any) => any
type ReduxAction = ((...args: any) => AnyAction) & { name: string; reducer: Reducer }

export type FetchAreaAction<TState, TFetchAction extends Func, TSuccessAction extends Func, TFailureAction extends Func> = {
   request: AreaAction<TState, TFetchAction>
   success: AreaAction<TState, TSuccessAction>
   failure: AreaAction<TState, TFailureAction>
}

export type AreaAction<TState, T extends Func> = ((...args: Parameters<T>) => ReturnType<T> & { type: string }) & {
   name: string,
   reducer: Reducer<Immutable<TState>, ReturnType<T> & { type: string }>,
   use: (draft: Draft<TState>, action: ReturnType<T>) => void,
   type: ReturnType<T> & { type: string }
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
   Object.defineProperty(mappedAction, 'use', {
      value: (draft: Draft<TState>, action: ReturnType<T>) => {
         action.type = mappedAction.name
         producer(draft, action)
      },
      writable: false
   })
   return mappedAction;
}

const produceMethodEmpty = <TState>(
   name: string,
   producer: (draft: Draft<TState>, action: { type: string }) => void
) => {
   const mappedAction = (() => ({ type: name })) as AreaAction<TState, () => TState>
   Object.defineProperty(mappedAction, 'reducer', {
      value: produce(producer) as Reducer<Immutable<TState>, { type: string }>,
      writable: false
   })
   Object.defineProperty(mappedAction, 'name', {
      value: name,
      writable: false
   })
   Object.defineProperty(mappedAction, 'use', {
      value: (draft: Draft<TState>) => {
         const action = { type: mappedAction.name }
         producer(draft, action)
      },
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

interface IBaseArea<TState> {
   initialState: TState
   namePrefix: string,
   fetchPostfix: string[],
   actions: ReduxAction[],
   rootReducer: Reducer<TState, AnyAction>,
   options: (options: ICreateReduxAreaOptions) => void
}
// --------- Add Flow ---------
const createAddFunc = <TState>(area: IBaseArea<TState>) => {
   return (name: string) => ({
      produce: (producer: (draft: Draft<TState>, action: { type: string }) => void) => {
         const mappedAction = produceMethodEmpty(area.namePrefix + name, producer)
         area.actions.push(mappedAction as unknown as ReduxAction)
         return mappedAction;
      },
      reducer: (
         reducer: (state: TState, reducerAction: { type: string }) => any | void
      ) => {
         const mappedAction = reduceMethodEmpty(area.namePrefix + name, reducer)
         area.actions.push(mappedAction as ReduxAction)
         return mappedAction;
      },
      action: <TAction extends Func>(action: TAction) => {
         let mappedAction = actionMethod<TState, TAction>(area.namePrefix + name, action)
         type MappedAction = ReturnType<TAction> & { type: string }
         return {
            produce: (producer: (draft: Draft<TState>, action: MappedAction) => void) => {
               mappedAction = produceMethod(mappedAction, producer)
               area.actions.push(mappedAction as unknown as ReduxAction)
               return mappedAction;
            },
            reducer: (
               reducer: (state: TState, reducerAction: MappedAction) => any | void
            ) => {
               mappedAction = reduceMethod(mappedAction, reducer)
               area.actions.push(mappedAction as unknown as ReduxAction)
               return mappedAction;
            }
         }
      }
   })
}
// --------- AddFetch Flow ---------
const createAddFetchRequestFunc = <TState>(area: IBaseArea<TState>) => {
   return (name: string) => ({
      action: <TFetchAction extends Func>(action: TFetchAction) => {
         let mappedAction = actionMethod<TState, TFetchAction>(area.namePrefix + name + area.fetchPostfix[0], action)
         return {
            produce: (producer: (draft: Draft<TState>, action: ReturnType<TFetchAction> & { type: string }) => void) => {
               mappedAction = produceMethod(mappedAction, producer)
               area.actions.push(mappedAction as unknown as ReduxAction)
               return {
                  successAction: createAddFetchSuccessFunc(area, name, mappedAction)
               };
            }
         }
      },
      produce: (producer: (draft: Draft<TState>, action: { type: string }) => void) => {
         const mappedAction = produceMethodEmpty(area.namePrefix + name, producer)
         area.actions.push(mappedAction as unknown as ReduxAction)
         return {
            successAction: createAddFetchSuccessFunc(area, name, mappedAction)
         };
      }
   })

}

const createAddFetchSuccessFunc = <TState, TFetchRequestAction extends Func>(area: IBaseArea<TState>, name: string, requestAction: AreaAction<TState, TFetchRequestAction>) => {
   return <TSuccessAction extends Func>(successAction: TSuccessAction) => {
      let fetchSuccessAction = actionMethod<TState, TSuccessAction>(area.namePrefix + name + area.fetchPostfix[1], successAction)
      return {
         successProduce: (successProducer: (draft: Draft<TState>, action: ReturnType<TSuccessAction> & { type: string }) => void) => {
            fetchSuccessAction = produceMethod(fetchSuccessAction, successProducer)
            area.actions.push(fetchSuccessAction as unknown as ReduxAction)
            return {
               failureAction: createAddFetchFailureFunc(area, name, requestAction, fetchSuccessAction)
            };
         }
      }
   }
}

const createAddFetchFailureFunc = <TState, TFetchRequestAction extends Func, TFetchSuccessAction extends Func>(
   area: IBaseArea<TState>,
   name: string,
   requestAction: AreaAction<TState, TFetchRequestAction>,
   fetchSuccessAction: AreaAction<TState, TFetchSuccessAction>
) => {
   return <TFailureAction extends Func>(failureAction: TFailureAction) => {
      let fetchFailureAction = actionMethod<TState, TFailureAction>(area.namePrefix + name + area.fetchPostfix[2], failureAction)
      return {
         failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnType<TFailureAction> & { type: string }) => void) => {
            fetchFailureAction = produceMethod(fetchFailureAction, failureProducer)
            area.actions.push(fetchFailureAction as unknown as ReduxAction)
            return {
               request: requestAction,
               success: fetchSuccessAction,
               failure: fetchFailureAction
            } as FetchAreaAction<TState, TFetchRequestAction, TFetchSuccessAction, TFailureAction>;
         }
      }
   }
}
// --------- Add Standard Fetch Flow ---------
const createAddStandardFetchRequestFunc = <TState, TStandardFetchFailureAction extends Func>(
   area: IBaseArea<TState>,
   failureAction: TStandardFetchFailureAction,
   failureProducer: (draft: Draft<TState>, action: ReturnType<TStandardFetchFailureAction> & { type: string }) => void
) => {
   return (name: string) => ({
      action: <TFetchAction extends Func>(action: TFetchAction) => {
         let mappedAction = actionMethod<TState, TFetchAction>(area.namePrefix + name + area.fetchPostfix[0], action)
         return {
            produce: (producer: (draft: Draft<TState>, action: ReturnType<TFetchAction> & { type: string }) => void) => {
               mappedAction = produceMethod(mappedAction, producer)
               area.actions.push(mappedAction as unknown as ReduxAction)
               return createAddStandardFetchSuccessFunc(area, name, mappedAction, failureAction, failureProducer)
            }
         }
      },
      produce: (producer: (draft: Draft<TState>, action: { type: string }) => void) => {
         const mappedAction = produceMethodEmpty(area.namePrefix + name + area.fetchPostfix[0], producer)
         area.actions.push(mappedAction as unknown as ReduxAction)
         return createAddStandardFetchSuccessFunc(area, name, mappedAction, failureAction, failureProducer)
      }
   })
}

const createAddStandardFetchSuccessFunc = <TState, TStandardFetchFailureAction extends Func, TRequestAction extends Func>(
   area: IBaseArea<TState>,
   name: string,
   requestAction: AreaAction<TState, TRequestAction>,
   failureAction: TStandardFetchFailureAction,
   failureProducer: (draft: Draft<TState>, action: ReturnType<TStandardFetchFailureAction> & { type: string }) => void
) => {
   return {
      successAction: <TSuccessAction extends Func>(action: TSuccessAction) => {
         let successAction = actionMethod<TState, TSuccessAction>(area.namePrefix + name + area.fetchPostfix[1], action)
         return {
            successProduce: (successProducer: (draft: Draft<TState>, action: ReturnType<TSuccessAction> & { type: string }) => void) => {
               successAction = produceMethod(successAction, successProducer)
               area.actions.push(successAction as unknown as ReduxAction)
               return {
                  failureAction: createAddFetchFailureFunc(area, name, requestAction, successAction),
                  standardFailure: createAddStandardFetchFailureFunc(area, name, requestAction, successAction, failureAction, failureProducer)
               };
            }
         }
      },
      successProduce: (successProducer: (draft: Draft<TState>, action: { type: string }) => void) => {
         const successAction = produceMethodEmpty(area.namePrefix + name + area.fetchPostfix[1], successProducer)
         area.actions.push(successAction as unknown as ReduxAction)
         return {
            failureAction: createAddFetchFailureFunc(area, name, requestAction, successAction),
            standardFailure: createAddStandardFetchFailureFunc(area, name, requestAction, successAction, failureAction, failureProducer)
         };
      }
   }
}

const createAddStandardFetchFailureFunc = <TState, TStandardFetchFailureAction extends Func, TRequestAction extends Func, TSuccessAction extends Func>(
   area: IBaseArea<TState>,
   name: string,
   requestAction: AreaAction<TState, TRequestAction>,
   successAction: AreaAction<TState, TSuccessAction>,
   failureAction: TStandardFetchFailureAction,
   failureProducer: (draft: Draft<TState>, action: ReturnType<TStandardFetchFailureAction> & { type: string }) => void
) => {
   return () => {
      let mappedFailureAction = actionMethod<TState, TStandardFetchFailureAction>(area.namePrefix + name + area.fetchPostfix[2], failureAction)
      mappedFailureAction = produceMethod(mappedFailureAction, failureProducer)
      area.actions.push(mappedFailureAction as unknown as ReduxAction)
      return {
         request: requestAction,
         success: successAction,
         failure: mappedFailureAction
      } as FetchAreaAction<TState, TRequestAction, TSuccessAction, TStandardFetchFailureAction>;
   }

}




// ----------- 
const CreateReduxArea = <TState>(initialState: TState) => {
   const area: IBaseArea<TState> = {
      namePrefix: '',
      fetchPostfix: ['Request', 'Success', 'Failure'],
      actions: [],
      initialState,
      rootReducer: (state: TState = initialState, action) => {
         const actionArea = area.actions.find(x => x.name === action.type)
         if (actionArea) {
            return actionArea.reducer(state, action)
         }
         return state
      },
      options: (options: ICreateReduxAreaOptions) => {
         if (options.namePrefix !== undefined) {
            area.namePrefix = options.namePrefix
         }
         if (options.fetchPostfix !== undefined) {
            area.fetchPostfix = options.fetchPostfix
         }
         return area;
      },
   }
   const returner = {
      ...area,
      add: createAddFunc(area),
      addFetch: createAddFetchRequestFunc(area),
      options: (options: ICreateReduxAreaOptions) => {
         area.options(options);
         return returner
      },
      setStandardFetchFailure: <TStandardFetchFailureAction extends Func>(
         action: TStandardFetchFailureAction,
         producer: (draft: Draft<TState>, action: ReturnType<TStandardFetchFailureAction> & { type: string }) => void
      ) => {
         const returnerExp = {
            ...returner,
            addFetch: createAddStandardFetchRequestFunc(area, action, producer),
            options: (options: ICreateReduxAreaOptions) => {
               area.options(options);
               return returnerExp
            }
         }
         delete returnerExp.setStandardFetchFailure;
         return returnerExp
      }
   }
   return returner
}

export default CreateReduxArea
