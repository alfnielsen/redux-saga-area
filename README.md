# Redux-area

## Description

**Short:** `Simplified strongly typed redux`

When defining redux actions and reducers with typescript,
you often need a lot of typing for interfaces to ensure that you can use your actions,
action-creators and reducers with autocompletion ect.

redux-area tries to simplify creation of redux logic by hiding / calculating types,
and thereby holding the code more clean.

It uses the [immer](https://github.com/immerjs/immer) npm module for keeping the reducers as simple as possible.

> You can create normal reducers if you need them

Source: [github/redux-area](https://github.com/alfnielsen/redux-area) | [npm/redux-area](https://www.npmjs.com/package/redux-area)

Demo: [Demo in React](https://codesandbox.io/s/hardcore-snow-jql32?fontsize=14) _(editable codesandbox.io)_

## Example

MyArea.ts

```ts
import CreateReduxArea from 'redux-area'

// State
export interface IMyAreaState {
   name: string
}
// InitialState
const area = CreateReduxArea<IMyAreaState>({
   name: ''
})
// Add action
const updateName = area
   .add('MY_AREA_UPDATE_NAME')
   .action((name: string) => ({
      name
   }))
   .produce((draft, { name }) => {
      draft.name = name
   })

// Export Redux actions
export const MyAreaActions = {
   updateName
}
// You can get the action type definition for Saga custom reducers ect. like this:
type UpdateNameActionType = typeof updateName.type

// Export initial state for area
export const MyAreaInitState = area.initialState
// Export root-reducer for area
export const MyAreaRootReducer = area.rootReducer
```

configureStore.ts

```ts
import { createStore, combineReducers } from 'redux'
import { MyAreaRootReducer, IMyAreaState } from './MyArea.ts'
import { OtherAreaRootReducer, IOtherAreaState } from './OtherAreaReducer.ts'
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

## Usage

### 1) Define an area

Create an interface that describe the initial state for the redux area
then create it with the default values:

```ts
import CreateReduxArea from 'redux-area'

interface IMyAreaState {
   name: string
}

const area = CreateReduxArea<IMyAreaState>({
   name: ''
})
```

### 2) Add Actions

You can now add actions to the area:

```ts
const updateName = area
   .add('MY_AREA_UPDATE_NAME')
   .action((name: string) => ({
      name
   }))
   .produce((draft, { name }) => {
      draft.name = name
   })
```

redux-area will use typescripts generic `ReturnType` and `Parameters` to
determent how the actions is by extracting the return from the actionCreator.
The type defined in `add` will automatically be added.

In this case the actual action will be defined as: `{ type: string, name: string}`

### 3) Export area (Actions, Names, Reducers and AreaRootReducer)

How you want to export the actionCreators is up to you and your team.

You can export each action directly if you prefer:

```ts
export const updateName = area
   .add('MY_AREA_UPDATE_NAME')
   (...)
```

Or as an area action map:

```ts
export const MyAreaActions = {
   updateName,
   (...)
}
```

Each action has added two properties: `name` and `reducer`

If your using Saga's or other types of reducer/elements that need the action name,
you can get them by the _name_ property and you can get the type definition with the _type_ property:

```ts
const action = updateName // => the action creator
const actionName = updateName.name // => 'MY_AREA_UPDATE_NAME'
const reducer = updateName.reducer // => the reducer method
type ActionType = typeof updateName.type // => undefined (Only for type definition)
```

An area contains three properties: `rootReducer`, `actions` and `initialState`

```ts
export const MyAreaInitState = area.initialState
export const MyAreaRootReducer = area.rootReducer
```

## Immer

Redux-area uses the [immer](https://github.com/immerjs/immer) project as it's base for creating simplified reducers.

## produce vs reducer

Its recommended to always use `produce` instead of `reducer`.
The `produce` uses [immer](https://github.com/immerjs/immer) to ensure immutable state,

Using `reducer` will creates a normal redux reducer,
and you need to ensure immutable state yourself.

You can still use `reducer` for the rare cases, where optimized reducer's are needed.

## Debug your producer

The _produce_ functionality from [immer](https://github.com/immerjs/immer) creates a Proxy object,
and you will not be able to console.log(draft) you draft state.

In this case you can change the 'produce' to 'reducer' to create a normal reducer.
It will not actually work as a reducer since you don't return a new state,
but you will be able to console.log and debug state values.
