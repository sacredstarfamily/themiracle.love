'use client';
import { verifyEmail } from "@/actions/actions";
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from "react";
type PageProps = {
  params: Promise<{ code: string }>;
};
export default function VerifyPage({ params }: PageProps) {
  const router = useRouter();
  const [data, setData] = useState<{ data: string } | undefined>();
  const [code, setCode] = useState<string>('');
  console.log(code);
  const verifyEmailCallback = useCallback(async (code: string) => {
    return await verifyEmail(code);
  }, [])
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      if (resolvedParams.code) {
        setCode(resolvedParams.code);
        verifyEmailCallback(resolvedParams.code).then((data) => {
          setData(data);
          if (data?.data === "Email verified") {
            router.push("/dashboard");
          }
        });
      } else {
        throw new Error("Please provide a valid verification code");
      }
    };
    getParams();
  }, [params, verifyEmailCallback, router]);
  return (
    <div className="h-screen">
      <h1>{data ? data.data : null}</h1>
    </div>
  );
}
