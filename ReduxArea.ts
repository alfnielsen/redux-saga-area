import produce, { Draft, Immutable } from "immer"
import { AnyAction, Reducer } from 'redux'

export type Func = (...args: any) => any
export type ReduxAction = ((...args: any) => AnyAction) & { name: string; reducer: Reducer; intercept?: Reducer }
export type AnyActionBase = { type: string }
export type EmptyActionType<AreaActionType> = { type: string } & AreaActionType
export type EmptyAction<AreaActionType> = () => EmptyActionType<AreaActionType>
export type ReturnTypeAction<T extends Func, AreaActionType> = ReturnType<T> & EmptyActionType<AreaActionType>
export type ActionCreatorInterceptorOptions = { action: { type: string }, actionName: string, actionTags: string[] }
export type ActionCreatorInterceptor = (options: ActionCreatorInterceptorOptions) => any

export type FetchAreaAction<TBaseState, TAreaState, TFetchAction extends Func, TSuccessAction extends Func, TFailureAction extends Func, AreaActionType> = {
   request: AreaAction<TBaseState, TAreaState, TFetchAction, AreaActionType>
   success: AreaAction<TBaseState, TAreaState, TSuccessAction, AreaActionType>
   failure: AreaAction<TBaseState, TAreaState, TFailureAction, AreaActionType>
   actionName: string
}
export type TIntercept<TState, AreaActionType> = (draft: Draft<TState>, action: EmptyActionType<AreaActionType>) => void
export type TActionIntercept<TState> = (draft: Draft<TState>, action: ActionCreatorInterceptorOptions) => void

export type AreaAction<TBaseState, TAreaState, T extends Func, AreaActionType> = ((...args: Parameters<T>) => ReturnTypeAction<T, AreaActionType>) & {
   name: string,
   actionName: string,
   reducer: Reducer<Immutable<TBaseState & TAreaState>, ReturnTypeAction<T, AreaActionType>>,
   use: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<T, AreaActionType>) => void,
   type: ReturnTypeAction<T, AreaActionType>
}

