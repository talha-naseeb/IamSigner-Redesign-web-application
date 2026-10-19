import React from "react";
import declineIcon from "@/assets/images/documetnDecline.svg";
import SigningMessage from "@/Components/SigningMessage/SigningMessage";

const DocumentRecalled = ({ message }) => <SigningMessage icon={declineIcon} title='Oops !' messages={[message]} />;

export default DocumentRecalled;
