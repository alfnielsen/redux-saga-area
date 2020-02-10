import produce, { Draft, Immutable } from "immer"
import { AnyAction, Reducer } from 'redux'

type Func = (...args: any) => any
type ReduxAction = ((...args: any) => AnyAction) & { name: string; reducer: Reducer; intercept?: Reducer }
type EmptyActionType = { type: string }
type EmptyAction = () => EmptyActionType
type ReturnTypeAction<T extends Func> = ReturnType<T> & EmptyActionType

export type FetchAreaAction<TState, TFetchAction extends Func, TSuccessAction extends Func, TFailureAction extends Func> = {
   request: AreaAction<TState, TFetchAction>
   success: AreaAction<TState, TSuccessAction>
   failure: AreaAction<TState, TFailureAction>
}
export type TIntercept<TState> = (draft: Draft<TState>, action: EmptyActionType) => void

export type AreaAction<TState, T extends Func> = ((...args: Parameters<T>) => ReturnTypeAction<T>) & {
   name: string,
   reducer: Reducer<Immutable<TState>, ReturnTypeAction<T>>,
   intercept?: (draft: Draft<TState>, action: EmptyActionType) => void,
   use: (draft: Draft<TState>, action: ReturnType<T>) => void,
   type: ReturnTypeAction<T>
}

const produceMethod = <TState, TAction extends Func>(
   name: string,
   action: TAction,
   producer: (draft: Draft<TState>, action: ReturnTypeAction<TAction>) => void,
   intercept?: (draft: Draft<TState>, action: EmptyActionType) => void,
) => {
   const actionCreator = (...args: Parameters<TAction>) => ({
      ...action.apply(null, args),
      type: name
   })
   const mappedAction = actionCreator as AreaAction<TState, TAction>
   Object.defineProperty(mappedAction, 'name', {
      value: name,
      writable: false
   })
   Object.defineProperty(mappedAction, 'reducer', {
      value: produce(producer) as Reducer<Immutable<TState>, ReturnTypeAction<TAction>>,
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
         value: produce(intercept) as Reducer<Immutable<TState>, EmptyActionType>,
         writable: false
      })
   }
   return mappedAction
}

const produceMethodEmptyAction = <TState>(
   name: string,
   producer: (draft: Draft<TState>, action: EmptyActionType) => void,
   intercept?: (draft: Draft<TState>, action: EmptyActionType) => void
) => {
   const mappedAction = (() => ({})) as () => EmptyActionType
   return produceMethod(name, mappedAction, producer, intercept)
}

const produceMethodEmptyProducer = <TState, TAction extends Func>(
   name: string,
   mappedAction: TAction,
   intercept?: (draft: Draft<TState>, action: EmptyActionType) => void
) => {
   const producer = ((draft, action) => { }) as (draft: Draft<TState>, action: EmptyActionType) => void
   return produceMethod(name, mappedAction, producer, intercept)
}

const produceMethodDoubleEmpty = <TState>(
   name: string,
   intercept?: (draft: Draft<TState>, action: EmptyActionType) => void
) => {
   const mappedAction = (() => ({})) as () => EmptyActionType
   const producer = ((draft, action) => { }) as (draft: Draft<TState>, action: EmptyActionType) => void
   return produceMethod(name, mappedAction, producer, intercept)
}

const reduceMethod = <TState, T extends Func, TAction>(
   mappedAction: T,
   reducer: (state: TState, reducerAction: TAction) => TState,
   intercept?: (draft: Draft<TState>, action: EmptyActionType) => void
) => {
   Object.defineProperty(mappedAction, 'reducer', {
      value: reducer as Reducer<TState, ReturnTypeAction<T>>,
      writable: false
   })
   if (intercept) {
      Object.defineProperty(mappedAction, 'intercept', {
         value: produce(intercept) as Reducer<Immutable<TState>, EmptyActionType>,
         writable: false
      })
   }
   return mappedAction
}

const reduceMethodEmpty = <TState>(
   name: string,
   reducer: (state: TState, reducerAction: EmptyActionType) => TState,
   intercept?: (draft: Draft<TState>, action: EmptyActionType) => void
) => {
   const mappedAction = (() => ({ type: name })) as unknown as (() => EmptyActionType) & {
      name: string,
      reducer: Reducer<Immutable<TState>, EmptyActionType>
      type: EmptyActionType
   }
   if (!mappedAction.reducer) {
      Object.defineProperty(mappedAction, 'reducer', {
         value: reducer as Reducer<TState, EmptyActionType>,
         writable: false
      })
   }
   Object.defineProperty(mappedAction, 'name', {
      value: name,
      writable: false
   })
   if (intercept) {
      Object.defineProperty(mappedAction, 'intercept', {
         value: produce(intercept) as Reducer<Immutable<TState>, EmptyActionType>,
         writable: false
      })
   }
   return mappedAction
}

