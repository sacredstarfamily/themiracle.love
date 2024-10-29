export default function VerifyPage({params}: {params: {code: string}}) {
  return (
  <div>
    <h1>Verify {params?.code}</h1>
  </div>
);
}
