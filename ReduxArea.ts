import produce, { Draft, Immutable } from "immer"
import { AnyAction, Reducer } from 'redux'

type Func = (...args: any) => any
type ReduxAction = ((...args: any) => AnyAction) & { name: string; reducer: Reducer; intercept?: Reducer }
type ReduxAreaAnyAction = { type: string, shortType: string }
type EmptyActionType<AreaActionType> = ReduxAreaAnyAction & AreaActionType
type EmptyAction<AreaActionType> = () => EmptyActionType<AreaActionType>
type ReturnTypeAction<T extends Func, AreaActionType> = ReturnType<T> & EmptyActionType<AreaActionType>
type ActionCreatorInterceptor<AreaActionType> = (act: ReduxAreaAnyAction) => AreaActionType

export type FetchAreaAction<TAppState, TAreaState, TFetchAction extends Func, TSuccessAction extends Func, TFailureAction extends Func, AreaActionType> = {
   request: AreaAction<TAppState, TAreaState, TFetchAction, AreaActionType>
   success: AreaAction<TAppState, TAreaState, TSuccessAction, AreaActionType>
   failure: AreaAction<TAppState, TAreaState, TFailureAction, AreaActionType>
}
export type TIntercept<TState, AreaActionType> = (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void

export type AreaAction<TAppState, TAreaState, T extends Func, AreaActionType> = ((...args: Parameters<T>) => ReturnTypeAction<T, AreaActionType>) & {
   name: string,
   reducer: Reducer<Immutable<TAppState & TAreaState>, ReturnTypeAction<T, AreaActionType>>,
   //   intercept?: TIntercept<TAppState & TAreaState, AreaActionType>,
   use: (draft: Draft<TAppState & TAreaState>, action: ReturnTypeAction<T, AreaActionType>) => void,
   type: ReturnTypeAction<T, AreaActionType>
}

const produceMethod = <
   // Area stuff
   TAppState,
   TAppFailureAction extends Func,
   TAppActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   // Other stuff
   TAction extends Func,
   >(
      shortName: string,
      name: string,
      action: TAction,
      producer: (draft: Draft<TAppState & TAreaState>, action: ReturnTypeAction<TAction, TAppActionType & TAreaActionType>) => void,
      appIntercept?: TIntercept<TAppState, TAppActionType>[],
      areaIntercept?: TIntercept<TAppState & TAreaState, TAppActionType & TAreaActionType>[],
      appActionIntercept?: TIntercept<TAppState, TAppActionType>[],
      areaActionIntercept?: TIntercept<TAppState & TAreaState, TAppActionType & TAreaActionType>[],
) => {
   const actionCreator = (...args: Parameters<TAction>) => {
      let actionResult = action.apply(null, args)
      // if (area.appOptions.appActionInterceptor && area.areaOptions.actionInterceptor) {
      //    return {
      //       ...actionResult,
      //       type: name,
      //       shortType: shortName,
      //       ...area.appOptions.appActionInterceptor({
      //          ...actionResult,
      //          type: name,
      //          shortType: shortName,
      //       }),
      //       ...area.areaOptions.actionInterceptor({
      //          ...actionResult,
      //          type: name,
      //          shortType: shortName,
      //       })
      //    }
      // } else if (area.appOptions.appActionInterceptor) {
      //    return {
      //       ...actionResult,
      //       type: name,
      //       shortType: shortName,
      //       ...area.appOptions.appActionInterceptor({
      //          ...actionResult,
      //          type: name,
      //          shortType: shortName,
      //       })
      //    }
      // } else if (area.areaOptions.actionInterceptor) {
      //    return {
      //       ...actionResult,
      //       type: name,
      //       shortType: shortName,
      //       ...area.areaOptions.actionInterceptor({
      //          ...actionResult,
      //          type: name,
      //          shortType: shortName,
      //       })
      //    }
      // } else {
      //    return {
      //       ...actionResult,
      //       type: name,
      //       shortType: shortName,
      //    }
      // }
      return {
         ...actionResult,
         type: name,
         shortType: shortName,
      }
   }
   const mappedAction = actionCreator as AreaAction<TAppState, TAreaState, TAction, TAppActionType & TAreaActionType>
   Object.defineProperty(mappedAction, 'name', {
      value: name,
      writable: false
   })
   if (appIntercept && areaIntercept) {
      Object.defineProperty(mappedAction, 'reducer', {
         value: (state: TAppState & TAreaState, action: ReturnTypeAction<TAction, TAppActionType & TAreaActionType>) => produce(draft => {
            producer(draft, action)
            appIntercept.forEach(inter => inter(draft, action as unknown as EmptyActionType<TAppActionType>))
            areaIntercept.forEach(inter => inter(draft, action as unknown as EmptyActionType<TAppActionType & TAreaActionType>))
         }) as Reducer<Immutable<TAppState & TAreaState>, ReturnTypeAction<TAction, TAppActionType & TAreaActionType>>,
         writable: false
      })
   } else {
      Object.defineProperty(mappedAction, 'reducer', {
         value: produce(producer) as Reducer<Immutable<TAppState & TAreaState>, ReturnTypeAction<TAction, TAppActionType & TAreaActionType>>,
         writable: false
      })
   }

   Object.defineProperty(mappedAction, 'use', {
      value: (draft: Draft<TAppState & TAreaState>, action: ReturnType<TAction>) => {
         action.type = mappedAction.name
         producer(draft, action)
      },
      writable: false
   })
   return mappedAction
}

const produceMethodEmptyAction = <
   // Area stuff
   TAppState,
   TAppFailureAction extends Func,
   TAppActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   >(
      shortName: string,
      name: string,
      producer: (draft: Draft<TAppState & TAreaState>, action: EmptyActionType<TAppActionType & TAreaActionType>) => void,
      appIntercept?: TIntercept<TAppState, TAppActionType>[],
      areaIntercept?: TIntercept<TAppState & TAreaState, TAreaActionType>[],
      appActionIntercept?: TIntercept<TAppState, TAppActionType>[],
      areaActionIntercept?: TIntercept<TAppState & TAreaState, TAppActionType & TAreaActionType>[],
) => {
   const mappedAction = (() => ({})) as () => EmptyActionType<TAppActionType & TAreaActionType>
   return produceMethod<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, typeof mappedAction>(
      shortName, name, mappedAction, producer, appIntercept, areaIntercept
   )
}

const produceMethodEmptyProducer = <
   // Area stuff
   TAppState,
   TAppFailureAction extends Func,
   TAppActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   // Other stuff
   TAction extends Func
>(
   shortName: string,
   name: string,
   mappedAction: TAction,
   appIntercept?: TIntercept<TAppState, TAppActionType>[],
   areaIntercept?: TIntercept<TAppState & TAreaState, TAreaActionType>[],
   appActionIntercept?: TIntercept<TAppState, TAppActionType>[],
   areaActionIntercept?: TIntercept<TAppState & TAreaState, TAppActionType & TAreaActionType>[],
) => {
   const producer = ((draft, action) => { }) as (draft: Draft<TAppState & TAreaState>, action: EmptyActionType<TAppActionType & TAreaActionType>) => void
   return produceMethod<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, typeof mappedAction>(
      shortName, name, mappedAction, producer, appIntercept, areaIntercept
   )
}

const produceMethodDoubleEmpty = <
   // Area stuff
   TAppState,
   TAppFailureAction extends Func,
   TAppActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   // Other stuff
   >(
      shortName: string,
      name: string,
      appIntercept?: TIntercept<TAppState, TAppActionType>[],
      areaIntercept?: TIntercept<TAppState & TAreaState, TAreaActionType>[],
      appActionIntercept?: TIntercept<TAppState, TAppActionType>[],
      areaActionIntercept?: TIntercept<TAppState & TAreaState, TAppActionType & TAreaActionType>[],
) => {
   const mappedAction = (() => ({})) as () => EmptyActionType<TAppActionType & TAreaActionType>
   const producer = ((draft, action) => { }) as (draft: Draft<TAppState & TAreaState>, action: EmptyActionType<TAppActionType & TAreaActionType>) => void
   return produceMethod<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, typeof mappedAction>(
      shortName, name, mappedAction, producer, appIntercept, areaIntercept
   )
}

const reduceMethod = <TState, T extends Func, TAction, AreaActionType>(
   mappedAction: T,
   reducer: (state: TState, reducerAction: TAction) => TState,
) => {
   Object.defineProperty(mappedAction, 'reducer', {
      value: reducer as Reducer<TState, ReturnTypeAction<T, AreaActionType>>,
      writable: false
   })
   return mappedAction
}

const reduceMethodEmpty = <TState, AreaActionType>(
   name: string,
   reducer: (state: TState, reducerAction: EmptyActionType<AreaActionType>) => TState,
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
   return mappedAction
}

// --------- AddFetch Flow ---------
// Request chain:
const createRequestChain = <
   TAppState,
   TAppFailureAction extends Func,
   TAppActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   >(
      area: Area<
         TAppState,
         TAppFailureAction,
         TAppActionType,
         TAreaState,
         TAreaFailureAction,
         TAreaActionType
      >,
      name: string
   ) => {
   const requestName = area.getRequestName(name)
   const successName = area.getSuccessName(name)
   const doubleEmptyRequestAction = produceMethodDoubleEmpty<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType>(
      name, requestName, area.appOptions.interceptRequest, area.areaOptions.interceptRequest
   )
   const doubleEmptySuccessAction = produceMethodDoubleEmpty<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType>(
      name, successName, area.appOptions.interceptSuccess, area.areaOptions.interceptSuccess
   )
   return ({
      action: <TFetchAction extends Func>(action: TFetchAction) => {
         const emptyProducer = produceMethodEmptyProducer<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchAction>(
            name, requestName, action, area.appOptions.interceptRequest, area.areaOptions.interceptRequest
         )
         return {
            produce: (producer: (draft: Draft<TAppState & TAreaState>, action: ReturnTypeAction<TFetchAction, TAppActionType & TAreaActionType>) => void) => {
               const mappedAction = produceMethod<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchAction>(
                  name, requestName, action, producer, area.appOptions.interceptRequest, area.areaOptions.interceptRequest
               )
               return createSuccessChain<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchAction>(
                  area, name, mappedAction
               )
            },
            ...createSuccessChain<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchAction>(
               area, name, emptyProducer
            ),
            ...createFailureChain<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchAction, EmptyAction<TAppActionType & TAreaActionType>>(
               area, name, emptyProducer, doubleEmptySuccessAction
            ),
         }
      },
      produce: (producer: (draft: Draft<TAppState & TAreaState>, action: EmptyActionType<TAppActionType & TAreaActionType>) => void) => {
         const mappedAction = produceMethodEmptyAction<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType>(
            name, requestName, producer, area.appOptions.interceptRequest, area.areaOptions.interceptRequest
         )
         return createSuccessChain<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, () => EmptyActionType<TAppActionType & TAreaActionType>>(
            area, name, mappedAction
         )
      },
      ...createSuccessChain<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, EmptyAction<TAppActionType & TAreaActionType>>(
         area, name, doubleEmptyRequestAction
      ),
      ...createFailureChain<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, EmptyAction<TAppActionType & TAreaActionType>, EmptyAction<TAppActionType & TAreaActionType>>(
         area, name, doubleEmptyRequestAction, doubleEmptySuccessAction
      ),
   })
}

// Success chain:
const createSuccessChain = <
   // Area stuff
   TAppState,
   TAppFailureAction extends Func,
   TAppActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   // Other stuff
   TFetchRequestAction extends Func,
   >(
      area: Area<
         TAppState,
         TAppFailureAction,
         TAppActionType,
         TAreaState,
         TAreaFailureAction,
         TAreaActionType
      >,
      name: string,
      requestAction: AreaAction<TAppState, TAreaState, TFetchRequestAction, TAppActionType & TAreaActionType>
   ) => {
   const successName = area.getSuccessName(name)
   const doubleEmptyAction = produceMethodDoubleEmpty<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType>(
      name, successName, area.appOptions.interceptSuccess, area.areaOptions.interceptSuccess
   )
   return ({
      successAction: <TSuccessAction extends Func>(successAction: TSuccessAction) => {
         const emptyProducer = produceMethodEmptyProducer<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TSuccessAction>(
            name, successName, successAction, area.appOptions.interceptSuccess, area.areaOptions.interceptSuccess
         )
         return {
            successProduce: (successProducer: (draft: Draft<TAppState & TAreaState>, action: ReturnTypeAction<TSuccessAction, TAppActionType & TAreaActionType>) => void) => {
               let _successAction = produceMethod<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TSuccessAction>(
                  name, successName, successAction, successProducer, area.appOptions.interceptSuccess, area.areaOptions.interceptSuccess
               )
               return createFailureChain<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchRequestAction, TSuccessAction>(
                  area, name, requestAction, _successAction
               )
            },
            ...createFailureChain<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchRequestAction, TSuccessAction>(
               area, name, requestAction, emptyProducer
            ),
         }
      },
      successProduce: (successProducer: (draft: Draft<TAppState & TAreaState>, action: EmptyActionType<TAppActionType & TAreaActionType>) => void) => {
         const fetchSuccessAction = produceMethodEmptyAction<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType>(
            name, successName, successProducer, area.appOptions.interceptSuccess, area.areaOptions.interceptSuccess
         )
         return createFailureChain<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchRequestAction, EmptyAction<TAppActionType & TAreaActionType>>(
            area, name, requestAction, fetchSuccessAction
         )
      },
      ...createFailureChain<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchRequestAction, EmptyAction<TAppActionType & TAreaActionType>>(
         area, name, requestAction, doubleEmptyAction
      )
   })
}

// Failure chain:
const createFailureChain = <
   // Area stuff
   TAppState,
   TAppFailureAction extends Func,
   TAppActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   // Other stuff
   TFetchRequestAction extends Func,
   TFetchSuccessAction extends Func,
   >(
      area: Area<
         TAppState,
         TAppFailureAction,
         TAppActionType,
         TAreaState,
         TAreaFailureAction,
         TAreaActionType
      >,
      name: string,
      requestAction: AreaAction<TAppState, TAreaState, TFetchRequestAction, TAppActionType & TAreaActionType>,
      successAction: AreaAction<TAppState, TAreaState, TFetchSuccessAction, TAppActionType & TAreaActionType>
   ) => {
   let failureName = area.getFailureName(name)
   return ({
      appFailure: () => {
         if (area.appOptions.appFailureAction && area.appOptions.appFailureProducer) {
            let failureAction = produceMethod<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TAppFailureAction>(
               name, failureName, area.appOptions.appFailureAction, area.appOptions.appFailureProducer, area.appOptions.interceptFailure, area.areaOptions.interceptFailure
            )
            return finalizeChain<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchRequestAction, TFetchSuccessAction, TAppFailureAction>(
               area, requestAction, successAction, failureAction
            )
         }
         throw new Error(`redux-area fetch method: ${name} tried to call appFailureAction/appFailureReducer, but the app didn't have one. Declare it with Redux-area App settings`)
      },
      areaFailure: () => {
         if (area.areaOptions.areaFailureAction && area.areaOptions.areaFailureProducer) {
            let failureAction = produceMethod<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TAreaFailureAction>(
               name, failureName, area.areaOptions.areaFailureAction, area.areaOptions.areaFailureProducer, area.appOptions.interceptFailure, area.areaOptions.interceptFailure
            )
            return finalizeChain<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchRequestAction, TFetchSuccessAction, TAreaFailureAction>(
               area, requestAction, successAction, failureAction
            )
         }
         throw new Error(`redux-area fetch method: ${name} tried to call areaFailureAction/areaFailureReducer, but the area didn't have one. Declare it with Redux-area area settings`)
      },
      failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
         return {
            failureProduce: (failureProducer: (draft: Draft<TAppState & TAreaState>, action: ReturnTypeAction<TFailureAction, TAppActionType & TAreaActionType>) => void) => {
               const _failureAction = produceMethod<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFailureAction>(
                  name, failureName, failureAction, failureProducer, area.appOptions.interceptFailure, area.areaOptions.interceptFailure
               )
               return finalizeChain<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchRequestAction, TFetchSuccessAction, TFailureAction>(
                  area, requestAction, successAction, _failureAction
               )
            }
         }
      },
      failureProduce: (failureProducer: (draft: Draft<TAppState & TAreaState>, action: EmptyActionType<TAppActionType & TAreaActionType>) => void) => {
         const _failureAction = produceMethodEmptyAction<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType>(
            name, failureName, failureProducer, area.appOptions.interceptFailure, area.areaOptions.interceptFailure
         )
         return finalizeChain<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchRequestAction, TFetchSuccessAction, EmptyAction<TAppActionType & TAreaActionType>>(
            area, requestAction, successAction, _failureAction
         )
      }
   })
}

