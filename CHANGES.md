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