// --------- AddFetch Flow ---------
// Request chain:
const createRequestChain = <TState, TStandardFailureAction extends Func>(area: Area<TState, TStandardFailureAction>, name: string) => {
   const requestName = area.namePrefix + name + area.fetchPostfix[0]
   const successName = area.namePrefix + name + area.fetchPostfix[1]
   const doubleEmptyRequestAction = produceMethodDoubleEmpty(requestName, area.interceptRequest)
   const doubleEmptySuccessAction = produceMethodDoubleEmpty(successName, area.interceptRequest)
   return ({
      action: <TFetchAction extends Func>(action: TFetchAction) => {
         const emptyProducer = produceMethodEmptyProducer(requestName, action, area.interceptRequest)
         return {
            produce: (producer: (draft: Draft<TState>, action: ReturnTypeAction<TFetchAction>) => void) => {
               const mappedAction = produceMethod(requestName, action, producer, area.interceptRequest)
               return createSuccessChain<TState, TStandardFailureAction, TFetchAction>(area, name, mappedAction)
            },
            ...createSuccessChain<TState, TStandardFailureAction, TFetchAction>(area, name, emptyProducer),
            ...createFailureChain<TState, TStandardFailureAction, TFetchAction, EmptyAction>(area, name, emptyProducer, doubleEmptySuccessAction),
         }
      },
      produce: (producer: (draft: Draft<TState>, action: EmptyActionType) => void) => {
         const mappedAction = produceMethodEmptyAction(area.namePrefix + name + area.fetchPostfix[0], producer, area.interceptRequest)
         return createSuccessChain<TState, TStandardFailureAction, () => EmptyActionType>(area, name, mappedAction)
      },
      ...createSuccessChain<TState, TStandardFailureAction, EmptyAction>(area, name, doubleEmptyRequestAction),
      ...createFailureChain<TState, TStandardFailureAction, EmptyAction, EmptyAction>(area, name, doubleEmptyRequestAction, doubleEmptySuccessAction),
   })
}

// Success chain:
const createSuccessChain = <TState, TStandardFailureAction extends Func, TFetchRequestAction extends Func>(
   area: Area<TState, TStandardFailureAction>,
   name: string,
   requestAction: AreaAction<TState, TFetchRequestAction>
) => {
   const successName = area.namePrefix + name + area.fetchPostfix[1]
   const failureName = area.namePrefix + name + area.fetchPostfix[2]
   const doubleFailureEmptyAction = produceMethodDoubleEmpty(failureName, area.interceptRequest)

   return ({
      successAction: <TSuccessAction extends Func>(successAction: TSuccessAction) => {
         const emptyProducer = produceMethodEmptyProducer(successName, successAction, area.interceptRequest)
         return {
            successProduce: (successProducer: (draft: Draft<TState>, action: ReturnTypeAction<TSuccessAction>) => void) => {
               let _successAction = produceMethod(successName, successAction, successProducer, area.interceptSuccess)
               return createFailureChain<TState, TStandardFailureAction, TFetchRequestAction, TSuccessAction>(area, name, requestAction, _successAction)
            },
            ...createFailureChain<TState, TStandardFailureAction, TFetchRequestAction, TSuccessAction>(area, name, requestAction, emptyProducer),
         }
      },
      successProduce: (successProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => {
         const fetchSuccessAction = produceMethodEmptyAction(successName, successProducer, area.interceptRequest)
         return createFailureChain<TState, TStandardFailureAction, TFetchRequestAction, EmptyAction>(area, name, requestAction, fetchSuccessAction)
      },
      ...createFailureChain<TState, TStandardFailureAction, TFetchRequestAction, EmptyAction>(area, name, requestAction, doubleFailureEmptyAction)
   })
}

// Failure chain:
const createFailureChain = <TState, TStandardFailureAction extends Func, TFetchRequestAction extends Func, TFetchSuccessAction extends Func>(
   area: Area<TState, TStandardFailureAction>,
   name: string,
   requestAction: AreaAction<TState, TFetchRequestAction>,
   successAction: AreaAction<TState, TFetchSuccessAction>
) => {
   let _name = area.namePrefix + name + area.fetchPostfix[2]
   return ({
      standardFailure: () => {
         if (area.standardFailureAction && area.standardFailureReducer) {
            let failureAction = produceMethod(_name, area.standardFailureAction, area.standardFailureReducer, area.interceptFailure)
            return finalizeChain<TState, TStandardFailureAction, TFetchRequestAction, TFetchSuccessAction, TStandardFailureAction>(area, requestAction, successAction, failureAction)
         }
         throw new Error(`redux-area fetch method: ${name} tried to call standardFailureAction/standardFailureReducer, but the area didn't have one. Declare it with area.setStandardFetchFailure(action, producer)!`)
      },
      failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
         return {
            failureProduce: (failureProducer: (draft: Draft<TState>, action: ReturnTypeAction<TFailureAction>) => void) => {
               const _failureAction = produceMethod(_name, failureAction, failureProducer, area.interceptFailure)
               return finalizeChain<TState, TStandardFailureAction, TFetchRequestAction, TFetchSuccessAction, TFailureAction>(area, requestAction, successAction, _failureAction)
            }
         }
      },
      failureProduce: (failureProducer: (draft: Draft<TState>, action: EmptyActionType) => void) => {
         const _name = area.namePrefix + name + area.fetchPostfix[2]
         const _failureAction = produceMethodEmptyAction(_name, failureProducer, area.interceptFailure)
         return finalizeChain<TState, TStandardFailureAction, TFetchRequestAction, TFetchSuccessAction, EmptyAction>(area, requestAction, successAction, _failureAction)
      }
   })
}

