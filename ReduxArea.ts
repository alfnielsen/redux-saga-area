import produce, { Draft, Immutable } from "immer"
import { AnyAction, Reducer } from 'redux'

export type Func = (...args: any) => any
export type ReduxAction = ((...args: any) => AnyAction) & { name: string; reducer: Reducer }
export type AnyActionBase = { type: string }
export type EmptyActionType<AreaActionType> = { type: string } & AreaActionType
export type EmptyAction<AreaActionType> = () => EmptyActionType<AreaActionType>
export type ReturnTypeAction<TAction extends Func, AreaActionType> = ReturnType<TAction> & EmptyActionType<AreaActionType>
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

export type AreaAction<TBaseState, TAreaState, TAction extends Func, AreaActionType> = ((...args: Parameters<TAction>) => ReturnTypeAction<TAction, AreaActionType>) & {
   name: string,
   actionName: string,
   reducer: Reducer<Immutable<TBaseState & TAreaState>, ReturnTypeAction<TAction, AreaActionType>>,
   use: (draft: Draft<TBaseState & TAreaState>, action: ReturnType<TAction>) => void,
   type: ReturnTypeAction<TAction, AreaActionType>
}

class Area<
   TBaseState,
   TAreaState,
   TBaseFailureAction extends Func,
   TAreaFailureAction extends Func,
   TBaseActionTypeInterceptor extends ActionCreatorInterceptor
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
         TBaseActionTypeInterceptor
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
      if (this.baseOptions.fetchNamePostfix) {
         this.normalNamePostfix = this.baseOptions.fetchNamePostfix[0]
         this.requestNamePostfix = this.baseOptions.fetchNamePostfix[1]
         this.successNamePostfix = this.baseOptions.fetchNamePostfix[2]
         this.failureNamePostfix = this.baseOptions.fetchNamePostfix[3]
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

   public findTagsInterceptors(tags: string[]): [TIntercept<TBaseState, ReturnType<TBaseActionTypeInterceptor>>[], TIntercept<TBaseState & TAreaState, ReturnType<TBaseActionTypeInterceptor>>[]] {
      const baseInterceptors: TIntercept<TBaseState, ReturnType<TBaseActionTypeInterceptor>>[] = []
      const areaInterceptors: TIntercept<TBaseState & TAreaState, ReturnType<TBaseActionTypeInterceptor>>[] = []
      const baseTagInterceptors = this.baseOptions.baseInterceptors || {}
      const tagInterceptors = this.areaOptions.areaInterceptors || {}
      tags.forEach(tag => {
         if (baseTagInterceptors[tag]) {
            baseInterceptors.push(...baseTagInterceptors[tag] as TIntercept<TBaseState, ReturnType<TBaseActionTypeInterceptor>>[])
         }
         if (tagInterceptors[tag]) {
            areaInterceptors.push(...tagInterceptors[tag] as TIntercept<TBaseState & TAreaState, ReturnType<TBaseActionTypeInterceptor>>[])
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
    * @param tags (optional) list of tags
    */
   public add(name: string, tags: string[] = []) {
      return this.createAddChain(name, ["All", "Normal", ...(this.areaOptions.tags || []), ...tags])
   }

   /**
    * Add 3 action (Request, success and failure). \
    * Optional 'interceptRequest', 'interceptSuccess' and 'interceptFailure' in options will effect this. \
    * You can omit any 'action' and/or 'produce' if its not needed. (expect one of the final areaFailure of produceFailure) \
    * @param name
    * @param tags (optional) list of tags
    */
   public addFetch(name: string, tags: string[] = []) {
      return this.createRequestChain(name, ["All", "Fetch", ...(this.areaOptions.tags || []), ...tags])
   }

   protected produceMethod = <
      TAction extends Func,
      >(
         actionName: string,
         name: string,
         actionTags: string[],
         action: TAction,
         producer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TAction, ReturnType<TBaseActionTypeInterceptor>>) => void,
   ) => {
      let [baseIntercept, areaIntercept] = this.findTagsInterceptors(actionTags)

      const baseActionIntercept = this.baseOptions.baseActionsIntercept
      const actionCreator = (...args: Parameters<TAction>) => {
         let actionResult = action.apply(null, args)
         let baseActionResult = {
            ...actionResult,
            type: name
         } as AnyActionBase
         baseActionIntercept && (baseActionResult = { ...baseActionResult, ...baseActionIntercept({ action: baseActionResult, actionName, actionTags }) })
         return baseActionResult as AnyActionBase & ReturnType<TBaseActionTypeInterceptor>
      }
      const mappedAction = actionCreator as AreaAction<TBaseState, TAreaState, TAction, ReturnType<TBaseActionTypeInterceptor>>
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
            value: (state: TBaseState & TAreaState, action: ReturnTypeAction<TAction, ReturnType<TBaseActionTypeInterceptor>>) => produce(state, draft => {
               producer(draft, action)
               baseIntercept && baseIntercept.forEach(inter => inter(draft, action as unknown as EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>))
               areaIntercept && areaIntercept.forEach(inter => inter(draft, action as unknown as EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>))
            }) as unknown as Reducer<Immutable<TBaseState & TAreaState>, ReturnTypeAction<TAction, ReturnType<TBaseActionTypeInterceptor>>>,
            writable: false
         })
      } else {
         Object.defineProperty(mappedAction, 'reducer', {
            value: produce(producer) as Reducer<Immutable<TBaseState & TAreaState>, ReturnTypeAction<TAction, ReturnType<TBaseActionTypeInterceptor>>>,
            writable: false
         })
      }

      Object.defineProperty(mappedAction, 'use', {
         value: (draft: Draft<TBaseState & TAreaState>, action: ReturnType<TAction>) => {
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
      producer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void
   ) => {
      const mappedAction = () => ({}) // as () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>
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
      const producer = () => { } // as (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void
      return this.produceMethod<typeof mappedAction>(
         actionName, name, actionTags, mappedAction, producer
      )
   }

   protected produceMethodDoubleEmpty = (
      actionName: string,
      name: string,
      actionTags: string[]
   ) => {
      const mappedAction = () => ({}) // as () => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>
      const producer = () => { } // as (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void
      return this.produceMethod<typeof mappedAction>(
         actionName, name, actionTags, mappedAction, producer
      )
   }

   protected reduceMethod = <TAction extends Func>(
      actionName: string,
      name: string,
      actionTags: string[],
      action: TAction,
      reducer: (state: TBaseState & TAreaState, reducerAction: TAction) => any
   ) => {
      const baseActionIntercept = this.baseOptions.baseActionsIntercept
      const actionCreator = (...args: Parameters<TAction>) => {
         let actionResult = action.apply(null, args)
         let baseActionResult = {
            ...actionResult,
            type: name
         } as AnyActionBase
         baseActionIntercept && (baseActionResult = { ...baseActionResult, ...baseActionIntercept({ action: baseActionResult, actionName, actionTags }) })
         return baseActionResult as AnyActionBase & ReturnType<TBaseActionTypeInterceptor>
      }
      const mappedAction = actionCreator as AreaAction<TBaseState, TAreaState, TAction, ReturnType<TBaseActionTypeInterceptor>>
      Object.defineProperty(mappedAction, 'name', {
         value: name,
         writable: false
      })
      Object.defineProperty(mappedAction, 'actionName', {
         value: actionName,
         writable: false
      })

      Object.defineProperty(mappedAction, 'reducer', {
         value: reducer as unknown as Reducer<TBaseState & TAreaState, ReturnTypeAction<TAction, ReturnType<TBaseActionTypeInterceptor>>>,
         writable: false
      })

      Object.defineProperty(mappedAction, 'use', {
         value: (draft: TBaseState & TAreaState, action: ReturnType<TAction>) => {
            action.type = mappedAction.name
            return reducer(draft, action)
         },
         writable: false
      })

      return mappedAction
   }

   protected reduceMethodEmpty = (
      name: string,
      actionName: string,
      actionTags: string[],
      reducer: (state: TBaseState & TAreaState) => TBaseState & TAreaState
   ) => {
      const action = () => ({}) // as unknown as (() => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>)
      return this.reduceMethod<typeof action>(
         actionName, name, actionTags, action, reducer
      )
   }

   // --------- Add Flow ---------

   protected createAddChain = (
      actionName: string,
      tags: string[] = []
   ) => {
      const typeName = this.getActionName(actionName)
      type TProduceDraft = Draft<TBaseState & TAreaState>
      return ({
         /**
          * produce (without action defined / auto generated action with 'type' and props from AreaBase)
          * @param producer A produce method that mutates the draft (state)
          * @example
          * .produce((draft, { type }) => {
          *    draft.startProduce = true
          * })
          */
         produce: (producer: (draft: TProduceDraft, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
            const mappedAction = this.produceMethodEmptyAction(
               actionName, typeName, tags, producer
            )
            this.actions.push(mappedAction as unknown as ReduxAction)
            return mappedAction
         },
         reducer: (
            reducer: (state: TAreaState & TBaseState) => any
         ) => {
            const mappedAction = this.reduceMethodEmpty(actionName, typeName, tags, reducer)
            this.actions.push(mappedAction as unknown as ReduxAction)
            return mappedAction
         },
         /**
         * actionCreator ('type' will be added automatically + props defined in AreaBase)
         * @param action ActionCreator
         * @example
         * .action((id: number) => ({ id })
         */
         action: <TAction extends Func>(action: TAction) => {
            type MappedAction = ReturnTypeAction<TAction, ReturnType<TBaseActionTypeInterceptor>>
            //  MappedAction & {magic!}
            return {
               /**
                * produce (props from 'action' method, plus auto generated 'type' and props from AreaBase)
                * @param producer A produce method that mutates the draft (state)
                * @example
                * .produce((draft, { id }) => {
                *    draft.productId = id
                * })
                */
               produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: MappedAction) => void) => {
                  const mappedAction = this.produceMethod<TAction>(
                     actionName, typeName, tags, action, producer
                  )
                  this.actions.push(mappedAction as unknown as ReduxAction)
                  return mappedAction
               },
               reducer: (
                  reducer: (state: TAreaState & TBaseState) => any
               ) => {
                  const mappedAction = this.reduceMethod(actionName, typeName, tags, action, reducer)
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
         /**
          * Fetch - request action - actionCreator ('type' will be added automatically + props defined in AreaBase)
          * @param action ActionCreator
          * @example
          * .action((id: number) => ({ id })
          */
         action: <TFetchAction extends Func>(action: TFetchAction) => {
            const emptyProducer = this.produceMethodEmptyProducer<TFetchAction>(
               actionName, requestName, requestTags, action
            )
            return {
               /**
                * fetch - produce request (props from 'action' method, plus auto generated 'type' and props from AreaBase)
                * @param producer A produce method that mutates the draft (state)
                * @example
                * .produce((draft, { id }) => {
                *    draft.productId = id
                * })
                */
               produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFetchAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
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
               ...this.createFailureChain<TFetchAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>>(
                  actionName, tags, emptyProducer, doubleEmptySuccessAction
               ),
            }
         },
         /**
          * fetch - produce request (without action defined / auto generated action with 'type' and props from AreaBase)
          * @param producer A produce method that mutates the draft (state)
          * @example
          * .produce((draft, { type }) => {
          *    draft.startProduce = true
          * })
          */
         produce: (producer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
            const mappedAction = this.produceMethodEmptyAction(
               actionName, requestName, requestTags, producer
            )
            return this.createSuccessChain<() => EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>>(
               actionName, tags, mappedAction
            )
         },
         ...this.createSuccessChain<EmptyAction<ReturnType<TBaseActionTypeInterceptor>>>(
            actionName, tags, doubleEmptyRequestAction
         ),
         ...this.createFailureChain<EmptyAction<ReturnType<TBaseActionTypeInterceptor>>, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>>(
            actionName, tags, doubleEmptyRequestAction, doubleEmptySuccessAction
         ),
      })
   }

   // Success chain:
   protected createSuccessChain = <TFetchRequestAction extends Func>(
      actionName: string,
      tags: string[],
      requestAction: AreaAction<TBaseState, TAreaState, TFetchRequestAction, ReturnType<TBaseActionTypeInterceptor>>,
   ) => {
      const successName = this.getSuccessName(actionName)

      const successTags = ["Success", ...tags]

      const doubleEmptyAction = this.produceMethodDoubleEmpty(
         actionName, successName, successTags
      )
      return ({
         /**
          * Fetch - success action - actionCreator ('type' will be added automatically + props defined in AreaBase)
          * @param action ActionCreator
          * @example
          * .successAction((products: IProduct[]) => ({ products })
          */
         successAction: <TSuccessAction extends Func>(successAction: TSuccessAction) => {
            const emptyProducer = this.produceMethodEmptyProducer<TSuccessAction>(
               actionName, successName, successTags, successAction
            )
            return {
               /**
                * fetch - produce success (props from 'successAction' method, plus auto generated 'type' and props from AreaBase)
                * @param producer A produce method that mutates the draft (state)
                * @example
                * .produce((draft, { products }) => {
                *    draft.products = products
                * })
                */
               successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TSuccessAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
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
         /**
          * fetch - produce success (without action defined / auto generated action with 'type' and props from AreaBase)
          * @param producer A produce method that mutates the draft (state)
          * @example
          * .successProduce((draft, { products }) => {
          *    draft.products = products
          * })
          */
         successProduce: (successProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
            const fetchSuccessAction = this.produceMethodEmptyAction(
               actionName, successName, successTags, successProducer
            )
            return this.createFailureChain<TFetchRequestAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>>(
               actionName, tags, requestAction, fetchSuccessAction
            )
         },
         ...this.createFailureChain<TFetchRequestAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>>(
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
         requestAction: AreaAction<TBaseState, TAreaState, TFetchRequestAction, ReturnType<TBaseActionTypeInterceptor>>,
         successAction: AreaAction<TBaseState, TAreaState, TFetchSuccessAction, ReturnType<TBaseActionTypeInterceptor>>
      ) => {
      let failureName = this.getFailureName(actionName)

      const failureTags = ["Failure", ...tags]

      return ({
         /**
          * Standard Fetch Failure produce method (including failure action). This is defined in the AreaBase.
          * @example
          * .baseFailure()
          */
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
         /**
          * Standard Fetch Failure produce method (including failure action). This is defined in the Area.
          * @example
          * .baseFailure()
          */
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
         /**
          * Fetch - failure action - actionCreator ('type' will be added automatically + props defined in AreaBase)
          * @param action ActionCreator
          * @example
          * .failureAction((error: Error) => ({ error })
          */
         failureAction: <TFailureAction extends Func>(failureAction: TFailureAction) => {
            return {
               /**
                * fetch - produce failure (props from 'failureAction' method, plus auto generated 'type' and props from AreaBase)
                * @param producer A produce method that mutates the draft (state)
                * @example
                * .produce((draft, { error }) => {
                *    draft.error = error
                * })
                */
               failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: ReturnTypeAction<TFailureAction, ReturnType<TBaseActionTypeInterceptor>>) => void) => {
                  const _failureAction = this.produceMethod<TFailureAction>(
                     actionName, failureName, failureTags, failureAction, failureProducer
                  )
                  return this.finalizeChain<TFetchRequestAction, TFetchSuccessAction, TFailureAction>(
                     actionName, requestAction, successAction, _failureAction
                  )
               }
            }
         },
         /**
          * fetch - produce failure (without action defined / auto generated action with 'type' and props from AreaBase)
          * @param producer A produce method that mutates the draft (state)
          * @example
          * .failureProduce((draft, { error }) => {
          *    draft.error = error
          * })
          */
         failureProduce: (failureProducer: (draft: Draft<TBaseState & TAreaState>, action: EmptyActionType<ReturnType<TBaseActionTypeInterceptor>>) => void) => {
            const _failureAction = this.produceMethodEmptyAction(
               actionName, failureName, failureTags, failureProducer
            )
            return this.finalizeChain<TFetchRequestAction, TFetchSuccessAction, EmptyAction<ReturnType<TBaseActionTypeInterceptor>>>(
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
         requestAction: AreaAction<TBaseState, TAreaState, TFetchRequestAction, ReturnType<TBaseActionTypeInterceptor>>,
         successAction: AreaAction<TBaseState, TAreaState, TFetchSuccessAction, ReturnType<TBaseActionTypeInterceptor>>,
         failureAction: AreaAction<TBaseState, TAreaState, TFetchFailureAction, ReturnType<TBaseActionTypeInterceptor>>
      ) => {
      this.actions.push(requestAction as unknown as ReduxAction)
      this.actions.push(successAction as unknown as ReduxAction)
      this.actions.push(failureAction as unknown as ReduxAction)
      return {
         request: requestAction,
         success: successAction,
         failure: failureAction,
         actionName
      } as FetchAreaAction<TBaseState, TAreaState, TFetchRequestAction, TFetchSuccessAction, TFetchFailureAction, ReturnType<TBaseActionTypeInterceptor>>
   }

}


export interface IAreaBaseOptions<
   TBaseState,
   TBaseStandardFailure extends Func,
   TBaseActionsIntercept extends ActionCreatorInterceptor
   > {
   baseState: TBaseState
   baseActionsIntercept: TBaseActionsIntercept,
   baseNamePrefix?: string,
   fetchNamePostfix?: string[]
   addNameSlashes?: boolean,
   addShortNameSlashes?: boolean,
   baseFailureAction?: TBaseStandardFailure,
   baseFailureProducer?: (draft: Draft<TBaseState>, action: ReturnTypeAction<TBaseStandardFailure, & ReturnType<TBaseActionsIntercept>>) => void
   baseInterceptors?: { [tag: string]: TIntercept<TBaseState, ReturnType<TBaseActionsIntercept>>[] }
}

export interface IAreaOptions<
   TBaseState,
   TAreaState,
   TAreaFailureAction extends Func,
   TBaseActionTypeInterceptor extends ActionCreatorInterceptor
   > {
   state: TAreaState,
   namePrefix?: string,
   tags?: string[],
   areaFailureAction?: TAreaFailureAction,
   areaFailureProducer?: (draft: Draft<TBaseState & TAreaState>, action: ReturnType<TAreaFailureAction>) => void,
   areaInterceptors?: { [tag: string]: TIntercept<TBaseState & TAreaState, ReturnType<TBaseActionTypeInterceptor>>[] }
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
      >(
         areaOptions: IAreaOptions<
            TBaseState,
            TAreaState,
            TAreaStandardFailure,
            TBaseActionsIntercept
         >
      ) {
      const area = new Area(
         this.baseOptions,
         areaOptions
      )
      return area
   }

}

export interface IFetchAreaBaseState {
   loading: boolean,
   loadingMap: { [key: string]: boolean },
   error?: Error,
   errorMessage: string,
   errorMap: {
      [key: string]: {
         error: Error,
         message: string,
         count: number
         currentCount: number
      }
   },
}

export var SimpleAreaBase = (baseName = "App") => new AreaBase({
   baseNamePrefix: "@@" + baseName,
   addNameSlashes: true,
   addShortNameSlashes: true,
   baseState: {},
   baseActionsIntercept: (/*{ actionName }: ActionCreatorInterceptorOptions*/) => ({/*actionName*/ }), // simple action don't add actionName
})

export var FetchAreaBase = (baseName = "App") => new AreaBase({
   baseNamePrefix: "@@" + baseName,
   addNameSlashes: true,
   addShortNameSlashes: true,
   baseState: {
      loading: false,
      loadingMap: {},
      error: undefined,
      errorMap: {},
      errorMessage: ''
   } as IFetchAreaBaseState,
   baseFailureAction: (error: Error) => ({ error }),
   baseFailureProducer: ((draft, { error, actionName }) => {
      draft.error = error
      draft.errorMessage = error.message
      draft.errorMap[actionName] = {
         error,
         message: error.message,
         count: draft.errorMap[actionName] ? draft.errorMap[actionName].count + 1 : 1,
         currentCount: draft.errorMap[actionName] ? draft.errorMap[actionName].count + 1 : 1
      }
   }),
   baseActionsIntercept: ({ actionName }: ActionCreatorInterceptorOptions) => ({
      actionName
   }),
   baseInterceptors: {
      "Request": [(draft, { actionName }) => {
         draft.loading = true
         draft.loadingMap[actionName] = true
      }],
      "Success": [(draft, { actionName }) => {
         draft.loading = false
         draft.loadingMap[actionName] = false
         if (draft.errorMap[actionName]) {
            draft.errorMap[actionName].currentCount = 0
         }
      }],
      "Failure": [(draft, { actionName }) => {
         draft.loading = false
         draft.loadingMap[actionName] = false
      }]
   }
})

export default AreaBase
