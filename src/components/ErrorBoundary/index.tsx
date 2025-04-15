import { Button, Panel, PanelHeader, Placeholder } from "@vkontakte/vkui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Component, ErrorInfo, ReactNode } from "react";
import { faBug } from "@fortawesome/free-solid-svg-icons/faBug";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return {hasError: true};
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <ErrorPage/>
            );
        }

        return this.props.children;
    }
}

function ErrorPage() {
    return (
        <Panel id="error">
            <PanelHeader>
                Ошибка
            </PanelHeader>

            <Placeholder
                icon={ <FontAwesomeIcon size="8x" icon={ faBug }/> }
                action={
                    <Button size="m" mode="tertiary" onClick={ () => window.location.reload() }>
                        Перезагрузить приложение
                    </Button>
                }
                stretched
            >
                В приложении произошла ошибка
            </Placeholder>
        </Panel>
    );
}

export default ErrorBoundary;
