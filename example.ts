import CreateReduxArea from "./ReduxArea"

// Optional state interface.
// You can also get it from (typeof area.initialState)
export interface IMyAreaState {
   readonly name: string
   readonly loading: boolean
   readonly error?: Error
}

const area = CreateReduxArea<IMyAreaState>({
   name: '',
   loading: false
})
area.options({
   namePrefix: '@@MyApp/MyArea/',
   fetchPostfix: ['Fetch', 'Success', 'Failure']
})

const updateName = area
   .add('MY_AREA_UPDATE_NAME')
   .action((name: string) => ({
      name
   }))
   .produce((draft, { name }) => {
      draft.name = name
   })

const clearName = area
   .add('MY_AREA_CLEAR_NAME')
   .produce((draft) => {
      draft.name = undefined
   })

const getName = area
   .addFetch('MY_AREA_GET_NAME')
   .action((id: number) => ({ id }))
   .produce((draft) => {
      draft.loading = true
   })
   .successAction((name: string) => ({ name }))
   .successProduce((draft, { name }) => {
      draft.name = name
      draft.loading = false
   })
   .failureAction((error: Error) => ({ error }))
   .failureProduce((draft, { error }) => {
      draft.loading = false
      draft.error = error
   })

const getAllTypes = area
   .addFetch('GetTypes')
   .action((id: number) => ({ id }))
   .produce((draft) => {
      draft.loading = true
   })
   .successAction((name: string) => ({ name }))
   .successProduce((draft, { name }) => {
      draft.name = name
      draft.loading = false
   })
   .failureAction((error: Error) => ({ error }))
   .failureProduce((draft, { error }) => {
      draft.loading = false
      draft.error = error
   })


export type UpdateNameType = typeof updateName.type

// Export Redux area
export const MyAreaActions = {
   updateName,
   clearName,
   getNameFetch: getName.fetch,
   getNameSuccess: getName.success,
   getNameFailure: getName.failure
}

export const MyAreaInitState = area.initialState
export const MyAreaRootReducer = area.rootReducer

