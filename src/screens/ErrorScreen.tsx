import { useRouteError } from "react-router-dom";

export default function ErrorScreen() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="flex flex-col  bg-black text-red-800 w-full h-screen place-content-center place-items-center">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        {/* @ts-ignore */}
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}