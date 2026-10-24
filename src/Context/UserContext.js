import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useTheme } from "./ThemeContext";
import { API_STATUS } from "@/Constants/apiStatuses";
import userImg from "@/assets/images/defaultImg.svg";
import documentService from "@/services/documentService";
import userService from "@/services/userService";
import { tokenManager } from "@/services/tokenManager";

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const { setTheme } = useTheme();
  // Share overlapping auth refreshes from OTP completion and the token listener.
  const profileRequestRef = useRef(null);
  const recordCountsRequestRef = useRef(null);
  const [loading, setIsLoading] = useState(true);
  const [accountId, setAccountId] = useState(null);
  const [profile, setProfile] = useState(userImg);
  const [emailId, setEmailId] = useState();
  const [showCompanyName, setShowCompanyName] = useState();
  const [accountType, setAccountType] = useState();
  const [recordsCount, setRecordsCount] = useState([]);
  const [sessionTimeOut, setSessionTimeOut] = useState("");
  const [user, setUser] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    profilePic: "",
    AccountID: "",
    RoleID: "",
    isDropbox: false,
    isGoogleDrive: false,
    isOneDrive: false,
  });
  const [userAccess, setUserAccess] = useState("");

  const fetchUserProfile = async () => {
    if (profileRequestRef.current) return profileRequestRef.current;

    const request = (async () => {
      try {
        const response = await userService.getUserProfile();
        if (response.data.statusCode === API_STATUS.SUCCESS) {
          const { fullName, countryCode, mobileNumber, emailID, userPhotoPath, userPhoto, isDropbox, isGoogleDrive, isOneDrive, accountID, roleID, accountType, selectedTheme } = response.data.response;
          const mobile = `${countryCode}-${mobileNumber}`;

          if (selectedTheme) {
            setTheme(selectedTheme);
          }

          // Add cache-busting timestamp to prevent browser caching
          const timestamp = new Date().getTime();
          const profileImageWithCache = userPhoto ? `${userPhotoPath}?t=${timestamp}` : userImg;

          setUser((prevUser) => ({
            ...prevUser,
            fullName,
            mobileNumber: mobile,
            email: emailID,
            profilePic: profileImageWithCache,
            isDropbox,
            isGoogleDrive,
            isOneDrive,
            AccountID: accountID,
            RoleID: roleID,
            AccountType: accountType,
            selectedTheme: selectedTheme,
          }));

          setProfile(profileImageWithCache);
          setAccountType(accountType);
          setAccountId(accountID);
          setIsLoading(false);
          setEmailId(emailID);

          // After setting accountId, fetch user access
          FetchUserAccess(accountID);
          fetchCoBrandingData(accountID);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsLoading(false);
      }
    })();

    profileRequestRef.current = request;
    try {
      return await request;
    } finally {
      if (profileRequestRef.current === request) profileRequestRef.current = null;
    }
  };

  const FetchUserAccess = async (AccountID) => {
    if (!AccountID) {
      return;
    }
    try {
      const response = await userService.getUserAccess(AccountID);
      if (response.data.statusCode === API_STATUS.SUCCESS) {
        setUserAccess(response.data.response);
      }
    } catch (error) {
      console.error("Error fetching user access:", error);
    }
  };

  const FetchRecordCounts = async () => {
    if (recordCountsRequestRef.current) return recordCountsRequestRef.current;

    const request = (async () => {
      try {
        const response = await documentService.getRecordCounts();
        if (response.data.statusCode === API_STATUS.SUCCESS) {
          setRecordsCount(response.data.response);
        }
      } catch (error) {
        console.error("Error fetching record counts:", error);
      }
    })();

    recordCountsRequestRef.current = request;
    try {
      return await request;
    } finally {
      if (recordCountsRequestRef.current === request) recordCountsRequestRef.current = null;
    }
  };

  const fetchCoBrandingData = async (AccountID) => {
    try {
      if (!AccountID) return;

      setIsLoading(true);

      const response = await userService.getCoBranding(AccountID);

      if (response.data.statusCode === API_STATUS.SUCCESS) {
        const { sessionTimeOut, companyRefPrefix } = response.data.response;
        // Set session timeout
        setSessionTimeOut(sessionTimeOut || "30");

        // Set company name
        setShowCompanyName(companyRefPrefix);
      }
    } catch (error) {
      console.error("Error fetching cobranding data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = tokenManager.getToken();
    if (token) {
      fetchUserProfile();
      FetchRecordCounts();
    }
    fetchCoBrandingData();

    const unsubscribe = tokenManager.subscribe((newToken, isAuthenticated) => {
      if (isAuthenticated) {
        fetchUserProfile();
        FetchRecordCounts();
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, accountId, profile, emailId, accountType, userAccess, recordsCount, sessionTimeOut, showCompanyName, fetchUserProfile, FetchRecordCounts }}>
      {children}
    </UserContext.Provider>
  );
};
