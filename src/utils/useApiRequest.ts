import {Dispatch, useEffect, useState} from "react";
import {DictObj} from "../utils.tsx";
import api, {ApiResponse} from "../api.ts";

const methodHandlers = {
    get: api.getRequest,
    post: api.postRequest,
    patch: api.patchRequest,
    delete: api.deleteRequest,
    // form: api.postFormRequest,
};

export default function useApiRequest<T>(path: string, params: DictObj | undefined = undefined, responseMiddleware: ((res: any) => any) | undefined = undefined, method: keyof typeof methodHandlers = "get") {
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [apiResponse, setApiResponse] = useState<ApiResponse<T> | undefined>(undefined);
    const [updateTicker, setUpdateTicker] = useState(0);

    useEffect(() => {
        request<T>(setApiResponse, setIsLoading, setApiError, path, params, responseMiddleware, method);
    }, [path, params, method, updateTicker]);

    return {
        isLoading,
        message: apiError,
        // @ts-ignore
        response: apiResponse?.data,
        status: apiResponse?.status,
        ok: apiResponse?.ok,
        setApiResponse: setApiResponse,
        update: () => setUpdateTicker((updateTicker + 1) % Number.MAX_SAFE_INTEGER),
    };
}

function request<T>(setApiResponse: Dispatch<ApiResponse<T> | undefined>, setIsLoading: Dispatch<boolean>, setApiError: Dispatch<string | null>, path: string, params: DictObj | undefined, responseMiddleware: ((res: any) => any) | undefined = undefined, method: keyof typeof methodHandlers) {
    setIsLoading(true);
    setApiError(null);
    setApiResponse(undefined);

    const methodHandler = methodHandlers[method];
    methodHandler(path, params)
        .then((requestRes) => {
            if (!requestRes.ok) {
                setApiError(requestRes?.message);
                setApiResponse(undefined);
                setIsLoading(false);
            } else {
                if (typeof responseMiddleware === "function") {
                    Promise.resolve(responseMiddleware(requestRes))
                        .then((data) => {
                            setApiError(null);
                            setApiResponse({...requestRes, data});
                            setIsLoading(false);
                        })
                        .catch((error) => {
                            setApiError(error);
                            setApiResponse(undefined);
                            setIsLoading(false);
                        });
                } else {
                    setApiError(null);
                    setApiResponse(requestRes as ApiResponse<T>);
                    setIsLoading(false);
                }
            }
        });
}