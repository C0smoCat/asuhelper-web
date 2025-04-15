export type Profile = {
    id: number,
    login: number,
    first_name: string,
    last_name: string,
    middle_name: string | null,
    avatar_id: number,
    group_title: string,
    NAZ_PODR: string,
    NAZSPEC: string,
    PROFIL: string,
    F_OB: string | "Дневная",
    N_SO: string | "Бакалавриат",
    VID_OPLATA: string | "Бюджет",
    year: number,
    status: string | "учится",
    short_name: string | "Д",
    email: string,
    last_online: number,
    is_dev?: boolean,
    emoji: string | null,
};

export type AuthInfo = {
    user: Profile;
    token: {
        token: string
    };
};