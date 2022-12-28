import Button from "@mui/material/Button";

import SendIcon from "@mui/icons-material/Send";
import DoneIcon from "@mui/icons-material/Done";
import ErrorIcon from "@mui/icons-material/Error";

import type { SubmissionStatus } from "../types/formComponents";

type SubmitButtonProps = {
    sentState: SubmissionStatus;
    updateCondition: boolean;
};

export function SubmitButton({ sentState, updateCondition }: SubmitButtonProps) {
    const { color, endIcon, label } = getButtonProps(sentState, updateCondition);
    return (
        <Button
            variant="outlined"
            color={color}
            type="submit"
            disabled={sentState === "Sent" || sentState === "Sending"}
            endIcon={endIcon}
        >
            {label}
        </Button>
    );

    type GetButtonPropsReturnType = {
        color: "primary" | "error" | "warning" | "success";
        endIcon: JSX.Element;
        label: string;
    };
    function getButtonProps(sendState: SubmissionStatus, updateCondition: boolean): GetButtonPropsReturnType {
        if (sendState === "Sent") {
            return {
                color: "primary",
                endIcon: <DoneIcon />,
                label: "Sent",
            };
        } else if (sendState === "Error") {
            return {
                color: "error",
                endIcon: <ErrorIcon />,
                label: "Error",
            };
        } else if (sendState === "Sending") {
            return {
                color: "warning",
                endIcon: <>...</>,
                label: "Sending",
            };
        } else if (updateCondition) {
            return {
                color: "warning",
                endIcon: <SendIcon />,
                label: "Update",
            };
        } else {
            return {
                color: "success",
                endIcon: <SendIcon />,
                label: "Send",
            };
        }
    }
}
