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

export type UpdateNameType = typeof updateName.type

// Export Redux area
export const MyAreaActions = {
   updateName
}

export const MyAreaInitState = area.initialState
export const MyAreaRootReducer = area.rootReducer

