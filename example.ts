import CreateReduxArea from "./ReduxArea"

export interface IMyAreaState {
   name: string
}
const area = CreateReduxArea<IMyAreaState>({
   name: ''
})

const updateName = area
   .add('MY_AREA_UPDATE_NAME')
   .action((name: string) => ({
      name
   }))
   .produce((draft, { name }) => {
      draft.name = name
   })

// Export Redux area
export const MyAreaActions = {
   updateName
}
export const MyAreaInitState = area.initialState
export const MyAreaRootReducer = area.rootReducer

