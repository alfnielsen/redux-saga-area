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
  namePrefix: "@@MyArea/"
});
// or you can use the old version
area.options();
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