class Area<
   TBaseState,
   TAreaState,
   TBaseFailureAction extends Func,
   TAreaFailureAction extends Func,
   TBaseActionTypeInterceptor extends ActionCreatorInterceptor,
   TAreaActionTypeInterceptor extends ActionCreatorInterceptor,
   TBaseActionType = ReturnType<TBaseActionTypeInterceptor>,
   TAreaActionType = ReturnType<TAreaActionTypeInterceptor>
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
         TBaseActionTypeInterceptor
      >,
      public areaOptions: IAreaOptions<
         TBaseState,
         TAreaState,
         TAreaFailureAction,
         TBaseActionTypeInterceptor,
         TAreaActionTypeInterceptor
      >
   ) {
      this.namePrefix = ""
      if (this.baseOptions.baseNamePrefix) {
         this.namePrefix += this.baseOptions.baseNamePrefix
      }
      if (this.areaOptions.namePrefix) {
         if (this.baseOptions.addNameSlashes) {
            this.namePrefix += "/"
         }
         this.namePrefix += this.areaOptions.namePrefix
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

   public findTagsInterceptors(tags: string[]): [TIntercept<TBaseState, TBaseActionType>[], TIntercept<TBaseState & TAreaState, TBaseActionType & TAreaActionType>[]] {
      const baseInterceptors: TIntercept<TBaseState, TBaseActionType>[] = []
      const areaInterceptors: TIntercept<TBaseState & TAreaState, TBaseActionType & TAreaActionType>[] = []
      const baseTagInterceptors = this.baseOptions.baseInterceptors || {}
      const tagInterceptors = this.areaOptions.areaInterceptors || {}
      tags.forEach(tag => {
         if (baseTagInterceptors[tag]) {
            baseInterceptors.push(...baseTagInterceptors[tag] as TIntercept<TBaseState, TBaseActionType>[])
         }
         if (tagInterceptors[tag]) {
            areaInterceptors.push(...tagInterceptors[tag] as TIntercept<TBaseState & TAreaState, TBaseActionType & TAreaActionType>[])
         }
      })
      return [baseInterceptors, areaInterceptors]
   }


   public getActionName(name: string) {
      if (!this.namePrefix) {
         return name
      }
      if (this.baseOptions.addNameSlashes) {
         return this.namePrefix + "/" + name
      }
      return this.namePrefix + name
   }

   public getRequestName(name: string) {
      name = this.getActionName(name)
      if (this.baseOptions.addNameSlashes) {
         name += "/"
      }
      return name + this.requestNamePostfix
   }

   public getSuccessName(name: string) {
      name = this.getActionName(name)
      if (this.baseOptions.addNameSlashes) {
         name += "/"
      }
      return name + this.successNamePostfix
   }

   public getFailureName(name: string) {
      name = this.getActionName(name)
      if (this.baseOptions.addNameSlashes) {
         name += "/"
      }
      return name + this.failureNamePostfix
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
   public add(name: string, tags: string[] = []) {
      return this.createAddChain(name, ["All", "Normal", ...tags])
   }

   /**
    * Add 3 action (Request, success and failure). \
    * Optional 'interceptRequest', 'interceptSuccess' and 'interceptFailure' in options will effect this. \
    * You can omit any 'action' and/or 'produce' if its not needed. (expect one of the final areaFailure of produceFailure) \
    * @param name
    */
   public addFetch(name: string, tags: string[] = []) {
      return this.createRequestChain(name, ["All", "Fetch", ...tags])
   }

   protected produceMethod = <
      TAction extends Func,
      >(
         actionName: string,
         name: string,
         actionTags: string[],
         action: TAction,
         producer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TAction, TBaseActionType & TAreaActionType>) => void,
   ) => {
      let [baseIntercept, areaIntercept] = this.findTagsInterceptors(actionTags)

      const baseActionIntercept = this.baseOptions.baseActionsIntercept
      const areaActionIntercept = this.areaOptions.actionInterceptor
      const actionCreator = (...args: Parameters<TAction>) => {
         let actionResult = action.apply(null, args)
         let baseActionResult = {
            ...actionResult,
            type: name
         } as AnyActionBase
         baseActionIntercept && (baseActionResult = { ...baseActionResult, ...baseActionIntercept({ action: baseActionResult, actionName, actionTags }) })
         areaActionIntercept && (baseActionResult = { ...baseActionResult, ...areaActionIntercept({ action: baseActionResult, actionName, actionTags }) })
         return baseActionResult as AnyActionBase & TBaseActionType & TAreaActionType
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

   protected produceMethodEmptyAction = (
      actionName: string,
      name: string,
      actionTags: string[],
      producer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void
   ) => {
      const mappedAction = (() => ({})) as () => EmptyActionType<TBaseActionType & TAreaActionType>
      return this.produceMethod<typeof mappedAction>(
         actionName, name, actionTags, mappedAction, producer
      )
   }

   protected produceMethodEmptyProducer = <TAction extends Func>(
      actionName: string,
      name: string,
      actionTags: string[],
      mappedAction: TAction
   ) => {
      const producer = ((draft, action) => { }) as (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void
      return this.produceMethod<typeof mappedAction>(
         actionName, name, actionTags, mappedAction, producer
      )
   }

   protected produceMethodDoubleEmpty = (
      actionName: string,
      name: string,
      actionTags: string[]
   ) => {
      const mappedAction = (() => ({})) as () => EmptyActionType<TBaseActionType & TAreaActionType>
      const producer = ((draft, action) => { }) as (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void
      return this.produceMethod<typeof mappedAction>(
         actionName, name, actionTags, mappedAction, producer
      )
   }

   protected reduceMethod = <TState, T extends Func, TAction, AreaActionType>(
      mappedAction: T,
      reducer: (state: TState, reducerAction: TAction) => TState,
   ) => {
      Object.defineProperty(mappedAction, 'reducer', {
         value: reducer as Reducer<TState, ReturnTypeAction<T, AreaActionType>>,
         writable: false
      })
      return mappedAction
   }

   protected reduceMethodEmpty = <TState, AreaActionType>(
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

   protected createAddChain = (
      actionName: string,
      tags: string[] = []
   ) => {
      const typeName = this.getActionName(actionName)

      return ({
         produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TAreaActionType>) => void) => {
            const mappedAction = this.produceMethodEmptyAction(
               actionName, typeName, tags, producer
            )
            this.actions.push(mappedAction as unknown as ReduxAction)
            return mappedAction
         },
         reducer: (
            reducer: (state: TAreaState, reducerAction: EmptyActionType<TAreaActionType>) => any | void
         ) => {
            const mappedAction = this.reduceMethodEmpty<TAreaState, TAreaActionType>(typeName, reducer)
            this.actions.push(mappedAction as unknown as ReduxAction)
            return mappedAction
         },
         action: <TAction extends Func>(action: TAction) => {
            type MappedAction = ReturnTypeAction<TAction, TAreaActionType>
            return {
               produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: MappedAction) => void) => {
                  const mappedAction = this.produceMethod<TAction>(
                     actionName, typeName, tags, action, producer
                  )
                  this.actions.push(mappedAction as unknown as ReduxAction)
                  return mappedAction
               },
               reducer: (
                  reducer: (state: TAreaState, reducerAction: MappedAction) => any | void
               ) => {
                  const mappedAction = this.reduceMethod(action, reducer)
                  this.actions.push(mappedAction as unknown as ReduxAction)
                  return mappedAction
               }
            }
         }
      })
   }


   // --------- AddFetch Flow ---------
   // Request chain:
   protected createRequestChain = (
      actionName: string,
      tags: string[] = []
   ) => {
      const requestName = this.getRequestName(actionName)
      const successName = this.getSuccessName(actionName)

      const requestTags = ["Request", ...tags]
      const successTags = ["Success", ...tags]

      const doubleEmptyRequestAction = this.produceMethodDoubleEmpty(
         actionName, requestName, requestTags
      )
      const doubleEmptySuccessAction = this.produceMethodDoubleEmpty(
         actionName, successName, successTags
      )
      return ({
         action: <TFetchAction extends Func>(action: TFetchAction) => {
            const emptyProducer = this.produceMethodEmptyProducer<TFetchAction>(
               actionName, requestName, requestTags, action
            )
            return {
               produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFetchAction, TBaseActionType & TAreaActionType>) => void) => {
                  const mappedAction = this.produceMethod<TFetchAction>(
                     actionName, requestName, requestTags, action, producer
                  )
                  return this.createSuccessChain<TFetchAction>(
                     actionName, tags, mappedAction
                  )
               },
               ...this.createSuccessChain<TFetchAction>(
                  actionName, tags, emptyProducer
               ),
               ...this.createFailureChain<TFetchAction, EmptyAction<TBaseActionType & TAreaActionType>>(
                  actionName, tags, emptyProducer, doubleEmptySuccessAction
               ),
            }
         },
         produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void) => {
            const mappedAction = this.produceMethodEmptyAction(
               actionName, requestName, requestTags, producer
            )
            return this.createSuccessChain<() => EmptyActionType<TBaseActionType & TAreaActionType>>(
               actionName, tags, mappedAction
            )
         },
         ...this.createSuccessChain<EmptyAction<TBaseActionType & TAreaActionType>>(
            actionName, tags, doubleEmptyRequestAction
         ),
         ...this.createFailureChain<EmptyAction<TBaseActionType & TAreaActionType>, EmptyAction<TBaseActionType & TAreaActionType>>(
            actionName, tags, doubleEmptyRequestAction, doubleEmptySuccessAction
         ),
      })
   }

   // Success chain:
   protected createSuccessChain = <TFetchRequestAction extends Func>(
      actionName: string,
      tags: string[],
      requestAction: AreaAction<TBaseState, TAreaState, TFetchRequestAction, TBaseActionType & TAreaActionType>,
   ) => {
      const successName = this.getSuccessName(actionName)

      const successTags = ["Success", ...tags]

      const doubleEmptyAction = this.produceMethodDoubleEmpty(
         actionName, successName, successTags
      )
      return ({
         successAction: <TSuccessAction extends Func>(successAction: TSuccessAction) => {
            const emptyProducer = this.produceMethodEmptyProducer<TSuccessAction>(
               actionName, successName, successTags, successAction
            )
            return {
               successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TSuccessAction, TBaseActionType & TAreaActionType>) => void) => {
                  let _successAction = this.produceMethod<TSuccessAction>(
                     actionName, successName, successTags, successAction, successProducer
                  )
                  return this.createFailureChain<TFetchRequestAction, TSuccessAction>(
                     actionName, tags, requestAction, _successAction
                  )
               },
               ...this.createFailureChain<TFetchRequestAction, TSuccessAction>(
                  actionName, tags, requestAction, emptyProducer
               ),
            }
         },
         successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void) => {
            const fetchSuccessAction = this.produceMethodEmptyAction(
               actionName, successName, successTags, successProducer
            )
            return this.createFailureChain<TFetchRequestAction, EmptyAction<TBaseActionType & TAreaActionType>>(
               actionName, tags, requestAction, fetchSuccessAction
            )
         },
         ...this.createFailureChain<TFetchRequestAction, EmptyAction<TBaseActionType & TAreaActionType>>(
            actionName, tags, requestAction, doubleEmptyAction
         )
      })
   }

   // Failure chain:
   protected createFailureChain = <
      TFetchRequestAction extends Func,
      TFetchSuccessAction extends Func,
      >(
         actionName: string,
         tags: string[],
         requestAction: AreaAction<TBaseState, TAreaState, TFetchRequestAction, TBaseActionType & TAreaActionType>,
         successAction: AreaAction<TBaseState, TAreaState, TFetchSuccessAction, TBaseActionType & TAreaActionType>
      ) => {
      let failureName = this.getFailureName(actionName)

      const failureTags = ["Failure", ...tags]

      return ({
         baseFailure: () => {
            if (this.baseOptions.baseFailureAction && this.baseOptions.baseFailureProducer) {
               let failureAction = this.produceMethod<TBaseFailureAction>(
                  actionName, failureName, failureTags, this.baseOptions.baseFailureAction, this.baseOptions.baseFailureProducer
               )
               return this.finalizeChain<TFetchRequestAction, TFetchSuccessAction, TBaseFailureAction>(
                  actionName, requestAction, successAction, failureAction
               )
            }
            throw new Error(`redux-area fetch method: ${actionName} tried to call baseFailureAction/baseFailureReducer, but the base didn't have one. Declare it with Redux-area Base settings`)
         },
         areaFailure: () => {
            if (this.areaOptions.areaFailureAction && this.areaOptions.areaFailureProducer) {
               let failureAction = this.produceMethod<TAreaFailureAction>(
                  actionName, failureName, failureTags, this.areaOptions.areaFailureAction, this.areaOptions.areaFailureProducer
               )
               return this.finalizeChain<TFetchRequestAction, TFetchSuccessAction, TAreaFailureAction>(
                  actionName, requestAction, successAction, failureAction
               )
            }
            throw new Error(`redux-area fetch method: ${actionName} tried to call areaFailureAction/areaFailureReducer, but the area didn't have one. Declare it with Redux-area area settings`)
         },
         failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
            return {
               failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction, TBaseActionType & TAreaActionType>) => void) => {
                  const _failureAction = this.produceMethod<TFailureAction>(
                     actionName, failureName, failureTags, failureAction, failureProducer
                  )
                  return this.finalizeChain<TFetchRequestAction, TFetchSuccessAction, TFailureAction>(
                     actionName, requestAction, successAction, _failureAction
                  )
               }
            }
         },
         failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<TBaseActionType & TAreaActionType>) => void) => {
            const _failureAction = this.produceMethodEmptyAction(
               actionName, failureName, failureTags, failureProducer
            )
            return this.finalizeChain<TFetchRequestAction, TFetchSuccessAction, EmptyAction<TBaseActionType & TAreaActionType>>(
               actionName, requestAction, successAction, _failureAction
            )
         }
      })
   }

   protected finalizeChain = <
      // Other stuff
      TFetchRequestAction extends Func,
      TFetchSuccessAction extends Func,
      TFetchFailureAction extends Func,
      >(
         actionName: string,
         requestAction: AreaAction<TBaseState, TAreaState, TFetchRequestAction, TBaseActionType & TAreaActionType>,
         successAction: AreaAction<TBaseState, TAreaState, TFetchSuccessAction, TBaseActionType & TAreaActionType>,
         failureAction: AreaAction<TBaseState, TAreaState, TFetchFailureAction, TBaseActionType & TAreaActionType>
      ) => {
      this.actions.push(requestAction as unknown as ReduxAction)
      this.actions.push(successAction as unknown as ReduxAction)
      this.actions.push(failureAction as unknown as ReduxAction)
      return {
         request: requestAction,
         success: successAction,
         failure: failureAction,
         actionName
      } as FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, TFetchSuccessAction, TFetchFailureAction, TBaseActionType & TAreaActionType>
   }

}


