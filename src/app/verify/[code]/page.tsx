'use client';
import { verifyEmail } from "@/actions/actions";
import { useRouter } from 'next/navigation';
import { useEffect , useCallback,useState} from "react";
export default function VerifyPage({params}: {params: {code: string}}) {
  const router = useRouter();
  const { code } = params;
  const [data, setData] = useState<{data:string }| undefined>();
  console.log(code);
  const verifyEmailCallback = useCallback(async (code: string) => {
    return await verifyEmail(code);
  }, [])
  useEffect(() => {
    verifyEmailCallback(code).then((data) => {
      setData(data);
      if(data?.data === "Email verified") {
       router.push("/dashboard");
      }
    });
  }, [code, verifyEmailCallback, router]);
  return (
  <div className="h-screen">
    <h1>{data? data.data:null}</h1>
  </div>
);
}
