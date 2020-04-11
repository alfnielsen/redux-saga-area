## 0.4.5

fix .reducer argument 'action' type

## 0.4.4

remove immutable from .reducer to avoid incorrect type checking

## 0.4.3

Fix '.reducer' so that it work as a normal reducer.

> '.reducer' will not run any interceptions!

It made so that a fallback with custom optimization is possible,
so any logic that can block that is removed (like interception)

Fix: '.use' so that it don't need 'type' and baseActionIntercept properties (actionName and/or actionTags)

'.use' only run hte draft logic in the other action. It will not run any interception.

'FetchAreaBase' now includes 'errorMap' that works like the loadingMap, adding failure count for 'baseFailure',
mapped on 'actionName'.

## 0.4.2

Fix product method, so that its action are strongly typed.

This fix has removed the option of adding ActionInterception in the Area.

Its now only done on the AreaBase, and its now a required settings.

For Areas that don't want ActionName ot ActionTags, an empty object must be returned. (See SimpleAreaBase)

## 0.4.1

Add missing types from baseActionInterception in baseFailure definition.

## 0.4.0

Add AreaBase.

This version is a total new version. Each Area now has AreaBase.

Redux-area now uses AreaBases. (See full documentation on gibhub wiki)

### New options:

There are now interception from the base and from the area (interceptions is a list, so they can be generalized and added multiple places)

All action has now `actionName` beside the `type`

`fetchPostfix` is now defined in the base.

`addNameSlashes` and `addShortNameSlashes` add slashes between auto generated name part.

(`baseActionInterceptor` and `actionInterceptor`, action interception, is still in feature development)

The BaseAreaOptions and the AreaOptions is defined as following:

### Breaking changes

The CreateReduxArea method is replaced by AreaBases.

The Area base don't takes a direct generic state interface (Like CreateReduxArea<MyState>),
instead the AreaBase take an option object with a `state` prop.

`area.options` and `setStandardFailure` is **removed**.

Both can be defined in the BaseArea option and the Area option.

Use `as MyStateInterface` instead:

```ts
const area = FetchAreaBase("@@MyApp").CreateArea({
  namePrefix: "MyArea",
  state: {
    name: "",
    lastCall: "",
    types: [],
  } as IMyAreaState,
})
```

`standardFailure` has been replaced with `baseFailure` and `areaFailure`

## 0.3.1

Add `shortType` to all actions.
This is the name without the area namePrefix.

Add experimental feature `addActionCreatorInterception``

In the first version it an intercept all action creators (.action, .successAction and .successFailure - both on add and addFetch).

It intercept after the normal action is created, take that as an argument and return an object with extra properties for the action.

**Note** that the only strong type part of it is {type, shortType}, so your need to make type test and casting to interact with other properties on the actions.

It's possible that this feature will have interceptions for each type like the `produce` interception methods,
but for now it an all in one.

## 0.3.0

Major rewrite of the internal code.

### Added Interception

Interception methods has been added to options:

```ts
interface ICreateReduxAreaOptions<TState> {
  namePrefix?: string
  fetchPostfix?: string[]
  interceptNormal?: (draft: Draft<TState>, action: { type: string }) => void
  interceptRequest?: (draft: Draft<TState>, action: { type: string }) => void
  interceptSuccess?: (draft: Draft<TState>, action: { type: string }) => void
  interceptFailure?: (draft: Draft<TState>, action: { type: string }) => void
}
```

### All action (action, successAction and failureAction) are now optional

Beside the `action` original optional action,
all actions are now optional

Because of the now interception method,
the in next version I will try to make producers optional as well,
(Some fetch reducers will only consist of a request action and a successAction and produce,
because all other state change its handle by interception and standard failure..)

### Breaking changes

Due to the new internal (done to make interception correct),
the rootReducer method has changed from a property to a generator:

```ts
// Old:
export reducers = area.rootReducer
// new:
export reducers = area.rootReducer() // <- Its now a function call

```

## 0.2.0

### Add new 'setStandardFetchFailure'

You can now define a standard failure for fetch actions.
When added each `addFetch` will have a `standardFailure()` option beside the `failureAction`

### All action are optional

All action (including fetch) can now be omitted.

If they are omitted a `empty` will be created that with only the `type`

### options can be chained directly on an area creation.

You can now use fluent interface for `options` on `CreateReduxArea`

```ts
const area = CreateReduxArea(state).options({
  namePrefix: "@@MyArea/",
})
// or you can use the old version
area.options()
```

### Internal

Major restructure of code, to make adding new feature,
including easy structure change like the omit of action.

## 0.1.5

Update `use` so it don't take `type` in its action.

`type` will automatically be filled with the action type that use it called on:

```ts
setActiveSelector.use(draft, { ... }) // type in action is setActiveSelector.name
```

## 0.1.3+0.1.4

### Add experimental feature (Can change in the future)

Each action now has a new method `use` which can be used in other producers.

This is done so that logic from another producer can be used.

The feature is experimental, will will maybe change in the future until its' proven reliable,
and has the correct format.

## 0.1.1+0.1.2

Update ts definition for FetchAreaAction and exported it and AreaAction type ofr usages in saga's and other places,
where generic approach can simplify your code.

## 0.1.0

Change d.ts a little for cleaner view: It will now have AreaAction with initial state and the definition for the action creator.

Added addFetch

Added area.options with: 'namePrefix' and 'fetchPostfix'

Added optional omitting the action for actions that only has 'type'
(This don't work for 'addFetch' in this version)

## 0.0.11

Update immer to version 5.0.0

## 0.0.9-0.0.10

Fix problem with readonly typescript and immer produce.

The draft will now ignore readonly and the produce will return the correct typescript definition
which is a immutable state. (Immer make the next state immutable)

## 0.0.7-0.0.8

Add action.type for type definition to use in custom Saga's Reducer ect.

## 0.0.6

Update README with link to editable Demo on sandbox.io

## 0.0.5

### Breaking changes

Fix rootReducer so it act like its described!

Before it returned a function that returned the rootReducer.

Now it actually returns the root reducer.

Update examples in README
