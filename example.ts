import { FetchAreaBase } from "./ReduxArea"

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
export const MyAreaRootReducer = area.rootReducer

