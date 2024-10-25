import {createUser} from '@/actions/actions';
export default function Signup() {
    return (
        <div>
            <h1>Sign Up</h1>
            <form action={createUser}>
                <input type="text" name="name" />
                <input type="text" name="email" />
                <input type="password" name="password" />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    )
}