interface IAreaBaseOptions<
   TBaseState,
   TBaseStandardFailure extends Func,
   TBaseActionsIntercept extends ActionCreatorInterceptor
   > {
   baseState: TBaseState
   baseActionsIntercept?: TBaseActionsIntercept, //(options: ActionCreatorInterceptorOptions) => TBaseActionType
   baseInterceptors?: { [tag: string]: TIntercept<TBaseState, ReturnType<TBaseActionsIntercept>>[] }
   namePostfix?: string[]
   baseNamePrefix?: string,
   addNameSlashes?: boolean,
   addShortNameSlashes?: boolean,
   baseFailureAction?: TBaseStandardFailure,
   baseFailureProducer?: (draft: Draft<TBaseState>, action: ReturnType<TBaseStandardFailure>) => void
}

interface IAreaOptions<
   TBaseState,
   TAreaState,
   TAreaFailureAction extends Func,
   TBaseActionsIntercept extends ActionCreatorInterceptor,
   TAreaActionsIntercept extends ActionCreatorInterceptor,
   TBaseActionType = ReturnType<TBaseActionsIntercept>,
   TAreaActionType = ReturnType<TAreaActionsIntercept>
   > {
   areaFailureAction?: TAreaFailureAction,
   areaFailureProducer?: (draft: Draft<TBaseState & TAreaState>, action: ReturnType<TAreaFailureAction>) => void,
   namePrefix?: string,
   tags?: string[],
   state: TAreaState,
   actionInterceptor?: TAreaActionsIntercept, // (options: ActionCreatorInterceptorOptions) => TBaseActionType,
   areaInterceptors?: { [tag: string]: TIntercept<TBaseState & TAreaState, TBaseActionType & TAreaActionType>[] }
}

