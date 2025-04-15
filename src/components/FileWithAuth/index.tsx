import {ReactNode, useEffect, useState} from 'react';
import api from "../../api.ts";

function Index({src, callback}: { src: string | null, callback: (objectURL: string | null) => ReactNode }) {
    const [objectURL, setObjectURL] = useState<string | null>(null);

    useEffect(() => {
        setObjectURL(null);

        if (src) {
            const apiToken = api.getApiToken();
            fetch(src, {
                method: 'GET',
                headers: {
                    "X-API-TOKEN": apiToken,
                    credentials: "include",
                } as Record<string, string>
            })
                .then(res => res.blob())
                .then(blob => {
                    setObjectURL(
                        URL.createObjectURL(blob)
                    );
                });

        }

        return () => {
            if (objectURL) {
                URL.revokeObjectURL(objectURL);
            }
        };
    }, [src]);

    return callback(objectURL);
}

export default Index;