import Button from "@mui/material/Button";

import SendIcon from "@mui/icons-material/Send";
import DoneIcon from "@mui/icons-material/Done";
import ErrorIcon from "@mui/icons-material/Error";

import type { SubmissionStatus } from "../types/formComponents";

type SubmitButtonProps = {
    sentState: SubmissionStatus;
    updateCondition: boolean;
};

export default function SubmitButton({ sentState, updateCondition }: SubmitButtonProps) {
    return (
        <Button
            variant="outlined"
            color={updateCondition ? "warning" : sentState === "Error" ? "error" : "success"}
            type="submit"
            disabled={sentState === "Sent"}
            endIcon={sentState === "Sent" ? <DoneIcon /> : sentState === "Unsent" ? <SendIcon /> : <ErrorIcon />}
        >
            {sentState === "Sent" ? "Sent" : updateCondition ? "Update" : sentState === "Error" ? "Error" : "Send"}
        </Button>
    );
}
