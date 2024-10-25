import { loginUser } from '@/actions/actions';



export default function Login() {
   
    return (
        <div>
            <h1>Login</h1>
            <form action={loginUser}>
                <input type="text" name="email" />
                <input type="password" name="password" />
             
                <button type="submit">Login</button>
            </form>
        </div>
    )
}