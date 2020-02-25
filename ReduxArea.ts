import produce, { Draft, Immutable } from "immer"
import { AnyAction, Reducer } from 'redux'

export type Func = (...args: any) => any
export type ReduxAction = ((...args: any) => AnyAction) & { name: string; reducer: Reducer; intercept?: Reducer }
export type ReduxAreaAnyAction = { type: string, actionName: string, actionType: string }
export type EmptyActionType<AreaActionType> = ReduxAreaAnyAction & AreaActionType
export type EmptyAction<AreaActionType> = () => EmptyActionType<AreaActionType>
export type ReturnTypeAction<T extends Func, AreaActionType> = ReturnType<T> & EmptyActionType<AreaActionType>
export type ActionCreatorInterceptor<AreaActionType> = (act: ReduxAreaAnyAction) => AreaActionType

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
   TAreaState,
   TBaseActionType,
   TAreaActionType,
   // Other stuff
   TAction extends Func,
   >(
      actionName: string,
      name: string,
      actionType: string,
      action: TAction,
      producer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TAction, TBaseActionType & TAreaActionType>) => void,
      baseIntercept?: TIntercept<TBaseState, TBaseActionType>[],
      areaIntercept?: TIntercept<TBaseState & TAreaState, TBaseActionType & TAreaActionType>[],
      baseActionIntercept?: ActionCreatorInterceptor<TBaseActionType>,
      areaActionIntercept?: ActionCreatorInterceptor<TBaseActionType & TAreaActionType>
   ) => {
   const actionCreator = (...args: Parameters<TAction>) => {
      let actionResult = action.apply(null, args)
      let baseActionResult = {
         ...actionResult,
         type: name,
         actionName,
      } as ReduxAreaAnyAction
      baseActionIntercept && (baseActionResult = { ...baseActionResult, ...baseActionIntercept(baseActionResult) })
      areaActionIntercept && (baseActionResult = { ...baseActionResult, ...areaActionIntercept(baseActionResult) })
      return baseActionResult as ReduxAreaAnyAction & TBaseActionType & TAreaActionType
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
   Object.defineProperty(mappedAction, 'actionType', {
      value: actionType,
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
   TAreaState,
   TBaseActionType,
   TAreaActionType,
   >(
      actionName: string,
      name: string,
      actionType: string,
      producer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void,
      baseIntercept?: TIntercept<TBaseState, TBaseActionType>[],
      areaIntercept?: TIntercept<TBaseState & TAreaState, TBaseActionType & TAreaActionType>[],
      baseActionIntercept?: ActionCreatorInterceptor<TBaseActionType>,
      areaActionIntercept?: ActionCreatorInterceptor<TBaseActionType & TAreaActionType>
   ) => {
   const mappedAction = (() => ({})) as () => EmptyActionType<TBaseActionType & TAreaActionType>
   return produceMethod<TBaseState, TAreaState, TBaseActionType, TAreaActionType, typeof mappedAction>(
      actionName, name, actionType, mappedAction, producer, baseIntercept, areaIntercept, baseActionIntercept, areaActionIntercept
   )
}

const produceMethodEmptyProducer = <
   // Area stuff
   TBaseState,
   TAreaState,
   TBaseActionType,
   TAreaActionType,
   // Other stuff
   TAction extends Func
>(
   actionName: string,
   name: string,
   actionType: string,
   mappedAction: TAction,
   baseIntercept?: TIntercept<TBaseState, TBaseActionType>[],
   areaIntercept?: TIntercept<TBaseState & TAreaState, TBaseActionType & TAreaActionType>[],
   baseActionIntercept?: ActionCreatorInterceptor<TBaseActionType>,
   areaActionIntercept?: ActionCreatorInterceptor<TBaseActionType & TAreaActionType>
) => {
   const producer = ((draft, action) => { }) as (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void
   return produceMethod<TBaseState, TAreaState, TBaseActionType, TAreaActionType, typeof mappedAction>(
      actionName, name, actionType, mappedAction, producer, baseIntercept, areaIntercept, baseActionIntercept, areaActionIntercept
   )
}

const produceMethodDoubleEmpty = <
   // Area stuff
   TBaseState,
   TAreaState,
   TBaseActionType,
   TAreaActionType,
   // Other stuff
   >(
      actionName: string,
      name: string,
      actionType: string,
      baseIntercept?: TIntercept<TBaseState, TBaseActionType>[],
      areaIntercept?: TIntercept<TBaseState & TAreaState, TBaseActionType & TAreaActionType>[],
      baseActionIntercept?: ActionCreatorInterceptor<TBaseActionType>,
      areaActionIntercept?: ActionCreatorInterceptor<TBaseActionType & TAreaActionType>
   ) => {
   const mappedAction = (() => ({})) as () => EmptyActionType<TBaseActionType & TAreaActionType>
   const producer = ((draft, action) => { }) as (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void
   return produceMethod<TBaseState, TAreaState, TBaseActionType, TAreaActionType, typeof mappedAction>(
      actionName, name, actionType, mappedAction, producer, baseIntercept, areaIntercept, baseActionIntercept, areaActionIntercept
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

// --------- Add Flow ---------

const createAddChain = <
   TBaseState,
   TAreaState,
   TBaseFailureAction extends Func,
   TAreaFailureAction extends Func,
   TBaseActionType,
   TAreaActionType,
   >(
      area: Area<
         TBaseState,
         TAreaState,
         TBaseFailureAction,
         TAreaFailureAction,
         TBaseActionType,
         TAreaActionType
      >,
      actionName: string
   ) => {
   const typeName = area.getActionName(actionName)

   return ({
      produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TAreaActionType>) => void) => {
         const mappedAction = produceMethodEmptyAction<TBaseState, TAreaState, TBaseActionType, TAreaActionType>(
            actionName, typeName, area.normalNamePostfix, producer, area.baseOptions.baseInterceptNormal, area.areaOptions.interceptNormal
         )
         area.actions.push(mappedAction as unknown as ReduxAction)
         return mappedAction
      },
      reducer: (
         reducer: (state: TAreaState, reducerAction: EmptyActionType<TAreaActionType>) => any | void
      ) => {
         const mappedAction = reduceMethodEmpty<TAreaState, TAreaActionType>(typeName, reducer)
         area.actions.push(mappedAction as unknown as ReduxAction)
         return mappedAction
      },
      action: <TAction extends Func>(action: TAction) => {
         type MappedAction = ReturnTypeAction<TAction, TAreaActionType>
         return {
            produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: MappedAction) => void) => {
               const mappedAction = produceMethod<TBaseState, TAreaState, TBaseActionType, TAreaActionType, TAction>(
                  actionName, typeName, area.normalNamePostfix, action, producer, area.baseOptions.baseInterceptNormal, area.areaOptions.interceptNormal
               )
               area.actions.push(mappedAction as unknown as ReduxAction)
               return mappedAction
            },
            reducer: (
               reducer: (state: TAreaState, reducerAction: MappedAction) => any | void
            ) => {
               const mappedAction = reduceMethod(action, reducer)
               area.actions.push(mappedAction as unknown as ReduxAction)
               return mappedAction
            }
         }
      }
   })
}


// --------- AddFetch Flow ---------
// Request chain:
const createRequestChain = <
   TBaseState,
   TAreaState,
   TBaseFailureAction extends Func,
   TAreaFailureAction extends Func,
   TBaseActionType,
   TAreaActionType,
   >(
      area: Area<
         TBaseState,
         TAreaState,
         TBaseFailureAction,
         TAreaFailureAction,
         TBaseActionType,
         TAreaActionType
      >,
      actionName: string
   ) => {
   const requestName = area.getRequestName(actionName)
   const successName = area.getSuccessName(actionName)
   const doubleEmptyRequestAction = produceMethodDoubleEmpty<TBaseState, TAreaState, TBaseActionType, TAreaActionType>(
      actionName, requestName, area.requestNamePostfix, area.baseOptions.baseInterceptRequest, area.areaOptions.interceptRequest, area.baseOptions.baseActionInterceptor, area.areaOptions.actionInterceptor
   )
   const doubleEmptySuccessAction = produceMethodDoubleEmpty<TBaseState, TAreaState, TBaseActionType, TAreaActionType>(
      actionName, successName, area.successNamePostfix, area.baseOptions.baseInterceptSuccess, area.areaOptions.interceptSuccess, area.baseOptions.baseActionInterceptor, area.areaOptions.actionInterceptor
   )
   return ({
      action: <TFetchAction extends Func>(action: TFetchAction) => {
         const emptyProducer = produceMethodEmptyProducer<TBaseState, TAreaState, TBaseActionType, TAreaActionType, TFetchAction>(
            actionName, requestName, area.requestNamePostfix, action, area.baseOptions.baseInterceptRequest, area.areaOptions.interceptRequest, area.baseOptions.baseActionInterceptor, area.areaOptions.actionInterceptor
         )
         return {
            produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFetchAction, TBaseActionType & TAreaActionType>) => void) => {
               const mappedAction = produceMethod<TBaseState, TAreaState, TBaseActionType, TAreaActionType, TFetchAction>(
                  actionName, requestName, area.requestNamePostfix, action, producer, area.baseOptions.baseInterceptRequest, area.areaOptions.interceptRequest, area.baseOptions.baseActionInterceptor, area.areaOptions.actionInterceptor
               )
               return createSuccessChain<TBaseState, TAreaState, TBaseFailureAction, TAreaFailureAction, TBaseActionType, TAreaActionType, TFetchAction>(
                  area, actionName, mappedAction
               )
            },
            ...createSuccessChain<TBaseState, TAreaState, TBaseFailureAction, TAreaFailureAction, TBaseActionType, TAreaActionType, TFetchAction>(
               area, actionName, emptyProducer
            ),
            ...createFailureChain<TBaseState, TAreaState, TBaseFailureAction, TAreaFailureAction, TBaseActionType, TAreaActionType, TFetchAction, EmptyAction<TBaseActionType & TAreaActionType>>(
               area, actionName, emptyProducer, doubleEmptySuccessAction
            ),
         }
      },
      produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void) => {
         const mappedAction = produceMethodEmptyAction<TBaseState, TAreaState, TBaseActionType, TAreaActionType>(
            actionName, requestName, area.requestNamePostfix, producer, area.baseOptions.baseInterceptRequest, area.areaOptions.interceptRequest, area.baseOptions.baseActionInterceptor, area.areaOptions.actionInterceptor
         )
         return createSuccessChain<TBaseState, TAreaState, TBaseFailureAction, TAreaFailureAction, TBaseActionType, TAreaActionType, () => EmptyActionType<TBaseActionType & TAreaActionType>>(
            area, actionName, mappedAction
         )
      },
      ...createSuccessChain<TBaseState, TAreaState, TBaseFailureAction, TAreaFailureAction, TBaseActionType, TAreaActionType, EmptyAction<TBaseActionType & TAreaActionType>>(
         area, actionName, doubleEmptyRequestAction
      ),
      ...createFailureChain<TBaseState, TAreaState, TBaseFailureAction, TAreaFailureAction, TBaseActionType, TAreaActionType, EmptyAction<TBaseActionType & TAreaActionType>, EmptyAction<TBaseActionType & TAreaActionType>>(
         area, actionName, doubleEmptyRequestAction, doubleEmptySuccessAction
      ),
   })
}

// Success chain:
const createSuccessChain = <
   // Area stuff
   TBaseState,
   TAreaState,
   TBaseFailureAction extends Func,
   TAreaFailureAction extends Func,
   TBaseActionType,
   TAreaActionType,
   // Other stuff
   TFetchRequestAction extends Func,
   >(
      area: Area<
         TBaseState,
         TAreaState,
         TBaseFailureAction,
         TAreaFailureAction,
         TBaseActionType,
         TAreaActionType
      >,
      actionName: string,
      requestAction: AreaAction<TBaseState, TAreaState, TFetchRequestAction, TBaseActionType & TAreaActionType>
   ) => {
   const successName = area.getSuccessName(actionName)
   const doubleEmptyAction = produceMethodDoubleEmpty<TBaseState, TAreaState, TBaseActionType, TAreaActionType>(
      actionName, successName, area.successNamePostfix, area.baseOptions.baseInterceptSuccess, area.areaOptions.interceptSuccess, area.baseOptions.baseActionInterceptor, area.areaOptions.actionInterceptor
   )
   return ({
      successAction: <TSuccessAction extends Func>(successAction: TSuccessAction) => {
         const emptyProducer = produceMethodEmptyProducer<TBaseState, TAreaState, TBaseActionType, TAreaActionType, TSuccessAction>(
            actionName, successName, area.successNamePostfix, successAction, area.baseOptions.baseInterceptSuccess, area.areaOptions.interceptSuccess, area.baseOptions.baseActionInterceptor, area.areaOptions.actionInterceptor
         )
         return {
            successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TSuccessAction, TBaseActionType & TAreaActionType>) => void) => {
               let _successAction = produceMethod<TBaseState, TAreaState, TBaseActionType, TAreaActionType, TSuccessAction>(
                  actionName, successName, area.successNamePostfix, successAction, successProducer, area.baseOptions.baseInterceptSuccess, area.areaOptions.interceptSuccess, area.baseOptions.baseActionInterceptor, area.areaOptions.actionInterceptor
               )
               return createFailureChain<TBaseState, TAreaState, TBaseFailureAction, TAreaFailureAction, TBaseActionType, TAreaActionType, TFetchRequestAction, TSuccessAction>(
                  area, actionName, requestAction, _successAction
               )
            },
            ...createFailureChain<TBaseState, TAreaState, TBaseFailureAction, TAreaFailureAction, TBaseActionType, TAreaActionType, TFetchRequestAction, TSuccessAction>(
               area, actionName, requestAction, emptyProducer
            ),
         }
      },
      successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void) => {
         const fetchSuccessAction = produceMethodEmptyAction<TBaseState, TAreaState, TBaseActionType, TAreaActionType>(
            actionName, successName, area.successNamePostfix, successProducer, area.baseOptions.baseInterceptSuccess, area.areaOptions.interceptSuccess, area.baseOptions.baseActionInterceptor, area.areaOptions.actionInterceptor
         )
         return createFailureChain<TBaseState, TAreaState, TBaseFailureAction, TAreaFailureAction, TBaseActionType, TAreaActionType, TFetchRequestAction, EmptyAction<TBaseActionType & TAreaActionType>>(
            area, actionName, requestAction, fetchSuccessAction
         )
      },
      ...createFailureChain<TBaseState, TAreaState, TBaseFailureAction, TAreaFailureAction, TBaseActionType, TAreaActionType, TFetchRequestAction, EmptyAction<TBaseActionType & TAreaActionType>>(
         area, actionName, requestAction, doubleEmptyAction
      )
   })
}

