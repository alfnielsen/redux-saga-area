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

Demo: [Demo in React](https://codesandbox.io/s/redux-area-base-ex-obn9u?fontsize=14&hidenavigation=1&theme=dark) _(editable codesandbox.io)_
Demo: [Demo in React (No interfaces)](https://codesandbox.io/s/redux-area-no-interfaces-r256o?fontsize=14&hidenavigation=1&theme=dark)\_

Fell free to add issue's in the git repository if you have examples of what would work well for your project.
At the moment there is added experimental interception features in the @next version.

**The goal is:** to ease and reduce the amount of code we need to write to get all benefits of both

- redux _(single truth, deterministic state transition and view rendering, time travel ect..)_
  and
- typescript _(strongly typed symbols and interfaces, code checking/nullable check, auto-rewriting, autocompletion, auto-importing ect..)_.

**Terminology**

In redux-area we will talk about:

- action

This is an `action creator`, a method the generate an redux action, which is a plain object with at least a `type: string` property.

From version 0.3.1, redux-area will also include `shortType: string`

Redux-area calculate the interface for each action by making a union of the result of an action cretor and adding the `type` and `shortType` under the hood _(plus the result of action interceptions, if is added to the redux-area)_

- produce (comes from the [immer](https://github.com/immerjs/immer) project).

This is called a `reducer` in normal redux. A reducer takes the current state an and action and return the next state.
A `procuder` takes a proxy of the state an and action and don't return anything. In the producer you can mutate the proxy state called a `draft` and [immer](https://github.com/immerjs/immer) will calculate the next state from the `draft` proxy. ([Immer](https://github.com/immerjs/immer) will also make the next state immutable, ensuring the principles of redux)

- fetch

Redux-area has a specialized `addFetch` method, that generate 3 actions (a request, success and failure).
This is simply to enable less code writing and to group this common functionality, that does servser/api calls.

Combined with 'omitting' and 'interception' this can radically simplify the code needed.

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
}).options({
   namePrefix: '@@MyApp/MyArea/',
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

// WE don't need to add empty action (They will still be created in the 'getNewName')
export const getNewName = area
   .addFetch('getNewName')
   .successAction((newName: string) => ({ newName }))
   .successProduce((draft, { newName }) => {
      draft.name = newName
   })
   .standardFailure()

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

redux-area will use typescript's generic `ReturnType` and `Parameters` to
calculate how the actions interface are, by extracting the return from the actionCreator.
The `type` defined in `add` will automatically be added.

In this case the actual action will be defined as: `{ type: string, name: string }`

### 2.2) Add Fetch Actions

You can also add a fetch action to the area:

It will create three action-creators and three reducers (producers).

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

### Intercept produce methods

From version 0.3.0 interception of produce methods can be added from the options.

// See below for interception of action-creators (They need a little different approach, and it not set in options)

There is 4 interception:

- _normal_ all normal (non fetch) actions
- _request_, _success_ and _failure_

By using interception in combination of addFetch you can avoid writing a lot of boilerplate code,
like loading flag ect.

From version 0.3.0 it is allowed to omit all parts of a addFetch.
(except that it needs one of the of the ending producers: failureProduce or standardFailure)

_interceptFailure_ will also intercept standardFailure if its created.

Note: Redux (and Saga's) can intercept any action by it self.

The interception in redux-area is just an easy way of controlling interception for an area,
and help auto-generate common boilerplate code.

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

const getUser = area
  .addFetch("getUser")
  .action((id: number) => ({ id }))
  .produce((draft, { types }) => {
    draft.user = undefined
  })
  .successAction((user: IUser) => ({ user }))
  .successProduce((draft, { user }) => {
    draft.user = user
  })
  .standardFailure()
```

Each of getUser's methods: { request, success, failure } includes setting the loading flag.

This is done by changing the reducer at create time, so all time-travel ect. will work normally.

### Omitting fetch (auto generated)

For fetch action you only need to write action/producers is they are needed:

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

// Same as result:
const getAllType = area
  .addFetch("getAllType")
  .action(() => ({})) // <-- We dont need this
  .produce((draft, { types }) => {}) // <-- We dont need this
  .successAction((types: ITypes) => ({ types }))
  .successProduce((draft, { types }) => {
    draft.types = types
  })
  .standardFailure()
```

If request interceptions is added, the omitted `action` and `produce` method is still created,
and will create a reducer that set ex a loading flag (Or what ever the interception does)

For rare cases the simplest version of an addFetch can be like:

```ts
const saveData = area.addFetch("saveData").standardFailure()
```

This will still create 3 action.

### Standard fetch failure

You can add a standard fetch failure with fluent interface on CreateReduxArea.

> NOTE: you cannot add it on an area like area.setStandardFetchFailure !

Due to the way typescript calculate generic's, setStandardFetchFailure needs
to be set directly (fluent interface) on the original CreateReduxArea.

This will create a version of area that has `standardFailure()` options beside the normal `addFailure`

```ts
const area = CreateReduxArea(state)
  .options({
    namePrefix: "@@MyArea/"
  })
  .setStandardFetchFailure(
    // adding it after with: area.setStandardFetchFailure will not work!
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

(From version 0.3.0 `rootReducer` it a method not a property, so remember to add `()` )

Normally it's only 'rootReducer()' and maybe 'initialState' that is used.

```ts
export const MyAreaInitState = area.initialState
export const MyAreaRootReducer = area.rootReducer()
```

## Use other producer in a producer

Sometime some logic in one producer should be use by another.

For this the action has the `use` method, which can be call from other producers

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

## Demo

Demo: [Demo in React](https://codesandbox.io/s/redux-area-base-ex-obn9u?fontsize=14&hidenavigation=1&theme=dark) _(editable codesandbox.io)_
Demo: [Demo in React (No interfaces)](https://codesandbox.io/s/redux-area-no-interfaces-r256o?fontsize=14&hidenavigation=1&theme=dark)\_

<iframe
     src="https://codesandbox.io/embed/redux-area-base-ex-obn9u?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="Redux-area base ex"
     allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
     sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
   ></iframe>
