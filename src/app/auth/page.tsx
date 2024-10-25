'use client';

import {useState} from 'react';
import Login from './Login';
import Signup from './Signup';
export default function AuthPage() {
    const [showSignUp, setShowSignUp] = useState(false);
    const showSignUpHandler = () => {
        setShowSignUp(previousState => !previousState);
    }
    if(showSignUp) {
        return (
            <div>
                <h1>Sign Up Page</h1>
                <Signup />
                <button onClick={showSignUpHandler}>Log In</button>
            </div>
        )
    }
    return (
        <div>
            <h1>Login Page</h1>
            <Login />
            <button onClick={showSignUpHandler}>Sign Up</button>
        </div>
    )
}