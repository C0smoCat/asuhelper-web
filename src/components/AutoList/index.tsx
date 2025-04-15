import {ReactNode, useEffect, useState} from 'react';
import api from "../../api.ts";
import {FormItem, FormStatus, Group, Placeholder} from "@vkontakte/vkui";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner} from "@fortawesome/free-solid-svg-icons/faSpinner";
import {DictObj} from "../../utils.tsx";

function Index({apiPath, apiQuery, apiResolver, elementsRenderer}: {
    apiPath: string,
    apiQuery?: DictObj,
    apiResolver?: (resData: any) => Promise<any[]>,
    elementsRenderer: (elements: any) => ReactNode,
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [elements, setElements] = useState<any[]>([]);

    useEffect(() => {
        setIsLoading(true);
        setApiError(null);

        api.getRequest<any[]>(apiPath, apiQuery)
            .then((res) => {
                if (res.ok) {
                    if (apiResolver) {
                        Promise.resolve(apiResolver(res.data)).then(setElements);
                    } else {
                        setElements(res.data);
                    }
                } else {
                    setApiError(res.message);
                }

                setIsLoading(false);
            });
    }, [apiPath, apiResolver]);

    return (
        <Group>
            {isLoading ? (
                <Placeholder
                    icon={<FontAwesomeIcon icon={faSpinner} size="2x" fixedWidth spin/>}
                    title="Загрузка..."
                />
            ) : apiError ? (
                <FormItem>
                    <FormStatus mode="error" title="Ошибка">
                        <p>{apiError}</p>
                    </FormStatus>
                </FormItem>
            ) : (
                elementsRenderer(elements)
            )}
        </Group>
    );
}

export default Index;