import produce, { Draft, Immutable } from "immer"
import { AnyAction, Reducer } from 'redux'

type Func = (...args: any) => any
type ReduxAction = ((...args: any) => AnyAction) & { name: string; reducer: Reducer; intercept?: Reducer }
type ReduxAreaAnyAction = { type: string, actionName: string }
type EmptyActionType<AreaActionType> = ReduxAreaAnyAction & AreaActionType
type EmptyAction<AreaActionType> = () => EmptyActionType<AreaActionType>
type ReturnTypeAction<T extends Func, AreaActionType> = ReturnType<T> & EmptyActionType<AreaActionType>
type ActionCreatorInterceptor<AreaActionType> = (act: ReduxAreaAnyAction) => AreaActionType

export type FetchAreaAction<TBaseState, TAreaState, TFetchAction extends Func, TSuccessAction extends Func, TFailureAction extends Func, AreaActionType> = {
   request: AreaAction<TBaseState, TAreaState, TFetchAction, AreaActionType>
   success: AreaAction<TBaseState, TAreaState, TSuccessAction, AreaActionType>
   failure: AreaAction<TBaseState, TAreaState, TFailureAction, AreaActionType>
   actionName: string
}
export type TIntercept<TState, AreaActionType> = (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void

export type AreaAction<TBaseState, TAreaState, T extends Func, AreaActionType> = ((...args: Parameters<T>) => ReturnTypeAction<T, AreaActionType>) & {
   name: string,
   actionName: string,
   reducer: Reducer<Immutable<TBaseState & TAreaState>, ReturnTypeAction<T, AreaActionType>>,
   use: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<T, AreaActionType>) => void,
   type: ReturnTypeAction<T, AreaActionType>
}

const produceMethod = <
   // Area stuff
   TBaseState,
   TBaseFailureAction extends Func,
   TBaseActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   // Other stuff
   TAction extends Func,
   >(
      actionName: string,
      name: string,
      action: TAction,
      producer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TAction, TBaseActionType & TAreaActionType>) => void,
      baseIntercept?: TIntercept<TBaseState, TBaseActionType>[],
      areaIntercept?: TIntercept<TBaseState & TAreaState, TBaseActionType & TAreaActionType>[],
      baseActionIntercept?: TIntercept<TBaseState, TBaseActionType>[],
      areaActionIntercept?: TIntercept<TBaseState & TAreaState, TBaseActionType & TAreaActionType>[],
) => {
   const actionCreator = (...args: Parameters<TAction>) => {
      let actionResult = action.apply(null, args)
      // if (area.baseOptions.baseActionInterceptor && area.areaOptions.actionInterceptor) {
      //    return {
      //       ...actionResult,
      //       type: name,
      //       shortType: shortName,
      //       ...area.baseOptions.baseActionInterceptor({
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
      // } else if (area.baseOptions.baseActionInterceptor) {
      //    return {
      //       ...actionResult,
      //       type: name,
      //       shortType: shortName,
      //       ...area.baseOptions.baseActionInterceptor({
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
         actionName: actionName,
      }
   }
   const mappedAction = actionCreator as AreaAction<TBaseState, TAreaState, TAction, TBaseActionType & TAreaActionType>
   Object.defineProperty(mappedAction, 'name', {
      value: name,
      writable: false
   })
   Object.defineProperty(mappedAction, 'actionName', {
      value: actionName,
      writable: false
   })
   if (baseIntercept || areaIntercept) {
      Object.defineProperty(mappedAction, 'reducer', {
         value: (state: TBaseState & TAreaState, action: ReturnTypeAction<TAction, TBaseActionType & TAreaActionType>) => produce(state, draft => {
            producer(draft, action)
            baseIntercept && baseIntercept.forEach(inter => inter(draft, action as unknown as EmptyActionType<TBaseActionType>))
            areaIntercept && areaIntercept.forEach(inter => inter(draft, action as unknown as EmptyActionType<TBaseActionType & TAreaActionType>))
         }) as unknown as Reducer<Immutable<TBaseState & TAreaState>, ReturnTypeAction<TAction, TBaseActionType & TAreaActionType>>,
         writable: false
      })
   } else {
      Object.defineProperty(mappedAction, 'reducer', {
         value: produce(producer) as Reducer<Immutable<TBaseState & TAreaState>, ReturnTypeAction<TAction, TBaseActionType & TAreaActionType>>,
         writable: false
      })
   }

   Object.defineProperty(mappedAction, 'use', {
      value: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TAction, TBaseActionType & TAreaActionType>) => {
         action.type = mappedAction.name
         producer(draft, action)
      },
      writable: false
   })
   return mappedAction
}

