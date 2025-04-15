import {Button, FormItem, FormStatus, Input, Textarea, File} from "@vkontakte/vkui";
import {Dispatch, ReactNode, useEffect, useState} from "react";
import {DictObj, formatBytes, reactJoin} from "../../utils.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCamera} from "@fortawesome/free-solid-svg-icons/faCamera";

const formInputTypes = {
    text: (params: DictObj) => (
        <Input
            {...params}
            value={params.value || ""}
            onChange={e => params.setValue(e.target.value)}
        />
    ),
    textarea: (params: DictObj) => (
        <Textarea
            {...params}
            value={params.value || ""}
            onChange={e => params.setValue(e.target.value)}
        />
    ),
    password: (params: DictObj) => (
        <Input
            type="password"
            {...params}
            value={params.value || ""}
            onChange={e => params.setValue(e.target.value)}
        />
    ),
    email: (params: DictObj) => (
        <Input
            type="email"
            {...params}
            value={params.value || ""}
            onChange={e => params.setValue(e.target.value)}
        />
    ),
    image: (params: DictObj) => (
        <ImageInput {...params as ({
            value: File;
            setValue: Dispatch<File | null>;
            types?: string[] | undefined;
            params: DictObj;
        })} />
    ),
};

function ImageInput({value, setValue, types, ...params}: {
    value: File,
    setValue: Dispatch<File | null>,
    types?: string[],
    params: DictObj
}) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (value) {
            const objectUrl = URL.createObjectURL(value);
            setImagePreview(objectUrl);

            return () => {
                URL.revokeObjectURL(objectUrl);
            };
        } else {
            setImagePreview(null);
        }
    }, [value]);

    return (
        <label style={{cursor: "pointer"}}>
            {value && (<>
                <img
                    style={{
                        width: "100%",
                        borderRadius: "var(--vkui--size_border_radius--regular)",
                        minHeight: "30vw",
                        maxHeight: "50vw",
                        objectFit: "cover",
                        backgroundColor: "var(--vkui--color_field_background)",
                    }}
                    src={imagePreview || undefined}
                    alt="image"
                />
                <p>{formatBytes(value.size)} {value.name}</p>
            </>)}
            <File
                before={
                    <FontAwesomeIcon icon={faCamera} fixedWidth/>
                }
                mode={!!value ? "secondary" : "primary"}
                size="m"
                hidden={!!value}
                {...params}
                required={false}
                // value={value || null}
                // onChange={e => setValue(e.target.value || null)}
                accept={types ? types.join(",") : undefined}
                onChange={(evt) => {
                    const file = evt.currentTarget?.files?.[0];
                    setValue(file || null);
                }}
            />
        </label>
    );
}

export type SimpleFormInput = {
    type: keyof typeof formInputTypes;
    name: string;
    label: string;
    disabled?: boolean;
    required?: boolean;
    readOnly?: boolean;
    description?: ReactNode;
    inputWrapParams?: typeof FormItem;
    inputParams?: DictObj;
    value?: any;
    currentValue?: any;
    validates?: ([(value: any, formValues: DictObj) => boolean, string])[];
    formValue?: (formValue: any) => any
};

function SimpleForm({inputs, errorText, isLoading, disableEditCheck = false, onSubmit, submitText = "Создать"}: {
    inputs: SimpleFormInput[],
    isLoading?: boolean,
    disableEditCheck?: boolean,
    errorText?: string,
    submitText?: string,
    onSubmit: (values: DictObj) => void,
}) {
    const [formValues, setFormValues] = useState(inputs.reduce((acc, fi) => {
        acc[fi.name] = fi.value;
        return acc;
    }, {} as DictObj));

    const formInputErrors = inputs.reduce((fiAcc: DictObj, fi) => {
        let errors = null;

        if (fi.required && !formValues[fi.name]) {
            errors = [`Это поле обязательно`];
        } else if (!fi.required && !formValues[fi.name]) {
            errors = null;
        } else if (!!fi.validates && Array.isArray(fi.validates)) {
            errors = fi.validates.reduce((acc, [validate, errorText]) => {
                if (!validate(formValues[fi.name], formValues)) {
                    acc.push(errorText);
                }

                return acc;
            }, [] as string[]);
            if (errors.length <= 0) {
                errors = null;
            }
        }

        fiAcc[fi.name] = errors;

        return fiAcc;
    }, {});
    const hasFormInputErrors = Object.values(formInputErrors).some(errors => !!errors);

    const isNotEdited = !disableEditCheck && inputs.every(fi => fi.currentValue !== undefined && fi.currentValue === formValues[fi.name]);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if ((!disableEditCheck && isNotEdited) || hasFormInputErrors) {
                    return;
                }

                const newValues = Object.entries(formValues).reduce((acc, [fk, fv]) => {
                    const fi = inputs.find(i => i.name === fk)!;
                    const value = typeof fi.formValue === "function" ? fi.formValue(fv) : fv;
                    if (value !== undefined) {
                        acc[fk] = value;
                    }
                    return acc;
                }, {} as DictObj);

                if (onSubmit) {
                    onSubmit(newValues);
                }
            }}
        >
            {inputs.map(fi => {
                const FormInput = formInputTypes[fi.type];
                const formValue = formValues[fi.name];

                const inputErrorText = formInputErrors[fi.name] ? (
                    reactJoin(formInputErrors[fi.name], <br/>)
                ) : undefined;

                // const isEdited = fi.currentValue !== undefined && fi.currentValue !== formValue;

                return (<>
                    <FormItem
                        key={`fi${fi.name}`}
                        top={fi.label}
                        status={inputErrorText ? 'error' : 'default'}
                        required={fi.required}
                        bottom={inputErrorText}
                        // bottom={[, fi.description].join("\n")}
                        disabled={fi.disabled}
                        readOnly={fi.readOnly}
                        {...(fi.inputWrapParams || [])}
                    >
                        <FormInput
                            id={fi.name}
                            setValue={(newValue: any) => setFormValues({...formValues, [fi.name]: newValue})}
                            value={formValue}
                            required={fi.required}
                            disabled={fi.disabled}
                            readOnly={fi.readOnly}
                            {...(fi.inputParams || [])}
                        />
                    </FormItem>
                </>);
            })}
            {!!errorText && (
                <FormItem>
                    <FormStatus mode="error" title="Ошибка">
                        {errorText}
                    </FormStatus>
                </FormItem>
            )}
            {(!disableEditCheck && isNotEdited) ? null : (<>
                {hasFormInputErrors && (
                    <FormItem>
                        <FormStatus mode="default">
                            Пожалуйста, заполните все поля
                        </FormStatus>
                    </FormItem>
                )}
                <FormItem>
                    <Button
                        type="submit"
                        children={submitText}
                        loading={isLoading}
                        size="l"
                        disabled={hasFormInputErrors}
                        stretched
                    />
                </FormItem>
            </>)}
        </form>
    );
}

export default SimpleForm;
