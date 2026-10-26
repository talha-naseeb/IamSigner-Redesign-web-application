import React from "react";
import declineIcon from "@/assets/images/signedDocDeclined.svg";
import SigningMessage from "@/Components/SigningMessage/SigningMessage";

const DeclinedMessage = ({ message }) => <SigningMessage icon={declineIcon} title='Declined' titleColor='var(--color-danger)' messages={[message]} />;

export default DeclinedMessage;