const produceMethodEmptyAction = <
   // Area stuff
   TBaseState,
   TBaseFailureAction extends Func,
   TBaseActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   >(
      actionName: string,
      name: string,
      producer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void,
      baseIntercept?: TIntercept<TBaseState, TBaseActionType>[],
      areaIntercept?: TIntercept<TBaseState & TAreaState, TAreaActionType>[],
      baseActionIntercept?: TIntercept<TBaseState, TBaseActionType>[],
      areaActionIntercept?: TIntercept<TBaseState & TAreaState, TBaseActionType & TAreaActionType>[],
) => {
   const mappedAction = (() => ({})) as () => EmptyActionType<TBaseActionType & TAreaActionType>
   return produceMethod<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, typeof mappedAction>(
      actionName, name, mappedAction, producer, baseIntercept, areaIntercept
   )
}

const produceMethodEmptyProducer = <
   // Area stuff
   TBaseState,
   TBaseFailureAction extends Func,
   TBaseActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   // Other stuff
   TAction extends Func
>(
   actionName: string,
   name: string,
   mappedAction: TAction,
   baseIntercept?: TIntercept<TBaseState, TBaseActionType>[],
   areaIntercept?: TIntercept<TBaseState & TAreaState, TAreaActionType>[],
   baseActionIntercept?: TIntercept<TBaseState, TBaseActionType>[],
   areaActionIntercept?: TIntercept<TBaseState & TAreaState, TBaseActionType & TAreaActionType>[],
) => {
   const producer = ((draft, action) => { }) as (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void
   return produceMethod<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, typeof mappedAction>(
      actionName, name, mappedAction, producer, baseIntercept, areaIntercept
   )
}

const produceMethodDoubleEmpty = <
   // Area stuff
   TBaseState,
   TBaseFailureAction extends Func,
   TBaseActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   // Other stuff
   >(
      actionName: string,
      name: string,
      baseIntercept?: TIntercept<TBaseState, TBaseActionType>[],
      areaIntercept?: TIntercept<TBaseState & TAreaState, TAreaActionType>[],
      baseActionIntercept?: TIntercept<TBaseState, TBaseActionType>[],
      areaActionIntercept?: TIntercept<TBaseState & TAreaState, TBaseActionType & TAreaActionType>[],
) => {
   const mappedAction = (() => ({})) as () => EmptyActionType<TBaseActionType & TAreaActionType>
   const producer = ((draft, action) => { }) as (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void
   return produceMethod<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, typeof mappedAction>(
      actionName, name, mappedAction, producer, baseIntercept, areaIntercept
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
   TBaseState,
   TBaseFailureAction extends Func,
   TBaseActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   >(
      area: Area<
         TBaseState,
         TBaseFailureAction,
         TBaseActionType,
         TAreaState,
         TAreaFailureAction,
         TAreaActionType
      >,
      actionName: string
   ) => {
   const requestName = area.getRequestName(actionName)
   const successName = area.getSuccessName(actionName)
   const doubleEmptyRequestAction = produceMethodDoubleEmpty<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType>(
      actionName, requestName, area.baseOptions.baseInterceptRequest, area.areaOptions.interceptRequest
   )
   const doubleEmptySuccessAction = produceMethodDoubleEmpty<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType>(
      actionName, successName, area.baseOptions.baseInterceptSuccess, area.areaOptions.interceptSuccess
   )
   return ({
      action: <TFetchAction extends Func>(action: TFetchAction) => {
         const emptyProducer = produceMethodEmptyProducer<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchAction>(
            actionName, requestName, action, area.baseOptions.baseInterceptRequest, area.areaOptions.interceptRequest
         )
         return {
            produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFetchAction, TBaseActionType & TAreaActionType>) => void) => {
               const mappedAction = produceMethod<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchAction>(
                  actionName, requestName, action, producer, area.baseOptions.baseInterceptRequest, area.areaOptions.interceptRequest
               )
               return createSuccessChain<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchAction>(
                  area, actionName, mappedAction
               )
            },
            ...createSuccessChain<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchAction>(
               area, actionName, emptyProducer
            ),
            ...createFailureChain<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchAction, EmptyAction<TBaseActionType & TAreaActionType>>(
               area, actionName, emptyProducer, doubleEmptySuccessAction
            ),
         }
      },
      produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void) => {
         const mappedAction = produceMethodEmptyAction<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType>(
            actionName, requestName, producer, area.baseOptions.baseInterceptRequest, area.areaOptions.interceptRequest
         )
         return createSuccessChain<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, () => EmptyActionType<TBaseActionType & TAreaActionType>>(
            area, actionName, mappedAction
         )
      },
      ...createSuccessChain<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, EmptyAction<TBaseActionType & TAreaActionType>>(
         area, actionName, doubleEmptyRequestAction
      ),
      ...createFailureChain<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, EmptyAction<TBaseActionType & TAreaActionType>, EmptyAction<TBaseActionType & TAreaActionType>>(
         area, actionName, doubleEmptyRequestAction, doubleEmptySuccessAction
      ),
   })
}

// Success chain:
const createSuccessChain = <
   // Area stuff
   TBaseState,
   TBaseFailureAction extends Func,
   TBaseActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   // Other stuff
   TFetchRequestAction extends Func,
   >(
      area: Area<
         TBaseState,
         TBaseFailureAction,
         TBaseActionType,
         TAreaState,
         TAreaFailureAction,
         TAreaActionType
      >,
      actionName: string,
      requestAction: AreaAction<TBaseState, TAreaState, TFetchRequestAction, TBaseActionType & TAreaActionType>
   ) => {
   const successName = area.getSuccessName(actionName)
   const doubleEmptyAction = produceMethodDoubleEmpty<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType>(
      actionName, successName, area.baseOptions.baseInterceptSuccess, area.areaOptions.interceptSuccess
   )
   return ({
      successAction: <TSuccessAction extends Func>(successAction: TSuccessAction) => {
         const emptyProducer = produceMethodEmptyProducer<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TSuccessAction>(
            actionName, successName, successAction, area.baseOptions.baseInterceptSuccess, area.areaOptions.interceptSuccess
         )
         return {
            successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TSuccessAction, TBaseActionType & TAreaActionType>) => void) => {
               let _successAction = produceMethod<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TSuccessAction>(
                  actionName, successName, successAction, successProducer, area.baseOptions.baseInterceptSuccess, area.areaOptions.interceptSuccess
               )
               return createFailureChain<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchRequestAction, TSuccessAction>(
                  area, actionName, requestAction, _successAction
               )
            },
            ...createFailureChain<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchRequestAction, TSuccessAction>(
               area, actionName, requestAction, emptyProducer
            ),
         }
      },
      successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void) => {
         const fetchSuccessAction = produceMethodEmptyAction<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType>(
            actionName, successName, successProducer, area.baseOptions.baseInterceptSuccess, area.areaOptions.interceptSuccess
         )
         return createFailureChain<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchRequestAction, EmptyAction<TBaseActionType & TAreaActionType>>(
            area, actionName, requestAction, fetchSuccessAction
         )
      },
      ...createFailureChain<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchRequestAction, EmptyAction<TBaseActionType & TAreaActionType>>(
         area, actionName, requestAction, doubleEmptyAction
      )
   })
}

