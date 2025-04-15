import {API_PATH, DEV_MODE} from "./config.ts";

export type ApiError = {
    message: string,
};

export type ApiResponse<T> = {
    ok: true,
    status: number,
    data: T,
} | {
    ok: false,
    status: number,
    message: string,
};

function Api() {
    let apiToken: string | null | undefined = undefined;

    async function request(path: string, body = undefined, method = "GET", options: any = {}) {
        const url = API_PATH + path;
        const {headers: optionsHeaders, ...optionsOther} = options || {};
        return await fetch(url.toString(), {
            method: method,
            credentials: "include",
            headers: {
                "X-API-TOKEN": apiToken,
                ...optionsHeaders
            },
            body: body,
            ...optionsOther
        });
    }

    async function getRequest<T extends any>(path: string, params: any = null, method = "GET", options: any = null): Promise<ApiResponse<T>> {
        try {
            const url = new URL(API_PATH + path, window.location.origin);
            if (params) {
                for (let [key, value] of Object.entries(params)) {
                    if (key !== undefined && value !== undefined && value !== null) {
                        if (Array.isArray(value)) {
                            for (let partValue of value) {
                                url.searchParams.append(key + "[]", partValue);
                            }
                        } else {
                            url.searchParams.set(key, value.toString());
                        }
                    }
                }
            }
            const {headers: optionsHeaders, ...optionsOther} = options || {};
            let res = await fetch(url.toString(), {
                method: method,
                credentials: "include",
                headers: {
                    "X-API-TOKEN": apiToken,
                    ...optionsHeaders
                },
                ...optionsOther
            });

            const resText = await res.text();

            try {
                const jsonData = JSON.parse(resText);

                if (res.ok && jsonData.ok) {
                    return {
                        ok: res.ok,
                        status: res.status,
                        data: jsonData.data
                    };
                } else {
                    if (DEV_MODE) {
                        console.error(path, params, resText);
                    }
                    return {
                        ok: false,
                        status: res.status,
                        message: jsonData.message || jsonData.error_text || resText
                    };
                }
            } catch (e) {
                if (DEV_MODE) {
                    console.error(path, params, resText);
                }
                return {
                    ok: false,
                    status: res.status,
                    message: resText
                };
            }
        } catch (err) {
            if (DEV_MODE) {
                console.error(path, params, err);
            }
            return {
                ok: false,
                status: 0,
                message: "Произошла неизвестная ошибка",
            };
        }
    }

    async function postRequest<T extends any>(path: string, body: any = null, options: any = {}) {
        return await getRequest<T>(path, null, "POST", {
            body: body ? JSON.stringify(body) : undefined,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            ...options
        });
    }

    async function patchRequest<T extends any>(path: string, params: any = null) {
        return await getRequest<T>(path, null, "PATCH", {
            body: params ? JSON.stringify(params) : undefined,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });
    }

    async function deleteRequest<T extends any>(path: string) {
        return await getRequest<T>(path, null, "DELETE", {
            body: undefined,
            headers: {
                "Accept": "application/json"
            }
        });
    }

    async function postFormRequest(path: string, data: { [key: string]: string | Blob }) {
        const formData = new FormData();
        for (let [ key, value ] of Object.entries(data)) {
            if (key !== undefined && value !== undefined)
                formData.append(key, value);
        }

        return await getRequest(path, null, "POST", {
            body: formData,
            headers: {
                "Accept": "application/json"
            }
        });
    }

    function setApiToken(newApiToken: string | null | undefined) {
        apiToken = newApiToken;
    }

    function getApiToken() {
        return apiToken;
    }

    return {
        request,
        getRequest,
        postRequest,
        patchRequest,
        deleteRequest,
        postFormRequest,
        getApiToken,
        setApiToken
    }
}

const api = Api();
export default api;
