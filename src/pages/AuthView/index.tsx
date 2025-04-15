import {Group, Panel, PanelHeader, View, Footer, useAdaptivityConditionalRender} from "@vkontakte/vkui";
import {useGetPanelForView, useRouteNavigator} from "@vkontakte/vk-mini-apps-router";
import {AuthInfo} from "../../types.ts";
import {Dispatch, useEffect, useState} from "react";
import SimpleForm from "../../components/SimpleForm";
import api from "../../api.ts";
import {saveUserConfig} from "../../components/EpicScreen";
import {HelpButton} from "../../components/HelpPopup";

function Index({viewId, authInfo, setAuthInfo}: {
    viewId: string,
    authInfo: AuthInfo,
    setAuthInfo: Dispatch<AuthInfo | null>
}) {
    const activePanel = useGetPanelForView('auth_view');
    const routeNavigator = useRouteNavigator();

    useEffect(() => {
        if (authInfo) {
            routeNavigator.replace("/profile");
        }
    }, [authInfo]);

    return (
        <View activePanel={activePanel!} key={viewId}>
            <LoginPanel id="login" setAuthInfo={setAuthInfo}/>
        </View>
    );
}

async function authUser(setAuthInfo: Dispatch<AuthInfo | null>, setIsLoading: Dispatch<boolean>, setApiError: Dispatch<string | null>, values: {
    [key: string]: any
}) {
    setIsLoading(true);
    setApiError(null);

    const res = await api.postRequest<AuthInfo>("login", values);

    if (res.ok) {
        setAuthInfo(res.data);
        api.setApiToken(res.data.token.token);
        saveUserConfig(res.data);
    } else {
        setApiError(res.message);
        saveUserConfig(null);
    }

    setIsLoading(false);
}

function LoginPanel({id, setAuthInfo}: { id: string, setAuthInfo: Dispatch<AuthInfo | null> }) {
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const {viewWidth} = useAdaptivityConditionalRender();

    return (
        <Panel id={id}>
            <PanelHeader>Авторизация</PanelHeader>
            <Group>
                <SimpleForm
                    inputs={[
                        {
                            type: "text",
                            name: "login",
                            label: "Логин",
                            required: true,
                            validates: [
                                [(value: string) => /^20\d{2}\d{4}$/.test(value), "Проверьте правильность логина"],
                            ]
                        },
                        {
                            type: "password",
                            name: "password",
                            label: "Пароль",
                            required: true,
                            validates: [
                                [(value: string) => /^(?=.*\d)([^\s])+$/.test(value), "Пароль должен содержать цифру"],
                                [(value: string) => /^(?=.*[A-ZА-ЯЙЁ])([^\s])+$/i.test(value), "Пароль должен содержать латинские буквы"],
                                [(value: string) => !!value && value.length >= 8, "Длина пароля должна быть не менее 8 символов"],
                                [(value: string) => !!value && value.length <= 32, "Длина пароля должна быть не более 32 символов"],
                            ]
                        },
                    ]}
                    onSubmit={(values) => authUser(setAuthInfo, setIsLoading, setApiError, values)}
                    isLoading={isLoading}
                    errorText={apiError || undefined}
                    submitText="Войти"
                    disableEditCheck
                />
                {/*<FormItem>
                    <Separator size="4xl"/>
                </FormItem>
                <FormItem>
                    <Button mode="secondary" size="l" onClick={() => routeNavigator.push("/register")} stretched>
                        Регистрация
                    </Button>
                </FormItem>*/}

                <Footer>
                    <HelpButton/>
                </Footer>
            </Group>
            {!!viewWidth.tabletMinus ? (
                <Footer className={viewWidth.tabletMinus.className}>
                    Сборка {
                    //@ts-ignore
                    import.meta.env.PROD ? BUILD_TIME : "DEV"
                }
                </Footer>
            ) : null}
        </Panel>
    );
}

export default Index;