// Failure chain:
const createFailureChain = <
   // Area stuff
   TBaseState,
   TBaseFailureAction extends Func,
   TBaseActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   // Other stuff
   TFetchRequestAction extends Func,
   TFetchSuccessAction extends Func,
   >(
      area: Area<
         TBaseState,
         TBaseFailureAction,
         TBaseActionType,
         TAreaState,
         TAreaFailureAction,
         TAreaActionType
      >,
      actionName: string,
      requestAction: AreaAction<TBaseState, TAreaState, TFetchRequestAction, TBaseActionType & TAreaActionType>,
      successAction: AreaAction<TBaseState, TAreaState, TFetchSuccessAction, TBaseActionType & TAreaActionType>
   ) => {
   let failureName = area.getFailureName(actionName)
   return ({
      baseFailure: () => {
         if (area.baseOptions.baseFailureAction && area.baseOptions.baseFailureProducer) {
            let failureAction = produceMethod<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TBaseFailureAction>(
               actionName, failureName, area.baseOptions.baseFailureAction, area.baseOptions.baseFailureProducer, area.baseOptions.baseInterceptFailure, area.areaOptions.interceptFailure
            )
            return finalizeChain<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchRequestAction, TFetchSuccessAction, TBaseFailureAction>(
               area, actionName, requestAction, successAction, failureAction
            )
         }
         throw new Error(`redux-area fetch method: ${actionName} tried to call baseFailureAction/baseFailureReducer, but the base didn't have one. Declare it with Redux-area Base settings`)
      },
      areaFailure: () => {
         if (area.areaOptions.areaFailureAction && area.areaOptions.areaFailureProducer) {
            let failureAction = produceMethod<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TAreaFailureAction>(
               actionName, failureName, area.areaOptions.areaFailureAction, area.areaOptions.areaFailureProducer, area.baseOptions.baseInterceptFailure, area.areaOptions.interceptFailure
            )
            return finalizeChain<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchRequestAction, TFetchSuccessAction, TAreaFailureAction>(
               area, actionName, requestAction, successAction, failureAction
            )
         }
         throw new Error(`redux-area fetch method: ${actionName} tried to call areaFailureAction/areaFailureReducer, but the area didn't have one. Declare it with Redux-area area settings`)
      },
      failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
         return {
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction, TBaseActionType & TAreaActionType>) => void) => {
               const _failureAction = produceMethod<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFailureAction>(
                  actionName, failureName, failureAction, failureProducer, area.baseOptions.baseInterceptFailure, area.areaOptions.interceptFailure
               )
               return finalizeChain<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchRequestAction, TFetchSuccessAction, TFailureAction>(
                  area, actionName, requestAction, successAction, _failureAction
               )
            }
         }
      },
      failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void) => {
         const _failureAction = produceMethodEmptyAction<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType>(
            actionName, failureName, failureProducer, area.baseOptions.baseInterceptFailure, area.areaOptions.interceptFailure
         )
         return finalizeChain<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TFetchRequestAction, TFetchSuccessAction, EmptyAction<TBaseActionType & TAreaActionType>>(
            area, actionName, requestAction, successAction, _failureAction
         )
      }
   })
}

