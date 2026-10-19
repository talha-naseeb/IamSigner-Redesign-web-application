import React, { useState, useEffect } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import "./style.css";
import { Button } from "react-bootstrap";

function GoogleLogin() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log("Login Success:", codeResponse);
      setUser(codeResponse);
    },
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
    if (user) {
      axios
        .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: "application/json",
          },
        })
        .then((res) => {
          console.log("Profile data:", res.data);
          setProfile(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  const logOut = () => {
    googleLogout();
    setProfile(null);
    setUser(null);
  };

  return (
    <div className='googleData'>
       {profile ? (
        <div>
          {profile.picture && <img src={profile.picture} alt='user' />}
          <h3>User Logged in</h3>
          <p>Name: {profile.name}</p>
          <p>Email Address: {profile.email}</p>
          <br />
          <br />
          <button className='googleSignIn' onClick={logOut}>
            <FcGoogle size={22} />
            Log out
          </button>
        </div>
      ) : (
      <Button variant="none" className='googleSignIn' onClick={() => login()}>
        <FcGoogle size={22} />
        Sign in with Google
      </Button>
      )}
    </div>
  );
}

export default GoogleLogin;



