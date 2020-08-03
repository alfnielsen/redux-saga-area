import { call } from 'redux-saga/effects'

import AreaBase, { FetchSagaAreaBase } from "./ReduxSagaArea"

// Optional state interface.
// You can also get it from (typeof area.initialState)
export interface IMyAreaState {
   readonly name: string
   readonly lastCall: string,
   readonly types: string[]
}

const area = FetchSagaAreaBase("@@MyApp").CreateArea({
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

interface IUser { id: number, name: string, userName: string, email: string }
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

area.takeLatest(getName, function* ({ id }) {
   const user: IUser = yield call(() =>
      fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
         .then(response => response.json())
         .then(myJson => myJson)
   )
   getName.success(user.name)
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

const StandardLoadEntitySuccess = (draft: typeof EntityAreaBase.draftType, elm: IEntity) => {
   draft.current = elm
}

const StandardLoadEntity = <TEntity extends IEntity>(name: string, area: typeof EntityAreaBase.areaType) => {
   return area.addFetch(name)
      .action((id: number) => ({ id }))
      .successAction((elm: TEntity) => ({ elm }))
      .successProduce((draft, { elm }) => {
         StandardLoadEntitySuccess(draft, elm)
      })
      .baseFailure()
}

export interface IUserEntity extends IEntity {
   id: number
   name: string,
   age: number
}
export interface IUserAreaState {
   current?: IUserEntity,
   countLoads: number
}

const userArea = EntityAreaBase.CreateArea({
   state: {
      countLoads: 0
   } as IUserAreaState
})

const load = StandardLoadEntity("loadUser", userArea)




// -------- Entity Search Area Base

export interface ISearchTerms<TEntity, TExtra> {
   type: TEntity[]
   extra: TExtra
}

export interface IEntitySearchAreaBaseState<TEntity> {
   found: TEntity[]
   error?: Error
   errorMessage?: string
}

export const EntitySearchAreaBase = new AreaBase({
   baseNamePrefix: "@@App/EntitySearch",
   addNameSlashes: true,
   addShortNameSlashes: true,
   baseState: {
      found: []
   } as IEntitySearchAreaBaseState<IEntity>,
   baseActionsIntercept: () => ({}),
   baseFailureAction: (error: Error) => ({ error }),
   baseFailureProducer: ((draft, { error }) => {
      draft.error = error
      draft.errorMessage = error.message
   }),
})

const StandardEntitySearchAction = <TEntity, TExtra>() => (searchTerms: ISearchTerms<TEntity, TExtra>, reset?: boolean) => ({
   searchTerms,
   reset
})

const StandardEntitySearchProduce = <TEntity, TExtra>() => (draft: typeof EntitySearchAreaBase.draftType, action: { searchTerms: ISearchTerms<TEntity, TExtra>, reset?: boolean }) => {
   if (action.reset) {
      draft.found = []
   }
}
const StandardEntitySearchSuccessAction = () => (found: IEntity[]) => ({
   found
})

const StandardEntitySearchSuccessProduce = () => (draft: typeof EntitySearchAreaBase.draftType, action: { found: IEntity[] }) => {
   draft.found = action.found
}

const StandardEntitySearch = (name: string, area: typeof EntitySearchAreaBase.areaType) => {
   return area.addFetch(name)
      .action(StandardEntitySearchAction())
      .produce(StandardEntitySearchProduce())
      .successAction(StandardEntitySearchSuccessAction())
      .successProduce(StandardEntitySearchSuccessProduce())
      .baseFailure()
}


export interface IUserAreaState extends IEntitySearchAreaBaseState<IUserEntity> {

}

const userSearchArea = EntitySearchAreaBase.Create<IUserAreaState>('userSearch', {
   found: [] as IUserEntity[],
   countLoads: 0
})

const searchUser = StandardEntitySearch("searchUser", userSearchArea)

export const searchActon = {
   searchUser: searchUser.request,
   failure: searchUser.failure,
   success: searchUser.success,
   clear: searchUser.clear
}

// cross area listen
area.listen(searchActon.success, function* (action) {

})