const finalizeChain = <
   // Area stuff
   TBaseState,
   TBaseFailureAction extends Func,
   TBaseActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   // Other stuff
   TFetchRequestAction extends Func,
   TFetchSuccessAction extends Func,
   TFetchFailureAction extends Func,
   >(
      area: Area<
         TBaseState,
         TBaseFailureAction,
         TBaseActionType,
         TAreaState,
         TAreaFailureAction,
         TAreaActionType
      >,
      actionName: string,
      requestAction: AreaAction<TBaseState, TAreaState, TFetchRequestAction, TBaseActionType & TAreaActionType>,
      successAction: AreaAction<TBaseState, TAreaState, TFetchSuccessAction, TBaseActionType & TAreaActionType>,
      failureAction: AreaAction<TBaseState, TAreaState, TFetchFailureAction, TBaseActionType & TAreaActionType>
   ) => {
   area.actions.push(requestAction as unknown as ReduxAction)
   area.actions.push(successAction as unknown as ReduxAction)
   area.actions.push(failureAction as unknown as ReduxAction)
   return {
      request: requestAction,
      success: successAction,
      failure: failureAction,
      actionName
   } as FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, TFetchSuccessAction, TFetchFailureAction, TBaseActionType & TAreaActionType>
}


class Area<
   TBaseState,
   TBaseFailureAction extends Func,
   TBaseActionType extends any,
   TAreaState,
   TAreaFailureAction extends Func,
   TAreaActionType extends any,
   > {
   actions: ReduxAction[] = []
   initialState: TBaseState & TAreaState
   namePrefix: string
   requestNamePostfix: string
   successNamePostfix: string
   failureNamePostfix: string

   constructor(
      public baseOptions: IBaseAreaOptions<TBaseState, TBaseFailureAction, TBaseActionType>,
      public areaOptions: IAreaOptions<TBaseState, TAreaState, TAreaFailureAction, TAreaActionType>
   ) {
      if (this.baseOptions.addNameSlashes) {
         this.namePrefix = this.baseOptions.baseNamePrefix + "/" + this.areaOptions.namePrefix
      } else {
         this.namePrefix = this.baseOptions.baseNamePrefix + this.areaOptions.namePrefix
      }
      if (this.baseOptions.fetchPostfix) {
         this.requestNamePostfix = this.baseOptions.fetchPostfix[0]
         this.successNamePostfix = this.baseOptions.fetchPostfix[1]
         this.failureNamePostfix = this.baseOptions.fetchPostfix[2]
      } else {
         this.requestNamePostfix = 'Request'
         this.successNamePostfix = 'Success'
         this.failureNamePostfix = 'Failure'
      }
      this.initialState = {
         ...baseOptions.baseState,
         ...areaOptions.state
      }
   }

   public getActionName(name: string) {
      if (this.baseOptions.addNameSlashes) {
         return this.namePrefix + "/" + name
      }
      return this.namePrefix + name
   }

   public getRequestName(name: string) {
      if (this.baseOptions.addNameSlashes) {
         return this.namePrefix + "/" + name + "/" + this.requestNamePostfix
      }
      return this.namePrefix + name + this.requestNamePostfix
   }

   public getSuccessName(name: string) {
      if (this.baseOptions.addNameSlashes) {
         return this.namePrefix + "/" + name + "/" + this.successNamePostfix
      }
      return this.namePrefix + name + this.successNamePostfix
   }

   public getFailureName(name: string) {
      if (this.baseOptions.addNameSlashes) {
         return this.namePrefix + "/" + name + "/" + this.failureNamePostfix
      }
      return this.namePrefix + name + this.failureNamePostfix
   }

   public rootReducer() {
      return (state: TAreaState = this.initialState, action: AnyAction) => {
         console.log(this.initialState)
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
      const _name = this.getActionName(name)
      return ({
         produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TAreaActionType>) => void) => {
            const mappedAction = produceMethodEmptyAction<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType>(
               name, _name, producer, this.baseOptions.baseInterceptNormal, this.areaOptions.interceptNormal
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
               produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: MappedAction) => void) => {
                  const mappedAction = produceMethod<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType, TAction>(
                     name, _name, action, producer, this.baseOptions.baseInterceptNormal, this.areaOptions.interceptNormal
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
      return createRequestChain<TBaseState, TBaseFailureAction, TBaseActionType, TAreaState, TAreaFailureAction, TAreaActionType>(this, name)
   }
}


interface IBaseAreaOptions<
   TBaseAreaState,
   TBaseStandardFailure extends Func,
   TBaseAreaActionType extends any
   > {
   baseNamePrefix: string,
   addNameSlashes?: boolean,
   addShortNameSlashes?: boolean,
   baseState: TBaseAreaState
   baseFailureAction?: TBaseStandardFailure,
   baseFailureProducer?: (draft: Draft<TBaseAreaState>, action: ReturnType<TBaseStandardFailure>) => void
   baseActionInterceptor?: ActionCreatorInterceptor<TBaseAreaActionType>
   fetchPostfix?: string[]
   baseInterceptNormal?: TIntercept<TBaseAreaState, TBaseAreaActionType>[]
   baseInterceptRequest?: TIntercept<TBaseAreaState, TBaseAreaActionType>[]
   baseInterceptSuccess?: TIntercept<TBaseAreaState, TBaseAreaActionType>[]
   baseInterceptFailure?: TIntercept<TBaseAreaState, TBaseAreaActionType>[]
}

interface IAreaOptions<
   TBaseState,
   TAreaState,
   TAreaStandardFailure extends Func,
   TAreaActionType extends any,
   TTotalState = TBaseState & TAreaState
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

class BaseArea<TBaseState, TBaseFailureAction extends Func, TAreaActionType extends any>{
   constructor(
      public baseOptions: IBaseAreaOptions<TBaseState, TBaseFailureAction, TAreaActionType>
   ) {
   }
   public AddArea<TAreaState, TAreaStandardFailure extends Func, TAreaActionType extends any>(
      areaOptions: IAreaOptions<TBaseState, TAreaState, TAreaStandardFailure, TAreaActionType>
   ) {
      return new Area(
         this.baseOptions,
         areaOptions
      )
   }
}

export interface IReduxAreaBaseGlobalState {
   loading: boolean,
   loadingMap: { [key: string]: boolean },
   error?: Error,
   errorMessage: string,
}

export var SimpleBaseArea = (baseName = "App") => new BaseArea({
   baseNamePrefix: "@@" + baseName,
   addNameSlashes: true,
   addShortNameSlashes: true,
   baseState: {}
})

export var FetchBaseGlobal = (baseName = "App") => new BaseArea({
   baseNamePrefix: "@@" + baseName,
   addNameSlashes: true,
   addShortNameSlashes: true,
   baseState: {
      loading: false,
      loadingMap: { initialized: true },
      error: undefined,
      errorMessage: ''
   } as IReduxAreaBaseGlobalState,
   baseFailureAction: (error: Error) => ({ error }),
   baseFailureProducer: ((draft, { error }) => {
      draft.error = error
      draft.errorMessage = error.message
   }),
   baseActionInterceptor: (act: ReduxAreaAnyAction) => ({}),
   baseInterceptRequest: [(draft, { actionName }) => {
      draft.loading = true
      draft.loadingMap[actionName] = true
   }],
   baseInterceptSuccess: [(draft, { actionName }) => {
      draft.loading = false
      draft.loadingMap[actionName] = false
   }],
   baseInterceptFailure: [(draft, action) => {
      draft.loading = false
      draft.loadingMap[action.actionName] = false
   }]
})

export default BaseArea