const finalizeChain = <
   // Area stuff
   TAppState,
   TAppFailureAction extends Func,
   TAppActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   // Other stuff
   TFetchRequestAction extends Func,
   TFetchSuccessAction extends Func,
   TFetchFailureAction extends Func,
   >(
      area: Area<
         TAppState,
         TAppFailureAction,
         TAppActionType,
         TAreaState,
         TAreaFailureAction,
         TAreaActionType
      >,
      requestAction: AreaAction<TAppState, TAreaState, TFetchRequestAction, TAppActionType & TAreaActionType>,
      successAction: AreaAction<TAppState, TAreaState, TFetchSuccessAction, TAppActionType & TAreaActionType>,
      failureAction: AreaAction<TAppState, TAreaState, TFetchFailureAction, TAppActionType & TAreaActionType>
   ) => {
   area.actions.push(requestAction as unknown as ReduxAction)
   area.actions.push(successAction as unknown as ReduxAction)
   area.actions.push(failureAction as unknown as ReduxAction)
   return {
      request: requestAction,
      success: successAction,
      failure: failureAction
   } as FetchAreaAction<TAppState, TAreaState, TFetchRequestAction, TFetchSuccessAction, TFetchFailureAction, TAppActionType & TAreaActionType>
}


class Area<
   TAppState,
   TAppFailureAction extends Func,
   TAppActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   > {
   actions: ReduxAction[] = []
   initialState: TAppState & TAreaState
   namePrefix: string
   requestNamePostfix: string
   successNamePostfix: string
   failureNamePostfix: string

   constructor(
      public appOptions: IAppAreaOptions<TAppState, TAppFailureAction, TAppActionType>,
      public areaOptions: IAreaOptions<TAppState, TAreaState, TAreaFailureAction, TAreaActionType>
   ) {
      this.namePrefix = this.appOptions.appNamePrefix + this.areaOptions.namePrefix
      if (this.appOptions.fetchPostfix) {
         this.requestNamePostfix = this.appOptions.fetchPostfix[0]
         this.successNamePostfix = this.appOptions.fetchPostfix[1]
         this.failureNamePostfix = this.appOptions.fetchPostfix[2]
      } else {
         this.requestNamePostfix = 'Request'
         this.successNamePostfix = 'Success'
         this.failureNamePostfix = 'Failure'
      }
      this.initialState = {
         ...appOptions.appState,
         ...areaOptions.state
      }
   }

   public getRequestName(name: string) {
      return this.namePrefix + name + this.requestNamePostfix
   }

   public getSuccessName(name: string) {
      return this.namePrefix + name + this.successNamePostfix
   }

   public getFailureName(name: string) {
      return this.namePrefix + name + this.failureNamePostfix
   }

   public rootReducer() {
      return (state: TAreaState = this.initialState, action: AnyAction) => {
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
         produce: (producer: (draft: Draft<TAreaState>, action: EmptyActionType<TAreaActionType>) => void) => {
            const mappedAction = produceMethodEmptyAction<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType>(
               name, _name, producer, this.appOptions.interceptNormal, this.areaOptions.interceptNormal
            )
            this.actions.push(mappedAction as unknown as ReduxAction)
            return mappedAction
         },
         reducer: (
            reducer: (state: TAreaState, reducerAction: EmptyActionType<TAreaActionType>) => any | void
         ) => {
            const mappedAction = reduceMethodEmpty<TAreaState, TAreaActionType>(_name, reducer)
            this.actions.push(mappedAction as unknown as ReduxAction)
            return mappedAction
         },
         action: <TAction extends Func>(action: TAction) => {
            type MappedAction = ReturnTypeAction<TAction, TAreaActionType>
            return {
               produce: (producer: (draft: Draft<TAreaState>, action: MappedAction) => void) => {
                  const mappedAction = produceMethod<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType, TAction>(
                     name, _name, action, producer, this.appOptions.interceptNormal, this.areaOptions.interceptNormal
                  )
                  this.actions.push(mappedAction as unknown as ReduxAction)
                  return mappedAction
               },
               reducer: (
                  reducer: (state: TAreaState, reducerAction: MappedAction) => any | void
               ) => {
                  const mappedAction = reduceMethod(action, reducer)
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
    * You can omit any 'action' and/or 'produce' if its not needed. (expect one of the final areaFailure of produceFailure) \
    * @param name
    */
   public addFetch(name: string) {
      return createRequestChain<TAppState, TAppFailureAction, TAppActionType, TAreaState, TAreaFailureAction, TAreaActionType>(this, name)
   }
}


interface IAppAreaOptions<
   TAppAreaState,
   TAppStandardFailure extends Func,
   TAppAreaActionType extends any
   > {
   appNamePrefix: string,
   appState: TAppAreaState
   appFailureAction?: TAppStandardFailure,
   appFailureProducer?: (draft: Draft<TAppAreaState>, action: ReturnType<TAppStandardFailure>) => void
   appActionInterceptor?: ActionCreatorInterceptor<TAppAreaActionType>
   fetchPostfix?: string[]
   interceptNormal?: TIntercept<TAppAreaState, TAppAreaActionType>[]
   interceptRequest?: TIntercept<TAppAreaState, TAppAreaActionType>[]
   interceptSuccess?: TIntercept<TAppAreaState, TAppAreaActionType>[]
   interceptFailure?: TIntercept<TAppAreaState, TAppAreaActionType>[]
}

interface IAreaOptions<
   TAppState,
   TAreaState,
   TAreaStandardFailure extends Func,
   TAreaActionType extends any,
   TTotalState = TAppState & TAreaState
   > {
   areaFailureAction?: TAreaStandardFailure,
   areaFailureProducer?: (draft: Draft<TTotalState>, action: ReturnType<TAreaStandardFailure>) => void,

   actionInterceptor?: ActionCreatorInterceptor<TAreaActionType>,
   namePrefix: string,
   state: TAreaState,
   interceptNormal?: TIntercept<TTotalState, TAreaActionType>[]
   interceptRequest?: TIntercept<TTotalState, TAreaActionType>[]
   interceptSuccess?: TIntercept<TTotalState, TAreaActionType>[]
   interceptFailure?: TIntercept<TTotalState, TAreaActionType>[]
}

class AppArea<TAppState, TAppFailureAction extends Func, TAreaActionType extends any>{
   constructor(
      public appOptions: IAppAreaOptions<TAppState, TAppFailureAction, TAreaActionType>
   ) {
   }
   public AddArea<TAreaState, TAreaStandardFailure extends Func, TAreaActionType extends any>(
      areaOptions: IAreaOptions<TAppState, TAreaState, TAreaStandardFailure, TAreaActionType>
   ) {
      return new Area(
         this.appOptions,
         areaOptions
      )
   }
}

export var BaseGlobal = (appName = "App") => new AppArea({
   appNamePrefix: "@@" + appName,
   appState: {
      loading: false,
      loadingMap: {} as { [key: string]: boolean },
      error: undefined as Error | undefined,
      errorMessage: ''
   },
   appFailureAction: (error: Error) => ({ error }),
   appFailureProducer: ((draft, { error }) => {
      draft.error = error
      draft.errorMessage = error.message
   }),
   appActionInterceptor: (act: ReduxAreaAnyAction) => ({}),
   interceptRequest: [(draft, { shortType }) => {
      draft.loading = true
      draft.loadingMap[shortType] = true
   }],
   interceptSuccess: [(draft, { shortType }) => {
      draft.loading = false
      draft.loadingMap[shortType] = false
   }],
   interceptFailure: [(draft, action) => {
      draft.loading = false
      draft.loadingMap[action.shortType] = false
   }]
})

export default AppArea
