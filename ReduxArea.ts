import produce, { Draft, Immutable } from "immer"
import { AnyAction, Reducer } from 'redux'

type Func = (...args: any) => any
type ReduxAction = ((...args: any) => AnyAction) & { name: string; reducer: Reducer; intercept?: Reducer }
type ReduxAreaAnyAction = { type: string, shortType: string }
type EmptyActionType<AreaActionType> = ReduxAreaAnyAction & AreaActionType
type EmptyAction<AreaActionType> = () => EmptyActionType<AreaActionType>
type ReturnTypeAction<T extends Func, AreaActionType> = ReturnType<T> & EmptyActionType<AreaActionType>
type ActionCreatorInterceptor<AreaActionType> = (act: ReduxAreaAnyAction) => AreaActionType

export type FetchAreaAction<TState, TFetchAction extends Func, TSuccessAction extends Func, TFailureAction extends Func, AreaActionType> = {
   request: AreaAction<TState, TFetchAction, AreaActionType>
   success: AreaAction<TState, TSuccessAction, AreaActionType>
   failure: AreaAction<TState, TFailureAction, AreaActionType>
}
export type TIntercept<TState, AreaActionType> = (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void

export type AreaAction<TState, T extends Func, AreaActionType> = ((...args: Parameters<T>) => ReturnTypeAction<T, AreaActionType>) & {
   name: string,
   reducer: Reducer<Immutable<TState>, ReturnTypeAction<T, AreaActionType>>,
   intercept?: (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void,
   use: (draft: Draft<TState>, action: ReturnType<T>) => void,
   type: ReturnTypeAction<T, AreaActionType>
}

const produceMethod = <TState, TAction extends Func, AreaActionType>(
   shortName: string,
   name: string,
   action: TAction,
   producer: (draft: Draft<TState>, action: ReturnTypeAction<TAction, AreaActionType>) => void,
   intercept?: (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void,
   actionCreatorInterceptor?: ActionCreatorInterceptor<AreaActionType>
) => {
   const actionCreator = (...args: Parameters<TAction>) => {
      let actionResult = action.apply(null, args)
      if (actionCreatorInterceptor) {
         return {
            ...actionResult,
            type: name,
            shortType: shortName,
            ...actionCreatorInterceptor({
               ...actionResult,
               type: name,
               shortType: shortName,
            })
         }
      } else {
         return {
            ...actionResult,
            type: name,
            shortType: shortName,
         }
      }
   }
   const mappedAction = actionCreator as AreaAction<TState, TAction, AreaActionType>
   Object.defineProperty(mappedAction, 'name', {
      value: name,
      writable: false
   })
   Object.defineProperty(mappedAction, 'reducer', {
      value: produce(producer) as Reducer<Immutable<TState>, ReturnTypeAction<TAction, AreaActionType>>,
      writable: false
   })
   Object.defineProperty(mappedAction, 'use', {
      value: (draft: Draft<TState>, action: ReturnType<TAction>) => {
         action.type = mappedAction.name
         producer(draft, action)
      },
      writable: false
   })
   if (intercept) {
      Object.defineProperty(mappedAction, 'intercept', {
         value: produce(intercept) as Reducer<Immutable<TState>, EmptyActionType<AreaActionType>>,
         writable: false
      })
   }
   return mappedAction
}

const produceMethodEmptyAction = <TState, AreaActionType>(
   shortName: string,
   name: string,
   producer: (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void,
   intercept?: (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void,
   actionCreatorInterceptor?: ActionCreatorInterceptor<AreaActionType>
) => {
   const mappedAction = (() => ({})) as () => EmptyActionType<AreaActionType>
   return produceMethod<TState, typeof mappedAction, AreaActionType>(shortName, name, mappedAction, producer, intercept, actionCreatorInterceptor)
}

const produceMethodEmptyProducer = <TState, TAction extends Func, AreaActionType>(
   shortName: string,
   name: string,
   mappedAction: TAction,
   intercept?: (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void,
   actionCreatorInterceptor?: ActionCreatorInterceptor<AreaActionType>
) => {
   const producer = ((draft, action) => { }) as (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void
   return produceMethod<TState, typeof mappedAction, AreaActionType>(shortName, name, mappedAction, producer, intercept, actionCreatorInterceptor)
}

const produceMethodDoubleEmpty = <TState, AreaActionType>(
   shortName: string,
   name: string,
   intercept?: (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void,
   actionCreatorInterceptor?: ActionCreatorInterceptor<AreaActionType>
) => {
   const mappedAction = (() => ({})) as () => EmptyActionType<AreaActionType>
   const producer = ((draft, action) => { }) as (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void
   return produceMethod<TState, typeof mappedAction, AreaActionType>(shortName, name, mappedAction, producer, intercept, actionCreatorInterceptor)
}

const reduceMethod = <TState, T extends Func, TAction, AreaActionType>(
   mappedAction: T,
   reducer: (state: TState, reducerAction: TAction) => TState,
   intercept?: (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void
) => {
   Object.defineProperty(mappedAction, 'reducer', {
      value: reducer as Reducer<TState, ReturnTypeAction<T, AreaActionType>>,
      writable: false
   })
   if (intercept) {
      Object.defineProperty(mappedAction, 'intercept', {
         value: produce(intercept) as Reducer<Immutable<TState>, EmptyActionType<AreaActionType>>,
         writable: false
      })
   }
   return mappedAction
}

const reduceMethodEmpty = <TState, AreaActionType>(
   name: string,
   reducer: (state: TState, reducerAction: EmptyActionType<AreaActionType>) => TState,
   intercept?: (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void
) => {
   const mappedAction = (() => ({ type: name })) as unknown as (() => EmptyActionType<AreaActionType>) & {
      name: string,
      reducer: Reducer<Immutable<TState>, EmptyActionType<AreaActionType>>
      type: EmptyActionType<AreaActionType>
   }
   if (!mappedAction.reducer) {
      Object.defineProperty(mappedAction, 'reducer', {
         value: reducer as Reducer<TState, EmptyActionType<AreaActionType>>,
         writable: false
      })
   }
   Object.defineProperty(mappedAction, 'name', {
      value: name,
      writable: false
   })
   if (intercept) {
      Object.defineProperty(mappedAction, 'intercept', {
         value: produce(intercept) as Reducer<Immutable<TState>, EmptyActionType<AreaActionType>>,
         writable: false
      })
   }
   return mappedAction
}

// --------- AddFetch Flow ---------
// Request chain:
const createRequestChain = <TState, TStandardFailureAction extends Func, AreaActionType>(area: Area<TState, TStandardFailureAction, AreaActionType>, name: string) => {
   const requestName = area.namePrefix + name + area.fetchPostfix[0]
   const successName = area.namePrefix + name + area.fetchPostfix[1]
   const doubleEmptyRequestAction = produceMethodDoubleEmpty(name, requestName, area.interceptRequest, area.actionCreatorInterceptor)
   const doubleEmptySuccessAction = produceMethodDoubleEmpty(name, successName, area.interceptSuccess, area.actionCreatorInterceptor)
   return ({
      action: <TFetchAction extends Func>(action: TFetchAction) => {
         const emptyProducer = produceMethodEmptyProducer(name, requestName, action, area.interceptRequest, area.actionCreatorInterceptor)
         return {
            produce: (producer: (draft: Draft<TState>, action: ReturnTypeAction<TFetchAction, AreaActionType>) => void) => {
               const mappedAction = produceMethod(name, requestName, action, producer, area.interceptRequest, area.actionCreatorInterceptor)
               return createSuccessChain<TState, TStandardFailureAction, TFetchAction, AreaActionType>(area, name, mappedAction)
            },
            ...createSuccessChain<TState, TStandardFailureAction, TFetchAction, AreaActionType>(area, name, emptyProducer),
            ...createFailureChain<TState, TStandardFailureAction, TFetchAction, EmptyAction<AreaActionType>, AreaActionType>(area, name, emptyProducer, doubleEmptySuccessAction),
         }
      },
      produce: (producer: (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void) => {
         const mappedAction = produceMethodEmptyAction(name, requestName, producer, area.interceptRequest, area.actionCreatorInterceptor)
         return createSuccessChain<TState, TStandardFailureAction, () => EmptyActionType<AreaActionType>, AreaActionType>(area, name, mappedAction)
      },
      ...createSuccessChain<TState, TStandardFailureAction, EmptyAction<AreaActionType>, AreaActionType>(area, name, doubleEmptyRequestAction),
      ...createFailureChain<TState, TStandardFailureAction, EmptyAction<AreaActionType>, EmptyAction<AreaActionType>, AreaActionType>(area, name, doubleEmptyRequestAction, doubleEmptySuccessAction),
   })
}

// Success chain:
const createSuccessChain = <TState, TStandardFailureAction extends Func, TFetchRequestAction extends Func, AreaActionType>(
   area: Area<TState, TStandardFailureAction, AreaActionType>,
   name: string,
   requestAction: AreaAction<TState, TFetchRequestAction, AreaActionType>
) => {
   const successName = area.namePrefix + name + area.fetchPostfix[1]
   //const failureName = area.namePrefix + name + area.fetchPostfix[2]
   const doubleEmptyAction = produceMethodDoubleEmpty(name, successName, area.interceptSuccess, area.actionCreatorInterceptor)

   return ({
      successAction: <TSuccessAction extends Func>(successAction: TSuccessAction) => {
         const emptyProducer = produceMethodEmptyProducer(name, successName, successAction, area.interceptSuccess, area.actionCreatorInterceptor)
         return {
            successProduce: (successProducer: (draft: Draft<TState>, action: ReturnTypeAction<TSuccessAction, AreaActionType>) => void) => {
               let _successAction = produceMethod(name, successName, successAction, successProducer, area.interceptSuccess, area.actionCreatorInterceptor)
               return createFailureChain<TState, TStandardFailureAction, TFetchRequestAction, TSuccessAction, AreaActionType>(area, name, requestAction, _successAction)
            },
            ...createFailureChain<TState, TStandardFailureAction, TFetchRequestAction, TSuccessAction, AreaActionType>(area, name, requestAction, emptyProducer),
         }
      },
      successProduce: (successProducer: (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void) => {
         const fetchSuccessAction = produceMethodEmptyAction(name, successName, successProducer, area.interceptSuccess, area.actionCreatorInterceptor)
         return createFailureChain<TState, TStandardFailureAction, TFetchRequestAction, EmptyAction<AreaActionType>, AreaActionType>(area, name, requestAction, fetchSuccessAction)
      },
      ...createFailureChain<TState, TStandardFailureAction, TFetchRequestAction, EmptyAction<AreaActionType>, AreaActionType>(area, name, requestAction, doubleEmptyAction)
   })
}

// Failure chain:
const createFailureChain = <TState, TStandardFailureAction extends Func, TFetchRequestAction extends Func, TFetchSuccessAction extends Func, AreaActionType>(
   area: Area<TState, TStandardFailureAction, AreaActionType>,
   name: string,
   requestAction: AreaAction<TState, TFetchRequestAction, AreaActionType>,
   successAction: AreaAction<TState, TFetchSuccessAction, AreaActionType>
) => {
   let _name = area.namePrefix + name + area.fetchPostfix[2]
   return ({
      standardFailure: () => {
         if (area.standardFailureAction && area.standardFailureReducer) {
            let failureAction = produceMethod(name, _name, area.standardFailureAction, area.standardFailureReducer, area.interceptFailure, area.actionCreatorInterceptor)
            return finalizeChain<TState, TStandardFailureAction, TFetchRequestAction, TFetchSuccessAction, TStandardFailureAction, AreaActionType>(area, requestAction, successAction, failureAction)
         }
         throw new Error(`redux-area fetch method: ${name} tried to call standardFailureAction/standardFailureReducer, but the area didn't have one. Declare it with area.setStandardFetchFailure(action, producer)!`)
      },
      failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
         return {
            failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction, AreaActionType>) => void) => {
               const _failureAction = produceMethod(name, _name, failureAction, failureProducer, area.interceptFailure, area.actionCreatorInterceptor)
               return finalizeChain<TState, TStandardFailureAction, TFetchRequestAction, TFetchSuccessAction, TFailureAction, AreaActionType>(area, requestAction, successAction, _failureAction)
            }
         }
      },
      failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void) => {
         const _name = area.namePrefix + name + area.fetchPostfix[2]
         const _failureAction = produceMethodEmptyAction(name, _name, failureProducer, area.interceptFailure, area.actionCreatorInterceptor)
         return finalizeChain<TState, TStandardFailureAction, TFetchRequestAction, TFetchSuccessAction, EmptyAction<AreaActionType>, AreaActionType>(area, requestAction, successAction, _failureAction)
      }
   })
}

const finalizeChain = <TState, TStandardFailureAction extends Func, TFetchRequestAction extends Func, TFetchSuccessAction extends Func, TFetchFailureAction extends Func, AreaActionType>(
   area: Area<TState, TStandardFailureAction, AreaActionType>,
   requestAction: AreaAction<TState, TFetchRequestAction, AreaActionType>,
   successAction: AreaAction<TState, TFetchSuccessAction, AreaActionType>,
   failureAction: AreaAction<TState, TFetchFailureAction, AreaActionType>
) => {
   area.actions.push(requestAction as unknown as ReduxAction)
   area.actions.push(successAction as unknown as ReduxAction)
   area.actions.push(failureAction as unknown as ReduxAction)
   return {
      request: requestAction,
      success: successAction,
      failure: failureAction
   } as FetchAreaAction<TState, TFetchRequestAction, TFetchSuccessAction, TFetchFailureAction, AreaActionType>
}

interface ICreateReduxAreaOptions<TState, AreaActionType> {
   namePrefix?: string,
   fetchPostfix?: string[]
   interceptNormal?: TIntercept<TState, AreaActionType>
   interceptRequest?: TIntercept<TState, AreaActionType>
   interceptSuccess?: TIntercept<TState, AreaActionType>
   interceptFailure?: TIntercept<TState, AreaActionType>
}

class Area<TState, TStandardFailureAction extends Func, AreaActionType> {
   namePrefix = ''
   fetchPostfix = ['Request', 'Success', 'Failure']
   interceptNormal?: TIntercept<TState, AreaActionType> = undefined
   interceptRequest?: TIntercept<TState, AreaActionType> = undefined
   interceptSuccess?: TIntercept<TState, AreaActionType> = undefined
   interceptFailure?: TIntercept<TState, AreaActionType> = undefined

   actions: ReduxAction[] = []

   constructor(
      public initialState: TState,
      public standardFailureAction?: TStandardFailureAction,
      public standardFailureReducer?: (draft: Draft<TState>, action: ReturnTypeAction<TStandardFailureAction, AreaActionType>) => void,
      public actionCreatorInterceptor?: ActionCreatorInterceptor<AreaActionType>
   ) {
   }

   public rootReducer() {
      return (state: TState = this.initialState, action: AnyAction) => {
         const actionArea = this.actions.find(x => x.name === action.type)
         if (actionArea) {
            if (actionArea.intercept) {
               state = actionArea.intercept(state, action)
            }
            return actionArea.reducer(state, action)
         }
         return state
      }
   }

   /**
    * Add a single action. \
    * Optional 'interceptNormal' in options will effect this. \
    * You can omit 'action' if its not needed. \
    * 'produce' uses [immer](https://immerjs.github.io/immer/docs/introduction) (always recommended) \
    * 'reducer' will create a normal reducer
    * @param name 
    */
   public add(name: string) {
      const _name = this.namePrefix + name
      return ({
         produce: (producer: (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void) => {
            const mappedAction = produceMethodEmptyAction(name, _name, producer, this.interceptNormal, this.actionCreatorInterceptor)
            this.actions.push(mappedAction as unknown as ReduxAction)
            return mappedAction
         },
         reducer: (
            reducer: (state: TState, reducerAction: EmptyActionType<AreaActionType>) => any | void
         ) => {
            const mappedAction = reduceMethodEmpty<TState, AreaActionType>(_name, reducer, this.interceptNormal)
            this.actions.push(mappedAction as unknown as ReduxAction)
            return mappedAction
         },
         action: <TAction extends Func>(action: TAction) => {
            type MappedAction = ReturnTypeAction<TAction, AreaActionType>
            return {
               produce: (producer: (draft: Draft<TState>, action: MappedAction) => void) => {
                  const mappedAction = produceMethod(name, _name, action, producer, this.interceptNormal, this.actionCreatorInterceptor)
                  this.actions.push(mappedAction as unknown as ReduxAction)
                  return mappedAction
               },
               reducer: (
                  reducer: (state: TState, reducerAction: MappedAction) => any | void
               ) => {
                  const mappedAction = reduceMethod(action, reducer, this.interceptNormal)
                  this.actions.push(mappedAction as unknown as ReduxAction)
                  return mappedAction
               }
            }
         }
      })
   }

   /**
    * Add 3 action (Request, success and failure). \
    * Optional 'interceptRequest', 'interceptSuccess' and 'interceptFailure' in options will effect this. \
    * You can omit any 'action' and/or 'produce' if its not needed. (expect one of the final standardFailure of produceFailure) \
    * @param name 
    */
   public addFetch(name: string) {
      return createRequestChain<TState, TStandardFailureAction, AreaActionType>(this, name)
   }

   public options(options: ICreateReduxAreaOptions<TState, AreaActionType>) {
      if (options.namePrefix !== undefined) {
         this.namePrefix = options.namePrefix
      }
      if (options.fetchPostfix !== undefined) {
         this.fetchPostfix = options.fetchPostfix
      }
      if (options.interceptNormal !== undefined) {
         this.interceptNormal = options.interceptNormal
      }
      if (options.interceptRequest !== undefined) {
         this.interceptRequest = options.interceptRequest
      }
      if (options.interceptSuccess !== undefined) {
         this.interceptSuccess = options.interceptSuccess
      }
      if (options.interceptFailure !== undefined) {
         this.interceptFailure = options.interceptFailure
      }
      return this
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
   public setStandardFetchFailure<TNewStandardAction extends Func>(
      action: TNewStandardAction,
      producer: (draft: Draft<TState>, action: ReturnTypeAction<TNewStandardAction, AreaActionType>) => void
   ) {
      const a = new Area<TState, TNewStandardAction, AreaActionType>(
         this.initialState,
         action,
         producer,
         this.actionCreatorInterceptor
      )
      a.interceptNormal = this.interceptNormal as TIntercept<TState, AreaActionType> | undefined
      a.interceptFailure = this.interceptFailure as TIntercept<TState, AreaActionType> | undefined
      a.interceptRequest = this.interceptRequest as TIntercept<TState, AreaActionType> | undefined
      a.interceptSuccess = this.interceptSuccess as TIntercept<TState, AreaActionType> | undefined
      a.namePrefix = this.namePrefix
      a.fetchPostfix = [...this.fetchPostfix]
      return a
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
   public addActionCreatorInterception<TNewAreaActionType extends any>(
      interceptor: ActionCreatorInterceptor<TNewAreaActionType>,
   ) {
      const b = new Area<TState, TStandardFailureAction, TNewAreaActionType>(
         this.initialState,
         this.standardFailureAction,
         this.standardFailureReducer,
         interceptor
      )
      b.interceptNormal = this.interceptNormal as TIntercept<TState, TNewAreaActionType> | undefined
      b.interceptFailure = this.interceptFailure as TIntercept<TState, TNewAreaActionType> | undefined
      b.interceptRequest = this.interceptRequest as TIntercept<TState, TNewAreaActionType> | undefined
      b.interceptSuccess = this.interceptSuccess as TIntercept<TState, TNewAreaActionType> | undefined
      b.namePrefix = this.namePrefix
      b.fetchPostfix = [...this.fetchPostfix]
      return b
   }

}


// -----------
const CreateReduxArea = <TState>(initialState: TState) => {
   return new Area(initialState)
}

export default CreateReduxArea
