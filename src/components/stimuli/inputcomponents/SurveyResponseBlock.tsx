import { Response } from "../../../parser/types";
import {saveTrialAnswer, useAppDispatch} from "../../../store";
import ResponseSwitcher from "./ResponseSwitcher";
import {NextButton} from "../../NextButton";
import {Button, Group} from "@mantine/core";
import {useCurrentStep} from "../../../routes";
import {useParams} from "react-router-dom";
import {createTrialProvenance} from "../../../store/trialProvenance";
import {useNextTrialId, useTrialsConfig} from "../../../controllers/TrialController";
import {useForm} from "@mantine/form";
import {useEffect} from "react";
import {useNextStep} from "../../../store/hooks/useNextStep";
import {useTrialStatus} from "../../../store/hooks/useTrialStatus";
import {generateInitFields, generateValidation} from "./utils";

type Props = {
    responses: Response[];
};

export default function SurveyResponseBlock({ responses }: Props) {

    const dispatch = useAppDispatch();
    const currentStep = useCurrentStep();
    const nextStep = useNextStep();
    const config = useTrialsConfig();




    const answerField = useForm({
        initialValues: generateInitFields(responses),
        validate: generateValidation(responses),
    });

    useEffect(() => {

    }, []);

    return (
        <>
            <form onSubmit={answerField.onSubmit(console.log)}>
            {
                responses.map((response, index) => {
                    return (
                        <ResponseSwitcher key={index} answer={answerField.getInputProps(response.id)} response={response} />
                    )
                })
            }

                <Group position="right" spacing="xs" mt="xl">

                        <NextButton
                            disabled={!answerField.isValid()}
                            to={`/${nextStep}`}
                            process={() => {
                                console.log(answerField.values)
                                const answer = JSON.stringify(answerField.values);
                                dispatch(
                                    saveTrialAnswer({
                                        trialName: currentStep,
                                        trialId:"survey",
                                        answer: answer,
                                    })
                                );
                                answerField.setFieldValue("input", "");
                            }}
                        />

                </Group>
            </form>
        </>
    );
}
