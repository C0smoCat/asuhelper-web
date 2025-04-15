import {
    Group,
    Panel,
    PanelHeader,
    Placeholder,
    View,
    SimpleCell,
    FormItem,
    SegmentedControl, FormStatus, Banner, Div, Button,
} from "@vkontakte/vkui";
import {useGetPanelForView, useParams, useRouteNavigator} from "@vkontakte/vk-mini-apps-router";
import {AuthInfo} from "../../types.ts";
import {ReactNode, useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import useApiRequest from "../../utils/useApiRequest.ts";
import {faSpinner} from "@fortawesome/free-solid-svg-icons/faSpinner";

function Index({viewId, authInfo}: {
    viewId: string,
    authInfo: AuthInfo
}) {
    const activePanel = useGetPanelForView('documents_view');
    const routeNavigator = useRouteNavigator();
    const user = authInfo?.user;

    useEffect(() => {
        if (!user) {
            routeNavigator.replace("/login");
        }
    }, [user]);

    if (!user) {
        return null;
    }

    return (
        <View activePanel={activePanel!} key={viewId}>
            <MainPanel id="index"/>
            <RequestPanel id="request_panel"/>
        </View>
    );
}

function AutoApiTab({apiPath, responseMiddleware, listRender, emptyContent}: {
    responseMiddleware?: ((res: any) => any) | undefined,
    apiPath: string,
    listRender: (element: any) => ReactNode,
    emptyContent?: ReactNode | undefined,
}) {
    const {
        isLoading,
        ok,
        message: apiError,
        response,
    } = useApiRequest(apiPath, undefined, responseMiddleware);

    return (
        isLoading ? (
            <Placeholder
                icon={<FontAwesomeIcon icon={faSpinner} size="2x" fixedWidth spin/>}
                title="Загрузка..."
            />
        ) : !ok ? (
            <FormItem>
                <FormStatus mode="error" title="Ошибка">
                    <p>{apiError}</p>
                </FormStatus>
            </FormItem>
        ) : (!Array.isArray(response) || response.length <= 0) ? (
            emptyContent ? (
                emptyContent
            ) : (
                <Placeholder
                    title="Нет данных :("
                />
            )
        ) : (
            listRender(response)
        )
    );
}

function MainPanel({id}: { id: string }) {
    const routeNavigator = useRouteNavigator();

    const [selectedType, setSelectedType] = useState<"my" | "request">("my");

    return (
        <Panel id={id}>
            <PanelHeader>Единый деканат</PanelHeader>

            <Group>
                <FormItem>
                    <SegmentedControl
                        options={[
                            {
                                'label': `Мои заказы`,
                                'value': "my",
                                'aria-label': `Мои заказы`,
                            },
                            {
                                'label': `Заказать справку`,
                                'value': "request",
                                'aria-label': `Заказать справку`,
                            }
                        ]}
                        value={selectedType}
                        onChange={(newValue) => setSelectedType(newValue as ("my" | "request"))}
                    />
                </FormItem>
            </Group>

            <Group>
                {selectedType === "my" ? (
                    <AutoApiTab
                        key="dos/requests"
                        apiPath="dos/requests?page=1&pageSize=100"
                        emptyContent={
                            <Placeholder
                                title="Пока нет заказанных справок"
                                action={
                                    <Button
                                        onClick={() => setSelectedType("request")}
                                    >
                                        Заказать справку
                                    </Button>
                                }
                            >
                                Если вы заказали справку недавно, она может отобразиться с задержкой в
                                несколько дней
                            </Placeholder>
                        }
                        responseMiddleware={res => res.data}
                        listRender={response => (
                            response.map((res: any) => (
                                <Div>
                                    <Banner
                                        title={
                                            <div style={{display: "flex", justifyContent: "space-between"}}>
                                                <span>{res.document.name}</span>
                                                <span>{res.reqNumber}</span>
                                            </div>
                                        }
                                        subtitle={[
                                            res.status.name && `Статус: ${res.status.name}`,
                                            res.curator && `Куратор: ${res.curator.surname} ${res.curator.name} ${res.curator.patronymic}`,
                                            res.executor.name && `Исполнитель: ${res.executor.name}`,
                                            res.issueType && `Форма получения справки: ${res.issueType.name}`,
                                            res.createdAt && `Дата подачи заявки: ${new Date(res.createdAt * 1000).toLocaleString()}`,
                                            res.editedAt && `Дата последнего изменения: ${new Date(res.editedAt * 1000).toLocaleString()}`,
                                            res.executedAt && `Дата выполнения: ${new Date(res.executedAt * 1000).toLocaleString()}`,
                                            res.closedAt && `Дата закрытия: ${new Date(res.closedAt * 1000).toLocaleString()}`,
                                            res.issuedAt && `Дата выдачи: ${new Date(res.issuedAt * 1000).toLocaleString()}`,
                                            res.copiesNumber && `Количество копий документа: ${res.copiesNumber}`,
                                        ].filter(s => !!s).map(s => <p>{s}</p>)}
                                    />
                                </Div>
                            ))
                        )}
                    />
                ) : selectedType === "request" ? (
                    <AutoApiTab
                        key="dos/documents"
                        apiPath="dos/documents"
                        responseMiddleware={res => res.data}
                        listRender={response => (
                            response.map((res: any) => (
                                <SimpleCell
                                    subtitle={`Время исполнения: ${res.execTime} дней`}
                                    onClick={() => routeNavigator.push(`/documents/${res.id}`)}
                                    chevron="always"
                                    multiline
                                >
                                    {res.name}
                                </SimpleCell>
                            ))
                        )}
                    />
                ) : null}
            </Group>
        </Panel>
    );
}

function RequestPanel({id}: { id: string }) {
    // @ts-ignore
    const {documentId} = useParams<"documentId">();

    const {
        isLoading,
        ok,
        message: apiError,
        response,
    } = useApiRequest(`dos/documents/${documentId}/properties`, undefined, res => res.data);

    return (
        <Panel id={id}>
            <PanelHeader>Единый деканат</PanelHeader>

            <Group>
                {isLoading ? (
                    <Placeholder
                        icon={<FontAwesomeIcon icon={faSpinner} size="2x" fixedWidth spin/>}
                        title="Загрузка..."
                    />
                ) : !ok ? (
                    <FormItem>
                        <FormStatus mode="error" title="Ошибка">
                            <p>{apiError}</p>
                        </FormStatus>
                    </FormItem>
                ) : (!Array.isArray(response) || response.length <= 0) ? (
                    <Placeholder
                        title="Услуга не требует дополнительных сведений"
                    />
                ) : (
                    response.map((inp: any) => (
                        <FormItem
                            required={!inp.system}
                            key={inp.systemName}
                            top={inp.displayName}
                        >
                            {JSON.stringify(inp)}
                        </FormItem>
                    ))
                )}
            </Group>
        </Panel>
    );
}

export default Index;
