import React from "react";
import declineIcon from "@/assets/images/signedDocDeclined.svg";
import SigningMessage from "@/Components/SigningMessage/SigningMessage";

const DeclinedMessage = ({ message }) => <SigningMessage icon={declineIcon} title='Declined' titleColor='#F14242' messages={[message]} />;

export default DeclinedMessage;
