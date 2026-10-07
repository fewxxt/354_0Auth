"use client";

import {
  googleLoginAction,
  logoutAction,
} from "@/app/actions";

type AuthButtonsProps = {
  isLoggedIn: boolean;
  userName?: string | null;
};

export function AuthButtons({
  isLoggedIn,
  userName,
}: AuthButtonsProps) {
  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        {userName && (
          <span className="text-sm text-gray-600">
            {userName}
          </span>
        )}

        <form action={logoutAction}>
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            ออกจากระบบ
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={googleLoginAction}>
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        เข้าสู่ระบบด้วย Google
      </button>
    </form>
  );
}
