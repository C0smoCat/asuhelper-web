import {useRouteNavigator} from "@vkontakte/vk-mini-apps-router";
import {Button, Placeholder} from "@vkontakte/vkui";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-solid-svg-icons/faUser";

function Index() {
    const routeNavigator = useRouteNavigator();

    return (
        <Placeholder
            icon={
                <FontAwesomeIcon icon={faUser} size="3x" fixedWidth/>
            }
            title="Для просмотра этого раздела необходима авторизация"
            action={
                <Button
                    size="m"
                    onClick={() => routeNavigator.push("/login")}
                >
                    Продолжить
                </Button>
            }
        />
    );
}

export default Index;
