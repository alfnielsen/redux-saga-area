import CreateReduxArea from "./ReduxArea"

// Optional state interface.
// You can also get it from (typeof area.initialState)
export interface IMyAreaState {
   readonly name: string
}

const area = CreateReduxArea({
   name: ''
})

const updateName = area
   .add('MY_AREA_UPDATE_NAME')
   .action((name: string) => ({
      name
   }))
   .produce((draft, { name, type }) => {
      draft.name = name
   })

const clearName = area
   .add('MY_AREA_CLEAR_NAME')
   .produce((draft, { type }) => {
      draft.name = undefined
   })

export type UpdateNameType = typeof updateName.type

// Export Redux area
export const MyAreaActions = {
   updateName,
   clearName
}

export const MyAreaInitState = area.initialState
export const MyAreaRootReducer = area.rootReducer

