import AreaBase, { ActionCreatorInterceptorOptions } from "./ReduxSagaArea";
export declare enum ActionTracking {
    Requested = "Requested",
    Succeeded = "Succeeded",
    Failed = "Failed"
}
export interface IAppAreaBaseState {
    loading: boolean;
    trackingMap: {
        [actionName: string]: ActionTracking;
    };
    errorMap: {
        [key: string]: {
            error: Error;
            message: string;
            count: number;
            currentCount: number;
        };
    };
}
export declare const initAppAreaBaseState: () => IAppAreaBaseState;
export declare const AppAreaBase: AreaBase<IAppAreaBaseState, (error: Error) => {
    error: Error;
}, ({ actionName }: ActionCreatorInterceptorOptions) => {
    actionName: string;
}>;
export default AppAreaBase;