const finalizeChain = <TState, TStandardFailureAction extends Func, TFetchRequestAction extends Func, TFetchSuccessAction extends Func, TFetchFailureAction extends Func>(
   area: Area<TState, TStandardFailureAction>,
   requestAction: AreaAction<TState, TFetchRequestAction>,
   successAction: AreaAction<TState, TFetchSuccessAction>,
   failureAction: AreaAction<TState, TFetchFailureAction>
) => {
   area.actions.push(requestAction as unknown as ReduxAction)
   area.actions.push(successAction as unknown as ReduxAction)
   area.actions.push(failureAction as unknown as ReduxAction)
   return {
      request: requestAction,
      success: successAction,
      failure: failureAction
   } as FetchAreaAction<TState, TFetchRequestAction, TFetchSuccessAction, TFetchFailureAction>
}

interface ICreateReduxAreaOptions<TState> {
   namePrefix?: string,
   fetchPostfix?: string[]
   interceptNormal?: (draft: Draft<TState>, action: EmptyActionType) => void
   interceptRequest?: (draft: Draft<TState>, action: EmptyActionType) => void
   interceptSuccess?: (draft: Draft<TState>, action: EmptyActionType) => void
   interceptFailure?: (draft: Draft<TState>, action: EmptyActionType) => void
}

class Area<TState, TStandardFailureAction extends Func> {
   namePrefix = ''
   fetchPostfix = ['Request', 'Success', 'Failure']
   interceptNormal?: TIntercept<TState> = undefined
   interceptRequest?: TIntercept<TState> = undefined
   interceptSuccess?: TIntercept<TState> = undefined
   interceptFailure?: TIntercept<TState> = undefined

   actions: ReduxAction[] = []

   constructor(
      public initialState: TState,
      public standardFailureAction?: TStandardFailureAction,
      public standardFailureReducer?: (draft: Draft<TState>, action: ReturnTypeAction<TStandardFailureAction>) => void
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
         produce: (producer: (draft: Draft<TState>, action: EmptyActionType) => void) => {
            const mappedAction = produceMethodEmptyAction(_name, producer, this.interceptNormal)
            this.actions.push(mappedAction as unknown as ReduxAction)
            return mappedAction
         },
         reducer: (
            reducer: (state: TState, reducerAction: EmptyActionType) => any | void
         ) => {
            const mappedAction = reduceMethodEmpty(_name, reducer, this.interceptNormal)
            this.actions.push(mappedAction as ReduxAction)
            return mappedAction
         },
         action: <TAction extends Func>(action: TAction) => {
            type MappedAction = ReturnTypeAction<TAction>
            return {
               produce: (producer: (draft: Draft<TState>, action: MappedAction) => void) => {
                  const mappedAction = produceMethod(_name, action, producer, this.interceptNormal)
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
      return createRequestChain<TState, TStandardFailureAction>(this, name)
   }

   public options(options: ICreateReduxAreaOptions<TState>) {
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
   public setStandardFetchFailure<TFetchAction extends Func>(
      action: TFetchAction,
      producer: (draft: Draft<TState>, action: ReturnTypeAction<TFetchAction>) => void
   ) {
      const a = new Area<TState, TFetchAction>(
         this.initialState,
         action,
         producer
      )
      a.interceptNormal = this.interceptNormal
      a.interceptFailure = this.interceptFailure
      a.interceptRequest = this.interceptRequest
      a.interceptSuccess = this.interceptSuccess
      a.namePrefix = this.namePrefix
      a.fetchPostfix = [...this.fetchPostfix]
      return a
   }
}



// -----------
const CreateReduxArea = <TState>(initialState: TState) => {
   return new Area(initialState)
}

export default CreateReduxArea
