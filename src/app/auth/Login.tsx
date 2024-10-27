import { loginUser, deleteUserData } from '@/actions/actions';
import {useFormState} from 'react-dom';

const INITIAL_STATE = {
    data: "Login"
}


export default function Login() {
   const [formState, formAction] = useFormState(loginUser, INITIAL_STATE);
   const [delFormState, delFormAction] = useFormState(deleteUserData, INITIAL_STATE);
    return (
        <div>
            <h1>Login</h1>
            <form action={formAction}>
                <p>{formState?.data}</p>
                <input type="text" name="email" />
                <input type="password" name="password" />
             
                <button type="submit">Login</button>
            </form>
            <form action={delFormAction}>
                <p>{delFormState?.data}</p>
                <input type="text" name="email" />
                <button type="submit">Delete</button>
            </form>
        </div>
    )
}