// Failure chain:
const createFailureChain = <
   // Area stuff
   TBaseState,
   TAreaState,
   TBaseFailureAction extends Func,
   TAreaFailureAction extends Func,
   TBaseActionType extends any,
   TAreaActionType extends any,
   // Other stuff
   TFetchRequestAction extends Func,
   TFetchSuccessAction extends Func,
   >(
      area: Area<
         TBaseState,
         TAreaState,
         TBaseFailureAction,
         TAreaFailureAction,
         TBaseActionType,
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
            let failureAction = produceMethod<TBaseState, TAreaState, TBaseActionType, TAreaActionType, TBaseFailureAction>(
               actionName, failureName, area.failureNamePostfix, area.baseOptions.baseFailureAction, area.baseOptions.baseFailureProducer, area.baseOptions.baseInterceptFailure, area.areaOptions.interceptFailure, area.baseOptions.baseActionInterceptor, area.areaOptions.actionInterceptor
            )
            return finalizeChain<TBaseState, TAreaState, TBaseFailureAction, TAreaFailureAction, TBaseActionType, TAreaActionType, TFetchRequestAction, TFetchSuccessAction, TBaseFailureAction>(
               area, actionName, requestAction, successAction, failureAction
            )
         }
         throw new Error(`redux-area fetch method: ${actionName} tried to call baseFailureAction/baseFailureReducer, but the base didn't have one. Declare it with Redux-area Base settings`)
      },
      areaFailure: () => {
         if (area.areaOptions.areaFailureAction && area.areaOptions.areaFailureProducer) {
            let failureAction = produceMethod<TBaseState, TAreaState, TBaseActionType, TAreaActionType, TAreaFailureAction>(
               actionName, failureName, area.failureNamePostfix, area.areaOptions.areaFailureAction, area.areaOptions.areaFailureProducer, area.baseOptions.baseInterceptFailure, area.areaOptions.interceptFailure, area.baseOptions.baseActionInterceptor, area.areaOptions.actionInterceptor
            )
            return finalizeChain<TBaseState, TAreaState, TBaseFailureAction, TAreaFailureAction, TBaseActionType, TAreaActionType, TFetchRequestAction, TFetchSuccessAction, TAreaFailureAction>(
               area, actionName, requestAction, successAction, failureAction
            )
         }
         throw new Error(`redux-area fetch method: ${actionName} tried to call areaFailureAction/areaFailureReducer, but the area didn't have one. Declare it with Redux-area area settings`)
      },
      failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
         return {
            failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction, TBaseActionType & TAreaActionType>) => void) => {
               const _failureAction = produceMethod<TBaseState, TAreaState, TBaseActionType, TAreaActionType, TFailureAction>(
                  actionName, failureName, area.failureNamePostfix, failureAction, failureProducer, area.baseOptions.baseInterceptFailure, area.areaOptions.interceptFailure, area.baseOptions.baseActionInterceptor, area.areaOptions.actionInterceptor
               )
               return finalizeChain<TBaseState, TAreaState, TBaseFailureAction, TAreaFailureAction, TBaseActionType, TAreaActionType, TFetchRequestAction, TFetchSuccessAction, TFailureAction>(
                  area, actionName, requestAction, successAction, _failureAction
               )
            }
         }
      },
      failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void) => {
         const _failureAction = produceMethodEmptyAction<TBaseState, TAreaState, TBaseActionType, TAreaActionType>(
            actionName, failureName, area.failureNamePostfix, failureProducer, area.baseOptions.baseInterceptFailure, area.areaOptions.interceptFailure, area.baseOptions.baseActionInterceptor, area.areaOptions.actionInterceptor
         )
         return finalizeChain<TBaseState, TAreaState, TBaseFailureAction, TAreaFailureAction, TBaseActionType, TAreaActionType, TFetchRequestAction, TFetchSuccessAction, EmptyAction<TBaseActionType & TAreaActionType>>(
            area, actionName, requestAction, successAction, _failureAction
         )
      }
   })
}

