## 0.1.0

Change d.ts a little for cleanier view: It will now AreaAction aith initial state and the definition for the action creator.

Added addFetch

Added area.options with: 'namePrefix' and 'fetchPostfix'

## 0.0.11

Update immer to version 5.0.0

## 0.0.9-0.0.10

Fix problem with readonly typescript and immer produce.

The draft will now ignore readonly and the produce will return the correct typescript difinition
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
