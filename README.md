# Redux-saga-area

[Redux-area](https://github.com/alfnielsen/redux-saga) width [redux-saga](https://redux-saga.js.org/)

**Short:** `Simplified strongly typed redux`

When defining redux actions and reducers with typescript,
you often need a lot of typing for interfaces to ensure that you can use your actions,
action-creators and reducers with autocompletion ect.

Redux-area tries to simplify creation of redux logic by hiding / calculating types,
keeping the code more clean.

**The goal is:** to ease and reduce the amount of code we need to write to get all benefits of both

- redux _(single truth, deterministic state transition and view rendering, time travel ect..)_
  and
- typescript _(strongly typed symbols and interfaces, code checking/nullable check, auto-rewriting, autocompletion, auto-importing ect..)_.

Redux-area uses the [immer](https://github.com/immerjs/immer) npm module for keeping the reducers as simple as possible.

> You can create normal reducers if you need them

Github [Source Code](https://github.com/alfnielsen/redux-saga-area) (The npm [package](https://www.npmjs.com/package/redux-saga-area))

See codesandbox [Demo in React](https://codesandbox.io/s/redux-saga-area-base-ex-071pn)

See Github Wiki for full [Documentation](https://github.com/alfnielsen/redux-saga-area/wiki)


**redux-area** 

[react-area](https://www.npmjs.com/package/react-area)

**react-redux-area** 

Another module that adds [React](https://reactjs.org/) specific functionality to redux-area.

[react-redux-area](https://www.npmjs.com/package/react-redux-area)

## Install

```sh
npm install redux-saga-area
```

Or

```sh
yarn add redux-saga-area
```

You need also to have install: "immer": "^5.x", "redux": "^4.x", "redux-saga": "^1.x"

Full install

```sh
yarn add immer redux redux-saga redux-saga-area
```

## Demo

_(editable codesandbox.io)_

Demo: [Demo in React](https://codesandbox.io/s/redux-saga-area-base-ex-071pn)

("@next" Demo - not stable): [Demo in React](https://codesandbox.io/s/redux-saga-area-next-base-ex-wwd17)