const finalizeChain = <
   // Area stuff
   TBaseState,
   TAreaState,
   TBaseFailureAction extends Func,
   TAreaFailureAction extends Func,
   TBaseActionType,
   TAreaActionType,
   // Other stuff
   TFetchRequestAction extends Func,
   TFetchSuccessAction extends Func,
   TFetchFailureAction extends Func,
   >(
      area: Area<
         TBaseState,
         TAreaState,
         TBaseFailureAction,
         TAreaFailureAction,
         TBaseActionType,
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
   TAreaState,
   TBaseFailureAction extends Func,
   TAreaFailureAction extends Func,
   TBaseActionTypeAll,
   TAreaActionTypeAll,
   > {
   actions: ReduxAction[] = []
   initialState: TBaseState & TAreaState
   namePrefix: string
   normalNamePostfix: string
   requestNamePostfix: string
   successNamePostfix: string
   failureNamePostfix: string

   constructor(
      public baseOptions: IAreaBaseOptions<
         TBaseState,
         TBaseFailureAction,
         TBaseActionTypeAll
      >,
      public areaOptions: IAreaOptions<
         TBaseState,
         TAreaState,
         TAreaFailureAction,
         TBaseActionTypeAll,
         TAreaActionTypeAll
      >
   ) {
      if (this.baseOptions.addNameSlashes) {
         this.namePrefix = this.baseOptions.baseNamePrefix + "/" + this.areaOptions.namePrefix
      } else {
         this.namePrefix = this.baseOptions.baseNamePrefix + this.areaOptions.namePrefix
      }
      if (this.baseOptions.namePostfix) {
         this.normalNamePostfix = this.baseOptions.namePostfix[0]
         this.requestNamePostfix = this.baseOptions.namePostfix[1]
         this.successNamePostfix = this.baseOptions.namePostfix[2]
         this.failureNamePostfix = this.baseOptions.namePostfix[3]
      } else {
         this.normalNamePostfix = 'Normal'
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
      const tags = []
      return ({
         tag: (tag: string) => {
            tags.push(tag)
            return {
               ...createAddChain<
                  TBaseState,
                  TAreaState,
                  TBaseFailureAction,
                  TAreaFailureAction,
                  TBaseActionTypeAll,
                  TAreaActionTypeAll
               >(this, name),
            }
         },
         ...createAddChain<
            TBaseState,
            TAreaState,
            TBaseFailureAction,
            TAreaFailureAction,
            TBaseActionTypeAll,
            TAreaActionTypeAll
         >(this, name)
         // produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TAreaActionTypeAll>) => void) => {
         //    const mappedAction = produceMethodEmptyAction<TBaseState, TAreaState, TBaseActionTypeAll, TAreaActionTypeAll>(
         //       name, _name, this.normalNamePostfix, producer, this.baseOptions.baseInterceptNormal, this.areaOptions.interceptNormal
         //    )
         //    this.actions.push(mappedAction as unknown as ReduxAction)
         //    return mappedAction
         // },
         // reducer: (
         //    reducer: (state: TAreaState, reducerAction: EmptyActionType<TAreaActionTypeAll>) => any | void
         // ) => {
         //    const mappedAction = reduceMethodEmpty<TAreaState, TAreaActionTypeAll>(_name, reducer)
         //    this.actions.push(mappedAction as unknown as ReduxAction)
         //    return mappedAction
         // },
         // action: <TAction extends Func>(action: TAction) => {
         //    type MappedAction = ReturnTypeAction<TAction, TAreaActionTypeAll>
         //    return {
         //       produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: MappedAction) => void) => {
         //          const mappedAction = produceMethod<TBaseState, TAreaState, TBaseActionTypeAll, TAreaActionTypeAll, TAction>(
         //             name, _name, this.normalNamePostfix, action, producer, this.baseOptions.baseInterceptNormal, this.areaOptions.interceptNormal
         //          )
         //          this.actions.push(mappedAction as unknown as ReduxAction)
         //          return mappedAction
         //       },
         //       reducer: (
         //          reducer: (state: TAreaState, reducerAction: MappedAction) => any | void
         //       ) => {
         //          const mappedAction = reduceMethod(action, reducer)
         //          this.actions.push(mappedAction as unknown as ReduxAction)
         //          return mappedAction
         //       }
         //    }
         // }
      })
   }

   /**
    * Add 3 action (Request, success and failure). \
    * Optional 'interceptRequest', 'interceptSuccess' and 'interceptFailure' in options will effect this. \
    * You can omit any 'action' and/or 'produce' if its not needed. (expect one of the final areaFailure of produceFailure) \
    * @param name
    */
   public addFetch(name: string) {
      return createRequestChain<TBaseState, TAreaState, TBaseFailureAction, TAreaFailureAction, TBaseActionTypeAll, TAreaActionTypeAll>(this, name)
   }
}


interface IAreaBaseOptions<
   TBaseState,
   TBaseStandardFailure extends Func,
   TBaseActionTypeAll
   > {
   baseNamePrefix: string,
   addNameSlashes?: boolean,
   addShortNameSlashes?: boolean,
   baseState: TBaseState
   baseFailureAction?: TBaseStandardFailure,
   baseFailureProducer?: (draft: Draft<TBaseState>, action: ReturnType<TBaseStandardFailure>) => void
   baseActionInterceptor?: ActionCreatorInterceptor<TBaseActionTypeAll>
   namePostfix?: string[]
   baseInterceptAll?: TIntercept<TBaseState, TBaseActionTypeAll>[]
   baseInterceptNormal?: TIntercept<TBaseState, TBaseActionTypeAll>[]
   baseInterceptRequest?: TIntercept<TBaseState, TBaseActionTypeAll>[]
   baseInterceptSuccess?: TIntercept<TBaseState, TBaseActionTypeAll>[]
   baseInterceptFailure?: TIntercept<TBaseState, TBaseActionTypeAll>[]
}

interface IAreaOptions<
   TBaseState,
   TAreaState,
   TAreaFailureAction extends Func,
   TBaseActionTypeAll,
   TAreaActionTypeAll,
   TTotalState = TBaseState & TAreaState,
   TTotalActionTypeAll = TBaseActionTypeAll & TAreaActionTypeAll,
   > {
   areaFailureAction?: TAreaFailureAction,
   areaFailureProducer?: (draft: Draft<TTotalState>, action: ReturnType<TAreaFailureAction>) => void,

   actionInterceptor?: ActionCreatorInterceptor<TTotalActionTypeAll>,

   namePrefix: string,
   state: TAreaState,
   interceptAll?: TIntercept<TTotalState, TTotalActionTypeAll>[]
   interceptNormal?: TIntercept<TTotalState, TTotalActionTypeAll & TTotalActionTypeAll>[]
   interceptRequest?: TIntercept<TTotalState, TTotalActionTypeAll & TTotalActionTypeAll>[]
   interceptSuccess?: TIntercept<TTotalState, TTotalActionTypeAll & TTotalActionTypeAll>[]
   interceptFailure?: TIntercept<TTotalState, TTotalActionTypeAll & TTotalActionTypeAll>[]
}

class AreaBase<
   TBaseState,
   TBaseFailureAction extends Func,
   TBaseActionTypeAll extends any = {}
   >{
   constructor(
      public baseOptions: IAreaBaseOptions<
         TBaseState,
         TBaseFailureAction,
         TBaseActionTypeAll
      >
   ) {
   }
   public CreateArea<
      TAreaState,
      TAreaStandardFailure extends Func,
      TAreaActionTypeAll extends any = {},
      >(
         areaOptions: IAreaOptions<
            TBaseState,
            TAreaState,
            TAreaStandardFailure,
            TBaseActionTypeAll,
            TAreaActionTypeAll
         >
      ) {
      return new Area(
         this.baseOptions,
         areaOptions
      )
   }
}

export interface IFetchAreaBaseState {
   loading: boolean,
   loadingMap: { [key: string]: boolean },
   error?: Error,
   errorMessage: string,
}

export var SimpleAreaBase = (baseName = "App") => new AreaBase({
   baseNamePrefix: "@@" + baseName,
   addNameSlashes: true,
   addShortNameSlashes: true,
   baseState: {}
})

export var FetchAreaBase = (baseName = "App") => new AreaBase({
   baseNamePrefix: "@@" + baseName,
   addNameSlashes: true,
   addShortNameSlashes: true,
   baseState: {
      loading: false,
      loadingMap: { initialized: true },
      error: undefined,
      errorMessage: ''
   } as IFetchAreaBaseState,
   baseFailureAction: (error: Error) => ({ error }),
   baseFailureProducer: ((draft, { error }) => {
      draft.error = error
      draft.errorMessage = error.message
   }),
   baseActionInterceptor: action => ({
      per: 22
   }),
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

export default AreaBase
