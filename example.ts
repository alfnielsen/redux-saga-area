import CreateReduxArea from "./ReduxArea"

// Optional state interface.
// You can also get it from (typeof area.initialState)
export interface IMyAreaState {
   readonly name: string
   readonly lastCall: string,
   readonly loading: boolean
   readonly error?: Error
   readonly types: string[]
}

const area = CreateReduxArea<IMyAreaState>({
   name: '',
   lastCall: '',
   loading: false,
   types: []
}).options({
   namePrefix: '@@MyApp/MyArea/',
   fetchPostfix: ['Request', 'Success', 'Failure'],
   interceptNormal: (draft, { type }) => {
      draft.lastCall = type
   },
   interceptRequest: (draft) => {
      draft.loading = true
   },
   interceptSuccess: (draft) => {
      draft.loading = false
   },
   interceptFailure: (draft) => {
      draft.loading = false
   }
}).setStandardFetchFailure(
   (error: Error) => ({ error }),
   (draft, { error }) => {
      draft.error = error
   }
)

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
   .standardFailure()


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