class AreaBase<
   TBaseState,
   TBaseStandardFailure extends Func,
   TBaseActionsIntercept extends Func,
   >{
   constructor(
      public baseOptions: IAreaBaseOptions<
         TBaseState,
         TBaseStandardFailure,
         TBaseActionsIntercept
      >
   ) {
   }
   public CreateArea<
      TAreaState,
      TAreaStandardFailure extends Func,
      TAreaActionsIntercept extends Func
   >(
      areaOptions: IAreaOptions<
         TBaseState,
         TAreaState,
         TAreaStandardFailure,
         TBaseActionsIntercept,
         TAreaActionsIntercept
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

// export var SimpleAreaBase = (baseName = "App") => new AreaBase({
//    baseNamePrefix: "@@" + baseName,
//    addNameSlashes: true,
//    addShortNameSlashes: true,
//    baseState: {}
// })

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
   baseActionsIntercept: ({ actionName, actionTags }: ActionCreatorInterceptorOptions) => ({
      actionName,
      actionTags
   }),
   baseInterceptors: {
      "Fetch": [(draft, { actionName }) => {
         draft.errorMessage = "Im fetch!"
      }],
      "Request": [(draft, { actionName }) => {
         draft.loading = true
         draft.loadingMap[actionName] = true
      }],
      "Success": [(draft, { actionName }) => {
         draft.loading = false
         draft.loadingMap[actionName] = false
         draft.errorMessage = "Im fetch! SSS"

      }],
      "Failure": [(draft, { actionName }) => {
         draft.loading = false
         draft.loadingMap[actionName] = false
      }]
   }
})

export default AreaBase
