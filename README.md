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

Fell free to add issue's in the git repository if you have examples of what would work well for your project.
At the moment there is added experimental interception features in the @next version.

**The goal is:** to easy and lessen the amount of code we need to write to get all benefits of both

- redux _(single truth, deterministic state transition and view rendering, time travel ect..)_
  and
- typescript _(strongly typed symbols and interfaces, code checking/nullable check, auto-rewriting, autocompletion, auto-importing ect..)_.

## Example

MyArea.ts

```ts
import CreateReduxArea from 'redux-area'

// State (Optional)
export interface IMyAreaState {
   name: string,
   loading: boolean
   error?: Error
}
// InitialState
const area = CreateReduxArea<IMyAreaState>({
   name: ''
   loading: false
})

// Change options for area (Optional)
area.options({
   namePrefix: '@@MyApp/MyArea/',
})

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
   .produce(draft => {
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

// Export Redux actions
export const MyAreaActions = {
   updateName,
   clearName,
   getNameFetch: getName.fetch,
   getNameSuccess: getName.success,
   getNameFailure: getName.failure
}
// You can get the action type definition for Saga custom reducers ect. like this:
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

## Usage

### 1) Define an area

Create an interface that describe the initial state for the redux area
then create it with the default values:

```ts
import CreateReduxArea from "redux-area"

interface IMyAreaState {
  name: string
}

const area = CreateReduxArea<IMyAreaState>({
  name: ""
})
```

### 1.2) Optional options

**namePrefix** Prefix all names in `add` and `addFetch` _(Default: '')_

**fetchPostfix** Postfix the 3 action created with `addFetch` _(Default: ['Request', 'Success', 'Failure'])_

```ts
area.options({
  namePrefix: "@@MyApp/MyArea/",
  fetchPostfix: ["Request", "Success", "Failure"]
})
```

### 2) Add Actions

You can now add actions to the area:

```ts
const updateName = area
  .add("updateName")
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

### 2.2) Add Fetch Actions

You can also add a fetch actions to the area:

It will create three action-creators and three reducers.

The name (action type) wil be the name in `addFetch` postfix with 'Request', 'Success' and 'Failure'. _(Can be changed in area options)_

```ts
const getName = area
  .addFetch("getName")
  .action((id: number) => ({ id }))
  .produce(draft => {
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
```

### Intercept and omitting fetch (auto generated)

From version 0.3.0 interception can be added from the options.

There is 4 interception:

- _normal_ all normal (non fetch) action
- _request_, _success_ and _failure_

By using interception in combination of addFetch you can avoid writing a lot of boilerplate code,
like loading flag ect.

Together with the interception, version 0.3.0 allows omitting all parts of a addFetch
(except that it needs either the of the ending produce: failureProduce or standardFailure)

_interceptFailure_ will also intercept standardFailure if its created.

Note: Redux (and Saga's) can intercept any action by it self.
The interception in redux-area is just an easy way of controller interception for an area,
and helping auto-generate common boilerplate code.

```ts
import CreateReduxArea from "redux-area"

const area = CreateReduxArea({
  types: [] as ITypes,
  lastCalled: "",
  loading: false
})
  .options({
    namePrefix: "@@MyApp/MyArea/",
    interceptNormal: (draft, { type }) => {
      draft.lastCalled = type
    },
    interceptRequest: draft => {
      draft.loading = true
    },
    interceptSuccess: draft => {
      draft.loading = false
    },
    interceptFailure: draft => {
      draft.loading = false
    }
  })
  .setStandardFetchFailure(
    (error: Error) => ({ error }),
    (draft, { error }) => {
      draft.error = error
    }
  )

const getAllType = area
  .addFetch("getAllType")
  .successAction((types: ITypes) => ({ types }))
  .successProduce((draft, { types }) => {
    draft.types = types
  })
  .standardFailure()
```

The _getAllType_ will still create all 3 action (request, success and failure),
but the request action is just an empty action:

```ts
const getAllType = area
  .addFetch("getAllType")
  .successAction((types: ITypes) => ({ types }))
  .successProduce((draft, { types }) => {
    draft.types = types
  })
  .standardFailure()

// same as result:
const getAllType = area
  .addFetch("getAllType")
  .action(() => ({}))
  .produce((draft, { types }) => {})
  .successAction((types: ITypes) => ({ types }))
  .successProduce((draft, { types }) => {
    draft.types = types
  })
  .standardFailure()
```

For rare cases the simplest version of an addFetch can be like:

```ts
const saveData = area.addFetch("saveData").standardFailure()
```

This is still create 3 action, and enabling following the action.

### Standard fetch failure

You can add a standard fetch failure with fluent interface on CreateReduxArea.

> NOTE: you cannot add it on an area like area.setStandardFetchFailure !

Due to the way typescript calculate generic there are some setStandardFetchFailure need
to be set directly (fluent interface) on the original CreateReduxArea

This will create a version of area that has `standardFailure()` options beside the normal `addFailure`

```ts
const area = CreateReduxArea(state)
  .options({
    namePrefix: "@@MyArea/"
  })
  .setStandardFetchFailure(
    (error: Error) => ({ error }),
    (draft, { error }) => {
      draft.error = error
    }
  )

const fetchAction = area
  .addFetch("getAll")
  .successProduce((draft, action) => {})
  .standardFailure()
```

### 3) Export area (Actions, Names, Reducers and AreaRootReducer)

How you want to export the actionCreators is up to you and your team.

You can export each action directly if you prefer:

```ts
export const updateName = area
   .add('updateName')
   (...)
```

Or as an area action map:

```ts
export const MyAreaActions = {
   updateName,
   (...)
}
```

Each action has added two properties: `name` and `reducer` (and a type props for easy 'typeof' use)

If your using Saga's or other types of reducer/elements that need the action name,
you can get them by the _name_ property and you can get the type definition with the _type_ property:

```ts
const action = updateName // => the action creator
const actionName = updateName.name // => 'MY_AREA_UPDATE_NAME'
const reducer = updateName.reducer // => the reducer method
type ActionType = typeof updateName.type // => undefined (Only for type definition)
```

An area contains five properties: `rootReducer`, `initialState`, `actions`, `namePrefix` and `fetchPostfix`

Normally it's only 'rootReducer' and maybe 'initialState' that is used.

```ts
export const MyAreaInitState = area.initialState
export const MyAreaRootReducer = area.rootReducer()
```

## Use other producer in a producer

Sometime some logic in one producer should be use by another.

For this eac action has the `use` property, which can be call from other producers

EX:

```ts
const setAllOptions = area
  .add("setAllOptions")
  .action((options: IOption) => ({ options }))
  .produce((draft, { options }) => {
    setOption1.use(draft, { ...options.option1 })
    setOption2.use(draft, { ...options.option2 })
  })
```

The use method will automatically set the action type.

```ts
setOption1.use(draft, { ...options.option1 })
// The action will be { type: setOption1.name, ...options.option1 }
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
