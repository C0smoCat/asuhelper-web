import {
    Button,
    Avatar,
    Group,
    Panel,
    PanelHeader,
    Placeholder,
    Header,
    View,
    SimpleCell,
    InfoRow,
    Chip, Footer, useAdaptivityConditionalRender,
} from "@vkontakte/vkui";
import {useGetPanelForView, useRouteNavigator} from "@vkontakte/vk-mini-apps-router";
import {AuthInfo} from "../../types.ts";
import {Dispatch, useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRightFromBracket} from "@fortawesome/free-solid-svg-icons/faRightFromBracket";
import api from "../../api.ts";
import FileWithAuth from "../../components/FileWithAuth";
import {API_PATH} from "../../config.ts";
import {saveUserConfig, ScheduleStatus} from "../../components/EpicScreen";

function Index({viewId, authInfo, setAuthInfo}: {
    viewId: string,
    authInfo: AuthInfo,
    setAuthInfo: Dispatch<AuthInfo | null>
}) {
    const activePanel = useGetPanelForView('profile_view');
    const routeNavigator = useRouteNavigator();
    const user = authInfo?.user;
    const {viewWidth} = useAdaptivityConditionalRender();

    useEffect(() => {
        if (!user) {
            routeNavigator.replace("/login");
        }
    }, [user]);

    function logout() {
        setAuthInfo(null);
        api.setApiToken(undefined);
        saveUserConfig(null);
    }

    return (
        <View activePanel={activePanel!} key={viewId}>
            <Panel id="index">
                <PanelHeader>Мой профиль</PanelHeader>
                {user && (<>
                    <Group>
                        <Placeholder
                            icon={
                                <FileWithAuth
                                    src={user.avatar_id ? `${API_PATH}files2/${user.avatar_id}` : null}
                                    callback={(avatarObjectURL) => (
                                        <Avatar
                                            src={avatarObjectURL || undefined}
                                            initials={`${user.first_name[0]}${user.last_name[0]}`}
                                            gradientColor={user.id % 6 + 1 as (1 | 2 | 3 | 4 | 5 | 6)}
                                            size={128}
                                        />
                                    )}
                                />
                            }
                            title={`${user.first_name} ${user.last_name}${user.emoji ? ` ${user.emoji}` : ""}`}
                            action={
                                <Button
                                    size="m"
                                    appearance="negative"
                                    mode="tertiary"
                                    onClick={logout}
                                    before={
                                        <FontAwesomeIcon icon={faRightFromBracket} fixedWidth/>
                                    }
                                >
                                    Выйти
                                </Button>
                            }
                        >
                            {user.group_title}
                            {user.is_dev && (<>
                                {" "}
                                <Chip removable={false}>
                                    DEV
                                </Chip>
                            </>)}
                        </Placeholder>
                    </Group>
                    {!!viewWidth.tabletMinus && (
                        <ScheduleStatus
                            className={viewWidth.tabletMinus.className}
                        />
                    )}
                    <Group header={<Header>Обо мне</Header>}>
                        {user.middle_name && (
                            <SimpleCell multiline>
                                <InfoRow header="ФИО">{user.last_name} {user.first_name} {user.middle_name}</InfoRow>
                            </SimpleCell>
                        )}
                        {user.email && (
                            <SimpleCell multiline>
                                <InfoRow header="Email">{user.email}</InfoRow>
                            </SimpleCell>
                        )}
                        {user.NAZ_PODR && (
                            <SimpleCell multiline>
                                <InfoRow header="Подразделение">{user.NAZ_PODR}</InfoRow>
                            </SimpleCell>
                        )}
                        {user.NAZSPEC && (
                            <SimpleCell multiline>
                                <InfoRow header="Специализация">{user.NAZSPEC}</InfoRow>
                            </SimpleCell>
                        )}
                        {user.PROFIL && (
                            <SimpleCell multiline>
                                <InfoRow header="Профиль">{user.PROFIL}</InfoRow>
                            </SimpleCell>
                        )}
                        <SimpleCell multiline>
                            <InfoRow header="Группа">{user.group_title}</InfoRow>
                        </SimpleCell>
                        {user.F_OB && (
                            <SimpleCell multiline>
                                <InfoRow header="Форма обучения">{user.F_OB}</InfoRow>
                            </SimpleCell>
                        )}
                        {user.year && (
                            <SimpleCell multiline>
                                <InfoRow header="Год поступления">{user.year}</InfoRow>
                            </SimpleCell>
                        )}
                        {user.N_SO && (
                            <SimpleCell multiline>
                                <InfoRow header="Степень">{user.N_SO}</InfoRow>
                            </SimpleCell>
                        )}
                        {user.VID_OPLATA && (
                            <SimpleCell multiline>
                                <InfoRow header="Форма оплаты">{user.VID_OPLATA}</InfoRow>
                            </SimpleCell>
                        )}
                        {user.status && (
                            <SimpleCell multiline>
                                <InfoRow header="Статус">{user.status}</InfoRow>
                            </SimpleCell>
                        )}
                    </Group>
                </>)}
                {!!viewWidth.tabletMinus && (
                    <Footer className={viewWidth.tabletMinus.className}>
                        Сборка {
                        //@ts-ignore
                        import.meta.env.PROD ? BUILD_TIME : "DEV"
                    }
                    </Footer>
                )}
            </Panel>
        </View>
    );
}

export default Index;
