'use client';
import { verifyEmail } from "@/actions/actions";
import { useEffect , useCallback,useState} from "react";
export default function VerifyPage({params}: {params: {code: string}}) {
  const { code } = params;
  const [data, setData] = useState<{data:string }| undefined>();
  console.log(code);
  const verifyEmailCallback = useCallback(async (code: string) => {
    return await verifyEmail(code);
  }, [])
  useEffect(() => {
    verifyEmailCallback(code).then((data) => {
      setData(data);
    });
  }, [code, verifyEmailCallback]);
  return (
  <div className="h-screen">
    <h1>{data? data.data:null}</h1>
  </div>
);
}
