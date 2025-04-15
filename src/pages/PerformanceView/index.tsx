import {
    Group,
    Panel,
    PanelHeader,
    Placeholder,
    Header,
    View,
    SimpleCell,
    FormItem,
    SegmentedControl, FormStatus,
} from "@vkontakte/vkui";
import { useGetPanelForView, useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import { AuthInfo } from "../../types.ts";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useApiRequest from "../../utils/useApiRequest.ts";
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";

const controlFormTypes = {
    "З": "Зачет",
    "Э": "Экзамен",
    "ДЗ": "Дифференцированный зачет",
    "КП/КР": "Курсовая работа",
};

function scoreToColor(score: number) {
    return score < 60 ? (
        "rgba(208,0,0,0.67)"
    ) : score < 70 ? (
        "rgba(220,147,39,0.67)"
    ) : (
        "rgba(44,150,77,0.67)"
    )
}

function Index({viewId, authInfo}: {
    viewId: string,
    authInfo: AuthInfo
}) {
    const activePanel = useGetPanelForView('performance_view');
    const routeNavigator = useRouteNavigator();
    const user = authInfo?.user;
    const [selectedKursNum, setSelectedKursNum] = useState(1);

    const {
        isLoading,
        ok,
        message: apiError,
        response: performance,
    } = useApiRequest(`academic_performance`, undefined, res => {
        res.data.performance.length = res.data.performance.findLastIndex((p: any) => Array.isArray(p) && p.length > 0) + 1;
        return res.data.performance;
    });

    useEffect(() => {
        if (!user) {
            routeNavigator.replace("/login");
        }
    }, [user]);

    if (!user) {
        return null;
    }

    return (
        <View activePanel={ activePanel! } key={ viewId }>
            <Panel id="index">
                <PanelHeader>Оценки</PanelHeader>

                { isLoading ? (
                    <Placeholder
                        icon={ <FontAwesomeIcon icon={ faSpinner } size="2x" fixedWidth spin/> }
                        title="Загрузка..."
                    />
                ) : !ok ? (
                    <FormItem>
                        <FormStatus mode="error" title="Ошибка">
                            <p>{ apiError }</p>
                        </FormStatus>
                    </FormItem>
                ) : (!Array.isArray(performance) || performance.length <= 0) ? (
                    <Placeholder
                        title="Нет данных :("
                    />
                ) : (<>
                    <Group>
                        <FormItem>
                            <SegmentedControl
                                options={ performance.map((_, pi) => ({
                                    'label': `Подгруппа ${ pi + 1 }`,
                                    'value': pi + 1,
                                    'aria-label': `Подгруппа ${ pi + 1 }`,
                                })) }
                                value={ selectedKursNum }
                                onChange={ (newValue) => setSelectedKursNum(newValue as number) }
                            />
                        </FormItem>
                    </Group>
                    { performance[selectedKursNum - 1].map((sem: any, semi: number) => (
                        (sem.ekz.length > 0 || sem.kp.length > 0) && (
                            <Group header={ <Header size="s">Семестр { semi + 1 }</Header> }>
                                { sem.ekz.length > 0 && (
                                    <Group mode="plain" header={ <Header size="s">Дисциплины</Header> }>
                                        { sem.ekz.map((ekz: any) => (
                                            <SimpleCell
                                                subtitle={ controlFormTypes[ekz.ZACH_EKZ_FORMA_KONTROLYA as keyof typeof controlFormTypes] || ekz.ZACH_EKZ_FORMA_KONTROLYA }
                                                after={
                                                    <span style={ {color: scoreToColor(ekz.ZACH_EKZ_BALL)} }>
                                                        { ekz.ZACH_EKZ_OCENKA } ({ ekz.ZACH_EKZ_BALL })
                                                    </span>
                                                }
                                                multiline
                                            >
                                                { ekz.dist_title }
                                            </SimpleCell>
                                        )) }
                                    </Group>
                                ) }
                                { sem.kp.length > 0 && (
                                    <Group mode="plain" header={ <Header size="s">Курсовые работы/проекты</Header> }>
                                        { sem.kp.map((kp: any) => (
                                            <SimpleCell
                                                subtitle={ controlFormTypes[kp.KP_KR_FORMA_KONTROLYA as keyof typeof controlFormTypes] || kp.KP_KR_FORMA_KONTROLYA }
                                                after={
                                                    <span style={ {color: scoreToColor(kp.KP_KR_BALL)} }>
                                                    { kp.KP_KR_OCENKA } ({ kp.KP_KR_BALL })
                                                </span>
                                                }
                                                multiline
                                            >
                                                { kp.dist_title }
                                            </SimpleCell>
                                        )) }
                                    </Group>
                                ) }
                            </Group>
                        )
                    )) }
                </>) }
            </Panel>
        </View>
    );
}

export default Index;
