## 0.0.7-0.0.9

### Added

Add `listen` to `area`

First argument of `takeEvery`, `takeLatest` and `takeLeading` now allows you to pass a function that returns an action,
to avoid ref to un initialized actions (caused to duel module dependency)

The `listen` method is actually same base of the `take...` method and take a third optional type,
that by default is takeEvery.

When you `listen` to action in other files it's important to use the function `()=>action`

It recommend to use `listen` to indicate that its listen to another area's action.

Used like this: `area.listen(()=>action, saga [, type*] )` // type: 'takeEvery' | 'takeLatest' | 'takeLeading'

Its important to use the `getSagas()` in the Redux Store configuration instead ogf the Area if there are dependencies from other files.

### Breaking Changes

#### Rename method:

`rootReducer()` is now `getRootReducer()`

`getSagaRegistrations()` is now `getSagas()`

#### Removed:

`rootSaga`has been removed!

You can get the same by :

```ts
function* root() {
  yield all(area.getSagas())
}
```

The AreaBases has been removed, create you own base instead.

> You can alway copy common AreaBases them from the wiki.

## 0.0.6 (@next version)

Remove Area/BaseArea specific data from `listener` to enable cross area listening.

This is now not include the ActionInterception from the other Area/BaseArea which might be a problem!

## 0.0.5 (@next version)

Experiment with easy subscribe (Event handling on saga level)

Add `listen` saga register method.

## 0.0.4

Add `getSagaRegistrations` to get the list not wrap in `all` (like in `rootSaga`)

This allow to combine different area's sagas into one app root saga.

## 0.0.3

Add option for first argument to `take...` to be either a action name (string) or a Redux-area action.
(The Redux-area will use the .request.name)

## 0.0.1-0.0.2

Add `takeLeading`, `takeLatest`, `takeEvery`, `rootSaga` to `area`
