import { useEffect } from "react"
import { useLazyGetLoggedInUserQuery, useGuestLoginMutation } from "@/redux/auth/authApi"

export const useAuthInit = () => {

  // const [getUser] = useLazyGetLoggedInUserQuery()
  const [guestLogin] = useGuestLoginMutation()

  useEffect(() => {

    const initAuth = async () => {

      const token = localStorage.getItem("token")

      // No token → create guest session
      if (!token) {
        await guestLogin()
        return
      }

      // Token exists → validate user
    //   try {
    //     await getUser().unwrap()
    //   } catch {

    //     // Token invalid → fallback guest
    //     await guestLogin()
    //   }
    }

    initAuth()

  }, [])
}