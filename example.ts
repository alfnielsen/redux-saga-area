import AreaBase, { FetchAreaBase } from "./ReduxArea"

// Optional state interface.
// You can also get it from (typeof area.initialState)
export interface IMyAreaState {
   readonly name: string
   readonly lastCall: string,
   readonly types: string[]
}

const area = FetchAreaBase("@@MyApp").CreateArea({
   namePrefix: "MyArea",
   state: {
      name: '',
      lastCall: '',
      types: []
   } as IMyAreaState
})

const getAllType = area
   .addFetch('getAllType')
   .successAction((types: string[]) => ({ types }))
   .successProduce((draft, { types }) => {
      draft.types = types
   })


const updateName = area
   .add('updateName')
   .action((name: string) => ({
      name
   }))
   .produce((draft, { name }) => {
      clearName.use(draft, {})
      draft.name = name
   })

const clearName = area
   .add('clearName')
   .produce((draft) => {
      draft.name = undefined
   })

const getName = area
   .addFetch('getName')
   .action((id: number) => ({ id }))
   .successAction((name: string) => ({ name }))
   .successProduce((draft, { name }) => {
      draft.name = name
   })
   .failureAction((error: Error) => ({ error }))
   .failureProduce((draft, { error }) => {
      draft.loading = false
      draft.error = error
      // write you own failure for this action
   })

const getAllTypes = area
   .addFetch('getAllTypes')
   .action((id: number) => ({ id }))
   .produce((draft) => {
      draft.loading = true
   })
   .successAction((name: string) => ({ name }))
   .successProduce((draft, { name }) => {
      draft.name = name
      draft.loading = false
   })
   .baseFailure()


export type UpdateNameType = typeof updateName.type

// Export Redux area
export const MyAreaActions = {
   updateName,
   clearName,
   getNameFetch: getName.request,
   getNameSuccess: getName.success,
   getNameFailure: getName.failure
}

export const MyAreaInitState = area.initialState
export const MyAreaRootReducer = area.rootReducer()


// -------- Entity Area Base

export interface IEntity {
   id: number
}
export interface IEntityAreaBaseState {
   current?: IEntity
   error?: Error
   errorMessage?: string
}

export const EntityAreaBase = new AreaBase({
   baseNamePrefix: "@@App/Entity",
   addNameSlashes: true,
   addShortNameSlashes: true,
   baseState: {
      current: undefined,
   } as IEntityAreaBaseState,
   baseActionsIntercept: () => ({}),
   baseFailureAction: (error: Error) => ({ error }),
   baseFailureProducer: ((draft, { error }) => {
      draft.error = error
      draft.errorMessage = error.message
   }),
})

const StandardLoadEntity = <TEntity extends IEntity>(name: string, area: typeof EntityAreaBase.areaType) => {
   return area.addFetch(name)
      .action((id: number) => ({ id }))
      .successAction((elm: TEntity) => ({ elm }))
      .successProduce((draft, { elm }) => {
         draft.current = elm
      })
      .baseFailure()
}

export interface IUserEntity extends IEntity {
   id: number
   name: string,
   age: number
}
export interface IUserAreaState {
   current?: IUserEntity
}

const userArea = EntityAreaBase.CreateArea({
   state: {
      countLoads: 0
   } as IUserAreaState
})

const load = StandardLoadEntity("loadUser", userArea)

