import React from "react";
import thankyouIcon from "@/assets/images/thankyouIcon.svg";
import SigningMessage from "@/Components/SigningMessage/SigningMessage";

const SignedMessage = ({ message }) => (
  <SigningMessage
    icon={thankyouIcon}
    iconClassName="success-icon"
    title="Thank You !"
    titleColor="#24B032"
    titleStyle={{ marginTop: "5px" }}
    messages={[message, "Shortly you will find a confirmation in your email."]}
  />
);

export default SignedMessage;
