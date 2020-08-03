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
