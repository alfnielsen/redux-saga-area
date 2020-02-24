# Redux-area

**Short:** `Simplified strongly typed redux`

When defining redux actions and reducers with typescript,
you often need a lot of typing for interfaces to ensure that you can use your actions,
action-creators and reducers with autocompletion ect.

redux-area tries to simplify creation of redux logic by hiding / calculating types,
and thereby holding the code more clean.

It uses the [immer](https://github.com/immerjs/immer) npm module for keeping the reducers as simple as possible.

> You can create normal reducers if you need them

Source: [github/redux-area](https://github.com/alfnielsen/redux-area) | [npm/redux-area](https://www.npmjs.com/package/redux-area)

Demo: [Demo in React](https://codesandbox.io/s/redux-area-base-ex-obn9u?fontsize=14&hidenavigation=1&theme=dark)
_(More demos in the bottom)_

[Documentation](https://github.com/alfnielsen/redux-area/wiki)

**The goal is:** to ease and reduce the amount of code we need to write to get all benefits of both

- redux _(single truth, deterministic state transition and view rendering, time travel ect..)_
  and
- typescript _(strongly typed symbols and interfaces, code checking/nullable check, auto-rewriting, autocompletion, auto-importing ect..)_.

**Terminology**

In redux-area we will talk about:

- action

This is an `action creator`, a method the generate an redux action, which is a plain object with at least a `type: string` property.

From version 0.3.1, redux-area will also include `actionName: string`

Redux-area calculate the interface for each action by making a union of the result of an action creator and adding the `type` and `actionName` under the hood _(plus the result of action interceptions, if is added to the redux-area)_

- produce (comes from the [immer](https://github.com/immerjs/immer) project).

This is called a `reducer` in normal redux. A reducer takes the current state an and action and return the next state.
A `procuder` takes a proxy of the state an and action and don't return anything. In the producer you can mutate the proxy state called a `draft` and [immer](https://github.com/immerjs/immer) will calculate the next state from the `draft` proxy. ([Immer](https://github.com/immerjs/immer) will also make the next state immutable, ensuring the principles of redux)

- fetch

Redux-area has a specialized `addFetch` method, that generate 3 actions (a request, success and failure).
This is simply to enable less code writing and to group this common functionality, that does servser/api calls.

Combined with 'omitting' and 'interception' this can radically simplify the code needed.

## Usage

1. Add an area
2. Add area action
3. Export area's rootReducer and actions
4. Register the rootReucer in a store (As normal redux)
5. Enjoy your new simple and easy redux logic

MyArea.ts

```ts
import { FetchAreaBase } from 'redux-area'

// State (Optional)
export interface IMyAreaState {
   name: string,
   loading: boolean
   error?: Error
}

// Create Area
const area = FetchAreaBase(MyApp).CreateArea({
   namePrefix: 'MyArea',
   state: {
     name: ''
   }
)

// Add single action
const updateName = area
   .add('updateName')
   .action((name: string) => ({
      name
   }))
   .produce((draft, { name }) => {
      draft.name = name
   })

// Add single empty action (action has only a type and no other values)
const clearName = area
   .add('clearName')
   .produce(draft => {
      draft.name = ''
   })

// Add fetch action (3 actions)
const getName = area
   .addFetch('getName')
   .action((id: number) => ({ id }))
   .produce((draft) => {
      draft.name = ''
   })
   .successAction((name: string) => ({ name }))
   .successProduce((draft, { name }) => {
      draft.name = name
   })
   .failureAction((error: Error) => ({ error }))
   .failureProduce((draft, { error }) => {
      draft.error = error
   })

// We don't need to add empty action (They will still be created in the 'getNewName')
export const getNewName = area
   .addFetch('getNewName')
   .successAction((newName: string) => ({ newName }))
   .successProduce((draft, { newName }) => {
      draft.name = newName
   })
   .baseFailure()

// Export Redux actions
export const MyAreaActions = {
   updateName,
   clearName,
   getNameFetch: getName.fetch,
   getNameSuccess: getName.success,
   getNameFailure: getName.failure,
   // By exporting the 'getNewName',
   // Saga's ect. can get the success and failure methods,
   // and you only have to expose then fetch to views.
   // (Or you can add all like the 'getName')
   getNewName: getNewName.fetch
}
// You can get the action type definition for Saga's, custom reducers, ect. like this:
type UpdateNameActionType = typeof updateName.type

// Export initial state for area
export const MyAreaInitState = area.initialState
// Export root-reducer for area
export const MyAreaRootReducer = area.rootReducer()
```

configureStore.ts (The same as normal redux)

```ts
import { createStore, combineReducers } from "redux"
import { MyAreaRootReducer, IMyAreaState } from "./MyArea.ts"
import { OtherAreaRootReducer, IOtherAreaState } from "./OtherAreaReducer.ts"
// import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly' // <-- Add for Dev Extention

// Optional create full interface for entire store:
export interface StoreState {
  myArea: IMyAreaState
  otherArea: IOtherAreaState
}

// Combined different areas into the store root reducer
const rootReducer = combineReducers({
  myArea: MyAreaRootReducer,
  otherArea: OtherAreaRootReducer
})

// Normal redux store setup
const configureStore = () => {
  const newStore = createStore(
    rootReducer
    // composeWithDevTools() // <-- Add for Dev Extention
    //applyMiddleware(...middleware),
  )
  return newStore
}
```

## Install

```sh
npm install redux-area
```

Or

```sh
yarn add redux-area
```

## Demo

_(editable codesandbox.io)_

Demo: [Demo in React](https://codesandbox.io/s/redux-area-base-ex-obn9u?fontsize=14&hidenavigation=1&theme=dark)

Demo: [Demo in React (No interfaces)](https://codesandbox.io/s/redux-area-no-interfaces-r256o?fontsize=14&hidenavigation=1&theme=dark)

[![Demo CountPages alpha](./ExImage.png)](https://codesandbox.io/s/redux-area-no-interfaces-r256o?fontsize=14&hidenavigation=1&theme=dark)
