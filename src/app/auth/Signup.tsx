import {createUser} from '@/actions/actions';
import { useFormState } from 'react-dom';

const SIGNUP_INITIAL_STATE = {
    data: "Sign Up"
}
export default function Signup() {
    const [signupState, signupAction] = useFormState(createUser, SIGNUP_INITIAL_STATE);
    return (
        <div>
            <h1>Sign Up</h1>
            <form action={signupAction}>
                {signupState? <p>{signupState?.data}</p> : null}
                <input type="text" name="name" />
                <input type="text" name="email" />
                <input type="password" name="password" />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    )
}