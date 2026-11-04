import React from "react";
import Forbidden403 from "@/Pages/Errors/Forbidden403";
import { useUser } from "@/Context/UserContext";

function UserLisence({ reason }) {
  const { userAccess } = useUser();
  return (
    <Forbidden403
      isExpired={true}
      packageName={userAccess?.packageName}
      reason={reason}
    />
  );
}

export default UserLisence;
