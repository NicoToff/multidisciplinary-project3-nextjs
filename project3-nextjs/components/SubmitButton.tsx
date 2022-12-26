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
    return (
        <Button
            variant="outlined"
            color={getButtonColor()}
            type="submit"
            disabled={sentState === "Sent" || sentState === "Sending"}
            endIcon={getButtonEndIcon()}
        >
            {getButtonLabel()}
        </Button>
    );

    function getButtonColor() {
        if (sentState === "Sent") {
            return "primary";
        } else if (sentState === "Error") {
            return "error";
        } else if (updateCondition) {
            return "warning";
        } else {
            return "success";
        }
    }

    function getButtonEndIcon() {
        if (sentState === "Sent") {
            return <DoneIcon />;
        } else if (sentState === "Error") {
            return <ErrorIcon />;
        } else if (sentState === "Sending") {
            return <>...</>;
        } else {
            return <SendIcon />;
        }
    }

    function getButtonLabel() {
        if (sentState === "Sent") {
            return "Sent";
        } else if (sentState === "Error") {
            return "Error";
        } else if (sentState === "Sending") {
            return "Sending";
        } else if (updateCondition) {
            return "Update";
        } else {
            return "Send";
        }
    }
}
