
export default function Unauthorized() {

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-10 rounded-xl shadow-lg text-center">

        <h1 className="text-5xl font-bold text-red-500 mb-4">
          403
        </h1>

        <p className="text-xl font-semibold mb-2">
          Access Denied
        </p>

        <p className="text-gray-500">
          You are not authorized to access this page.
        </p>

      </div>

    </div>
  );
}