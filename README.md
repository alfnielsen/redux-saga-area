## Install

```sh
npm install redux-area
```

Or

```sh
yarn add redux-area
```

## Usage

### 1 Define an area

Create an interface that describe the initial state for the redux area
then create it with the default values:

```ts
import CreateReduxArea from './ReduxArea'

interface IMyAreaState {
   name: string
}

const area = CreateReduxArea<IMyAreaState>({
   name: ''
})
```

### 2 Add Actions

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

In this case the actual action will be defined as: `{ type: string, name: string}`

### 3 Export area (Actions, Names, Reducers and AreaRootReducer)

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

> _NOTE:_ If you using React, consider exporting an actionDispatcherMap by using the [react-redux-action-dispatcher](url will come) package

Each action has added two properties: `name` and `reducer`

If your using Saga's or other types of reducer/elements that need the action name,
you can get them by the _name_ property:

```ts
const action = updateName // => the action creator
const actionName = updateName.name // => 'MY_AREA_UPDATE_NAME'
const reducer = updateName.reducer // => the reducer method
```

An area contains three properties: `rootReducer`, `actions` and `initialState`

```ts
export const MyAreaInitState = area.initialState
export const MyAreaRootReducer = area.rootReducer
```

## Full Example

```ts
import CreateReduxArea from './ReduxArea'

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
```

## Immer

Redux-area uses the [immer](https://github.com/immerjs/immer) project as is base for creating simplified reducers.

## produce vs reducer

It recommended to always use 'produce' instead of 'reducer'.
The 'produce' uses [immer](https://github.com/immerjs/immer) to ensure immutable state,
Using 'reducer' will creates a normal redux reduce,
and you need to ensure immutable state your self.

You can still use 'reducer' for rare case super optimized reducer if your project need it.

## Debug your producer

The produce functionality from [immer](https://github.com/immerjs/immer) creates a Proxy object,
and you will not be able to console.log(draft) you draft state.

In this case you can change the 'produce' to 'reducer' to create a normal reducer.
It will not actually work as a reducer since you don't return a new state,
but you will be able to console.log and debug state values.

## Recommended to React Projects

This redux-area is maintained along side the npm package react-dispatch-action.

Both project are 100% independent, but the author recommended to use both on react projects.
react-dispatch-action transform an map of strongly typed redux areas
into a map of strongly typed dispatch actions.
