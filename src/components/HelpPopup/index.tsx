import {Dispatch, useState} from "react";
import {Accordion, Button, Div, Link, ModalPage, Title} from "@vkontakte/vkui";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare} from "@fortawesome/free-solid-svg-icons/faArrowUpRightFromSquare";
import {faCircleQuestion} from "@fortawesome/free-solid-svg-icons/faCircleQuestion";

function HelpModal({openHelp, setOpenHelp}: { openHelp: boolean, setOpenHelp: Dispatch<boolean> }) {
    const infoStyle = {color: 'var(--vkui--color_text_subhead)'};

    return (
        <ModalPage
            title="Помощь"
            open={openHelp}
            onClose={() => setOpenHelp(false)}
        >
            <Div>
                <Title level="1">
                    Помощь
                </Title>
            </Div>
            <Accordion>
                <Accordion.Summary>Какой логин и пароль?</Accordion.Summary>
                <Accordion.Content>
                    <Div style={infoStyle}>
                        В приложении используется такие же логин и пароль, как и в личном кабинете студента
                    </Div>
                </Accordion.Content>
            </Accordion>
            <Accordion>
                <Accordion.Summary>Как зарегистрироваться?</Accordion.Summary>
                <Accordion.Content>
                    <Div style={infoStyle}>
                        Единую учётную запись могут получить обучающиеся АГУ им. В. Н. Татищева (в том числе находящиеся
                        в академическом отпуске):<br/>
                        Обучающиеся по программам ВО – в Едином деканате<br/>
                        Обучающиеся по программам СПО – в своем отделении
                    </Div>
                </Accordion.Content>
            </Accordion>
            <Accordion>
                <Accordion.Summary>Пароль от Moodle не работает?</Accordion.Summary>
                <Accordion.Content>
                    <Div style={infoStyle}>
                        В приложении используется логин и пароль от единой учётной записи, которая не связана с Moodle.
                        При изменении пароля в Moodle пароль в приложении не меняется.
                    </Div>
                </Accordion.Content>
            </Accordion>
            <Accordion>
                <Accordion.Summary>У меня остались вопросы!</Accordion.Summary>
                <Accordion.Content>
                    <Div style={infoStyle}>
                        Пожалуйста, напишите разработчику в <Link
                        href="https://t.me/danbuch"
                        target="_blank"
                        style={{textWrap: "nowrap"}}
                        after={<FontAwesomeIcon icon={faArrowUpRightFromSquare} size="xs" fixedWidth/>}
                    >
                        Telegram
                    </Link> (рекомендуется) или <Link
                        href="https://vk.me/danbuch"
                        target="_blank"
                        style={{textWrap: "nowrap"}}
                        after={<FontAwesomeIcon icon={faArrowUpRightFromSquare} size="xs" fixedWidth/>}
                    >
                        ВКонтакте
                    </Link>
                    </Div>
                </Accordion.Content>
            </Accordion>
        </ModalPage>
    );
}

export function HelpButton() {
    const [openHelp, setOpenHelp] = useState(false);

    return (<>
            <Button
                mode="tertiary"
                before={<FontAwesomeIcon icon={faCircleQuestion} fixedWidth/>}
                size="m"
                onClick={() => setOpenHelp(true)}
                stretched
            >
                Нужна помощь?
            </Button>
            <HelpModal
                openHelp={openHelp}
                setOpenHelp={setOpenHelp}
            />
        </>
    );
}